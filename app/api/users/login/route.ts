import { usersFactory, permissoesFactory } from "@/lib/factory";
import { errorResponse } from "@/lib/errors";
import { isRequestSecure } from "@/lib/cookies";
import { NextResponse } from "next/server";
import { SignJWT } from 'jose';
import { AuthUser } from "@/contexts/auth";
import { PermissaoSlug } from "@/lib/permissoes.generated";

const SECRET_KEY = new TextEncoder().encode(process.env.JWT_SECRET)
const SISTEMA_ID_ATUAL = Number(process.env.SISTEMA_ID_ATUAL)

export async function POST(request: Request) {
    try {
        const loginUserDto = await request.json();

        // Lança AppError (credenciais inválidas / usuário desativado) — vira
        // toast no frontend via errorResponse -> fetchClient -> ApiError.
        const user = await usersFactory.create().loginUser(loginUserDto, SISTEMA_ID_ATUAL);

        // Resolve o mapa perfil_permissao + usuario_permissao_override UMA
        // vez aqui e assina no JWT — não é reconsultado a cada request. Ver
        // AGENTS.md ("Login: resolve uma vez, cravado no JWT").
        const { mapa } = await permissoesFactory
            .create()
            .resolverPermissoesDoLogin(user.id, SISTEMA_ID_ATUAL);

        const permissoes = Array.from(mapa.entries())
            .filter(([, permitido]) => permitido)
            .map(([chave]) => chave) as PermissaoSlug[];

        const token = await new SignJWT({
            id: user.id,
            login: user.login,
            role: user.cargos?.cargo, // display-only — nunca usar pra decidir acesso
            permissoes,
        })
            .setProtectedHeader({ alg: 'HS256' })
            .setIssuedAt()
            .setExpirationTime('1d')
            .sign(SECRET_KEY);

        const authUser: AuthUser = {
            id: user.id,
            nome: user.nome ?? '',
            login: user.login ?? '',
            filial: {
                id: user.filial_id ?? 0,
                nome: user.filiais?.nome ?? 'Sem Filial',
            },
            cargo: {
                nome: user.cargos?.cargo ?? 'Sem Cargo',
            },
            permissoes,
        };

        const response = NextResponse.json({
            message: "Login realizado com sucesso",
            user: authUser,
        });

        response.cookies.set("session_token", token, {
            httpOnly: true,
            secure: isRequestSecure(request),
            sameSite: 'lax',
            path: '/',
            maxAge: 60 * 60 * 24,
        });

        return response;
    } catch (error) {
        return errorResponse(error);
    }
}
