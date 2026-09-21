import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { decodeToken } from "@/Utils/jwtController";
import { usuarioSistemaFactory, auditoriaAcessoFactory } from "@/lib/factory";

const SISTEMA_ID_ATUAL = Number(process.env.SISTEMA_ID_ATUAL);

export async function POST() {
    const cookieStore = await cookies();
    const token = cookieStore.get("session_token")?.value;

    if (token) {
        try {
            const payload = await decodeToken(token);
            await usuarioSistemaFactory.create().registrarSaida(payload.id, SISTEMA_ID_ATUAL);
            await auditoriaAcessoFactory.create().registrarLogout(payload.id, SISTEMA_ID_ATUAL);
        } catch {
            // Token inválido/expirado — nada de presença/auditoria pra limpar,
            // segue o logout normal (limpar o cookie) de qualquer jeito.
        }
    }

    const response = NextResponse.json({ message: "Logout realizado" });
    response.cookies.set("session_token", "", {
        httpOnly: true,
        expires: new Date(0),
        path: "/",
    });

    return response;
}
