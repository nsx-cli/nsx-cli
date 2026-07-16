import { Project } from 'ts-morph';
import { describe, expect, it, vi } from 'vitest';
import { AstPersistenceService } from './ast-persistence.service';

describe('AstPersistenceService', () => {
  it('salva sourceFile, salva projeto inteiro e executa format', async () => {
    const project = new Project({ useInMemoryFileSystem: true });
    const sourceFile = project.createSourceFile('a.ts', 'export const a = 1;', {
      overwrite: true,
    });

    const saveSpy = vi.spyOn(sourceFile, 'save').mockResolvedValue(undefined);
    const context = {
      saveProject: vi.fn().mockResolvedValue(undefined),
    };

    const service = new AstPersistenceService(context as never);

    await service.save({ sourceFile });
    await service.saveAll();
    await service.format({ sourceFile });

    expect(saveSpy).toHaveBeenCalledTimes(1);
    expect(context.saveProject).toHaveBeenCalledTimes(1);
  });
});
