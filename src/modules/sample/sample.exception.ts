export class SampleException extends Error {
  constructor(message = 'Erro inesperado') {
    super(message);
    this.name = 'SampleException';
  }
}
