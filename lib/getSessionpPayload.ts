// lib/getSessionPayload.ts
import { cookies } from "next/headers";
import { AppError } from "@/lib/errors";
import { decodeToken, TokenPayload } from "@/Utils/jwtController";
import { AcaoSlug, RecursoSlug } from "./permissoes.generated";
import { usersFactory, usuarioSistemaFactory } from "./factory";

export async function getSessionPayload(): Promise<TokenPayload> {
    const cookieStore = await cookies();
    const token = cookieStore.get("session_token")?.value;

    if (!token) {
        throw new AppError("Acesso não autorizado", 401);
    }

    let payload: TokenPayload;
    try {
        payload = await decodeToken(token);
    } catch {
        throw new AppError("Sessão inválida ou expirada", 401);
    }

    // Assinatura válida não basta: se a sessão foi revogada (usuário
    // desativado, perfil trocado, override criado/apagado) depois que esse
    // token foi emitido, ela morre aqui. Ver AGENTS.md ("Revogando uma
    // sessão antes").
    const sessaoValida = await usersFactory
        .create()
        .sessaoAindaValida(payload.id, (payload.iat ?? 0) * 1000);

    if (!sessaoValida) {
        throw new AppError(
            "Sessão expirada. Suas permissões foram alteradas — faça login novamente.",
            401,
        );
    }

    // Heartbeat de presença: todo request autenticado passa por aqui, então
    // é o ponto natural pra "pingar" que o usuário está ativo neste sistema.
    // Tem throttle interno (lib/presenca.ts) — não é 1 escrita por request.
    await usuarioSistemaFactory
        .create()
        .registrarAcesso(payload.id, Number(process.env.SISTEMA_ID_ATUAL));

    return payload;
}

// ⚠️ TEMPORÁRIO — checagem granular desligada de propósito. Este é o projeto
// TEMPLATE: não tem `recurso`/`acao`/`perfil_permissao` reais cadastrados no
// core ainda, então `payload.permissoes` vem sempre vazio e nenhuma rota
// autorizaria nada. Por enquanto, basta ter passado por getSessionPayload()
// (login válido) pra poder fazer qualquer ação em qualquer route.ts.
//
// Quando este projeto virar um sistema oficial (com recursos cadastrados via
// `npm run gen:permissoes`): apague o `return true` e descomente a linha real
// abaixo.
export function temPermissao(payload: TokenPayload, recurso: RecursoSlug, acao: AcaoSlug): boolean {
    return true;
    // return payload.permissoes.includes(`${recurso}:${acao}`);
}
