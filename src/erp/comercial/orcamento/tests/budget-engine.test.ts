
import { describe,it,expect } from "vitest";

import { BudgetEngine } from "../engine/budget.engine";

describe("BudgetEngine",()=>{

it("calcula orçamento",()=>{

const engine=new BudgetEngine();

const result=engine.calcular({

cliente:"NSX",

evento:"Evento",

margem:30,

deslocamento:200,

alimentacao:300,

hospedagem:0,

impostos:10,

itens:[

{

descricao:"Limpeza",

quantidade:5,

horas:8,

valorHora:28,

custo:0

}

]

});

expect(result.total).toBeGreaterThan(0);

});

});

