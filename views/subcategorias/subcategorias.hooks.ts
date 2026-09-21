import { useQuery } from "@tanstack/react-query"
import { apiGetSubcategorias } from "./subcategorias.api"

export function useSubcategorias() {
  const { data: subcategorias = [], isLoading: loading } = useQuery({
    queryKey: ['subcategorias'],
    queryFn: apiGetSubcategorias,
  })

  return {
    loading,
    subcategorias
  }
}
