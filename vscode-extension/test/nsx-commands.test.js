import { describe, expect, it } from "vitest";
import nsxCommands from "../src/nsx-commands.js";
import workspaceUtils from "../src/workspace-utils.js";

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
} = nsxCommands;

const { deriveNameFromResourcePath } = workspaceUtils;

describe("NSX VS Code extension helpers", () => {
  it("builds CLI args without duplicating CLI logic", () => {
    expect(buildDoctorArgs()).toEqual(["doctor"]);
    expect(buildAnalyzeArgs()).toEqual(["analyze"]);
    expect(buildFixArgs({ dryRun: true, outputPath: "c:/tmp/report.md" })).toEqual([
      "fix",
      "--dry-run",
      "--output",
      "c:/tmp/report.md",
    ]);
    expect(buildGraphArgs()).toEqual(["graph"]);
    expect(buildDocsGenerateArgs()).toEqual(["docs", "generate"]);
    expect(buildGenerateArgs("module", "users")).toEqual(["generate", "module", "users"]);
    expect(buildMakeArgs("resource", "users")).toEqual(["make", "resource", "users"]);
    expect(buildPrismaCrudArgs("User")).toEqual(["prisma", "crud", "User"]);
    expect(buildMarketplaceListArgs()).toEqual(["marketplace", "templates", "list"]);
    expect(buildMarketplaceInstallArgs("enterprise-controller")).toEqual([
      "marketplace",
      "templates",
      "install",
      "enterprise-controller",
    ]);
  });

  it("derives a suggested name from explorer paths", () => {
    expect(deriveNameFromResourcePath("c:\\workspace\\src\\modules\\users")).toBe("users");
    expect(deriveNameFromResourcePath("c:\\workspace\\src\\modules\\users\\users.controller.ts")).toBe("users.controller");
  });
});