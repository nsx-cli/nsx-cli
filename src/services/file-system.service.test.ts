import * as fsExtra from 'fs-extra';
import { describe, expect, it, vi } from 'vitest';
import { FileSystem } from './file-system.service';

vi.mock('fs-extra', () => ({
  copy: vi.fn().mockResolvedValue(undefined),
  ensureDir: vi.fn().mockResolvedValue(undefined),
  ensureFile: vi.fn().mockResolvedValue(undefined),
  pathExists: vi.fn().mockResolvedValue(true),
  readFile: vi.fn().mockResolvedValue('content'),
  remove: vi.fn().mockResolvedValue(undefined),
  rename: vi.fn().mockResolvedValue(undefined),
  writeFile: vi.fn().mockResolvedValue(undefined),
  readdir: vi.fn().mockResolvedValue(['a', 'b']),
  glob: vi.fn(
    (pattern: string, cb: (error: Error | null, matches: string[]) => void) =>
      cb(null, [pattern]),
  ),
  readJson: vi.fn().mockResolvedValue({ ok: true }),
  writeJson: vi.fn().mockResolvedValue(undefined),
}));

describe('FileSystem', () => {
  it('executa operações de arquivo e diretório', async () => {
    const fs = new FileSystem();

    expect(await fs.read('a.txt')).toBe('content');
    await fs.write('a.txt', 'x');
    expect(await fs.exists('a.txt')).toBe(true);
    await fs.copy('a.txt', 'dir/b.txt');
    await fs.move('dir/b.txt', 'dir/c.txt');
    await fs.remove('dir/c.txt');
    await fs.mkdir('dir');
    expect(await fs.find('src/**/*.ts')).toEqual(['src/**/*.ts']);
    expect(await fs.list('src')).toEqual(['a', 'b']);
    expect(await fs.readJson('a.json')).toEqual({ ok: true });
    await fs.writeJson('a.json', { x: 1 });
  });

  it('propaga erro no glob', async () => {
    vi.mocked(fsExtra.glob).mockImplementationOnce(((
      pattern: string,
      cb: (error: Error | null, matches: string[]) => void,
    ) => cb(new Error('glob fail'), [])) as typeof fsExtra.glob);

    const fs = new FileSystem();

    await expect(fs.find('**/*.ts')).rejects.toThrow('glob fail');
  });
});
