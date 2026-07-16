import { Command } from 'commander';
import { describe, expect, it, vi } from 'vitest';
import { MarketplaceCommand } from './marketplace.command';

describe('MarketplaceCommand', () => {
  it('exibe packs remotos, pesquisa e instala', async () => {
    const marketplaceService = {
      list: vi.fn().mockResolvedValue({
        catalogUrl: 'https://example.com/catalog.json',
        packs: [
          {
            id: 'enterprise-controller',
            name: 'Enterprise Controller Pack',
            description: 'Controllers enterprise',
            version: '1.0.0',
            tags: ['controller'],
            templates: [
              {
                name: 'controller',
                downloadUrl: 'https://example.com/controller.hbs',
              },
            ],
          },
        ],
      }),
      search: vi.fn().mockResolvedValue({
        catalogUrl: 'https://example.com/catalog.json',
        query: 'enterprise',
        packs: [
          {
            id: 'enterprise-controller',
            name: 'Enterprise Controller Pack',
            description: 'Controllers enterprise',
            version: '1.0.0',
            tags: ['controller'],
            templates: [
              {
                name: 'controller',
                downloadUrl: 'https://example.com/controller.hbs',
              },
            ],
          },
        ],
      }),
      install: vi.fn().mockResolvedValue({
        catalogUrl: 'https://example.com/catalog.json',
        pack: {
          id: 'enterprise-controller',
          name: 'Enterprise Controller Pack',
          description: 'Controllers enterprise',
          version: '1.0.0',
          tags: ['controller'],
          templates: [
            {
              name: 'controller',
              downloadUrl: 'https://example.com/controller.hbs',
            },
          ],
        },
        manifestPath: 'c:/workspace/.nsx/template-marketplace.json',
        templates: [
          {
            name: 'controller',
            filePath:
              'c:/workspace/.nsx/templates/enterprise-controller/controller.hbs',
            sourceUrl: 'https://example.com/controller.hbs',
          },
        ],
      }),
      listInstalled: vi.fn().mockResolvedValue({
        manifestPath: 'c:/workspace/.nsx/template-marketplace.json',
        packs: [
          {
            id: 'enterprise-controller',
            name: 'Enterprise Controller Pack',
            version: '1.0.0',
            installedAt: '2026-07-14T00:00:00.000Z',
            templates: [
              {
                name: 'controller',
                filePath:
                  'c:/workspace/.nsx/templates/enterprise-controller/controller.hbs',
                sourceUrl: 'https://example.com/controller.hbs',
              },
            ],
          },
        ],
      }),
    };

    const program = new Command();
    program.exitOverride();
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => undefined);

    new MarketplaceCommand(marketplaceService as never).register(program);

    await program.parseAsync(['marketplace', 'templates', 'list'], {
      from: 'user',
    });
    await program.parseAsync(
      ['marketplace', 'templates', 'search', 'enterprise'],
      { from: 'user' },
    );
    await program.parseAsync(
      ['marketplace', 'templates', 'install', 'enterprise-controller'],
      { from: 'user' },
    );
    await program.parseAsync(['marketplace', 'templates', 'installed'], {
      from: 'user',
    });

    expect(marketplaceService.list).toHaveBeenCalled();
    expect(marketplaceService.search).toHaveBeenCalledWith(
      'enterprise',
      undefined,
    );
    expect(marketplaceService.install).toHaveBeenCalledWith(
      'enterprise-controller',
      { catalogUrl: undefined },
    );
    expect(marketplaceService.listInstalled).toHaveBeenCalled();
    expect(logSpy).toHaveBeenCalledWith(
      expect.stringContaining('Templates remotos disponíveis'),
    );
    expect(logSpy).toHaveBeenCalledWith(
      expect.stringContaining('Template pack instalado'),
    );

    logSpy.mockRestore();
  });
});
