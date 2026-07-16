const { cpSync, rmSync, existsSync } = require('node:fs');
const path = require('node:path');

const sourceDir = path.resolve(process.cwd(), 'src', 'templates');
const targetDir = path.resolve(process.cwd(), 'dist', 'templates');

if (existsSync(targetDir)) {
  rmSync(targetDir, { recursive: true, force: true });
}

cpSync(sourceDir, targetDir, { recursive: true });
