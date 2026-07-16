import { IGenerator } from './igenerator';
import {
  GeneratorMetadata,
  normalizeGeneratorType,
} from './generator-metadata';
import { GeneratorAlreadyRegisteredException } from './exceptions/generator-already-registered.exception';
import { GeneratorNotFoundException } from './exceptions/generator-not-found.exception';
import { GeneratorValidationException } from './exceptions/generator-validation.exception';

const ERROR_MESSAGE = {
  EMPTY_TYPE: 'Metadata type is required',
  EMPTY_DESCRIPTION: 'Metadata description is required',
  EMPTY_CATEGORY: 'Metadata category is required',
  EMPTY_VERSION: 'Metadata version is required',
  DUPLICATE_ALIASES: 'Metadata aliases must not contain duplicates',
} as const;

export class GeneratorRegistry {
  private readonly generatorsByType = new Map<string, IGenerator>();
  private readonly metadataByType = new Map<string, GeneratorMetadata>();
  private readonly typeByAlias = new Map<string, string>();
  private readonly typesByCategory = new Map<string, Set<string>>();

  public register(generator: IGenerator): void {
    const metadata = generator.metadata;
    this.validate(metadata);

    const type = this.normalize(metadata.type);

    if (this.generatorsByType.has(type)) {
      throw new GeneratorAlreadyRegisteredException(type);
    }

    for (const alias of metadata.aliases) {
      const normalizedAlias = this.normalize(alias);
      const existingType = this.typeByAlias.get(normalizedAlias);

      if (existingType !== undefined) {
        throw new GeneratorAlreadyRegisteredException(normalizedAlias);
      }
    }

    this.generatorsByType.set(type, generator);
    this.metadataByType.set(type, metadata);

    for (const alias of metadata.aliases) {
      this.typeByAlias.set(this.normalize(alias), type);
    }

    const category = this.normalize(metadata.category);
    const categoryTypes =
      this.typesByCategory.get(category) ?? new Set<string>();
    categoryTypes.add(type);
    this.typesByCategory.set(category, categoryTypes);
  }

  public registerMany(generators: IGenerator[]): void {
    for (const generator of generators) {
      this.register(generator);
    }
  }

  public unregister(type: string): void {
    const normalizedType = this.normalize(type);
    const metadata = this.metadataByType.get(normalizedType);

    if (metadata === undefined) {
      return;
    }

    this.generatorsByType.delete(normalizedType);
    this.metadataByType.delete(normalizedType);

    for (const alias of metadata.aliases) {
      this.typeByAlias.delete(this.normalize(alias));
    }

    const category = this.normalize(metadata.category);
    const categoryTypes = this.typesByCategory.get(category);

    if (categoryTypes !== undefined) {
      categoryTypes.delete(normalizedType);

      if (categoryTypes.size === 0) {
        this.typesByCategory.delete(category);
      }
    }
  }

  public has(type: string): boolean {
    return this.generatorsByType.has(this.normalize(type));
  }

  public get(type: string): IGenerator {
    const generator = this.generatorsByType.get(this.normalize(type));

    if (generator === undefined) {
      throw new GeneratorNotFoundException(type);
    }

    return generator;
  }

  public getByAlias(alias: string): IGenerator | undefined {
    const type = this.typeByAlias.get(this.normalize(alias));

    if (type === undefined) {
      return undefined;
    }

    return this.generatorsByType.get(type);
  }

  public list(): readonly IGenerator[] {
    return Object.freeze(Array.from(this.generatorsByType.values()));
  }

  public listByCategory(category: string): readonly IGenerator[] {
    const normalizedCategory = this.normalize(category);
    const types = this.typesByCategory.get(normalizedCategory);

    if (types === undefined) {
      return Object.freeze([] as IGenerator[]);
    }

    const generators: IGenerator[] = [];

    for (const type of types) {
      const generator = this.generatorsByType.get(type);

      if (generator !== undefined) {
        generators.push(generator);
      }
    }

    return Object.freeze(generators);
  }

  public validate(metadata: GeneratorMetadata): void {
    if (!this.isNonEmptyString(metadata.type)) {
      throw new GeneratorValidationException(ERROR_MESSAGE.EMPTY_TYPE);
    }

    if (!this.isNonEmptyString(metadata.description)) {
      throw new GeneratorValidationException(ERROR_MESSAGE.EMPTY_DESCRIPTION);
    }

    if (!this.isNonEmptyString(metadata.category)) {
      throw new GeneratorValidationException(ERROR_MESSAGE.EMPTY_CATEGORY);
    }

    if (!this.isNonEmptyString(metadata.version)) {
      throw new GeneratorValidationException(ERROR_MESSAGE.EMPTY_VERSION);
    }

    const seenAliases = new Set<string>();

    for (const alias of metadata.aliases) {
      const normalizedAlias = this.normalize(alias);

      if (seenAliases.has(normalizedAlias)) {
        throw new GeneratorValidationException(ERROR_MESSAGE.DUPLICATE_ALIASES);
      }

      seenAliases.add(normalizedAlias);
    }
  }

  private normalize(value: string): string {
    return normalizeGeneratorType(value);
  }

  private isNonEmptyString(value: string): boolean {
    return value.trim().length > 0;
  }
}
