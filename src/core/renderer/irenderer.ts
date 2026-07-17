import { DomainModel } from "../domain";

export interface IRenderer {

    readonly name:string;

    readonly priority:number;

    render(domain:DomainModel):Promise<void>|void;

}
