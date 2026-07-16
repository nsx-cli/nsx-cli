# DECISIONS

## ADR-001

Nunca utilizar parser manual do Prisma.

Motivo:

DMMF oficial e estavel e suportado oficialmente.

------------------------------------------------

## ADR-002

Toda modificacao TypeScript utiliza ts-morph.

------------------------------------------------

## ADR-003

Planner separado do Executor.

------------------------------------------------

## ADR-004

Registry substitui switch.

------------------------------------------------

## ADR-005

Generators nunca modificam arquivos existentes.

Apenas Operations fazem isso.

------------------------------------------------

## ADR-006

Todo Command e registrado no Bootstrap e resolvido via ApplicationContext.

------------------------------------------------

## ADR-007

Toda feature so e considerada pronta com testes e build TypeScript valido.

------------------------------------------------

## ADR-008

Comandos make devem mapear targets por registry/mapa declarativo.

Motivo:

Evitar switch/case e manter extensao previsivel para novos targets.

------------------------------------------------

## ADR-009

Analyze deve seguir pipeline Command -> Service -> Analyzer -> Formatter.

Motivo:

Separar orquestração, cálculo de métricas e apresentação para manter coesão, testabilidade e evolução incremental.

------------------------------------------------

## ADR-010

NSX Fix deve seguir pipeline FixCommand -> FixEngine -> FixPlanner -> ExecutionPlan -> FixExecutor -> Operations.

Motivo:

Garantir dry-run previsível, preview de mudanças e reuso explícito de AnalyzeAnalyzer + operações AST existentes sem duplicar lógica de manipulação.

------------------------------------------------

## ADR-011

NSX Graph deve seguir pipeline GraphCommand -> GraphService -> GraphBuilder -> GraphFormatter.

Motivo:

Separar descoberta de dependencias (builder), apresentacao (formatter) e orquestracao/IO (service) para manter testabilidade e aderencia ao padrao de comandos existentes.

------------------------------------------------

## ADR-012

Test Generator deve ser um IGenerator registrado no GeneratorRegistry e executado via comando generate.

Motivo:

Manter extensibilidade declarativa por metadata, reusar Template Method de BaseGenerator e evitar criacao de novo comando dedicado para geracao de testes.

------------------------------------------------

## ADR-013

Marketplace de templates deve instalar overlays em .nsx/template-marketplace.json e o TemplateRegistry deve priorizar templates remotos instalados antes dos templates locais.

------------------------------------------------

Motivo:

Permitir uso imediato de templates remotos sem alterar a arquitetura dos generators existentes e manter a resolução idempotente e previsivel.

------------------------------------------------

## ADR-014

A extensao oficial do VS Code deve ser uma camada fina de integracao que apenas invoca a CLI NSX por comando, sem duplicar regras de negocio.

Motivo:

Centralizar toda a regra na CLI, manter o comportamento consistente entre terminal e editor, e evitar divergencia entre o manifesto da extensao e o pipeline interno.

------------------------------------------------

## ADR-015

A extensao deve expor comandos via Command Palette e menus do Explorer/Context Menu usando a VS Code Extension API oficial.

Motivo:

Garantir descoberta natural no editor, manter a experiencia previsivel para o usuario e depender somente das contribution points oficiais da plataforma.

------------------------------------------------

## ADR-016

A release 1.0 deve ser validada com build, testes e coverage do pacote principal antes de qualquer empacotamento ou publicacao.

Motivo:

Reduzir risco de regressao na entrega final e manter o processo de publicacao baseado em evidencias de qualidade do codigo-fonte real.

------------------------------------------------

## ADR-017

A validacao final da release 1.0 deve usar um playground isolado `nsx-playground` com o pacote local instalado e comandos exercitados de ponta a ponta.

Motivo:

Confirmar o comportamento real da CLI fora do workspace principal, validar binario, comandos e templates publicados, e reduzir risco de regressao no consumo externo.
