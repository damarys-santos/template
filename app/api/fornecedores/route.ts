import { errorResponse, okResponse } from "@/lib/errors";
import { fornecedoresFactory } from "@/lib/factory";


const fornecedoresService = fornecedoresFactory.create()

export async function GET(request: Request) {
    try {
        const fornecedores = await fornecedoresService.fetchFornecedores()
        return okResponse(fornecedores,201)
    } catch (error) {
        return errorResponse(error)
    }
}