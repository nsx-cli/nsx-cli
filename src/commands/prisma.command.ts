import { Command } from 'commander';
import { CrudGenerator } from '../core/crud/crud-generator';
import { CrudExecutionReport } from '../core/crud/crud-execution-report';

export class PrismaCommand {
  constructor(private readonly crudGenerator: CrudGenerator) {}

  register(program: Command): void {
    const prisma = program.command('prisma').description('Comandos do Prisma');

    prisma.command('models').description('Lista os models do Prisma');

    prisma
      .command('crud <Model>')
      .description('Gera CRUD a partir de um model do Prisma')
      .action(async (modelName: string) => {
        const report = await this.crudGenerator.generate(modelName);
        this.printReport(report);
      });

    prisma
      .command('entity <Model>')
      .description('Gera entity a partir de um model do Prisma');
  }

  private printReport(report: CrudExecutionReport): void {
    console.log(
      `CRUD '${report.modelName}' concluido em ${report.durationMs}ms.`,
    );
    console.log(`Steps executados: ${report.totalSteps}`);

    for (const executed of report.executedSteps) {
      console.log(
        `  - ${executed.step.type} (${executed.step.target}) -> ${executed.executorName}`,
      );
    }
  }
}
