import { errorResponse, okResponse } from "@/lib/errors";
import { filiaisFactory } from "@/lib/factory";

export async function GET(request:Request) {

    const filiaisService = filiaisFactory.create()

    try {
        const filiais = await filiaisService.fetchFiliais()
        return okResponse (filiais, 201)
    } catch(error) {
        return errorResponse(error)
    }
    
}