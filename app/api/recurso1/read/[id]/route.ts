import { errorResponse, okResponse } from "@/lib/errors"
import { recurso1Factory } from "@/lib/factory"

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const recurso1Service = recurso1Factory.create()
    try {
        const item = await recurso1Service.getItem(id)
        return okResponse(item)
    } catch (error) {
        return errorResponse(error)
    }
}
