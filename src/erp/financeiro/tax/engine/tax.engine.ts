
import { TaxConfiguration } from "../models/tax.model";

export class TaxEngine{

calcular(custo:number,cfg:TaxConfiguration){

const iss=custo*(cfg.iss/100);

const pis=custo*(cfg.pis/100);

const cofins=custo*(cfg.cofins/100);

const ir=custo*(cfg.ir/100);

const csll=custo*(cfg.csll/100);

const inss=custo*(cfg.inss/100);

const fgts=custo*(cfg.fgts/100);

const rat=custo*(cfg.rat/100);

const terceiros=custo*(cfg.terceiros/100);

const administrativo=custo*(cfg.administrativo/100);

const comissao=custo*(cfg.comissao/100);

const subtotal=

custo+

iss+

pis+

cofins+

ir+

csll+

inss+

fgts+

rat+

terceiros+

administrativo+

comissao;

const lucro=subtotal*(cfg.lucro/100);

return{

iss,

pis,

cofins,

ir,

csll,

inss,

fgts,

rat,

terceiros,

administrativo,

comissao,

lucro,

total:subtotal+lucro

};

}

}

