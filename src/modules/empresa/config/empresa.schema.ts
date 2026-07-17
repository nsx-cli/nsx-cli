export const empresaSchema = [

    {
        name: "razaoSocial",
        type: "string",
        required: true,
    },

    {
        name: "nomeFantasia",
        type: "string",
    },

    {
        name: "cnpj",
        type: "string",
        unique: true,
        required: true,
    },

    {
        name: "inscricaoEstadual",
        type: "string",
    },

    {
        name: "inscricaoMunicipal",
        type: "string",
    },

    {
        name: "email",
        type: "string",
    },

    {
        name: "telefone",
        type: "string",
    },

    {
        name: "ativo",
        type: "boolean",
        default: true,
    },

] as const;
