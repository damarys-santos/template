import { apiGetFornecedores } from "./fornecedores.api";
import { useQuery } from "@tanstack/react-query";

export function useFornecedores() {
    const { data: fornecedores = [], isLoading: loading } = useQuery({
        queryKey: ['fornecedores'],
        queryFn: apiGetFornecedores,
    })

    return {
        loading,
        fornecedores
    }
}
