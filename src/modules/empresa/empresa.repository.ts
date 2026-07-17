
import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";

@Injectable()
export class EmpresaRepository{

constructor(private readonly prisma:PrismaService){}

create(data:any){
return this.prisma.empresa.create({data});
}

findAll(){
return this.prisma.empresa.findMany();
}

findById(id:string){
return this.prisma.empresa.findUnique({
where:{id},
});
}

update(id:string,data:any){
return this.prisma.empresa.update({
where:{id},
data,
});
}

delete(id:string){
return this.prisma.empresa.delete({
where:{id},
});
}

}
