import { readFile } from "fs/promises";

export class YamlLoader {

    async load(file:string):Promise<string>{

        return readFile(file,"utf8");

    }

}
