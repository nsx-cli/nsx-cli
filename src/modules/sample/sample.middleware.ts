export function SampleMiddleware() {
  return (_req: unknown, _res: unknown, next: () => void) => next();
}
