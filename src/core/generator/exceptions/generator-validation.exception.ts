export class GeneratorValidationException extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'GeneratorValidationException';
  }
}
