import { Module } from "@nestjs/common";
import { TemplatemethodresourceController } from "./templatemethodresource.controller";
import { TemplatemethodresourceService } from "./templatemethodresource.service";

@Module({
    controllers: [TemplatemethodresourceController],
    providers: [TemplatemethodresourceService]
})
export class TemplatemethodresourceModule {}
