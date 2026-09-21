import { FilialBase } from "../filiais/filial.types"
import { SetorBase } from "../setor/setor.types"
import { UserBase } from "../user/user.type"

// Exemplo de domínio relacionado/histórico (equivalente ao antigo
// "historico"), ligado a `recurso1` por `id_recurso1`.

export interface Recurso2Base {
    id: number
    id_recurso1: string
    data_ocorrencia: Date
    observacao: string | null
    id_filial_atual: number | null
    id_filial_destino: number | null
    usuario_origem: number | null
    usuario_destino: number | null
    usuario_aprovador: number | null
    setor_origem: number | null
    setor_destino: number | null
}

export interface CreateRecurso2DTO {
    id_recurso1: string
    id_filial_atual?: number
    id_filial_destino?: number
    usuario_origem?: number
    usuario_destino?: number
    usuario_aprovador?: number
    setor_origem?: number
    setor_destino?: number
    observacao?: string
}

export type Recurso2ComRelacoes = Recurso2Base & {
    filial_atual: FilialBase | null
    filial_destino: FilialBase | null
    usuario_origem_rel: UserBase | null
    usuario_destino_rel: UserBase | null
    usuario_aprovador_rel: UserBase | null
    setor_origem_rel: SetorBase | null
    setor_destino_rel: SetorBase | null
}
