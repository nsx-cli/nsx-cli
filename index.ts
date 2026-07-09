#!/usr/bin/env node

import { Command } from "commander";

const program = new Command();

program
  .name("nsx")
  .description("NSX Platform CLI")
  .version("1.0.0");

program.parse(process.argv);