// CATEGORIA
export interface CategoriaBase {
    id: number
    nome: string
}

export type CreateCategoriaDTO = Pick<CategoriaBase, 'nome'>
export type UpdateCategoriaDTO = Partial<Pick<CategoriaBase, 'nome'>>


// SUBCATEGORIA
export interface SubcategoriaBase {
    id: number
    nome: string
    categoria_id: number | null
}

export type CreateSubcategoriaDTO = Pick<SubcategoriaBase, 'nome' | 'categoria_id'>
export type UpdateSubcategoriaDTO = Partial<Pick<SubcategoriaBase, 'nome' | 'categoria_id'>>

// COM RELAÇÕES — subcategoria já trazendo a categoria pai
export type SubcategoriaComRelacoes = SubcategoriaBase & {
    categorias: CategoriaBase | null
}
