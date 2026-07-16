import { GeneratorMetadata } from './generator-metadata';

export interface IGenerator {
  /**
   * Informações do generator.
   */
  readonly metadata: GeneratorMetadata;

  /**
   * Executa a geração dos arquivos.
   */
  generate(name: string): Promise<void>;
}
