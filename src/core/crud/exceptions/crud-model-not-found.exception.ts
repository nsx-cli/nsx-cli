export class CrudModelNotFoundException extends Error {
  constructor(modelName: string) {
    super(`Prisma model not found: ${modelName}`);
    this.name = "CrudModelNotFoundException";
  }
}
