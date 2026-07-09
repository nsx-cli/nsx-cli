import { Command } from "commander";
import { ControllerGenerator } from "../generators/controller.generator";

export class GenerateCommand {
  register(program: Command): void {
    program
      .command("generate <type> <name>")
      .alias("g")
      .description("Generate application resources")
      .action(async (type: string, name: string) => {
        switch (type.toLowerCase()) {
          case "controller":
            await new ControllerGenerator().generate(name);
            break;

          default:
            console.log(`❌ Generator '${type}' não encontrado.`);
            console.log("");
            console.log("Generators disponíveis:");
            console.log("  controller");
        }
      });
  }
}