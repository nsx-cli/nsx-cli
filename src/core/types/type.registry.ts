import { TypeDefinition } from "./type-definition";

export class TypeRegistry {

    private readonly types = new Map<string, TypeDefinition>();

    register(type: TypeDefinition): void {

        this.types.set(
            type.name.toLowerCase(),
            type,
        );

    }

    get(name: string): TypeDefinition {

        const type = this.types.get(
            name.toLowerCase(),
        );

        if (!type) {
            throw new Error(
                `Tipo '${name}' não registrado.`,
            );
        }

        return type;

    }

    has(name: string): boolean {

        return this.types.has(
            name.toLowerCase(),
        );

    }

    list(): TypeDefinition[] {

        return [...this.types.values()];

    }

}
