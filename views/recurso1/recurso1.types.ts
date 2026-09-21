import { FilialBase } from "../filiais/filial.types"
import { SetorBase } from "../setor/setor.types"
import { FornecedorBase } from "../fornecedores/fornecedores.types"
import { UserBase } from "../user/user.type"
import { SubcategoriaComRelacoes } from "../subcategorias/subcategorias.types"
import { Recurso2Base } from "../recurso2/recurso2.types"

// Exemplo de domínio (equivalente ao antigo "itens"). Renomeie/adapte para
// o recurso real do seu projeto — o importante é manter o padrão
// route → service → repository → views.

export interface recurso1Base {
    id: string // uuid — se o id do seu domínio for auto-increment, mude para number.
    nome: string
    descricao: string | null
    valor: number | null
    anexo: string | null
    id_filial: number | null
    id_setor: number | null
    id_usuario_responsavel: number | null
    id_fornecedor: number | null
    subcategoria_id: number | null
}

export type CreateRecurso1DTO = Pick<recurso1Base, 'nome' | 'id_filial' | 'id_setor'> & {
    descricao?: string
    valor?: number
    id_fornecedor?: number
    subcategoria_id?: number
    anexo?: string
    id_usuario_responsavel?: number
};

export type Recurso1ComRelacoes = recurso1Base & {
    usuario_responsavel?: UserBase | null
    // lista traz só a última ocorrência e sem relações aninhadas — use
    // `Recurso1ComRelacoesLimitadas.historicos` (via `read()`) quando
    // precisar dos nomes de filial/setor/usuário já resolvidos.
    historico?: Recurso2Base[] | null
    fornecedores?: FornecedorBase | null
    filiais?: FilialBase | null
    setores?: SetorBase | null
    subcategorias?: SubcategoriaComRelacoes | null
}

export type Recurso1ComRelacoesLimitadas = recurso1Base & {
    filial: Pick<FilialBase, 'id' | 'nome'> | null
    setor: Pick<SetorBase, 'id' | 'nome'> | null
    subcategoria: Pick<SubcategoriaComRelacoes, 'id' | 'nome'> | null
    fornecedor: Pick<FornecedorBase, 'id' | 'nome_fantasia'> | null
    usuario: Pick<UserBase, 'id' | 'nome' | 'email' | 'status'> | null

    historicos: (Pick<Recurso2Base, 'id' | 'data_ocorrencia'> & {
        filial_atual: Pick<FilialBase, 'nome'> | null
        filial_destino: Pick<FilialBase, 'nome'> | null
        usuario_origem: Pick<UserBase, 'nome'> | null
        usuario_destino: Pick<UserBase, 'nome'> | null
        setor_origem_rel: Pick<SetorBase, 'nome'> | null
        setor_destino_rel: Pick<SetorBase, 'nome'> | null
    })[] | null
}

export interface Recurso1FiltersState {
    setor_id?: string
    filial_id?: string
    usuario_id?: string
    subcategoria_id?: string

    page?: number
    limit?: number
}

export const defaultRecurso1Filters: Recurso1FiltersState = {
    setor_id: "",
    filial_id: "",
    usuario_id: "",
    subcategoria_id: "",

    page: 1,
    limit: 15,
}
