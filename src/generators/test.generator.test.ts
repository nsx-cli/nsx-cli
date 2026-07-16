import path from 'path';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { pathExists } from 'fs-extra';
import { describe, expect, it } from 'vitest';
import { TestGenerator } from './test.generator';

describe('TestGenerator', () => {
  it('gera scaffold de teste no modulo informado', async () => {
    const previousCwd = process.cwd();
    const sandbox = await mkdtemp(path.join(tmpdir(), 'nsx-test-generator-'));

    process.chdir(sandbox);

    try {
      const generator = new TestGenerator();
      await generator.generate('billing');

      const outputPath = path.join(
        sandbox,
        'src',
        'modules',
        'billing',
        'billing.spec.ts',
      );

      expect(await pathExists(outputPath)).toBe(true);

      const content = await readFile(outputPath, 'utf8');

      expect(content).toContain('describe("Billing module tests"');
      expect(content).toContain('expect("billing").toBe("billing")');
    } finally {
      process.chdir(previousCwd);
      await rm(sandbox, { recursive: true, force: true });
    }
  });

  it('nao sobrescreve arquivo de teste existente', async () => {
    const previousCwd = process.cwd();
    const sandbox = await mkdtemp(path.join(tmpdir(), 'nsx-test-generator-'));

    process.chdir(sandbox);

    try {
      const generator = new TestGenerator();
      await generator.generate('accounts');

      const outputPath = path.join(
        sandbox,
        'src',
        'modules',
        'accounts',
        'accounts.spec.ts',
      );
      const initialContent = await readFile(outputPath, 'utf8');

      await generator.generate('accounts');

      const afterSecondRun = await readFile(outputPath, 'utf8');
      expect(afterSecondRun).toBe(initialContent);
    } finally {
      process.chdir(previousCwd);
      await rm(sandbox, { recursive: true, force: true });
    }
  });
});
