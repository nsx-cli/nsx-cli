import { Command } from "commander";
import { DoctorReportFormatter } from "../core/doctor/doctor-report-formatter";
import { DoctorService } from "../core/doctor/doctor.service";

export class DoctorCommand {
  constructor(
    private readonly doctorService: DoctorService,
    private readonly formatter: DoctorReportFormatter = new DoctorReportFormatter()
  ) {}

  register(program: Command): void {
    program
      .command("doctor")
      .description("Executa diagnósticos no workspace")
      .option("-o, --output <path>", "Caminho do relatório markdown")
      .action(async (options: { output?: string }) => {
        const result = await this.doctorService.run({ outputPath: options.output });

        console.log(this.formatter.formatConsoleSummary(result.report));
        console.log(`Relatório salvo em ${result.outputPath}`);
      });
  }
}