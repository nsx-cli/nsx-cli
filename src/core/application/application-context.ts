import { ServiceNotFoundException } from "./exceptions/service-not-found.exception";

export type ServiceToken<T = unknown> = string | symbol | (new (...args: never[]) => T);

export class ApplicationContext {
  private readonly services = new Map<ServiceToken<unknown>, unknown>();

  public register<T>(token: ServiceToken<T>, service: T): void {
    if (this.services.has(token)) {
      throw new Error(`Service token already registered: ${this.stringifyToken(token)}`);
    }

    this.services.set(token, service);
  }

  public resolve<T>(token: ServiceToken<T>): T {
    const service = this.services.get(token);

    if (service === undefined) {
      throw new ServiceNotFoundException(this.stringifyToken(token));
    }

    return service as T;
  }

  public has(token: ServiceToken<unknown>): boolean {
    return this.services.has(token);
  }

  public remove(token: ServiceToken<unknown>): void {
    this.services.delete(token);
  }

  public clear(): void {
    this.services.clear();
  }

  private stringifyToken(token: ServiceToken<unknown>): string {
    if (typeof token === "string") {
      return token;
    }

    if (typeof token === "symbol") {
      return token.description ?? token.toString();
    }

    return token.name;
  }
}
