import { YamlLoader } from "./loaders/yaml.loader";
import { YamlParser } from "./parsers/yaml.parser";

export class BlueprintLoader{

    private readonly loader=new YamlLoader();

    private readonly parser=new YamlParser();

    async load(file:string){

        const yaml=await this.loader.load(file);

        return this.parser.parse(yaml);

    }

}
