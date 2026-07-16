import { PrismaCommand } from "./commands/prisma.command";

applicationContext.resolve(PrismaCommand).register(program);
applicationContext.resolve(DevCommand).register(program);
