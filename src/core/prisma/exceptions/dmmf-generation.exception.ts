export class DmmfGenerationException extends Error {
  constructor(cause?: unknown) {
    super("Unable to generate Prisma DMMF");
    this.name = "DmmfGenerationException";

    if (cause instanceof Error && cause.stack !== undefined) {
      this.stack = `${this.stack ?? this.name}\nCaused by: ${cause.stack}`;
    }
  }
}
