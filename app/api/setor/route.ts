import { errorResponse, okResponse } from "@/lib/errors";
import { setorFactory } from "@/lib/factory";


export async function GET(request:Request) {

    const setorService = setorFactory.create()

    try {
        const setor = await setorService.fetchSetores()
        return okResponse (setor, 201)
    } catch(error) {
        return errorResponse(error)
    }
    
}