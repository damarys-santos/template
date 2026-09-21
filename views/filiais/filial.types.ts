import { UserWithRelations } from "../user/user.type";

export interface FilialBase {
  id: number;
  nome: string | null;
  cnpj: string | null;
  inscricao_estadual: string | null;
  inscricao_municipal: string | null;
  razao_social: string | null;
  telefone: string | null;
  endereco: string | null;
  celular: string | null;
  municipio_id: number | null;
}

export interface FilialWithRelations extends FilialBase {
  municipios?: Municipio | null;
  usuarios?: UserWithRelations[];
}

export type CreateFilialInput = Omit<FilialBase, 'id'>;
export type UpdateFilialInput = Partial<CreateFilialInput>;

export interface Municipio {
  id: number;
  nome: string | null;
  uf_id: number | null;
}
