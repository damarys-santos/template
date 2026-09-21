export interface FornecedorBase {
    id: number
    categoria: string | null
    nome_fantasia: string | null
    razao_social: string | null
    cnpj: string | null
    inscricao_estadual: string | null
    inscricao_municipal: string | null
    telefone: string | null
    celular: string | null
    endereco: string | null
    cep: string | null
    municipio_id: number | null
    uf_id: number | null
    email: string | null
    responsavel: string | null
    bloqueado: boolean | null
    justificativa_bloqueado: string | null
}

export interface CreateFornecedorDTO {
    categoria?: string
    nome_fantasia: string
    razao_social: string
    cnpj: string
    inscricao_estadual?: string
    inscricao_municipal?: string
    telefone?: string
    celular?: string
    endereco?: string
    cep?: string
    municipio_id?: number
    uf_id?: number
    email?: string
    responsavel?: string
}

export interface UpdateFornecedorDTO {
    categoria?: string
    nome_fantasia?: string
    razao_social?: string
    cnpj?: string
    inscricao_estadual?: string
    inscricao_municipal?: string
    telefone?: string
    celular?: string
    endereco?: string
    cep?: string
    municipio_id?: number
    uf_id?: number
    email?: string
    responsavel?: string
    bloqueado?: boolean
    justificativa_bloqueado?: string
}
