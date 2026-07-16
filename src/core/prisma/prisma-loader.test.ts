import path from "path";
import { afterEach, describe, expect, it, vi } from "vitest";
import { SchemaNotFoundException } from "./exceptions/schema-not-found.exception";
import { SchemaReadException } from "./exceptions/schema-read.exception";
import { PrismaLoader } from "./prisma-loader";

const statMock = vi.hoisted(() => vi.fn());
const readFileMock = vi.hoisted(() => vi.fn());

vi.mock("fs/promises", () => ({
  stat: statMock,
  readFile: readFileMock,
}));

function createFileInfo(isFileResult: boolean) {
  return {
    isFile: () => isFileResult,
  };
}

describe("PrismaLoader", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("localiza schema automaticamente a partir do diretorio atual", async () => {
    const loader = new PrismaLoader();
    const cwd = process.cwd();
    const expectedPath = path.join(cwd, "prisma", "schema.prisma");

    statMock.mockImplementation(async (filePath: string) => {
      if (filePath === path.join(cwd, "schema.prisma")) {
        return createFileInfo(false);
      }

      if (filePath === expectedPath) {
        return createFileInfo(true);
      }

      return createFileInfo(false);
    });

    readFileMock.mockResolvedValue("datasource db {}\n");

    const result = await loader.load();

    expect(result).toEqual({
      path: expectedPath,
      content: "datasource db {}\n",
    });
    expect(readFileMock).toHaveBeenCalledWith(expectedPath, "utf8");
  });

  it("permite caminho customizado", async () => {
    const loader = new PrismaLoader();
    const customSchemaPath = path.join("prisma", "custom-schema.prisma");
    const expectedPath = path.resolve(process.cwd(), customSchemaPath);

    statMock.mockResolvedValue(createFileInfo(true));
    readFileMock.mockResolvedValue("model User {}\n");

    const result = await loader.load({ schemaPath: customSchemaPath });

    expect(result.path).toBe(expectedPath);
    expect(result.content).toBe("model User {}\n");
    expect(readFileMock).toHaveBeenCalledWith(expectedPath, "utf8");
  });

  it("lanca SchemaNotFoundException quando o schema nao existe", async () => {
    const loader = new PrismaLoader();

    statMock.mockResolvedValue(createFileInfo(false));

    await expect(loader.resolveSchemaPath({ schemaPath: "prisma/missing-schema.prisma" })).rejects.toBeInstanceOf(
      SchemaNotFoundException
    );
  });

  it("lanca SchemaReadException quando houver erro de leitura", async () => {
    const loader = new PrismaLoader();
    const cwd = process.cwd();
    const expectedPath = path.join(cwd, "prisma", "schema.prisma");

    statMock.mockImplementation(async (filePath: string) => {
      if (filePath === path.join(cwd, "schema.prisma")) {
        return createFileInfo(false);
      }

      if (filePath === expectedPath) {
        return createFileInfo(true);
      }

      return createFileInfo(false);
    });

    readFileMock.mockRejectedValue(new Error("EACCES"));

    await expect(loader.load()).rejects.toBeInstanceOf(SchemaReadException);
  });
});
