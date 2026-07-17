import {
Entity,
PrimaryGeneratedColumn,
Column,
CreateDateColumn,
UpdateDateColumn
} from "typeorm";

@Entity("empresas")
export class Empresa {

    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @Column()
    razaoSocial!: string;

    @Column({ nullable: true })
    nomeFantasia?: string;

    @Column({ unique: true, nullable: true })
    cnpj?: string;

    @Column({ nullable: true })
    inscricaoEstadual?: string;

    @Column({ nullable: true })
    email?: string;

    @Column({ nullable: true })
    telefone?: string;

    @Column({ nullable: true })
    celular?: string;

    @Column({ nullable: true })
    cep?: string;

    @Column({ nullable: true })
    logradouro?: string;

    @Column({ nullable: true })
    numero?: string;

    @Column({ nullable: true })
    complemento?: string;

    @Column({ nullable: true })
    bairro?: string;

    @Column({ nullable: true })
    cidade?: string;

    @Column({ nullable: true })
    estado?: string;

    @Column({ nullable: true })
    pais?: string;

    @Column({ nullable: true })
    ativo?: boolean;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;

}