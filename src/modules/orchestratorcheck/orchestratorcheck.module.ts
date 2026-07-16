import { Module } from "@nestjs/common";
import { OrchestratorcheckController } from "./orchestratorcheck.controller";
import { OrchestratorcheckService } from "./orchestratorcheck.service";

@Module({
    controllers: [OrchestratorcheckController],
    providers: [OrchestratorcheckService]
})
export class OrchestratorcheckModule {}
