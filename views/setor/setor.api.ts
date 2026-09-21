import { fetchClient } from "@/lib/fetchClients";
import { SetorBase } from "./setor.types";

export const apiGetSetor = (): Promise<SetorBase[]> => fetchClient('/api/setor')
