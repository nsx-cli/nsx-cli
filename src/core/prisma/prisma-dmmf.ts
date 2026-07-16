import type { DMMF } from '@prisma/generator-helper';
import { getDMMF } from '@prisma/internals';
import { DmmfGenerationException } from './exceptions/dmmf-generation.exception';

export class PrismaDmmf {
  public async generate(schema: string): Promise<DMMF.Document> {
    try {
      return await getDMMF({ datamodel: schema });
    } catch (error) {
      throw new DmmfGenerationException(error);
    }
  }
}
