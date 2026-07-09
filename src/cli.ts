import { Command } from "commander";
import { GenerateCommand } from "./commands/generate.command";

export function createCli() {

  const program = new Command();

  program
    .name("nsx")
    .description("NSX Platform CLI")
    .version("0.1.0");

  new GenerateCommand().register(program);

  return program;

}