export interface Empresa {

    id: string;

    razaoSocial: string;

    nomeFantasia?: string;

    cnpj: string;

    inscricaoEstadual?: string;

    inscricaoMunicipal?: string;

    email?: string;

    telefone?: string;

    ativo: boolean;

    createdAt: Date;

    updatedAt: Date;

}
