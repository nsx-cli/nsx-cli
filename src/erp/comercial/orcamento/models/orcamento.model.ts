
import { OrcamentoItem } from "./item.model";

export interface Orcamento{

    cliente:string;

    evento:string;

    margem:number;

    deslocamento:number;

    alimentacao:number;

    hospedagem:number;

    impostos:number;

    itens:OrcamentoItem[];

}

