
import { createCli } from './cli';
import { Bootstrap } from './bootstrap/bootstrap';
import { GenerateCommand } from './commands/generate.command';
import { MakeCommand } from './commands/make.command';
import { DoctorCommand } from './commands/doctor.command';
import { AnalyzeCommand } from './commands/analyze.command';
import { FixCommand } from './commands/fix.command';
import { GraphCommand } from './commands/graph.command';
import { DocumentationCommand } from './commands/documentation.command';
import { AiCommand } from './commands/ai.command';
import { PluginCommand } from './commands/plugin.command';
import { MarketplaceCommand } from './commands/marketplace.command';
import { PrismaCommand } from './commands/prisma.command';
import { ErpCommand } from './commands/erp.command';
import { PluginManager } from './core/plugin/plugin-manager';

async function bootstrapCli(): Promise<void> {
  const applicationContext = new Bootstrap().create();
  const program = createCli();

  applicationContext.resolve(GenerateCommand).register(program);
  applicationContext.resolve(MakeCommand).register(program);
  applicationContext.resolve(DoctorCommand).register(program);
  applicationContext.resolve(AnalyzeCommand).register(program);
  applicationContext.resolve(FixCommand).register(program);
  applicationContext.resolve(GraphCommand).register(program);
  applicationContext.resolve(DocumentationCommand).register(program);
  applicationContext.resolve(AiCommand).register(program);
  applicationContext.resolve(PluginCommand).register(program);
  applicationContext.resolve(MarketplaceCommand).register(program);
  applicationContext.resolve(PrismaCommand).register(program);
  applicationContext.resolve(ErpCommand).register(program);

  const pluginManager = applicationContext.resolve(PluginManager);
  await pluginManager.initialize(program, applicationContext);

  await program.parseAsync(process.argv);
}

void bootstrapCli();

