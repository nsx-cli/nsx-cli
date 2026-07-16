
import { describe,it,expect } from "vitest";

import { OrdemServicoService } from "../services/ordem-servico.service";

describe("OrdemServicoService",()=>{

it("gera numero automaticamente",()=>{

const service=new OrdemServicoService();

const os=service.criar({

clienteId:"1",

orcamentoId:"2",

responsavel:"Sidnei"

});

expect(os.numero.startsWith("OS-")).toBe(true);

});

});

