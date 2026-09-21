import { usersFactory } from "@/lib/factory";
import { CreateUserDTO } from "@/views/user/user.type";
import { NextResponse } from "next/server";


const userService = usersFactory.create()

export async function POST(request: Request) {
    try {
        const createUserdto: CreateUserDTO = await request.json();
        const users = userService.createUser(createUserdto)
        return NextResponse.json(users)
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";

        console.error("Erro ao cadastrar usuário:", errorMessage);

        return NextResponse.json(
            { error: errorMessage },
            { status: 401 }
        );
    }
}