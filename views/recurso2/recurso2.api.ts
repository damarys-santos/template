import { fetchClient } from "@/lib/fetchClients";
import { CreateRecurso2DTO, Recurso2Base } from "./recurso2.types";

export const apiGetRecurso2 = (recurso1Id: string): Promise<Recurso2Base[]> =>
    fetchClient(`/api/recurso2?recurso1Id=${recurso1Id}`)

export const apiCreateRecurso2 = (data: CreateRecurso2DTO) =>
    fetchClient('/api/recurso2/create', {
        method: 'POST',
        body: JSON.stringify(data),
    })
