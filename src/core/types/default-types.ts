import { TypeRegistry } from "./type.registry";

export function registerDefaultTypes(
    registry: TypeRegistry,
): void {

    registry.register({
        name:"string",
        prisma:"String",
        typescript:"string",
        validator:"@IsString()",
        swagger:"string",
        react:"TextInput",
    });

    registry.register({
        name:"email",
        prisma:"String",
        typescript:"string",
        validator:"@IsEmail()",
        swagger:"email",
        react:"EmailInput",
    });

    registry.register({
        name:"phone",
        prisma:"String",
        typescript:"string",
        validator:"@IsPhoneNumber('BR')",
        swagger:"string",
        react:"PhoneInput",
    });

    registry.register({
        name:"cpf",
        prisma:"String",
        typescript:"string",
        validator:"@IsCPF()",
        swagger:"string",
        react:"CpfInput",
    });

    registry.register({
        name:"cnpj",
        prisma:"String",
        typescript:"string",
        validator:"@IsCNPJ()",
        swagger:"string",
        react:"CnpjInput",
    });

    registry.register({
        name:"uuid",
        prisma:"String",
        typescript:"string",
        validator:"@IsUUID()",
        swagger:"uuid",
        react:"Hidden",
    });

    registry.register({
        name:"boolean",
        prisma:"Boolean",
        typescript:"boolean",
        validator:"@IsBoolean()",
        swagger:"boolean",
        react:"Switch",
    });

    registry.register({
        name:"datetime",
        prisma:"DateTime",
        typescript:"string",
        validator:"@IsDateString()",
        swagger:"date-time",
        react:"DatePicker",
    });

}
