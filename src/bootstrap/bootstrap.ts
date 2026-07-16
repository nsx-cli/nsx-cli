import { ApplicationContext } from '../core/application/application-context';
import { GenerateCommand } from '../commands/generate.command';
import { DoctorCommand } from '../commands/doctor.command';
import { AnalyzeCommand } from '../commands/analyze.command';
import { FixCommand } from '../commands/fix.command';
import { GraphCommand } from '../commands/graph.command';
import { PluginCommand } from '../commands/plugin.command';
import { DocumentationCommand } from '../commands/documentation.command';
import { AiCommand } from '../commands/ai.command';
import { PrismaCommand } from '../commands/prisma.command';
import { MakeCommand } from '../commands/make.command';
import { GeneratorRegistry } from '../core/generator/generator.registry';
import { PrismaLoader } from '../core/prisma/prisma-loader';
import { PrismaDmmf } from '../core/prisma/prisma-dmmf';
import { PrismaEngine } from '../core/prisma/prisma-engine';
import { ProjectScanner } from '../services/project-scanner.service';
import { CrudPlanner } from '../core/crud/crud-planner';
import { CrudExecutor } from '../core/crud/crud-executor';
import { CrudOrchestratorService } from '../core/crud/crud-orchestrator.service';
import { CrudGenerator } from '../core/crud/crud-generator';
import { ExecutionStepExecutorRegistry } from '../core/crud/execution-step-executor-registry';
import { CreateModuleExecutor } from '../core/crud/executors/create-module.executor';
import { CreateControllerExecutor } from '../core/crud/executors/create-controller.executor';
import { CreateServiceExecutor } from '../core/crud/executors/create-service.executor';
import { CreateRepositoryExecutor } from '../core/crud/executors/create-repository.executor';
import { CreateEntityExecutor } from '../core/crud/executors/create-entity.executor';
import { CreateCreateDtoExecutor } from '../core/crud/executors/create-create-dto.executor';
import { CreateUpdateDtoExecutor } from '../core/crud/executors/create-update-dto.executor';
import { AddProviderExecutor } from '../core/crud/executors/add-provider.executor';
import { AddControllerExecutor } from '../core/crud/executors/add-controller.executor';
import { OrganizeImportsExecutor } from '../core/crud/executors/organize-imports.executor';
import { AstProjectContext } from '../core/ast/ast-project-context';
import { AstPersistenceService } from '../core/ast/ast-persistence.service';
import { ModuleCrudSupport } from '../core/crud/module-crud-support';
import { AddProviderOperation } from '../core/ast/operations/add-provider.operation';
import { AddControllerOperation } from '../core/ast/operations/add-controller.operation';
import { OrganizeImportsOperation } from '../core/ast/operations/organize-imports.operation';
import { ControllerGenerator } from '../generators/controller.generator';
import { ServiceGenerator } from '../generators/service.generator';
import { ModuleGenerator } from '../generators/module.generator';
import { DtoGenerator } from '../generators/dto.generator';
import { RepositoryGenerator } from '../generators/repository.generator';
import { EntityGenerator } from '../generators/entity.generator';
import { ResourceGenerator } from '../generators/resource.generator';
import { UseCaseGenerator } from '../generators/usecase.generator';
import { GatewayGenerator } from '../generators/gateway.generator';
import { DecoratorGenerator } from '../generators/decorator.generator';
import { GuardGenerator } from '../generators/guard.generator';
import { InterceptorGenerator } from '../generators/interceptor.generator';
import { PipeGenerator } from '../generators/pipe.generator';
import { FilterGenerator } from '../generators/filter.generator';
import { MiddlewareGenerator } from '../generators/middleware.generator';
import { ExceptionGenerator } from '../generators/exception.generator';
import { TestGenerator } from '../generators/test.generator';
import { DoctorService } from '../core/doctor/doctor.service';
import { DoctorAnalyzer } from '../core/doctor/doctor-analyzer';
import { DoctorReportFormatter } from '../core/doctor/doctor-report-formatter';
import { AnalyzeAnalyzer } from '../core/analyze/analyze-analyzer';
import { AnalyzeFormatter } from '../core/analyze/analyze-formatter';
import { AnalyzeService } from '../core/analyze/analyze.service';
import { FixEngine } from '../core/fix/fix-engine';
import { FixPlanner } from '../core/fix/fix-planner';
import { FixExecutor } from '../core/fix/fix-executor';
import { FixReportFormatter } from '../core/fix/fix-report';
import { GraphService } from '../core/graph/graph.service';
import { GraphBuilder } from '../core/graph/graph-builder';
import { GraphFormatter } from '../core/graph/graph-formatter';
import { DocumentationCollector } from '../core/documentation/documentation-collector';
import { DocumentationFormatter } from '../core/documentation/documentation-formatter';
import { DocumentationService } from '../core/documentation/documentation.service';
import { AiProviderRegistry } from '../core/ai/ai-provider-registry';
import { AiService } from '../core/ai/ai.service';
import { EchoAiProvider } from '../core/ai/providers/echo-ai.provider';
import { OpenAiProvider } from '../core/ai/providers/openai.provider';
import { PluginConfigResolver } from '../core/plugin/plugin-config-resolver';
import { PluginLoader } from '../core/plugin/plugin-loader';
import { PluginManager } from '../core/plugin/plugin-manager';
import { MarketplaceCommand } from '../commands/marketplace.command';
import { TemplateMarketplaceService } from '../core/marketplace/template-marketplace.service';
import { ConfigService } from '../config/config.service';
import { FileService } from '../services/file.service';

export class Bootstrap {
  public create(): ApplicationContext {
    const applicationContext = new ApplicationContext();
    const generatorRegistry = new GeneratorRegistry();

    this.registerGenerators(generatorRegistry);

    const prismaLoader = new PrismaLoader();
    const prismaDmmf = new PrismaDmmf();
    const prismaEngine = new PrismaEngine(prismaLoader, prismaDmmf);
    const crudPlanner = new CrudPlanner();

    const astProjectContext = new AstProjectContext();
    const astPersistenceService = new AstPersistenceService(astProjectContext);
    const moduleCrudSupport = new ModuleCrudSupport(
      astProjectContext,
      astPersistenceService,
    );

    const createModuleExecutor = new CreateModuleExecutor(
      generatorRegistry.get('module'),
    );
    const createControllerExecutor = new CreateControllerExecutor(
      generatorRegistry.get('controller'),
    );
    const createServiceExecutor = new CreateServiceExecutor(
      generatorRegistry.get('service'),
    );
    const createRepositoryExecutor = new CreateRepositoryExecutor(
      generatorRegistry.get('repository'),
    );
    const createEntityExecutor = new CreateEntityExecutor(
      generatorRegistry.get('entity'),
    );
    const createCreateDtoExecutor = new CreateCreateDtoExecutor(
      generatorRegistry.get('dto'),
    );
    const createUpdateDtoExecutor = new CreateUpdateDtoExecutor(
      generatorRegistry.get('dto'),
    );
    const addProviderExecutor = new AddProviderExecutor(
      moduleCrudSupport,
      new AddProviderOperation(),
    );
    const addControllerExecutor = new AddControllerExecutor(
      moduleCrudSupport,
      new AddControllerOperation(),
    );
    const organizeImportsExecutor = new OrganizeImportsExecutor(
      moduleCrudSupport,
      new OrganizeImportsOperation(),
    );
    const executionStepExecutorRegistry = new ExecutionStepExecutorRegistry([
      createModuleExecutor,
      createEntityExecutor,
      createRepositoryExecutor,
      createServiceExecutor,
      createControllerExecutor,
      createCreateDtoExecutor,
      createUpdateDtoExecutor,
      addProviderExecutor,
      addControllerExecutor,
      organizeImportsExecutor,
    ]);

    const crudExecutor = new CrudExecutor(executionStepExecutorRegistry.list());

    const crudOrchestrator = new CrudOrchestratorService(
      crudPlanner,
      crudExecutor,
    );
    const crudGenerator = new CrudGenerator(prismaEngine, crudOrchestrator);
    const configService = new ConfigService(process.cwd());
    const fileService = new FileService();
    const templateMarketplaceService = new TemplateMarketplaceService(
      process.cwd(),
      fileService,
    );
    const doctorAnalyzer = new DoctorAnalyzer(prismaLoader);
    const doctorFormatter = new DoctorReportFormatter();
    const doctorService = new DoctorService(
      new ProjectScanner(process.cwd()),
      doctorAnalyzer,
      doctorFormatter,
    );
    const analyzeAnalyzer = new AnalyzeAnalyzer();
    const analyzeFormatter = new AnalyzeFormatter();
    const analyzeService = new AnalyzeService(
      new ProjectScanner(process.cwd()),
      analyzeAnalyzer,
      analyzeFormatter,
      fileService,
    );
    const fixPlanner = new FixPlanner();
    const fixExecutor = new FixExecutor(astProjectContext);
    const fixReportFormatter = new FixReportFormatter();
    const fixEngine = new FixEngine(
      new ProjectScanner(process.cwd()),
      astProjectContext,
      analyzeAnalyzer,
      fixPlanner,
      fixExecutor,
      fixReportFormatter,
      fileService,
    );
    const graphBuilder = new GraphBuilder();
    const graphFormatter = new GraphFormatter();
    const graphService = new GraphService(
      new ProjectScanner(process.cwd()),
      astProjectContext,
      graphBuilder,
      graphFormatter,
      fileService,
    );
    const documentationCollector = new DocumentationCollector(
      new ProjectScanner(process.cwd()),
      fileService,
      prismaLoader,
      prismaDmmf,
    );
    const documentationFormatter = new DocumentationFormatter();
    const documentationService = new DocumentationService(
      documentationCollector,
      documentationFormatter,
      fileService,
    );
    const aiProviderRegistry = new AiProviderRegistry();
    aiProviderRegistry.register(new EchoAiProvider());
    aiProviderRegistry.register(new OpenAiProvider());
    const aiService = new AiService(aiProviderRegistry, configService);
    const pluginConfigResolver = new PluginConfigResolver(
      configService,
      fileService,
      process.cwd(),
    );
    const pluginLoader = new PluginLoader(process.cwd());
    const pluginManager = new PluginManager(
      pluginConfigResolver,
      pluginLoader,
      process.cwd(),
    );

    const generateCommand = new GenerateCommand(generatorRegistry);
    const makeCommand = new MakeCommand(generatorRegistry);
    const doctorCommand = new DoctorCommand(doctorService, doctorFormatter);
    const analyzeCommand = new AnalyzeCommand(analyzeService, analyzeFormatter);
    const fixCommand = new FixCommand(fixEngine, fixReportFormatter);
    const graphCommand = new GraphCommand(graphService, graphFormatter);
    const documentationCommand = new DocumentationCommand(
      documentationService,
      documentationFormatter,
    );
    const aiCommand = new AiCommand(aiService);
    const pluginCommand = new PluginCommand(pluginManager);
    const marketplaceCommand = new MarketplaceCommand(
      templateMarketplaceService,
    );
    const prismaCommand = new PrismaCommand(crudGenerator);

    applicationContext.register(GeneratorRegistry, generatorRegistry);
    applicationContext.register(PrismaLoader, prismaLoader);
    applicationContext.register(PrismaDmmf, prismaDmmf);
    applicationContext.register(PrismaEngine, prismaEngine);
    applicationContext.register(CrudPlanner, crudPlanner);
    applicationContext.register(AstProjectContext, astProjectContext);
    applicationContext.register(AstPersistenceService, astPersistenceService);
    applicationContext.register(ModuleCrudSupport, moduleCrudSupport);
    applicationContext.register(CrudExecutor, crudExecutor);
    applicationContext.register(
      ExecutionStepExecutorRegistry,
      executionStepExecutorRegistry,
    );
    applicationContext.register(CrudOrchestratorService, crudOrchestrator);
    applicationContext.register(CrudGenerator, crudGenerator);
    applicationContext.register(PrismaCommand, prismaCommand);
    applicationContext.register(GenerateCommand, generateCommand);
    applicationContext.register(MakeCommand, makeCommand);
    applicationContext.register(DoctorAnalyzer, doctorAnalyzer);
    applicationContext.register(DoctorReportFormatter, doctorFormatter);
    applicationContext.register(DoctorService, doctorService);
    applicationContext.register(DoctorCommand, doctorCommand);
    applicationContext.register(AnalyzeAnalyzer, analyzeAnalyzer);
    applicationContext.register(AnalyzeFormatter, analyzeFormatter);
    applicationContext.register(AnalyzeService, analyzeService);
    applicationContext.register(AnalyzeCommand, analyzeCommand);
    applicationContext.register(FixPlanner, fixPlanner);
    applicationContext.register(FixExecutor, fixExecutor);
    applicationContext.register(FixReportFormatter, fixReportFormatter);
    applicationContext.register(FixEngine, fixEngine);
    applicationContext.register(FixCommand, fixCommand);
    applicationContext.register(GraphBuilder, graphBuilder);
    applicationContext.register(GraphFormatter, graphFormatter);
    applicationContext.register(GraphService, graphService);
    applicationContext.register(GraphCommand, graphCommand);
    applicationContext.register(DocumentationCollector, documentationCollector);
    applicationContext.register(DocumentationFormatter, documentationFormatter);
    applicationContext.register(DocumentationService, documentationService);
    applicationContext.register(DocumentationCommand, documentationCommand);
    applicationContext.register(AiProviderRegistry, aiProviderRegistry);
    applicationContext.register(AiService, aiService);
    applicationContext.register(AiCommand, aiCommand);
    applicationContext.register(ConfigService, configService);
    applicationContext.register(FileService, fileService);
    applicationContext.register(
      TemplateMarketplaceService,
      templateMarketplaceService,
    );
    applicationContext.register(PluginConfigResolver, pluginConfigResolver);
    applicationContext.register(PluginLoader, pluginLoader);
    applicationContext.register(PluginManager, pluginManager);
    applicationContext.register(PluginCommand, pluginCommand);
    applicationContext.register(MarketplaceCommand, marketplaceCommand);
    applicationContext.register(CreateModuleExecutor, createModuleExecutor);
    applicationContext.register(
      CreateControllerExecutor,
      createControllerExecutor,
    );
    applicationContext.register(CreateServiceExecutor, createServiceExecutor);
    applicationContext.register(
      CreateRepositoryExecutor,
      createRepositoryExecutor,
    );
    applicationContext.register(CreateEntityExecutor, createEntityExecutor);
    applicationContext.register(
      CreateCreateDtoExecutor,
      createCreateDtoExecutor,
    );
    applicationContext.register(
      CreateUpdateDtoExecutor,
      createUpdateDtoExecutor,
    );
    applicationContext.register(AddProviderExecutor, addProviderExecutor);
    applicationContext.register(AddControllerExecutor, addControllerExecutor);
    applicationContext.register(
      OrganizeImportsExecutor,
      organizeImportsExecutor,
    );

    return applicationContext;
  }

  private registerGenerators(generatorRegistry: GeneratorRegistry): void {
    generatorRegistry.register(new ControllerGenerator());
    generatorRegistry.register(new ServiceGenerator());
    generatorRegistry.register(new ModuleGenerator());
    generatorRegistry.register(new DtoGenerator());
    generatorRegistry.register(new RepositoryGenerator());
    generatorRegistry.register(new EntityGenerator());
    generatorRegistry.register(new ResourceGenerator());
    generatorRegistry.register(new UseCaseGenerator());
    generatorRegistry.register(new GatewayGenerator());
    generatorRegistry.register(new DecoratorGenerator());
    generatorRegistry.register(new GuardGenerator());
    generatorRegistry.register(new InterceptorGenerator());
    generatorRegistry.register(new PipeGenerator());
    generatorRegistry.register(new FilterGenerator());
    generatorRegistry.register(new MiddlewareGenerator());
    generatorRegistry.register(new ExceptionGenerator());
    generatorRegistry.register(new TestGenerator());
  }
}
