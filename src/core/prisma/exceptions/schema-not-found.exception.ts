export class SchemaNotFoundException extends Error {
  constructor(schemaPath: string) {
    super(`schema.prisma not found: ${schemaPath}`);
    this.name = "SchemaNotFoundException";
  }
}
