import {
Controller,
Get,
Post,
Patch,
Delete,
Body,
Param
} from "@nestjs/common";

import { EmpresaService } from "./empresa.service";
import { CreateEmpresaDto } from "./dto/create-empresa.dto";
import { UpdateEmpresaDto } from "./dto/update-empresa.dto";

@Controller("empresa")
export class EmpresaController {

    constructor(
        private readonly service:EmpresaService,
    ){}

    @Post()
    create(@Body() dto:CreateEmpresaDto){
        return this.service.create(dto);
    }

    @Get()
    findAll(){
        return this.service.findAll();
    }

    @Get(":id")
    findById(@Param("id") id:string){
        return this.service.findById(id);
    }

    @Patch(":id")
    update(
        @Param("id") id:string,
        @Body() dto:UpdateEmpresaDto,
    ){
        return this.service.update(id,dto);
    }

    @Delete(":id")
    delete(@Param("id") id:string){
        return this.service.delete(id);
    }

}
