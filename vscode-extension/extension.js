const vscode = require("vscode");
const { createNsxRunner } = require("./src/nsx-runner");
const {
  deriveNameFromResourcePath,
  resolveWorkspaceRootFromResource,
} = require("./src/workspace-utils");
const {
  buildDoctorArgs,
  buildAnalyzeArgs,
  buildFixArgs,
  buildGraphArgs,
  buildDocsGenerateArgs,
  buildGenerateArgs,
  buildMakeArgs,
  buildPrismaCrudArgs,
  buildMarketplaceListArgs,
  buildMarketplaceInstallArgs,
} = require("./src/nsx-commands");

function activate(context) {
  const outputChannel = vscode.window.createOutputChannel("NSX CLI");
  const runner = createNsxRunner(vscode, outputChannel);
  const workspaceRoot = resolveWorkspaceRootFromResource(vscode);

  const register = (commandId, handler) => {
    context.subscriptions.push(vscode.commands.registerCommand(commandId, handler));
  };

  register("nsx.doctor", async () => {
    await runCliCommand(runner, buildDoctorArgs(), outputChannel, workspaceRoot);
  });

  register("nsx.analyze", async () => {
    await runCliCommand(runner, buildAnalyzeArgs(), outputChannel, workspaceRoot);
  });

  register("nsx.fix.dryRun", async () => {
    await runCliCommand(runner, buildFixArgs({ dryRun: true }), outputChannel, workspaceRoot);
  });

  register("nsx.fix.apply", async () => {
    await runCliCommand(runner, buildFixArgs({ dryRun: false }), outputChannel, workspaceRoot);
  });

  register("nsx.graph", async () => {
    await runCliCommand(runner, buildGraphArgs(), outputChannel, workspaceRoot);
  });

  register("nsx.docs.generate", async () => {
    await runCliCommand(runner, buildDocsGenerateArgs(), outputChannel, workspaceRoot);
  });

  register("nsx.generate.module", async (resourceUri) => {
    await runGenerateCommand({
      runner,
      outputChannel,
      resourceUri,
      type: "module",
      commandId: "nsx.generate.module",
    });
  });

  register("nsx.generate.module.fromFolder", async (resourceUri) => {
    await runGenerateCommand({
      runner,
      outputChannel,
      resourceUri,
      type: "module",
      commandId: "nsx.generate.module.fromFolder",
      preferResourceName: true,
    });
  });

  register("nsx.generate.test", async (resourceUri) => {
    await runGenerateCommand({
      runner,
      outputChannel,
      resourceUri,
      type: "test",
      commandId: "nsx.generate.test",
    });
  });

  register("nsx.generate.test.fromFolder", async (resourceUri) => {
    await runGenerateCommand({
      runner,
      outputChannel,
      resourceUri,
      type: "test",
      commandId: "nsx.generate.test.fromFolder",
      preferResourceName: true,
    });
  });

  register("nsx.make.resource", async (resourceUri) => {
    await runMakeCommand({
      runner,
      outputChannel,
      resourceUri,
      target: "resource",
      commandId: "nsx.make.resource",
    });
  });

  register("nsx.make.resource.fromFolder", async (resourceUri) => {
    await runMakeCommand({
      runner,
      outputChannel,
      resourceUri,
      target: "resource",
      commandId: "nsx.make.resource.fromFolder",
      preferResourceName: true,
    });
  });

  register("nsx.prisma.crud", async (resourceUri) => {
    await runPrismaCrudCommand({ runner, outputChannel, resourceUri, commandId: "nsx.prisma.crud" });
  });

  register("nsx.prisma.crud.fromFolder", async (resourceUri) => {
    await runPrismaCrudCommand({
      runner,
      outputChannel,
      resourceUri,
      commandId: "nsx.prisma.crud.fromFolder",
      preferResourceName: true,
    });
  });

  register("nsx.marketplace.templates.list", async () => {
    await runCliCommand(runner, buildMarketplaceListArgs(), outputChannel, workspaceRoot);
  });

  register("nsx.marketplace.templates.install", async () => {
    const packId = await vscode.window.showInputBox({
      title: "NSX Marketplace",
      prompt: "Template pack identifier",
      placeHolder: "enterprise-controller",
      ignoreFocusOut: true,
    });

    if (!packId) {
      return;
    }

    await runCliCommand(runner, buildMarketplaceInstallArgs(packId), outputChannel, workspaceRoot);
  });

  context.subscriptions.push(outputChannel);
}

async function runCliCommand(runner, args, outputChannel, cwd) {
  outputChannel.clear();
  outputChannel.show(true);

  try {
    const result = await runner(args, cwd);

    if (result.stdout) {
      outputChannel.append(result.stdout);
    }

    if (result.stderr) {
      outputChannel.append(result.stderr);
    }

    vscode.window.showInformationMessage("NSX CLI finished successfully.");
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    outputChannel.appendLine(message);
    vscode.window.showErrorMessage(`NSX CLI failed: ${message}`);
  }
}

async function runGenerateCommand({ runner, outputChannel, resourceUri, type, commandId, preferResourceName = false }) {
  const workspaceRoot = resolveWorkspaceRootFromResource(vscode, resourceUri);
  const resourceName = preferResourceName && resourceUri ? deriveNameFromResourcePath(resourceUri.fsPath) : undefined;
  const name = await promptForName(vscode, type, resourceName);

  if (!name) {
    return;
  }

  await runCliCommand(runner, buildGenerateArgs(type, name), outputChannel, workspaceRoot);
}

async function runMakeCommand({ runner, outputChannel, resourceUri, target, commandId, preferResourceName = false }) {
  const workspaceRoot = resolveWorkspaceRootFromResource(vscode, resourceUri);
  const resourceName = preferResourceName && resourceUri ? deriveNameFromResourcePath(resourceUri.fsPath) : undefined;
  const name = await promptForName(vscode, target, resourceName);

  if (!name) {
    return;
  }

  await runCliCommand(runner, buildMakeArgs(target, name), outputChannel, workspaceRoot);
}

async function runPrismaCrudCommand({ runner, outputChannel, resourceUri, commandId, preferResourceName = false }) {
  const workspaceRoot = resolveWorkspaceRootFromResource(vscode, resourceUri);
  const suggestedName = preferResourceName && resourceUri ? deriveNameFromResourcePath(resourceUri.fsPath) : undefined;
  const modelName = await promptForName(vscode, "Prisma model", suggestedName);

  if (!modelName) {
    return;
  }

  await runCliCommand(runner, buildPrismaCrudArgs(modelName), outputChannel, workspaceRoot);
}

async function promptForName(vscodeApi, label, suggestedValue) {
  return vscodeApi.window.showInputBox({
    title: "NSX CLI",
    prompt: `${label} name`,
    value: suggestedValue ?? "",
    ignoreFocusOut: true,
  });
}

function deactivate() {}

module.exports = {
  activate,
  deactivate,
};