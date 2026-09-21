import { errorResponse, okResponse } from "@/lib/errors";
import { subcategoriasFactory } from "@/lib/factory";

export async function GET(request: Request) {
    const subcategoriaService = subcategoriasFactory.create()

    try {
        const subcategorias = await subcategoriaService.fetchSubcategorias()
        return okResponse(subcategorias, 201)
    } catch(error) {
        return errorResponse(error)
    }
}