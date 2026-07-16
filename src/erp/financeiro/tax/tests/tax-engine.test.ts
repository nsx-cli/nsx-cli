
import { describe,it,expect } from "vitest";

import { TaxEngine } from "../engine/tax.engine";

describe("TaxEngine",()=>{

it("calcula impostos",()=>{

const engine=new TaxEngine();

const result=engine.calcular(1000,{

simples:true,

iss:5,

pis:0.65,

cofins:3,

ir:0,

csll:0,

inss:0,

fgts:0,

rat:0,

terceiros:0,

administrativo:5,

comissao:3,

lucro:25

});

expect(result.total).toBeGreaterThan(1000);

});

});

