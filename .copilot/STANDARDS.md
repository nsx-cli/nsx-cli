# NSX CLI STANDARDS

## Regras Obrigatorias

- Nunca usar any
- Nunca usar parser manual para TypeScript
- Sempre usar ts-morph para alteracoes em TypeScript
- Sempre usar DMMF oficial do Prisma
- Todo Generator implementa IGenerator
- Toda alteracao em AST deve ser idempotente
- Todo codigo novo possui testes
- Todo Command usa ApplicationContext
- Todo Generator registra metadata
- Nunca usar switch quando Registry resolver
- Composition over Inheritance
- Nao duplicar logica entre camadas
- Planner nao executa I/O
- Executor nao decide arquitetura, apenas executa steps
- Generators nao modificam arquivos existentes
- Operations sao responsaveis por modificar arquivos existentes
- Todo fluxo novo precisa de validacao com build TypeScript
