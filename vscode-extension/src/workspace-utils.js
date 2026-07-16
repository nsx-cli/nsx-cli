const path = require('node:path');

function deriveNameFromResourcePath(resourcePath) {
  const normalized = resourcePath.replace(/\\/g, '/');
  const baseName = path.posix.basename(normalized);

  return baseName.replace(/\.[^.]+$/, '');
}

function resolveWorkspaceRootFromResource(vscodeApi, resourceUri) {
  if (resourceUri) {
    const workspaceFolder = vscodeApi.workspace.getWorkspaceFolder(resourceUri);

    if (workspaceFolder) {
      return workspaceFolder.uri.fsPath;
    }
  }

  return vscodeApi.workspace.workspaceFolders?.[0]?.uri.fsPath ?? process.cwd();
}

module.exports = {
  deriveNameFromResourcePath,
  resolveWorkspaceRootFromResource,
};
