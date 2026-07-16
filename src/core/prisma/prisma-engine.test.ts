import { describe, expect, it, vi } from "vitest";
import { PrismaDmmf } from "./prisma-dmmf";
import { PrismaEngine } from "./prisma-engine";
import type { PrismaLoader, PrismaSchemaFile } from "./prisma-loader";

type PrismaDocument = Awaited<ReturnType<PrismaDmmf["generate"]>>;

function createDocument(): PrismaDocument {
  return {
    datamodel: {
      models: [
        {
          name: "User",
          dbName: null,
          schema: null,
          fields: [
            {
              kind: "scalar",
              name: "id",
              isRequired: true,
              isList: false,
              isUnique: true,
              isId: true,
              isReadOnly: false,
              isGenerated: false,
              type: "Int",
              hasDefaultValue: true,
              default: { name: "autoincrement", args: [] },
              documentation: "identifier",
            },
            {
              kind: "enum",
              name: "role",
              isRequired: true,
              isList: false,
              isUnique: false,
              isId: false,
              isReadOnly: false,
              isGenerated: false,
              type: "Role",
              hasDefaultValue: false,
              documentation: "user role",
            },
            {
              kind: "object",
              name: "posts",
              isRequired: true,
              isList: true,
              isUnique: false,
              isId: false,
              isReadOnly: false,
              isGenerated: false,
              type: "Post",
              hasDefaultValue: false,
              relationName: "PostToUser",
              relationFromFields: [],
              relationToFields: [],
              documentation: "user posts",
            },
          ],
          uniqueFields: [],
          uniqueIndexes: [],
          documentation: "users",
          primaryKey: null,
          isGenerated: false,
        },
        {
          name: "Post",
          dbName: null,
          schema: null,
          fields: [
            {
              kind: "scalar",
              name: "id",
              isRequired: true,
              isList: false,
              isUnique: true,
              isId: true,
              isReadOnly: false,
              isGenerated: false,
              type: "Int",
              hasDefaultValue: true,
              default: { name: "autoincrement", args: [] },
            },
            {
              kind: "scalar",
              name: "userId",
              isRequired: true,
              isList: false,
              isUnique: false,
              isId: false,
              isReadOnly: false,
              isGenerated: false,
              type: "Int",
              hasDefaultValue: false,
            },
            {
              kind: "object",
              name: "user",
              isRequired: true,
              isList: false,
              isUnique: false,
              isId: false,
              isReadOnly: false,
              isGenerated: false,
              type: "User",
              hasDefaultValue: false,
              relationFromFields: ["userId"],
              relationToFields: ["id"],
              relationName: "PostToUser",
              relationOnDelete: "Cascade",
              relationOnUpdate: "Cascade",
            },
          ],
          uniqueFields: [],
          uniqueIndexes: [],
          documentation: undefined,
          primaryKey: null,
          isGenerated: false,
        },
      ],
      enums: [
        {
          name: "Role",
          dbName: null,
          documentation: "user roles",
          values: [
            { name: "USER", dbName: null },
            { name: "ADMIN", dbName: null },
          ],
        },
      ],
      types: [],
      indexes: [],
    },
    schema: {
      inputObjectTypes: { model: [], prisma: [] },
      outputObjectTypes: { model: [], prisma: [] },
      enumTypes: { model: [], prisma: [] },
      fieldRefTypes: {},
    },
    mappings: {
      modelOperations: [],
      otherOperations: {
        read: [],
        write: [],
      },
    },
  };
}

describe("PrismaEngine", () => {
  it("carrega o schema e converte o DMMF em modelos, enums, campos e relacoes", async () => {
    const schema = "datasource db { provider = \"sqlite\" url = \"file:dev.db\" }";
    const schemaFile: PrismaSchemaFile = {
      path: "prisma/schema.prisma",
      content: schema,
    };

    const loader = {
      load: vi.fn().mockResolvedValue(schemaFile),
    } as unknown as PrismaLoader;

    const dmmfGenerator = {
      generate: vi.fn().mockResolvedValue(createDocument()),
    } as unknown as PrismaDmmf;

    const engine = new PrismaEngine(loader, dmmfGenerator);

    await engine.load("prisma/schema.prisma");

    expect(loader.load).toHaveBeenCalledWith({ schemaPath: "prisma/schema.prisma" });
    expect(dmmfGenerator.generate).toHaveBeenCalledWith(schema);
    expect(engine.getModels()).toHaveLength(2);
    expect(engine.getModel("User")?.name).toBe("User");
    expect(engine.getEnums()).toHaveLength(1);
    expect(engine.getFields("User")).toHaveLength(3);
    expect(engine.getRelations("User")).toHaveLength(1);
  });

  it("expõe os relacionamentos e enums do modelo convertido", async () => {
    const loader = {
      load: vi.fn().mockResolvedValue({ path: "prisma/schema.prisma", content: "schema" }),
    } as unknown as PrismaLoader;

    const dmmfGenerator = {
      generate: vi.fn().mockResolvedValue(createDocument()),
    } as unknown as PrismaDmmf;

    const engine = new PrismaEngine(loader, dmmfGenerator);
    await engine.load();

    const userModel = engine.getModel("User");

    expect(userModel?.enums.map((entry) => entry.name)).toEqual(["Role"]);
    expect(engine.getFields(userModel ?? "User").map((field) => field.name)).toEqual(["id", "role", "posts"]);
    expect(engine.getRelations(userModel ?? "User")[0]).toMatchObject({
      modelName: "User",
      fieldName: "posts",
      type: "Post",
    });
    expect(engine.getRelations("Post")[0]).toMatchObject({
      modelName: "Post",
      fieldName: "user",
      fromFields: ["userId"],
      toFields: ["id"],
      references: ["id"],
    });
  });
});
