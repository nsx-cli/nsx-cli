import { describe,it,expect } from "vitest";
import { SuperModuleGenerator } from "../super-module.generator";

describe("SuperModuleGenerator",()=>{

    it("gera definição completa",()=>{

        const g=new SuperModuleGenerator();

        const module=g.generate("empresa");

        expect(module.entity).toBe(true);
        expect(module.repository).toBe(true);
        expect(module.service).toBe(true);
        expect(module.controller).toBe(true);
        expect(module.dto).toBe(true);

    });

});
