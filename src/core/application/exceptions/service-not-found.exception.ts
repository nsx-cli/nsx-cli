export class ServiceNotFoundException extends Error {
  constructor(token: string) {
    super(`Service not found for token: ${token}`);
    this.name = "ServiceNotFoundException";
  }
}