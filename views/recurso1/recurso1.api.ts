import { fetchClient } from "@/lib/fetchClients";
import { Recurso1ComRelacoes, Recurso1ComRelacoesLimitadas, Recurso1FiltersState } from "./recurso1.types";

function buildQuery(filtros: Recurso1FiltersState) {
    const params = new URLSearchParams();
    Object.entries(filtros).forEach(([key, value]) => {
        if (value !== undefined && value !== "") params.set(key, String(value));
    });
    return params.toString();
}

export const apiGetRecurso1 = (filtros: Recurso1FiltersState): Promise<{ data: Recurso1ComRelacoes[], totalPages: number }> =>
    fetchClient(`/api/recurso1/read?${buildQuery(filtros)}`)

export const apiGetRecurso1ById = (id: string): Promise<Recurso1ComRelacoesLimitadas> =>
    fetchClient(`/api/recurso1/read/${id}`)

export const apiCreateRecurso1 = (formData: FormData) =>
    fetchClient('/api/recurso1/create', { method: 'POST', body: formData })
