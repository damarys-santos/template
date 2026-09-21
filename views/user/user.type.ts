export interface LoginUserDTO {
    login: string;
    password: string;
}

export interface CreateUserDTO {
    nome: string;
    email: string;
    filial_id: number;
    setor_id: number;
    cargo_id: number;
    status: boolean;
    criado_em: Date;
    atualizado_em: Date;
    username: string;
    senha: string;
}

export interface UserBase {
    id: number
    nome: string | null
    email: string | null
    celular?: string | null
    filial_id?: number | null
    setor_id?: number | null
    cargo_id?: number | null
    status: boolean | null
    login: string | null
    senha: string | null
    atualizado_por?: string | null
    ultimo_login?: Date | null
    criado_em: Date | null
    atualizado_em: Date | null
    cpf_cnpj?: string | null
    origem_cadastro?: string | null
}

export interface UserWithRelations {
    id: number
    nome: string | null
    email: string | null
    celular?: string | null
    filial_id?: number | null
    setor_id?: number | null
    cargo_id?: number | null
    status: boolean | null
    login: string | null
    senha: string | null
    atualizado_por?: string | null
    ultimo_login?: Date | null
    criado_em: Date | null
    atualizado_em: Date | null
    cpf_cnpj?: string | null
    origem_cadastro?: string | null

    filiais?: {
        id: number
        nome: string | null
        cnpj?: string | null
        inscricao_estadual?: string | null
        inscricao_municipal?: string | null
        razao_social?: string | null
        telefone?: string | null
        endereco?: string | null
        celular?: string | null
        municipio_id?: number | null
    } | null

    setores?: {
        id: number
        nome: string | null
    } | null

    cargos?: {
        id: number
        cargo: string | null
        descricao?: string | null
        cbo?: string | null
    } | null
}