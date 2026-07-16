import { describe, expect, it } from 'vitest';
import { ProjectScanner } from './project-scanner.service';

describe('ProjectScanner', () => {
  it('returns scan metadata for current workspace', async () => {
    const scanner = new ProjectScanner(process.cwd());
    const result = await scanner.scan();

    expect(result.rootDir.length).toBeGreaterThan(0);
    expect(typeof result.isNestJs).toBe('boolean');
    expect(typeof result.usesPrisma).toBe('boolean');
    expect(typeof result.usesTypeORM).toBe('boolean');
  });
});
