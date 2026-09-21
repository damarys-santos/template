import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import { jwtVerify } from "jose";
// ⚠️ TEMPORÁRIO — só usados pelo bloco de checagem por recurso comentado
// abaixo. Descomente junto quando este virar um sistema oficial.
// import { getRecursoForRoute } from "@/config/permissions";
// import { ACOES } from "@/lib/permissoes.generated";

const SECRET_KEY = new TextEncoder().encode(process.env.JWT_SECRET);

// Protege NAVEGAÇÃO (não dados — isso é responsabilidade de cada route.ts
// via getSessionPayload()/temPermissao()). Não faz roundtrip no banco de
// propósito: só reassina a assinatura do JWT e lê o snapshot de
// `permissoes` que já veio gravado nele no login. Ver AGENTS.md ("Full
// worked reference — Step 3").
export async function proxy(request: NextRequest) {
  const token = request.cookies.get("session_token")?.value;

  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  try {
    await jwtVerify(token, SECRET_KEY);

    // ⚠️ TEMPORÁRIO — checagem granular por recurso desligada de propósito.
    // Este é o projeto TEMPLATE: não tem `sistema_id`/`recurso`/`perfil_permissao`
    // reais cadastrados no core ainda, então `permissoes` vem sempre vazio pra
    // todo mundo e ninguém conseguiria abrir tela nenhuma. Enquanto isso não
    // virar um sistema oficial (com recursos cadastrados via
    // `npm run gen:permissoes`), qualquer usuário com LOGIN VÁLIDO (checado
    // acima) entra em qualquer tela.
    //
    // Quando este projeto virar um sistema oficial: descomente o bloco abaixo
    // e apague o `return NextResponse.next()` solto logo depois dele.
    //
    // const permissoes = (payload.permissoes as string[] | undefined) ?? [];
    // const { pathname } = request.nextUrl;
    // const recurso = getRecursoForRoute(pathname);
    // // Sem recurso mapeado pra essa rota: navegação liberada (a proteção real
    // // de dados continua acontecendo em cada route.ts).
    // if (recurso && !permissoes.includes(`${recurso}:${ACOES.VER}`)) {
    //   // Autenticado, só sem essa permissão granular — manda pra uma página
    //   // dedicada, NUNCA de volta pro /login (usuário já está logado).
    //   // Essa página fica fora do matcher abaixo de propósito: se ela também
    //   // fosse protegida por recurso, um usuário sem NENHUMA permissão cairia
    //   // em loop infinito de redirect.
    //   return NextResponse.redirect(new URL("/sem-permissao", request.url));
    // }

    return NextResponse.next();
  } catch (error) {
    console.error("Erro ao validar sessão:", error);
    return NextResponse.redirect(new URL("/login", request.url));
  }
}

export const config = {
  matcher: [
    "/recurso1",
    "/recurso1/:path*",
    "/recurso2/:path*",
    "/usuarios/:path*",
  ],
};
