import os from "node:os";
import path from "node:path";
import { mkdtemp, mkdir, writeFile } from "node:fs/promises";
import { afterEach, describe, expect, it } from "vitest";
import { TemplateRegistry } from "./template-registry.service";

const originalCwd = process.cwd();

describe("TemplateRegistry", () => {
  afterEach(() => {
    process.chdir(originalCwd);
  });

  it("prioriza template instalado via marketplace", async () => {
    const tempRoot = await mkdtemp(path.join(os.tmpdir(), "nsx-template-registry-"));
    process.chdir(tempRoot);

    await mkdir(path.join(tempRoot, ".nsx", "templates", "enterprise-controller"), { recursive: true });
    await mkdir(path.join(tempRoot, "src", "templates"), { recursive: true });

    const installedTemplatePath = path.join(tempRoot, ".nsx", "templates", "enterprise-controller", "controller.hbs");

    await writeFile(installedTemplatePath, "installed controller", "utf8");
    await writeFile(path.join(tempRoot, "src", "templates", "controller.hbs"), "default controller", "utf8");
    await writeFile(
      path.join(tempRoot, ".nsx", "template-marketplace.json"),
      JSON.stringify({
        installedAt: new Date().toISOString(),
        catalogUrl: "https://example.com/catalog.json",
        packs: [],
        overrides: {
          controller: installedTemplatePath,
        },
      }),
      "utf8"
    );

    const registry = new TemplateRegistry();
    const resolvedPath = await registry.resolveTemplatePath("controller");

    expect(resolvedPath).toBe(installedTemplatePath);
  });
});