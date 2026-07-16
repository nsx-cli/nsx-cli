
import { Orcamento } from "../models/orcamento.model";

export class BudgetEngine{

    calcular(or:Orcamento){

        const maoDeObra=or.itens.reduce(

            (t,i)=>t+(i.quantidade*i.horas*i.valorHora),

            0

        );

        const custoDireto=

            maoDeObra+

            or.alimentacao+

            or.deslocamento+

            or.hospedagem;

        const impostos=

            custoDireto*(or.impostos/100);

        const lucro=

            (custoDireto+impostos)*(or.margem/100);

        const total=

            custoDireto+

            impostos+

            lucro;

        return{

            maoDeObra,

            custoDireto,

            impostos,

            lucro,

            total

        };

    }

}

