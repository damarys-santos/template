import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiCreateRecurso1, apiGetRecurso1, apiGetRecurso1ById } from "./recurso1.api";
import { Recurso1FiltersState } from "./recurso1.types";

export function useRecurso1List(filtros: Recurso1FiltersState) {
    const { data, isLoading: loading } = useQuery({
        queryKey: ['recurso1', filtros],
        queryFn: () => apiGetRecurso1(filtros),
    })

    return {
        registros: data?.data ?? [],
        totalPages: data?.totalPages ?? 1,
        loading,
    }
}

export function useRecurso1(id: string) {
    const { data: registro, isLoading: loading } = useQuery({
        queryKey: ['recurso1', id],
        queryFn: () => apiGetRecurso1ById(id),
        enabled: !!id,
    })

    return { registro, loading }
}

export function useCreateRecurso1() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: apiCreateRecurso1,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['recurso1'] })
        }
    })
}
