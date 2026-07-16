import path from 'path';
import { AnalyzeAnalyzer } from '../analyze/analyze-analyzer';
import { AstProjectContext } from '../ast/ast-project-context';
import { FileService } from '../../services/file.service';
import { ProjectScanner } from '../../services/project-scanner.service';
import { FixExecutor } from './fix-executor';
import { FixPlanner } from './fix-planner';
import { FixReportFormatter } from './fix-report';
import { FixReport, FixRunOptions, FixRunResult } from './fix-result';

export class FixEngine {
  constructor(
    private readonly scanner: ProjectScanner = new ProjectScanner(
      process.cwd(),
    ),
    private readonly projectContext: AstProjectContext = new AstProjectContext(),
    private readonly analyzeEngine: AnalyzeAnalyzer = new AnalyzeAnalyzer(),
    private readonly planner: FixPlanner = new FixPlanner(),
    private readonly executor: FixExecutor = new FixExecutor(projectContext),
    private readonly formatter: FixReportFormatter = new FixReportFormatter(),
    private readonly fileService: FileService = new FileService(),
  ) {}

  public async run(options: FixRunOptions = {}): Promise<FixRunResult> {
    const projectInfo = await this.scanner.scan();

    if (projectInfo.tsconfigPath === null) {
      throw new Error('tsconfig.json not found. Unable to run nsx fix.');
    }

    const project = this.projectContext.open({
      tsConfigFilePath: projectInfo.tsconfigPath,
    });

    const analyzeReport = await this.analyzeEngine.analyze(
      project,
      projectInfo,
    );
    const executionPlan = this.planner.plan(project, analyzeReport);
    const dryRun = options.dryRun ?? false;

    let executedOperations = 0;
    let failedOperations = 0;
    let execution = [] as FixReport['execution'];

    if (!dryRun) {
      const executionResult = this.executor.execute(executionPlan);
      executedOperations = executionResult.successCount;
      failedOperations = executionResult.failureCount;
      execution = executionResult.executedSteps;
      await this.projectContext.saveProject();
    }

    const report: FixReport = {
      generatedAt: new Date().toISOString(),
      project: projectInfo,
      analyzeReport,
      summary: {
        totalPlannedOperations: executionPlan.getSteps().length,
        executedOperations,
        failedOperations,
        dryRun,
      },
      executionPlan: executionPlan.getSteps(),
      execution,
    };

    const outputPath =
      options.outputPath ??
      path.resolve(projectInfo.rootDir, '.nsx', 'fix-report.md');
    const markdown = this.formatter.formatMarkdown(report, outputPath);

    await this.fileService.ensureDirectory(path.dirname(outputPath));
    await this.fileService.writeFile(outputPath, markdown);

    return {
      report,
      markdown,
      outputPath,
      preview: this.formatter.formatPreview(report),
    };
  }
}
