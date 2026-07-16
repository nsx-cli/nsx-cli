import { describe, expect, it } from 'vitest';
import { Bootstrap } from '../bootstrap/bootstrap';
import { createCli } from '../cli';
import { GenerateCommand } from '../commands/generate.command';
import { MakeCommand } from '../commands/make.command';
import { DoctorCommand } from '../commands/doctor.command';
import { AnalyzeCommand } from '../commands/analyze.command';
import { FixCommand } from '../commands/fix.command';
import { GraphCommand } from '../commands/graph.command';
import { DocumentationCommand } from '../commands/documentation.command';
import { AiCommand } from '../commands/ai.command';
import { PluginCommand } from '../commands/plugin.command';
import { PrismaCommand } from '../commands/prisma.command';

describe('CLI smoke', () => {
  it('registra os comandos essenciais da release 1.0', () => {
    const context = new Bootstrap().create();
    const program = createCli();

    context.resolve(GenerateCommand).register(program);
    context.resolve(MakeCommand).register(program);
    context.resolve(DoctorCommand).register(program);
    context.resolve(AnalyzeCommand).register(program);
    context.resolve(FixCommand).register(program);
    context.resolve(GraphCommand).register(program);
    context.resolve(DocumentationCommand).register(program);
    context.resolve(AiCommand).register(program);
    context.resolve(PluginCommand).register(program);
    context.resolve(PrismaCommand).register(program);

    const commands = program.commands.map((command) => command.name());

    expect(commands).toEqual(
      expect.arrayContaining([
        'generate',
        'make',
        'doctor',
        'analyze',
        'fix',
        'graph',
        'docs',
        'ai',
        'plugins',
        'prisma',
      ]),
    );
  });
});
