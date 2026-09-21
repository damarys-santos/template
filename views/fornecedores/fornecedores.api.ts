import { fetchClient } from "@/lib/fetchClients";
import { FornecedorBase } from "./fornecedores.types";

export const apiGetFornecedores = (): Promise<FornecedorBase[]> => fetchClient('/api/fornecedores')
