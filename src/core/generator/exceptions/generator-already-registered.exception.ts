export class GeneratorAlreadyRegisteredException extends Error {
  constructor(identifier: string) {
    super(`Generator already registered for identifier: ${identifier}`);
    this.name = 'GeneratorAlreadyRegisteredException';
  }
}
