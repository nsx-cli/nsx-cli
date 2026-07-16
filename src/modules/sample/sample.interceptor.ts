export class SampleInterceptor {
  intercept(_context: unknown, next: () => unknown) {
    return next();
  }
}
