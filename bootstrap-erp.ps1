$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "==============================================="
Write-Host "        NSX CLI ERP BOOTSTRAP"
Write-Host "==============================================="
Write-Host ""

Write-Host "[1/8] Instalando dependências..."

npm install

Write-Host ""
Write-Host "[2/8] Compilando..."

npm run build

Write-Host ""
Write-Host "[3/8] Executando testes..."

npm test

Write-Host ""
Write-Host "[4/8] Corrigindo imports..."

npx tsc --noEmit

Write-Host ""
Write-Host "[5/8] Organizando código..."

npx prettier . --write

Write-Host ""
Write-Host "[6/8] Executando ESLint..."

npx eslint src --fix

Write-Host ""
Write-Host "[7/8] Validando Prisma..."

npx prisma validate

Write-Host ""
Write-Host "[8/8] Gerando Client Prisma..."

npx prisma generate

Write-Host ""
Write-Host "==============================================="
Write-Host "       BOOTSTRAP FINALIZADO COM SUCESSO"
Write-Host "==============================================="