import { DomainModel } from "../domain";
import { IRenderer } from "./irenderer";

export class RendererRegistry{

    private readonly renderers:IRenderer[]=[];

    register(renderer:IRenderer):void{

        this.renderers.push(renderer);

        this.renderers.sort(
            (a,b)=>a.priority-b.priority,
        );

    }

    registerMany(renderers:IRenderer[]):void{

        for(const renderer of renderers){

            this.register(renderer);

        }

    }

    list():readonly IRenderer[]{

        return Object.freeze(this.renderers);

    }

    async render(domain:DomainModel):Promise<void>{

        for(const renderer of this.renderers){

            console.log(`▶ ${renderer.name}`);

            await renderer.render(domain);

        }

    }

}
