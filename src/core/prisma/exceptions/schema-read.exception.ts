export class SchemaReadException extends Error {
  constructor(schemaPath: string, cause?: unknown) {
    super(`Unable to read schema.prisma: ${schemaPath}`);
    this.name = 'SchemaReadException';
    if (cause instanceof Error && cause.stack !== undefined) {
      this.stack = `${this.stack ?? this.name}\nCaused by: ${cause.stack}`;
    }
  }
}
