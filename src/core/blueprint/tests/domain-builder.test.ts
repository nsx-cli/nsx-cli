import { describe,it,expect } from "vitest";
import { DomainBuilder } from "../domain.builder";

describe("DomainBuilder",()=>{

    it("converte blueprint em DomainModel",()=>{

        const builder=new DomainBuilder();

        const result=builder.build({

            module:"empresa",

            fields:[

                {

                    name:"cnpj",

                    type:"string"

                }

            ]

        });

        expect(result.modules.length).toBe(1);

        expect(result.modules[0].name).toBe("empresa");

    });

});
