Clear-Host

Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "        NSX CLI DOCTOR v1.0" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "[1/9] TypeScript..." -ForegroundColor Yellow
npx tsc --noEmit

Write-Host ""
Write-Host "[2/9] Build..." -ForegroundColor Yellow
npm run build

Write-Host ""
Write-Host "[3/9] Testes..." -ForegroundColor Yellow
npm test

Write-Host ""
Write-Host "[4/9] ESLint..." -ForegroundColor Yellow
npx eslint src --fix

Write-Host ""
Write-Host "[5/9] Prettier..." -ForegroundColor Yellow
npx prettier . --write

Write-Host ""
Write-Host "[6/9] Código morto (Knip)..." -ForegroundColor Yellow
npx knip

Write-Host ""
Write-Host "[7/9] Exports não utilizados..." -ForegroundColor Yellow
npx ts-prune

Write-Host ""
Write-Host "[8/9] Dependências..." -ForegroundColor Yellow
npx depcheck

Write-Host ""
Write-Host "[9/9] Dependências circulares..." -ForegroundColor Yellow
npx madge src --circular

Write-Host ""
Write-Host "==========================================" -ForegroundColor Green
Write-Host "          DOCTOR FINALIZADO" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Green
