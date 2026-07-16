import { Command } from "commander";

export function createCli() {

  const program = new Command();

  program
    .name("nsx")
    .description("NSX Platform CLI")
    .version("1.0.0");

  return program;

}
