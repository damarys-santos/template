import { apiGetFiliais } from "./filial.api";
import { useQuery } from "@tanstack/react-query";

export function useFiliais() {
    const { data: filiais = [], isLoading: loading } = useQuery({
        queryKey: ['filiais'],
        queryFn: apiGetFiliais,
    })

    return {
        filiais,
        loading
    }
}
