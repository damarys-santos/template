import { PermissaoSlug } from "@/lib/permissoes.generated";
import { jwtVerify, JWTPayload } from "jose";

const SECRET_KEY = new TextEncoder().encode(process.env.JWT_SECRET);

// `role` (cargo) viaja aqui só pra exibição (ex: rodapé da sidebar) — nunca
// usar pra decidir acesso. Quem concede acesso é `permissoes`, resolvido uma
// vez no login a partir de perfil_permissao + usuario_permissao_override.
// Ver AGENTS.md ("cargo nunca concede acesso").
export type TokenPayload = JWTPayload & {
    id: number;
    login: string;
    role?: string;
    permissoes: PermissaoSlug[];
};

export async function decodeToken(token: string): Promise<TokenPayload> {
    const { payload } = await jwtVerify(token, SECRET_KEY);
    return payload as TokenPayload;
}
