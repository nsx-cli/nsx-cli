# NSX CLI ARCHITECTURE

## Fluxo Principal

ApplicationContext

↓

Bootstrap

↓

Registry

↓

Planner

↓

ExecutionPlan

↓

Executor

↓

Generators

↓

AST Operations

## Responsabilidades por Camada

## ApplicationContext

- Resolver dependencias por token
- Registrar servicos e comandos
- Evitar acoplamento entre implementacoes

## Bootstrap

- Compor todo o grafo da aplicacao
- Registrar Commands, Services, Registries e Engines
- Definir wiring oficial de runtime

## Registry

- Resolver estrategias por metadata
- Substituir switch/case por lookup explicito
- Centralizar plugins e executors disponiveis

## Planner

- Traduzir intencao de alto nivel para passos atomicos
- Definir ordem deterministica de execucao
- Nao executar efeitos colaterais

## ExecutionPlan

- Representar plano imutavel/serializavel de etapas
- Permitir relatorio de execucao e auditoria

## Executor

- Executar steps por Strategy/Registry
- Garantir idempotencia quando aplicavel
- Produzir report final com status e duracao

## Generators

- Gerar arquivos novos a partir de templates
- Implementar IGenerator e metadata obrigatoria
- Nao alterar arquivos existentes

## AST Operations

- Alterar codigo TypeScript existente via ts-morph
- Aplicar mudancas idempotentes e seguras
- Organizar imports e atualizar metadata de modulo

## Integracoes Oficiais

- Prisma: leitura e modelagem via DMMF oficial
- TypeScript AST: operacoes via ts-morph
- CLI: comandos registrados no Bootstrap e resolvidos pelo ApplicationContext
