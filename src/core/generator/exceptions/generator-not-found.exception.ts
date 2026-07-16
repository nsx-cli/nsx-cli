export class GeneratorNotFoundException extends Error {
  constructor(identifier: string) {
    super(`Generator not found for identifier: ${identifier}`);
    this.name = 'GeneratorNotFoundException';
  }
}
