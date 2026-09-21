import { apiGetSetor } from "./setor.api";
import { useQuery } from "@tanstack/react-query";

export function useSetores() {
    const { data: setores = [], isLoading: loading } = useQuery({
        queryKey: ['setores'],
        queryFn: apiGetSetor,
    })

    return {
        setores,
        loading
    }
}
