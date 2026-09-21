import { fetchClient } from "@/lib/fetchClients";
import { SubcategoriaComRelacoes } from "./subcategorias.types";

export const apiGetSubcategorias = (): Promise<SubcategoriaComRelacoes[]> => fetchClient('/api/subcategorias')
