import { describe, expect, it, vi } from 'vitest';
import { FileService } from './file.service';

describe('FileService', () => {
  it('encaminha todas operações para FileSystem', async () => {
    const service = new FileService();
    const fsMock = {
      mkdir: vi.fn().mockResolvedValue(undefined),
      write: vi.fn().mockResolvedValue(undefined),
      exists: vi.fn().mockResolvedValue(true),
      read: vi.fn().mockResolvedValue('abc'),
      copy: vi.fn().mockResolvedValue(undefined),
      move: vi.fn().mockResolvedValue(undefined),
      remove: vi.fn().mockResolvedValue(undefined),
      find: vi.fn().mockResolvedValue(['x']),
      list: vi.fn().mockResolvedValue(['y']),
      readJson: vi.fn().mockResolvedValue({ z: 1 }),
      writeJson: vi.fn().mockResolvedValue(undefined),
    };

    (service as unknown as { fileSystem: typeof fsMock }).fileSystem = fsMock;

    await service.ensureDirectory('a');
    await service.writeFile('a.txt', 'x');
    expect(await service.exists('a.txt')).toBe(true);
    expect(await service.read('a.txt')).toBe('abc');
    await service.copy('a', 'b');
    await service.move('a', 'b');
    await service.remove('a');
    expect(await service.find('**/*.ts')).toEqual(['x']);
    expect(await service.list('.')).toEqual(['y']);
    expect(await service.readJson('a.json')).toEqual({ z: 1 });
    await service.writeJson('a.json', { z: 2 });

    expect(fsMock.mkdir).toHaveBeenCalled();
    expect(fsMock.writeJson).toHaveBeenCalled();
  });
});
