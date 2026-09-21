// lib/cookies.ts
// ─────────────────────────────────────────────────────────────
// `secure` no cookie de sessão precisa refletir o transporte REAL da
// requisição, nunca `NODE_ENV`. Ver AGENTS.md ("Cookie/session security
// notes") para o porquê: `NODE_ENV=production` rodando atrás de um proxy que
// ainda não termina HTTPS faz o browser silenciosamente recusar o cookie
// `Secure`, e o login "funciona" (200) mas a sessão nunca é salva.
//
// Lê `X-Forwarded-Proto` (setado por praticamente todo proxy/CDN que termina
// TLS na frente da app — nginx, Cloudflare, ALB, Vercel) e cai pro protocolo
// da própria URL da requisição se o header não vier.
// ─────────────────────────────────────────────────────────────

export function isRequestSecure(request: Request): boolean {
    const forwardedProto = request.headers.get("x-forwarded-proto");
    if (forwardedProto) {
        return forwardedProto.split(",")[0].trim().toLowerCase() === "https";
    }
    return new URL(request.url).protocol === "https:";
}
