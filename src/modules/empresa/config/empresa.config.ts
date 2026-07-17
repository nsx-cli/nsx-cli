import { EMPRESA_MODULE } from "../constants/empresa.constants";

export const empresaConfig = {

    ...EMPRESA_MODULE,

    version: "1.0.0",

    dependencies: [],

    seed: true,

    audit: true,

    permissions: true,

} as const;
