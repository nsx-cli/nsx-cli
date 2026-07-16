import { describe, expect, it } from 'vitest';
import { GeneratorAlreadyRegisteredException } from './exceptions/generator-already-registered.exception';
import { GeneratorNotFoundException } from './exceptions/generator-not-found.exception';
import { GeneratorValidationException } from './exceptions/generator-validation.exception';
import { GeneratorRegistry } from './generator.registry';

function makeGenerator(type: string, aliases: string[] = []) {
  return {
    metadata: {
      type,
      description: `${type} description`,
      category: 'scaffold',
      version: '1.0.0',
      aliases,
    },
    generate: async () => undefined,
  };
}

describe('GeneratorRegistry', () => {
  it('registra, resolve por tipo/alias e lista por categoria', () => {
    const registry = new GeneratorRegistry();
    const generator = makeGenerator('resource', ['res']);

    registry.register(generator);

    expect(registry.has('resource')).toBe(true);
    expect(registry.get('RESOURCE')).toBe(generator);
    expect(registry.getByAlias('RES')).toBe(generator);
    expect(registry.list().length).toBe(1);
    expect(registry.listByCategory('SCAFFOLD').length).toBe(1);
  });

  it('registerMany/unregister e valida limpeza de alias/categoria', () => {
    const registry = new GeneratorRegistry();
    const g1 = makeGenerator('resource', ['res']);
    const g2 = makeGenerator('dto', ['data']);

    registry.registerMany([g1, g2]);

    expect(registry.list().length).toBe(2);

    registry.unregister('resource');

    expect(registry.has('resource')).toBe(false);
    expect(registry.getByAlias('res')).toBeUndefined();
    expect(registry.listByCategory('scaffold').length).toBe(1);
  });

  it('lança erros para duplicidade, não encontrado e metadata inválida', () => {
    const registry = new GeneratorRegistry();

    registry.register(makeGenerator('resource', ['res']));

    expect(() => registry.register(makeGenerator('resource') as never)).toThrow(
      GeneratorAlreadyRegisteredException,
    );
    expect(() =>
      registry.register(makeGenerator('other', ['res']) as never),
    ).toThrow(GeneratorAlreadyRegisteredException);
    expect(() => registry.get('missing')).toThrow(GeneratorNotFoundException);

    expect(() =>
      registry.validate({
        type: '',
        description: 'ok',
        category: 'ok',
        version: '1.0.0',
        aliases: [],
      }),
    ).toThrow(GeneratorValidationException);

    expect(() =>
      registry.validate({
        type: 'x',
        description: 'ok',
        category: 'ok',
        version: '1.0.0',
        aliases: ['dup', 'dup'],
      }),
    ).toThrow(GeneratorValidationException);
  });
});
