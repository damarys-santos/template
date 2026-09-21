// Destino de fallback do proxy.ts quando o usuário está autenticado mas não
// tem a permissão granular ("<recurso>:ver") pra rota que tentou acessar.
//
// Fica FORA do matcher de proxy.ts (config/permissions.ts + proxy.ts) de
// propósito: se essa página também fosse protegida por recurso, um usuário
// sem NENHUMA permissão cairia em loop infinito de redirect. Ver AGENTS.md
// ("Protegendo navegação").
export default function SemPermissaoPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-6 text-center">
      <div className="max-w-md space-y-2">
        <h1 className="text-2xl font-semibold text-foreground">Sem permissão</h1>
        <p className="text-muted-foreground">
          Você está autenticado, mas não tem permissão para acessar esta página.
          Fale com um administrador se acha que isso é um engano.
        </p>
      </div>
    </div>
  )
}
