
import { OrdemServico,OrdemServicoStatus } from "../entities/ordem-servico.entity";

export class OrdemServicoService{

private contador=1;

criar(data:Partial<OrdemServico>){

const os=new OrdemServico();

Object.assign(os,data);

os.numero="OS-"+String(this.contador++).padStart(6,"0");

return os;

}

aprovar(os:OrdemServico){

os.status=OrdemServicoStatus.APROVADA;

return os;

}

iniciar(os:OrdemServico){

os.status=OrdemServicoStatus.EM_EXECUCAO;

return os;

}

finalizar(os:OrdemServico){

os.status=OrdemServicoStatus.FINALIZADA;

return os;

}

}

