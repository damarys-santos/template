import { errorResponse, okResponse } from "@/lib/errors";
import { recurso2Factory } from "@/lib/factory";

export async function GET(request: Request) {
    const recurso2Service = recurso2Factory.create()

    try {
        const { searchParams } = new URL(request.url)
        const recurso1Id = searchParams.get('recurso1Id') || ""
        const historico = await recurso2Service.fetchByRecurso1Id(recurso1Id)
        return okResponse(historico, 201)
    } catch (error) {
        return errorResponse(error)
    }
}
