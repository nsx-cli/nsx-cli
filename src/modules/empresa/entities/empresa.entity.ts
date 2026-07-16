export class Empresa {

  id!: string;

  razaoSocial!: string;

  nomeFantasia?: string;

  cnpj!: string;

  inscricaoEstadual?: string;

  email?: string;

  telefone?: string;

  celular?: string;

  cep?: string;

  endereco?: string;

  numero?: string;

  complemento?: string;

  bairro?: string;

  cidade?: string;

  estado?: string;

  pais?: string;

  ativo:boolean=true;

  createdAt:Date=new Date();

  updatedAt:Date=new Date();

}
