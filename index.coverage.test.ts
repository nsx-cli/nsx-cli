import { describe, expect, it, vi } from 'vitest';

describe('root index coverage', () => {
  it('importa entrypoint raiz com commander mockado', async () => {
    vi.resetModules();

    const parse = vi.fn();

    vi.doMock('commander', () => ({
      Command: class {
        name() {
          return this;
        }

        description() {
          return this;
        }

        version() {
          return this;
        }

        parse = parse;
      },
    }));

    await import('./index');

    expect(parse).toHaveBeenCalledTimes(1);
  });
});
