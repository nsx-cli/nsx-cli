# Architecture Guide

NSX CLI is structured around layered responsibilities:

- ApplicationContext: dependency container
- Bootstrap: composition root and wiring
- Command layer: user input and orchestration
- Core services: domain use-cases and pipelines
- Registry/Planner/Executor patterns for deterministic execution
- AST operations via ts-morph
- Prisma engine via DMMF

Primary flow:

ApplicationContext -> Bootstrap -> Registry -> Planner -> ExecutionPlan -> Executor -> Generators/Operations
