import os from "node:os";
import path from "node:path";
import { mkdtemp, readFile } from "node:fs/promises";
import { describe, expect, it, vi } from "vitest";
import { FileService } from "../../services/file.service";
import { TemplateMarketplaceService } from "./template-marketplace.service";

describe("TemplateMarketplaceService", () => {
  it("lista, pesquisa e instala templates remotos", async () => {
    const tempRoot = await mkdtemp(path.join(os.tmpdir(), "nsx-marketplace-"));
    const catalogUrl = "https://example.com/catalog.json";

    const fetchMock = vi.fn(async (input: string) => {
      if (input === catalogUrl) {
        return new Response(
          JSON.stringify({
            packs: [
              {
                id: "enterprise-controller",
                name: "Enterprise Controller Pack",
                description: "Controllers enterprise",
                version: "1.0.0",
                tags: ["controller", "nestjs"],
                templates: [
                  { name: "controller", downloadUrl: "https://example.com/controller.hbs" },
                  { name: "service", downloadUrl: "https://example.com/service.hbs" },
                ],
              },
            ],
          }),
          { status: 200 }
        );
      }

      if (input === "https://example.com/controller.hbs") {
        return new Response("export class {{controllerName}} {}", { status: 200 });
      }

      if (input === "https://example.com/service.hbs") {
        return new Response("export class {{serviceName}} {}", { status: 200 });
      }

      return new Response("not found", { status: 404 });
    });

    const service = new TemplateMarketplaceService(tempRoot, new FileService(), fetchMock as never, catalogUrl);

    const listResult = await service.list();
    expect(listResult.packs).toHaveLength(1);

    const searchResult = await service.search("enterprise");
    expect(searchResult.packs).toHaveLength(1);

    const installResult = await service.install("enterprise-controller");

    expect(installResult.templates).toHaveLength(2);
    expect(fetchMock).toHaveBeenCalledWith(catalogUrl);

    const installedController = await readFile(installResult.templates[0].filePath, "utf8");
    expect(installedController).toContain("{{controllerName}}");

    const manifestPath = path.resolve(tempRoot, ".nsx", "template-marketplace.json");
    const manifest = JSON.parse(await readFile(manifestPath, "utf8")) as { overrides: Record<string, string> };

    expect(manifest.overrides.controller).toContain(path.join(".nsx", "templates", "enterprise-controller"));
    expect(manifest.overrides.service).toContain(path.join(".nsx", "templates", "enterprise-controller"));
  });

  it("lista instalados sem manifest e retorna vazio quando não há correspondência", async () => {
    const tempRoot = await mkdtemp(path.join(os.tmpdir(), "nsx-marketplace-empty-"));

    const fetchMock = vi.fn(async () => new Response(JSON.stringify({ packs: [] }), { status: 200 }));
    const service = new TemplateMarketplaceService(tempRoot, new FileService(), fetchMock as never, "https://example.com/catalog.json");

    const installed = await service.listInstalled();
    const search = await service.search("missing");

    expect(installed.packs).toEqual([]);
    expect(search.packs).toEqual([]);
  });
});