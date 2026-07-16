import { Command } from 'commander';
import { describe, expect, it, vi } from 'vitest';
import { GeneratorRegistry } from '../core/generator/generator.registry';
import { MakeCommand } from './make.command';

function createRegistry() {
  const registry = new GeneratorRegistry();
  const generateMock = vi.fn().mockResolvedValue(undefined);

  registry.register({
    metadata: {
      type: 'resource',
      description: 'Generate full resource',
      category: 'scaffold',
      version: '1.0.0',
      aliases: [],
    },
    generate: generateMock,
  });

  return {
    registry,
    generateMock,
  };
}

describe('MakeCommand', () => {
  it('executa make api via generator resource', async () => {
    const { registry, generateMock } = createRegistry();
    const program = new Command();
    program.exitOverride();

    new MakeCommand(registry).register(program);

    await program.parseAsync(['make', 'api', 'usuario'], { from: 'user' });

    expect(generateMock).toHaveBeenCalledWith('usuario');
  });

  it('executa make resource via generator resource', async () => {
    const { registry, generateMock } = createRegistry();
    const program = new Command();
    program.exitOverride();

    new MakeCommand(registry).register(program);

    await program.parseAsync(['make', 'resource', 'cliente'], { from: 'user' });

    expect(generateMock).toHaveBeenCalledWith('cliente');
  });
});
