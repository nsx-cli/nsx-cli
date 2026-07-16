import { Command } from 'commander';
import { PluginManager } from '../core/plugin/plugin-manager';

export class PluginCommand {
  constructor(private readonly pluginManager: PluginManager) {}

  public register(program: Command): void {
    const plugins = program
      .command('plugins')
      .description('Gerenciamento de plugins do CLI');

    plugins
      .command('list')
      .description('Lista plugins carregados, falhos e ignorados')
      .action(() => {
        if (!this.pluginManager.isInitialized()) {
          console.log('Plugin system ainda não foi inicializado.');
          return;
        }

        const loaded = this.pluginManager.listLoaded();
        const failed = this.pluginManager.listFailed();
        const skipped = this.pluginManager.listSkipped();

        console.log(`Plugins carregados: ${loaded.length}`);

        for (const plugin of loaded) {
          console.log(
            `  ✔ ${plugin.definition.name} (${plugin.descriptor.modulePath})`,
          );
        }

        console.log(`Plugins com falha: ${failed.length}`);

        for (const plugin of failed) {
          console.log(`  ✖ ${plugin.descriptor.id}: ${plugin.error}`);
        }

        console.log(`Plugins ignorados: ${skipped.length}`);

        for (const plugin of skipped) {
          console.log(`  ○ ${plugin.id}`);
        }
      });
  }
}
