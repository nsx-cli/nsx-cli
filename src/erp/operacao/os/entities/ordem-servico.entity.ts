
export enum OrdemServicoStatus{

RASCUNHO="RASCUNHO",

APROVADA="APROVADA",

EM_EXECUCAO="EM_EXECUCAO",

FINALIZADA="FINALIZADA",

CANCELADA="CANCELADA"

}

export class OrdemServico{

id!:string;

numero!:string;

clienteId!:string;

eventoId?:string;

orcamentoId!:string;

contratoId?:string;

responsavel!:string;

dataInicio!:Date;

dataFim!:Date;

endereco!:string;

cidade!:string;

estado!:string;

observacoes?:string;

status:OrdemServicoStatus=
OrdemServicoStatus.RASCUNHO;

createdAt=new Date();

updatedAt=new Date();

}

