import { AppError, errorResponse, okResponse } from "@/lib/errors";
import { recurso1Factory } from "@/lib/factory";
import { getSessionPayload, temPermissao } from "@/lib/getSessionpPayload";
import { ACOES, RECURSOS } from "@/lib/permissoes.generated";
import { Recurso1FiltersState } from "@/views/recurso1/recurso1.types";

export async function GET(request: Request) {

    const recurso1Service = recurso1Factory.create()

    try {
        const payload = await getSessionPayload()

        if (!temPermissao(payload, RECURSOS.RECURSO1, ACOES.VER)) {
            throw new AppError("Sem permissão para listar recurso1.", 403);
        }

        const { searchParams } = new URL(request.url)

        const filtros: Recurso1FiltersState = {
            setor_id: searchParams.get('setor_id') || "",
            filial_id: searchParams.get('filial_id') || "",
            subcategoria_id: searchParams.get("subcategoria_id") || "",
            usuario_id: searchParams.get('usuario_id') || "",

            limit: Number(searchParams.get("limit")) || 15,
            page: Number(searchParams.get("page")) || 1
        }

        const registros = await recurso1Service.fetchRecurso1(filtros)
        return okResponse(registros, 201)
    } catch (error) {
        return errorResponse(error)
    }
}
