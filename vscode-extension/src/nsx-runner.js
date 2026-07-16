const { spawn } = require("node:child_process");

function createNsxRunner(vscodeApi, outputChannel) {
  return async function runNsx(args, cwd) {
    const cliPath = vscodeApi.workspace.getConfiguration("nsx").get("cliPath", "nsx");
    const workingDirectory = cwd ?? vscodeApi.workspace.workspaceFolders?.[0]?.uri.fsPath ?? process.cwd();

    outputChannel.appendLine(`> ${cliPath} ${args.join(" ")}`);

    return new Promise((resolve, reject) => {
      const child = spawn(cliPath, args, {
        cwd: workingDirectory,
        shell: true,
        windowsHide: true,
      });

      let stdout = "";
      let stderr = "";

      child.stdout?.on("data", (chunk) => {
        const text = chunk.toString();
        stdout += text;
        outputChannel.append(text);
      });

      child.stderr?.on("data", (chunk) => {
        const text = chunk.toString();
        stderr += text;
        outputChannel.append(text);
      });

      child.on("error", (error) => {
        reject(error);
      });

      child.on("close", (code) => {
        if (code === 0) {
          resolve({ stdout, stderr, code });
          return;
        }

        reject(new Error(stderr.trim() || `NSX CLI exited with code ${code ?? -1}`));
      });
    });
  };
}

module.exports = {
  createNsxRunner,
};