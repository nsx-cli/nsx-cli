import type { DMMF } from "@prisma/generator-helper";
import { getDMMF } from "@prisma/internals";
import { afterEach, describe, expect, it, vi } from "vitest";
import { DmmfGenerationException } from "./exceptions/dmmf-generation.exception";
import { PrismaDmmf } from "./prisma-dmmf";

vi.mock("@prisma/internals", () => ({
  getDMMF: vi.fn(),
}));

const getDmmfMock = vi.mocked(getDMMF);

function createDocument(overrides: Partial<DMMF.Document> = {}): DMMF.Document {
  return {
    datamodel: {
      models: [],
      enums: [],
      types: [],
      ...overrides.datamodel,
    },
    schema: {
      inputObjectTypes: { model: [], prisma: [] },
      outputObjectTypes: { model: [], prisma: [] },
      enumTypes: { model: [], prisma: [] },
      rootQueryType: null,
      rootMutationType: null,
      rootSubscriptionType: null,
      ...overrides.schema,
    },
    mappings: {
      modelOperations: [],
      otherOperations: [],
      ...overrides.mappings,
    },
    datamodelEnumMap: {},
    ...overrides,
  } as DMMF.Document;
}

describe("PrismaDmmf", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("gera DMMF a partir de um schema valido", async () => {
    const schema = `
      datasource db {
        provider = "sqlite"
        url      = "file:dev.db"
      }

      model User {
        id Int @id
      }
    `;
    const document = createDocument();

    getDmmfMock.mockResolvedValueOnce(document);

    const prismaDmmf = new PrismaDmmf();
    const result = await prismaDmmf.generate(schema);

    expect(getDmmfMock).toHaveBeenCalledWith({ datamodel: schema });
    expect(result).toBe(document);
  });

  it("lanca DmmfGenerationException quando o schema e invalido", async () => {
    const schema = `model User { id Int`;

    getDmmfMock.mockRejectedValueOnce(new Error("Invalid schema"));

    const prismaDmmf = new PrismaDmmf();

    await expect(prismaDmmf.generate(schema)).rejects.toBeInstanceOf(DmmfGenerationException);
  });

  it("preserva um model simples no documento retornado", async () => {
    const schema = `
      model User {
        id Int @id
        name String
      }
    `;
    const document = createDocument({
      datamodel: {
        models: [
          {
            name: "User",
            dbName: null,
            schema: null,
            fields: [],
            primaryKey: null,
            uniqueFields: [],
            uniqueIndexes: [],
            isGenerated: false,
            documentation: undefined,
          },
        ],
        enums: [],
        types: [],
        indexes: [],
      },
    });

    getDmmfMock.mockResolvedValueOnce(document);

    const prismaDmmf = new PrismaDmmf();
    const result = await prismaDmmf.generate(schema);

    expect(result.datamodel.models).toHaveLength(1);
    expect(result.datamodel.models[0].name).toBe("User");
  });

  it("preserva um model com relacionamento no documento retornado", async () => {
    const schema = `
      model User {
        id Int @id
        posts Post[]
      }

      model Post {
        id Int @id
        userId Int
        user User @relation(fields: [userId], references: [id])
      }
    `;
    const document = createDocument({
      datamodel: {
        models: [
          {
            name: "User",
            dbName: null,
            schema: null,
            fields: [
              {
                name: "posts",
                kind: "object",
                type: "Post",
                isList: true,
                isRequired: true,
                isUnique: false,
                isId: false,
                isReadOnly: false,
                isGenerated: false,
                hasDefaultValue: false,
                relationName: "PostToUser",
                relationFromFields: [],
                relationToFields: [],
                relationOnDelete: undefined,
                relationOnUpdate: undefined,
                documentation: undefined,
              },
            ],
            primaryKey: null,
            uniqueFields: [],
            uniqueIndexes: [],
            isGenerated: false,
            documentation: undefined,
          },
          {
            name: "Post",
            dbName: null,
            schema: null,
            fields: [],
            primaryKey: null,
            uniqueFields: [],
            uniqueIndexes: [],
            isGenerated: false,
            documentation: undefined,
          },
        ],
        enums: [],
        types: [],
        indexes: [],
      },
    });

    getDmmfMock.mockResolvedValueOnce(document);

    const prismaDmmf = new PrismaDmmf();
    const result = await prismaDmmf.generate(schema);

    expect(result.datamodel.models).toHaveLength(2);
    expect(result.datamodel.models[0].fields[0].relationName).toBe("PostToUser");
  });

  it("preserva enums no documento retornado", async () => {
    const schema = `
      enum Role {
        USER
        ADMIN
      }
    `;
    const document = createDocument({
      datamodel: {
        models: [],
        enums: [
          {
            name: "Role",
            values: [
              {
                name: "USER",
                dbName: null,
              },
              {
                name: "ADMIN",
                dbName: null,
              },
            ],
            dbName: null,
            documentation: undefined,
          },
        ],
        types: [],
        indexes: [],
      },
    });

    getDmmfMock.mockResolvedValueOnce(document);

    const prismaDmmf = new PrismaDmmf();
    const result = await prismaDmmf.generate(schema);

    expect(result.datamodel.enums).toHaveLength(1);
    expect(result.datamodel.enums[0].name).toBe("Role");
  });
});
