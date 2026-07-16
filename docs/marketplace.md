# Marketplace de Templates

O marketplace remoto permite listar, pesquisar e instalar packs de templates sem alterar a arquitetura dos generators existentes.

## Fluxo

1. O comando `nsx marketplace templates install <packId>` baixa os arquivos remotos do catálogo configurado.
2. Os templates são salvos em `.nsx/templates/<packId>/` no workspace.
3. O manifesto `.nsx/template-marketplace.json` registra os overrides ativos.
4. O `TemplateRegistry` prioriza esses overrides antes dos templates locais.

## Comandos

- `nsx marketplace templates list`
- `nsx marketplace templates search <query>`
- `nsx marketplace templates install <packId>`
- `nsx marketplace templates installed`

## Catálogo

O serviço aceita uma URL de catálogo via `--catalog-url` ou pela variável `NSX_TEMPLATE_MARKETPLACE_URL`.

## Uso

Exemplo:

```bash
nsx marketplace templates install enterprise-controller
```

Depois da instalação, um template remoto pode sobrescrever um template local com o mesmo nome, mantendo o fluxo atual de `generate` e `TemplateService`.