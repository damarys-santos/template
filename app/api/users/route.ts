import { AppError, errorResponse, okResponse } from "@/lib/errors";
import { usersFactory } from "@/lib/factory";


const userService = usersFactory.create()

export async function GET(request: Request) {
    try {
        const users = await userService.fetchUsers()
        return okResponse(users,201)
    } catch (error) {
        return errorResponse(error)
    }
}