
import { Injectable } from "@nestjs/common";
import { EmpresaRepository } from "./empresa.repository";
import { CreateEmpresaDto } from "./dto/create-empresa.dto";
import { UpdateEmpresaDto } from "./dto/update-empresa.dto";

@Injectable()
export class EmpresaService{

constructor(
private readonly repository:EmpresaRepository,
){}

create(dto:CreateEmpresaDto){
return this.repository.create(dto);
}

findAll(){
return this.repository.findAll();
}

findById(id:string){
return this.repository.findById(id);
}

update(id:string,dto:UpdateEmpresaDto){
return this.repository.update(id,dto);
}

delete(id:string){
return this.repository.delete(id);
}

}
