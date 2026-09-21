import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiCreateRecurso2, apiGetRecurso2 } from "./recurso2.api";

export function useRecurso2(recurso1Id: string) {
    const { data: historico = [], isLoading: loading } = useQuery({
        queryKey: ['recurso2', recurso1Id],
        queryFn: () => apiGetRecurso2(recurso1Id),
        enabled: !!recurso1Id,
    })

    return { historico, loading }
}

export function useCreateRecurso2() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: apiCreateRecurso2,
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: ['recurso2', variables.id_recurso1] })
            queryClient.invalidateQueries({ queryKey: ['recurso1'] })
        }
    })
}
