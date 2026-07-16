
export interface Crud<T>{

    create(data:any):Promise<T>;

    update(id:string,data:any):Promise<T>;

    delete(id:string):Promise<void>;

    findAll():Promise<T[]>;

    findById(id:string):Promise<T | null>;

}

