import YAML from "yaml";

export class YamlParser{

    parse(content:string){

        return YAML.parse(content);

    }

}
