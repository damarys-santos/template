import { UserWithRelations } from "../user/user.type";

export interface SetorBase {
  id: number;
  nome: string | null;
}

export interface SetorWithRelations extends SetorBase {
  usuarios?: UserWithRelations[];
}

export type CreateSetorInput = Omit<SetorBase, 'id'>;
export type UpdateSetorInput = Partial<CreateSetorInput>;
