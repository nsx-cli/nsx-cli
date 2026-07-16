import { describe, expect, it, vi } from 'vitest';
import { CrudGenerator } from './crud-generator';
import { CrudModelNotFoundException } from './exceptions/crud-model-not-found.exception';
import { PrismaEngine } from '../prisma/prisma-engine';
import { PrismaModel } from '../prisma/prisma-model';

describe('CrudGenerator', () => {
  it('carrega o Prisma, localiza o model e delega para o orchestrator', async () => {
    const model = new PrismaModel({ name: 'User', fields: [], relations: [] });
    const loadMock = vi.fn().mockResolvedValue(undefined);
    const getModelMock = vi.fn().mockReturnValue(model);
    const executeMock = vi
      .fn()
      .mockResolvedValue({ modelName: 'User', totalSteps: 1 });

    const prismaEngine = {
      load: loadMock,
      getModel: getModelMock,
    } as unknown as PrismaEngine;

    const crudGenerator = new CrudGenerator(prismaEngine, {
      execute: executeMock,
    });

    const report = await crudGenerator.generate('User');

    expect(loadMock).toHaveBeenCalledWith();
    expect(getModelMock).toHaveBeenCalledWith('User');
    expect(executeMock).toHaveBeenCalledWith(model);
    expect(report).toEqual({ modelName: 'User', totalSteps: 1 });
  });

  it('lanca erro quando o model nao existe', async () => {
    const loadMock = vi.fn().mockResolvedValue(undefined);
    const getModelMock = vi.fn().mockReturnValue(undefined);
    const executeMock = vi
      .fn()
      .mockResolvedValue({ modelName: 'Missing', totalSteps: 0 });

    const prismaEngine = {
      load: loadMock,
      getModel: getModelMock,
    } as unknown as PrismaEngine;

    const crudGenerator = new CrudGenerator(prismaEngine, {
      execute: executeMock,
    });

    await expect(crudGenerator.generate('Missing')).rejects.toBeInstanceOf(
      CrudModelNotFoundException,
    );
    expect(executeMock).not.toHaveBeenCalled();
  });
});
