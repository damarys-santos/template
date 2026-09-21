import { AppError, errorResponse, okResponse } from "@/lib/errors";
import { recurso2Factory } from "@/lib/factory";
import { getSessionPayload, temPermissao } from "@/lib/getSessionpPayload";
import { ACOES, RECURSOS } from "@/lib/permissoes.generated";

export async function POST(request: Request) {
    const recurso2Service = recurso2Factory.create()
    try {

        const payload = await getSessionPayload()
        if (!temPermissao(payload, RECURSOS.RECURSO2, ACOES.CREATE)) {
            throw new AppError("Sem permissão para criar um recurso2.", 403);
        }

        const data = await request.json()
        const criado = await recurso2Service.create(data)
        return okResponse(criado, 201)
    } catch (error) {
        return errorResponse(error)
    }
}
