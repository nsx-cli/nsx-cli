
export abstract class BaseEntity{

    id!:string;

    createdAt:Date=new Date();

    updatedAt:Date=new Date();

    deletedAt?:Date;

    ativo:boolean=true;

}

