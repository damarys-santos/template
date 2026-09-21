<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Ligar o sistema de permissões (quando este template virar um sistema oficial)

Hoje a checagem granular de permissão está **comentada de propósito** em 4
arquivos (deixei `⚠️ TEMPORÁRIO` em cada um) — o projeto ainda não tem
`sistema_id`/`recurso`/`perfil_permissao` reais cadastrados no core, então
manter a checagem ligada trancaria todo mundo pra fora. Só login válido é
exigido por enquanto.

**Arquivos pra olhar, nessa ordem:**

1. `lib/permissoes.generated.ts` — constantes `RECURSOS`/`ACOES` geradas do
   core. Auto-gerado, não editar à mão (rodar `npm run gen:permissoes`).
2. `config/permissions.ts` — mapeia cada rota (`/recurso1`, `/recurso2`, ...)
   pro `recurso` que ela exige. Fonte de verdade pro proxy e pra sidebar.
3. `proxy.ts` — protege NAVEGAÇÃO. Tem o bloco comentado que checa
   `<recurso>:ver` contra `payload.permissoes` antes de deixar entrar numa
   página.
4. `components/ui/app-sidebar.tsx` — espelha o mesmo critério pra decidir o
   que aparece no menu (cosmético, não é proteção real).
5. `services/permissoesService.ts` (`resolverPermissoesDoLogin`) — no LOGIN,
   busca o vínculo do usuário (`usuario_sistema`) com este `sistema_id` e
   monta o mapa de permissões (`perfil_permissao` + `usuario_permissao_override`).
   Hoje, se não achar vínculo, deixa entrar com permissões vazias em vez de
   bloquear — esse é o segundo `⚠️ TEMPORÁRIO`.
6. `lib/getSessionpPayload.ts` (`temPermissao`) — usado por TODA `route.ts`
   protegida pra checar permissão granular numa ação de API. Hoje sempre
   retorna `true`.
7. `app/api/users/login/route.ts` — onde o mapa do passo 5 vira o array
   `permissoes` assinado dentro do JWT.

**Passo a passo pra religar:**

1. Cadastrar o sistema oficial na tabela `sistemas` do core e apontar
   `SISTEMA_ID_ATUAL` (`.env`) pro `id` real.
2. Cadastrar as linhas de `recurso` desse `sistema_id` (uma por
   tela/domínio real, ex: `itens`, `historico`).
3. Cadastrar `perfil` + `perfil_permissao` (qual perfil pode fazer o quê).
4. Cadastrar `usuario_sistema` vinculando cada usuário real a um `perfil`
   dentro desse `sistema_id`.
5. Rodar `npm run gen:permissoes` — regenera `lib/permissoes.generated.ts`
   com os slugs reais (troca os placeholders `recurso1`/`recurso2`).
6. Atualizar `config/permissions.ts` com as rotas/recursos reais.
7. Restaurar os dois `⚠️ TEMPORÁRIO`: descomentar o bloco de checagem em
   `proxy.ts` e o filtro em `app-sidebar.tsx`; em `lib/getSessionpPayload.ts`
   apagar o `return true` e descomentar a linha real de `temPermissao`; em
   `services/permissoesService.ts` apagar o `return` vazio e descomentar o
   `throw new AppError(...)`.
8. Testar com um usuário vinculado: login funciona, menu mostra só o que ele
   tem permissão, e uma rota sem permissão redireciona pra
   `/sem-permissao` em vez de deixar entrar.

# Baseline every clone of this template already has

Everything documented below this point (permissions, sessions, cookies,
presence, audit) used to describe the *reference* implementation (Projeto-
Core) as an aspiration — the template itself didn't actually follow its own
doc yet (`proxy.ts` still gated by legacy `cargo`/`role`, login didn't throw
`AppError`, no `sessao_valida_apos`/presence/audit at all). That gap has been
closed: **every new sistema forked from this template starts with the full
auth chain below already wired**, not just documented. Don't re-derive any of
this from scratch in a new project — it's already here:

- **Recurso-based nav protection** — `proxy.ts` and `config/permissions.ts`
  gate by `recurso` (via `getRecursoForRoute`), not by `cargo`/`role`.
  `app-sidebar.tsx` mirrors the same check against `user.permissoes`
  (cosmetic only). `/sem-permissao` (`app/sem-permissao/page.tsx`) is the
  redirect target for "authenticated but missing a permission" — deliberately
  outside `proxy.ts`'s `matcher`.
  **⚠️ Currently commented out** in `proxy.ts`, `lib/getSessionpPayload.ts`
  (`temPermissao` hardcoded to `return true`), and `app-sidebar.tsx` (menu
  shows every `APP_ROUTES` entry). This project (the template itself) has no
  real `sistema_id`/`recurso`/`perfil_permissao` rows in the core yet, so
  `permissoes` is always empty and the granular check would lock everyone
  out — a valid login is still required, only the *granular* recurso/ação
  gate is bypassed. Each spot has a `⚠️ TEMPORÁRIO` comment with the exact
  lines to restore once this becomes an officially registered sistema (real
  `sistema_id` + rows populated + `npm run gen:permissoes` rerun).
- **`AppError` end-to-end on login/logout** — `services/usersServices.ts`
  throws `AppError` (invalid credentials, disabled user) instead of a bare
  `Error`; `app/api/users/login/route.ts` and `logout/route.ts` go through
  `errorResponse`/`okResponse` like any other route.
- **`isRequestSecure`** (`lib/cookies.ts`) — the session cookie's `secure`
  flag tracks the real transport (`X-Forwarded-Proto`), not `NODE_ENV`. Used
  by the login route when setting `session_token`.
- **`sessao_valida_apos`** — `usersServices.sessaoAindaValida()` +
  `usersRepository.invalidarSessao()`/`invalidarSessaoPorPerfil()` are ready.
  `getSessionPayload()` (`lib/getSessionpPayload.ts`) already calls
  `sessaoAindaValida()` on every request. **Still a TODO for whoever adds
  user-management screens to a sistema**: call `invalidarSessao(usuarioId)`
  after deactivating a user or changing their `perfil`, and
  `invalidarSessaoPorPerfil(perfilId)` after editing a `perfil_permissao` row
  — those mutation points don't exist in the template yet (no admin UI ships
  by default), only the primitives to call when they're built.
- **Presence heartbeat (write-side only)** — `lib/presenca.ts`
  (`HEARTBEAT_THROTTLE_MS`), `repository/usuarioSistemaRepository.ts`,
  `services/usuarioSistemaService.ts`, wired into `getSessionPayload()`
  (heartbeat) and `logout/route.ts` (clear on explicit logout). The
  read/count side (`ONLINE_WINDOW_MS`, an endpoint, a badge) is Core-only —
  see "Real-time presence" below — don't add it to a sistema-filho.
- **Access audit log (write-side only)** — `repository/auditoriaAcessoRepository.ts`,
  `services/auditoriaAcessoService.ts`, wired into `usersServices.loginUser()`
  (login event) and `logout/route.ts` (logout event). Same split: reading it
  back is Core-only, see "Access audit log" below.
- **`fetchClient` never lets a raw error escape** — wraps `fetch()` itself
  (offline/DNS/unreachable) and the success-path `res.json()` (empty/malformed
  2xx body) in try/catch, always normalizing to `ApiError`.
- **401 handling in `QueryProvider`** — `contexts/query-client.provider.tsx`'s
  global `onError` clears the saved `AuthUser`
  (`localStorage["@AppTemplate:user"]`) and hard-redirects to `/login` on any
  401, so a revoked/expired session doesn't just re-toast forever.

None of this required knowing what the sistema is actually *for* — it's
identical for every domain. If you're about to add a script/feature that is
similarly domain-agnostic (doesn't need product-specific UI or a "which
screen does this belong to" decision), it belongs in the template baseline
too, not bolted onto one project at a time.

# Project architecture

Every project on this stack follows the same layered pattern. Before touching a
domain (itens, historico, fornecedores, ...), find its four pieces and respect the
direction of the chain — never skip a layer.

## Backend: route → factory → service → repository

```
app/api/<domain>/.../route.ts   (HTTP handler: auth check, parse request, try/catch)
  → lib/factory.ts              (<Domain>Factory.create() wires repo + service)
    → services/<domain>Service.ts   (business rules, validation, orchestration)
      → repository/<domain>Repository.ts   (the ONLY layer allowed to import `prisma`)
```

Rules:
- Never call `prisma` from a `route.ts` or a `service` — always go through a
  repository method, even for a one-line query.
- Never put business logic (throwing `AppError`, cross-domain orchestration,
  computing derived values) inside a repository — that belongs in the service.
  A repository method should read like a straight Prisma query, nothing else.
- A `route.ts` handler is always: get `xFactory.create()` → auth/permission check
  (see below) → parse request → call service → `okResponse`/`errorResponse`. Don't
  put Prisma calls or business rules directly in the route.
- Every new domain needs all four pieces, even if a piece is one line today —
  don't shortcut the pattern "because it's simple."

## Errors & toasts — one chain, end to end

Error handling is a single pipeline from the service layer all the way to the toast
the user sees. Never write local error-toast code in a component or hook — the
chain already does it globally. The pieces, in order:

```
services/<domain>Service.ts        throw new AppError(message, status, code?)
  → app/api/.../route.ts           catch (error) { return errorResponse(error) }
    → lib/errors/errorResponse.ts  NextResponse.json({ error: message, code }, { status })
      → lib/fetchClients.ts        fetchClient() sees res.ok === false, throws
                                    new ApiError(message, code, status)
        → contexts/query-client.provider.tsx   QueryCache/MutationCache's global
                                                onError: if (error instanceof ApiError)
                                                → toast.error(error.message)
```

1. **`lib/errors/AppError.ts`** — `new AppError(message, status = 400, code = "BUSINESS_ERROR")`.
   Throw this from a **service** (never a repository) whenever a business rule fails.
   Write `message` in plain, user-facing Portuguese — it travels unmodified all the
   way to the toast the user sees, so word it for them, not for a log file.
2. **`lib/errors/errorResponse.ts`** — every `route.ts` catch block calls
   `errorResponse(error)`. It special-cases `AppError` (uses its own
   message/status/code) and otherwise runs unknown/Prisma errors through
   `parsePrismaError` (translates raw Prisma error codes like `P2002`/`P2025` into
   friendly messages) before returning the same `{ error, code }` JSON shape either
   way. `okResponse(data, status)` is the success-path counterpart.
3. **`lib/fetchClients.ts`** — the one place all client-side requests go through
   (`fetchClient(url, options)`). On a non-`ok` response it parses the JSON body and
   throws a typed `ApiError(message, code, status)` — not a generic `Error`. This
   type is what the next layer keys off of. It also auto-detects `FormData` bodies
   and skips setting `Content-Type` (see uploads above).
4. **`contexts/query-client.provider.tsx`** — the `QueryClient` is built with a
   `QueryCache` and a `MutationCache`, each with a global `onError` that checks
   `error instanceof ApiError` and calls `toast.error(error.message)` (plus logs
   `[code] message` to the console). **This is why individual `useQuery`/
   `useMutation` calls never need their own error handling** — just let the error
   propagate; the toast fires automatically for every failed query/mutation in the
   app, with zero code in the hook itself.
5. **Success toasts are opt-in**, unlike errors. Pass `meta: { successMessage: "..." }`
   when defining a `useMutation` — the `MutationCache`'s global `onSuccess` reads
   `mutation.meta?.successMessage` and calls `toast.success(...)` only if present.
   Don't call `toast.success` manually inside a local `onSuccess` callback; use
   `meta` instead, so it stays consistent with how errors are handled (one global
   place decides how toasts render).
   ```ts
   const { mutate: itemCreate } = useMutation({
       mutationFn: (data: FormData) => apiPostItens(data),
       onSuccess: () => queryClient.invalidateQueries({ queryKey: ['itens'] }), // fine to add extra local behavior...
       meta: { successMessage: "Item criado com sucesso!" },                    // ...but the toast itself goes through meta
   })
   ```
   A local `onSuccess`/`onError` callback is fine (and expected) for side effects
   like `queryClient.invalidateQueries`, closing a modal, or resetting local state —
   just never duplicate the toast call there.
6. **`components/ui/sonner.tsx`** — wraps `sonner`'s `Toaster`, theme-aware (reads
   `next-themes`), with icons per toast type and colors pulled from the app's own
   CSS variables (`--popover`, `--popover-foreground`, `--border`) so toasts follow
   light/dark automatically. Mounted once, near the root layout (`<Toaster
   richColors closeButton />`) — never mount a second `Toaster` inside a page or
   component.

Net effect for anyone writing a new mutation: throw a well-worded `AppError` on the
server, add `meta: { successMessage }` on the client if you want a success toast,
and don't write any toast/error-display code yourself — it already works.

**Robustness guarantees this chain relies on — keep them true if you touch these files:**
- `fetchClient` must **always** throw an `ApiError` on any failure path — including
  `fetch()` itself rejecting (offline, DNS failure, server unreachable) and the
  success-path `res.json()` failing on a malformed/empty body. If a raw
  non-`ApiError` ever escapes `fetchClient`, the global `onError` (`error instanceof
  ApiError`) silently ignores it — the query/mutation fails with **zero** user
  feedback. Wrap every step of `fetchClient` in try/catch and normalize to
  `ApiError`, don't let anything through unwrapped.
- A `401` (`AppError("...", 401)`, thrown from `getSessionPayload()` when the
  session is missing/invalid/expired) is handled specially in
  `contexts/query-client.provider.tsx`'s global `onError`: besides the toast, it
  clears the saved `AuthUser` (`localStorage["@Inventario:user"]`) and hard-redirects
  to `/login`. Without this, an expired session just re-toasts the same error on
  every subsequent action instead of sending the user back to log in.
- `app/error.tsx` is a React Error Boundary for the App Router — it only catches
  **render-time** errors (a component throwing while rendering, e.g. a bug like
  reading a property off `undefined`), which is a different failure mode than the
  API/query error chain above. Keep both: the toast chain doesn't catch render
  crashes, and `error.tsx` doesn't catch failed queries (React Query swallows query
  errors into `error`/`isError` state, it doesn't rethrow to a boundary).

## Frontend: one folder per domain (`views/<domain>/`)

```
views/<domain>/<domain>.types.ts    — TS interfaces: <X>Base (DB shape),
                                       Create<X>DTO, Update<X>DTO, <X>ComRelacoes
views/<domain>/<domain>.api.ts      — thin fetchClient(...) wrappers, one per endpoint
views/<domain>/<domain>.hooks.ts    — React Query (useQuery/useMutation), owns
                                       cache invalidation via queryClient
views/<domain>/components/*.tsx     — "use client" components (modals, tables,
                                       cards) that call the hooks — never call
                                       .api.ts functions directly from a component
```

`fetchClient` (`lib/fetchClients.ts`) already handles JSON vs `FormData` headers —
don't set `Content-Type` manually, just pass a `FormData` body when uploading files.

## File uploads

`lib/upload.ts` has shared helpers (`salvarImagem`, `salvarImagens`, `salvarPdf`,
`sanitizarIdRastreavel`) — reuse them from any route that needs to save a file,
don't reimplement the same `mkdir`/`writeFile` logic per route. Files land under
`public/uploads/...`, which is gitignored — never let generated/uploaded content get
committed; if you add a new kind of generated output folder, gitignore it too.

## Theming (light/dark)

Colors are CSS variables defined in `app/globals.css` (`--background`,
`--foreground`, `--muted-foreground`, etc.), toggled via `next-themes` (`.dark`
class). **Never hardcode `text-white` / `text-black` / `bg-white` on content that
sits on a theme-following background** — it'll be invisible in one of the two
themes. Use the semantic Tailwind classes (`text-foreground`, `bg-background`,
`text-muted-foreground`, ...) instead. Hardcoded colors are only correct on an
element whose *own* background is deliberately fixed regardless of theme (e.g. a
dark overlay/scrim, a branded login screen, a badge sitting on its own solid chip).

# Permissions & authorization system

This platform is multi-tenant: every project is a `sistema` sharing the same
`public` (core) schema in Postgres, distinguished by `sistema_id`
(`process.env.SISTEMA_ID_ATUAL`). Read this before adding any new protected route,
page, or permission.

## Core tables (schema `public`)

| Table | What it is | Scope |
|---|---|---|
| `sistemas` | Each project/app on the platform | — |
| `recurso` | A protectable "thing" (e.g. `itens`, `historico`) | **Per `sistema_id`** — never reuse another sistema's recurso row |
| `acao` | A verb (`create`, `edit`, `excluir`, `ver`, `anexar`, ...) | **Global** — shared across every sistema on the platform; reuse an existing acao before creating a new one |
| `perfil` | An access profile within a sistema (e.g. "usuario", "coordenador", "admin") — **not** the same thing as `cargo` (job title, display-only) | Per `sistema_id` |
| `perfil_permissao` | `perfil × recurso × acao` — if a row exists, that perfil can do it | `@@unique([perfil_id, recurso_id, acao_id])` |
| `usuario_sistema` | Assigns a user to one `perfil` inside one sistema | `@@unique([usuario_id, sistema_id])` |
| `usuario_permissao_override` | Per-user exception (`permitido: boolean`) on top of the perfil's permissions | `@@unique([usuario_id, sistema_id, recurso_id, acao_id])` |

Mental model: usuario → (`usuario_sistema`) → perfil → (`perfil_permissao`) → base
permission set → apply that usuario's `usuario_permissao_override` on top (override
always wins) → final `["recurso:acao", ...]` list.

## `cargo` never grants access — `usuario_sistema` is the only door in

`usuarios.cargo_id` (→ `cargos`, with fields like `cargo`, `cbo`) is **real-world
job-title data** — used for display and for anything HR/payroll-related (`cbo` is
the Brazilian occupational classification code, a legal/labor field, nothing to do
with this app's permissions). It is **not** an authorization mechanism. An earlier
version of this pattern used `cargo.nome` as a coarse allow-list (`roles: string[]`
on each protected route, checked in `proxy.ts`) *before* the granular
`perfil`/`perfil_permissao` system existed — that legacy check has since been
**removed entirely** from `proxy.ts` and `config/permissions.ts`. Don't reintroduce
it, and don't add a new project that gates pages/routes by `cargo`.

The only thing that grants a user access to anything is:
`usuario_sistema` (is this user even linked to this `sistema`, and under which
`perfil`?) → `perfil_permissao` (what can that `perfil` do?) → this usuario's
`usuario_permissao_override` (any per-user exception on top?). If a user has no
`usuario_sistema` row for this `sistema_id`, they have **zero** access here,
regardless of `cargo`, regardless of what they can do in some *other* sistema —
`usuario_sistema` is itself scoped per `sistema_id` (`@@unique([usuario_id,
sistema_id])`), so being an admin in one sistema means nothing in another unless a
matching `usuario_sistema` row exists for that one too.

`cargo` is still carried in the JWT (`role` field) and in the login response body
(`AuthUser.cargo.nome`) purely for **display** (e.g. the sidebar footer) — never
read it to decide what to show or allow. If you're tempted to check `cargo`/`role`
anywhere in `proxy.ts`, a `route.ts`, or a component's rendering logic, that's a
sign you're missing a `recurso`/`acao` row instead of a shortcut worth taking.

## Login: resolve once, bake into the JWT

At login, resolve the array above **for this project's `sistema_id`** and sign it
straight into the session JWT (`jose`/`SignJWT`, `HS256`, cookie `session_token`,
`httpOnly`, 1-day expiry). The token payload carries `id`, `login`, `role` (cargo,
display-only, see above), `permissoes: string[]`, and `iat`.

`permissoes` itself is resolved **once at login, not re-queried per request** —
the JWT's copy of it is a snapshot. What *is* checked per request is whether that
snapshot has since been invalidated: see "Revoking a session early" below —
`sessao_valida_apos` is what makes a `perfil_permissao`/`usuario_sistema` change
take effect on the user's very next request instead of requiring a logout.

Also return a plain `AuthUser` object in the login response body (not the cookie)
with display fields **plus a copy of `permissoes`**, so the frontend can decide what
to render. This copy is cosmetic only — the real source of truth stays server-side
in the httpOnly cookie; tampering with the client copy grants nothing.

## Generating typed constants

A script (`npm run gen:permissoes`) queries `recurso` (filtered by
`SISTEMA_ID_ATUAL`) and `acao` (global) and writes
`lib/permissoes.generated.ts` — **auto-generated, never hand-edit it.** After
inserting a new `recurso`/`acao` row in the DB, rerun this script before referencing
`RECURSOS.X`/`ACOES.Y` in code (it won't compile otherwise).

## Full worked reference: login → JWT → session/permission check → proxy → sidebar

This section exists because a sibling project on this platform was found to not be
basing its access control on `perfil`/`perfil_permissao` at all — it had its own,
disconnected notion of "admin". **If you're porting this pattern to a new project,
copy the actual code below, don't re-derive it from the bullet points above.**
Projeto-Core is the reference implementation; every other `sistema` must match
this, end to end, because they all read/write the same `public` schema.

### Step 1 — Login resolves the permission matrix and signs it flat into the JWT

`services/usersServices.ts` — `loginUser`:

```ts
async loginUser(loginUserDto: LoginUserDTO, sistemaId: number): Promise<LoginResult> {
    const user = await this.usersRepository.loginUser(loginUserDto.login, sistemaId);
    if (!user || !user.senha) throw new AppError("Credenciais inválidas.", 401, "INVALID_CREDENTIALS");
    if (user.status === false) throw new AppError("Usuário desativado.", 403, "USER_DISABLED");

    const senhaValida = bcrypt.compareSync(loginUserDto.password, user.senha);
    if (!senhaValida) throw new AppError("Credenciais inválidas.", 401, "INVALID_CREDENTIALS");

    // usuario_sistema já vem filtrado por sistema_id no repository (loginUser query)
    const vinculoSistema = user.usuario_sistema[0];
    if (!vinculoSistema) throw new AppError("Você não tem acesso a este sistema.", 403, "SISTEMA_ACCESS_DENIED");

    // Perfil (rótulo tipo "Administrador") NÃO concede nada sozinho — quem concede
    // é a linha em perfil_permissao. Um perfil chamado "Administrador" sem linhas
    // em perfil_permissao não tem UMA ÚNICA permissão real.
    const permissoesSet = new Set<string>();

    for (const pp of vinculoSistema.perfil.perfil_permissao) {
        permissoesSet.add(`${pp.recurso.slug}:${pp.acao.slug}`);
    }

    for (const override of user.usuario_permissao_override) {
        const chave = `${override.recurso.slug}:${override.acao.slug}`;
        if (override.permitido) permissoesSet.add(chave)
        else permissoesSet.delete(chave)
    }

    return { user, permissoes: Array.from(permissoesSet) }; // string[] "recurso:acao"
}
```

`app/api/users/login/route.ts` — signs `permissoes` straight into the token, and
sets the cookie with `isRequestSecure` (see "Cookie/session security notes"
above), not `NODE_ENV`:

```ts
const { user, permissoes } = await userService.loginUser({ login, password }, Number(sistema_id));

const token = await new SignJWT({
    id: user.id,
    login: user.login,
    role: user.cargos?.cargo,   // legacy display field, NOT what grants access
    permissoes: permissoes,     // string[] "recurso:acao" — this is what grants access
})
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('1d')
    .sign(SECRET_KEY);

response.cookies.set("session_token", token, {
    httpOnly: true,
    secure: isRequestSecure(request),
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24,
});
```

### Step 2 — `getSessionPayload()` verifies the signature AND asks "was this revoked since?"

`utils/jwtController.ts`:

```ts
export interface TokenPayload {
    id: number;
    login: string;
    role?: string;
    permissoes: string[]; // "recurso:acao"
    iat: number; // issued-at, seconds — jose sets this via .setIssuedAt()
}

const SECRET_KEY = new TextEncoder().encode(process.env.JWT_SECRET);

export async function decodeToken(token: string): Promise<TokenPayload> {
    const { payload } = await jwtVerify(token, SECRET_KEY);
    return payload as unknown as TokenPayload;
}
```

`lib/getSessionPayload.ts` — a valid signature is necessary but not sufficient;
see "Revoking a session early" below for why:

```ts
export async function getSessionPayload(): Promise<TokenPayload> {
    const cookieStore = await cookies();
    const token = cookieStore.get("session_token")?.value;
    if (!token) throw new AppError("Acesso não autorizado", 401);

    let payload: TokenPayload;
    try {
        payload = await decodeToken(token);
    } catch {
        throw new AppError("Sessão inválida ou expirada", 401);
    }

    const valida = await usersFactory.create().sessaoAindaValida(payload.id, payload.iat * 1000);
    if (!valida) {
        throw new AppError("Sessão expirada. Suas permissões foram alteradas — faça login novamente.", 401);
    }

    return payload;
}

export function temPermissao(payload: TokenPayload, recurso: RecursoSlug, acao: AcaoSlug): boolean {
    return payload.permissoes.includes(`${recurso}:${acao}`);
}
```

A `route.ts` uses both together — this is the actual 2-line pattern from the next
section, now with real types:

```ts
const payload = await getSessionPayload();
if (!temPermissao(payload, RECURSOS.USUARIOS, ACOES.VER)) {
    throw new AppError("Sem permissão para ver usuários.", 403);
}
```

### Step 3 — `proxy.ts` protects navigation with the SAME `permissoes` array (no DB call)

`proxy.ts` deliberately does **not** call `sessaoAindaValida` — it only checks the
signature and whatever `permissoes`/`role` were baked into the token at login.
This is why editing someone's permission doesn't kick them out of a *page* they're
already on until they hit an API — see "Revoking a session early" for the tradeoff.

```ts
export async function proxy(request: NextRequest) {
  const token = request.cookies.get("session_token")?.value;
  if (!token) return NextResponse.redirect(new URL("/login", request.url));

  try {
    const { payload } = await jwtVerify(token, SECRET_KEY);
    const permissoes = (payload.permissoes as string[] | undefined) ?? [];
    const { pathname } = request.nextUrl;

    const recurso = getRecursoForRoute(pathname);
    if (recurso && !permissoes.includes(`${recurso}:${ACOES.VER}`)) {
      // Fallback page must stay OUT of matcher below, or a user with zero
      // permissions loops forever redirecting to it. See earlier note.
      return NextResponse.redirect(new URL("/sem-permissao", request.url));
    }

    return NextResponse.next();
  } catch (error) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
}

export const config = {
  matcher: ["/usuarios", "/sistemas", "/permissoes", "/cadastros"],
};
```

`config/permissions.ts` is what `proxy.ts` reads from. **No `cargo`/`roles` field
at all** — `recurso` is the only thing a route can be gated by:

```ts
export interface RouteConfig {
  path: string;
  label: string;
  recurso: RecursoSlug;
  icon?: string;
}

export const APP_ROUTES: RouteConfig[] = [
  { path: '/usuarios', label: 'Usuários', recurso: RECURSOS.USUARIOS },
  // one entry per protected page — recurso is what proxy.ts checks against permissoes
];

export const getRecursoForRoute = (pathname: string) =>
  APP_ROUTES.find(route => pathname.startsWith(route.path))?.recurso;
```

### Step 4 — Sidebar mirrors the exact same `recurso` check (cosmetic, not security)

`cargo` shows up here **only** for display (the user's name/job-title in the
footer) — it plays no role in deciding which links render. In
`components/ui/app-sidebar.tsx`:

```tsx
const { user } = useAuth()
const cargoUsuario = user?.user.cargo.nome   // display only, e.g. sidebar footer
const permissoesUsuario = user?.user.permissoes ?? []

const menuItems = APP_ROUTES.filter(route =>
    permissoesUsuario.includes(`${route.recurso}:ver`)
)
```

Remember: this only decides what renders. It does **not** protect anything — a
user could still hit the route's URL directly, which is why `proxy.ts` (step 3)
and the `route.ts` check (step 2) both have to be correct independently.

### If a new project's admin sees "no permission" everywhere

Walk the steps above in order and check the data, not the code, first:
1. Does `perfil_permissao` have rows for that admin's `perfil_id`, in the right
   `sistema_id`? An empty `perfil_permissao` means zero real permissions, no
   matter what the perfil is named.
2. Does `recurso.sistema_id` match this project's actual `SISTEMA_ID_ATUAL`?
3. Is `lib/permissoes.generated.ts` stale (rerun `npm run gen:permissoes`)?
4. `console.log(payload.permissoes)` right after `getSessionPayload()` and look
   at the real array before assuming it's a logic bug.

## Protecting an API route (mandatory 2-line pattern)

```ts
const payload = await getSessionPayload();                       // 401 if no valid session
if (!temPermissao(payload, RECURSOS.ITENS, ACOES.CREATE)) {      // 403 if missing that permission
    throw new AppError("Sem permissão para criar itens.", 403);
}
```

Apply this to **every** route that touches non-public data. Deliberate exceptions
(document the "why" inline, don't just leave a route unchecked and assume it's
fine):
- Login/logout.
- Intentionally public routes (e.g. an item detail page reachable by scanning a
  physical QR code — no login required by design).
- Shared reference/lookup data used by forms across every role (e.g. a dropdown's
  source list) where no single `recurso` naturally fits — still require
  `getSessionPayload()` (valid login) even without a `temPermissao` check; never
  leave it with neither.

Any other route with zero auth check is a bug — audit for this specifically
whenever you inherit or extend this codebase.

## Protecting navigation (`proxy.ts`, not `middleware.ts`)

This Next.js version names its routing middleware file `proxy.ts` at the project
root. It runs before rendering pages matched by its `config.matcher` — it protects
*navigation*, not data; the API-level check above is what actually protects data.

`config/permissions.ts` is the single source of truth:

```ts
export interface RouteConfig {
  path: string;
  label: string;
  recurso: RecursoSlug;  // requires "<recurso>:ver" in the JWT — the only gate
  icon?: string;
}
export const APP_ROUTES: RouteConfig[] = [/* ... */];
export const getRecursoForRoute = (pathname: string) => APP_ROUTES.find(r => pathname.startsWith(r.path))?.recurso;
```

`proxy.ts` checks, per request: if the route is mapped in `APP_ROUTES`, require
`"<recurso>:ver"` in `payload.permissoes`. That's the only check — no `cargo`/role
allow-list (see "`cargo` never grants access" above for why that was removed).
This generic recurso-based check is what makes adding page-level protection to a
*new* page a one-line config change (`recurso: 'novoRecurso'`) instead of bespoke
code in `proxy.ts` every time.

Redirect target matters: send to `/login` only when authentication itself is
missing/invalid (no token, expired/bad signature). Send to a safe in-app page (not
`/login`) when the user is authenticated but simply lacks a granular permission —
sending an already-logged-in user back to the login screen is confusing.

**That "safe in-app page" must NOT itself be inside `config.matcher`.** If it is,
you get an infinite redirect loop the moment a real user hits it: `proxy.ts` fails
the recurso check on page A, redirects to fallback page B — but B is *also*
matched by the proxy, so its own check runs, also fails (same user, same missing
permission), redirects back to B... the browser eventually gives up with
`ERR_TOO_MANY_REDIRECTS`. This isn't a hypothetical: it happened by picking an
existing protected route (`/usuarios`) as the fallback target. Fix: a dedicated
page like `/sem-permissao` that is deliberately **left out of `matcher`**, so
`proxy.ts` never intercepts it regardless of what permissions the user has (or
doesn't have) — it's the one route guaranteed not to loop.

**Every protected page's path must be added to `proxy.ts`'s `matcher` array** — a
route missing from `matcher` gets zero navigation protection even if
`APP_ROUTES`/`config/permissions.ts` defines rules for it. (The one deliberate
exception is the "sem permissão" fallback page above — everything else that's
meant to be protected belongs in `matcher`.)

## Mirroring in the sidebar/menu (cosmetic only)

The menu component should apply the exact same check (`recurso` against
`user.permissoes`) to decide what to render — see "Full worked reference" step 4
above for the real code. **This is UX only, never security** — hiding a link
doesn't block the route; the `proxy.ts` + `route.ts` layers above are what
actually enforce access. Never treat UI-hiding as a substitute for either, and
never gate what renders by `cargo`/job-title — that field is display data, not a
permission source (see "`cargo` never grants access" above).

## Checklist: adding permissions to a new domain

1. Insert the `recurso` row(s) for this `sistema_id`.
2. Confirm the `acao`(s) you need already exist globally (`create`/`edit`/`excluir`/
   `ver` almost certainly do); only add a new `acao` for a genuinely new verb.
3. Run `npm run gen:permissoes`.
4. Add the `getSessionPayload()` + `temPermissao()` pair to every new/affected
   `route.ts`.
5. If the resource maps to a real page, add it to `APP_ROUTES` in
   `config/permissions.ts` and its path to `proxy.ts`'s `matcher`.
6. Mirror the same check in the sidebar/menu for UX.
7. Populate `perfil_permissao` (data, not code) for whichever perfis should have
   this recurso:acao.

# Cookie/session security notes

## `Secure` cookie flag must reflect the real transport, not `NODE_ENV`

`secure: true` tells the **browser** to only store/send this cookie over HTTPS. If
this is derived from `NODE_ENV === "production"` instead of the actual connection,
it creates a real deployment trap: the moment the app runs with
`NODE_ENV=production` **before** HTTPS is actually terminating in front of it (no
cert yet, reverse proxy/load balancer not configured for TLS yet), the login
response carries `Set-Cookie: ...; Secure` over a plain HTTP connection. Browsers
silently **refuse to store** a `Secure` cookie that didn't arrive over HTTPS — the
API call still returns 200, but `session_token` never lands in the browser. Every
subsequent request then has no cookie → looks like a random "instant logout" or a
login loop, when the real cause is transport, not auth logic.

**Fix implemented**: `lib/cookies.ts` exports `isRequestSecure(request)`, which
checks the `X-Forwarded-Proto` header (set by essentially every TLS-terminating
reverse proxy/CDN — nginx, Cloudflare, an ALB, Vercel) and falls back to the
request's own URL protocol if that header is absent. Both `app/api/users/login/route.ts`
and `app/api/users/logout/route.ts` use `secure: isRequestSecure(request)` instead of
`secure: process.env.NODE_ENV === "production"`. This makes the cookie's security
level track the *actual* connection automatically: while the app is only reachable
over HTTP, cookies go out without `Secure` (unavoidable — there's no such thing as a
secure cookie over an insecure channel); the moment HTTPS starts terminating in
front of it, cookies automatically start going out `Secure`, with no manual flag to
remember to flip and no risk of forgetting.

Precondition for this to work: whatever sits in front of the app in production
(reverse proxy, load balancer, CDN) must actually forward `X-Forwarded-Proto`. This
is the default for nginx (with standard proxy config), Cloudflare, AWS ALB, Vercel,
etc. — but if you introduce a different fronting layer, verify it sets this header,
or `isRequestSecure` will under-report and cookies will stay non-`Secure` even once
HTTPS is live.

## Other things to keep in mind here

- `httpOnly: true` is already correct — client-side JS (and therefore XSS) can't
  read the token. Don't "fix" a frontend permission-reading problem by making the
  cookie non-`httpOnly`; expose a specific field in the login response body instead
  (see `AuthUser.permissoes` above), never the raw token.
- `JWT_SECRET` must stay a strong, random value and must never be committed —
  confirm it's only ever read from `.env`/the deploy platform's secret store.

## Dev gotcha: testing two `sistema`s at once on `localhost` shares the cookie

`session_token` is set with `path: '/'` and no explicit `domain` — cookies are
scoped by **host**, not by port. If you're running this project on
`localhost:3000` and another `sistema` (a separate Next.js app on this same
platform) on `localhost:3001` in the **same browser**, they share one cookie jar
for `localhost`. Logging into sistema B overwrites `session_token` with a JWT
whose `permissoes` are resolved for B's `sistema_id` — switching back to tab A,
its `proxy.ts` reads that same cookie, finds none of A's recursos in the
`permissoes` array, and bounces you to the "sem permissão" fallback (see above) —
even though you didn't touch any permission and A's own session was fine a minute
ago. Symptom looks like "logged in too long → randomly loses access"; the real
trigger is "logged into a different sistema in another tab since then."

This is **not a bug to patch in application code** — it's normal cookie scoping,
and it only bites you in local multi-sistema testing on `localhost` with
different ports (in production, each sistema has its own real domain/subdomain,
so this doesn't happen). To test two sistemas at once locally: use two separate
browser profiles, or one regular + one incognito/private window, so each gets its
own cookie jar.

## Revoking a session early (`sessao_valida_apos`)

The JWT is stateless by design (see "Login: resolve once, bake into the JWT"
above) — that's what keeps `getSessionPayload()` a single signature check with no
DB roundtrip. The gap: if an admin deactivates a user, changes their `perfil` in a
`usuario_sistema`, edits a `usuario_permissao_override`, or edits a `perfil`'s
`perfil_permissao` rows, none of that touches already-issued tokens. Whoever is
logged in keeps their **old** permissions baked into their **old** token until it
naturally expires (up to 1 day) — a demoted or deactivated user doesn't actually
lose access until they happen to log out.

**Fix**: one nullable column on `usuarios`, checked with a single indexed lookup
per request — cheap enough to not give up the "no DB roundtrip to verify a
signature" property in spirit, while still closing the gap.

```sql
ALTER TABLE usuarios ADD COLUMN sessao_valida_apos TIMESTAMPTZ;
```
```prisma
// model usuarios
sessao_valida_apos DateTime? @db.Timestamptz(6)
```

`repository/usersRepository.ts` gets three methods: `invalidarSessao(usuarioId)`
(sets `sessao_valida_apos = now()` for one user), `invalidarSessaoPorPerfil(perfilId)`
(same, but `updateMany` for every user currently linked to that `perfil` via
`usuario_sistema` — a `perfil_permissao` edit affects everyone on that perfil, not
one user), and `buscarSessaoValidaApos(usuarioId)` (selects just
`sessao_valida_apos` + `status`).

`services/usersServices.ts` gets `sessaoAindaValida(usuarioId, tokenIatMs)`:

```ts
async sessaoAindaValida(usuarioId: number, tokenIatMs: number): Promise<boolean> {
    const usuario = await this.usersRepository.buscarSessaoValidaApos(usuarioId)
    if (!usuario || usuario.status === false) return false
    if (!usuario.sessao_valida_apos) return true
    return tokenIatMs >= usuario.sessao_valida_apos.getTime()
}
```

`getSessionPayload()` calls it right after verifying the JWT signature — a valid
signature is no longer sufficient on its own:

```ts
const payload = await decodeToken(token) // throws on bad signature
const valida = await usersFactory.create().sessaoAindaValida(payload.id, payload.iat * 1000)
if (!valida) throw new AppError("Sessão expirada. Suas permissões foram alteradas — faça login novamente.", 401)
```

This needs `iat` (issued-at, seconds) on `TokenPayload` — `jose`'s
`.setIssuedAt()` already puts it on the token, the type just has to declare it.

**Every service action that changes what a user can do must call one of the two
`invalidar*` methods after writing:**

| Action | Call |
|---|---|
| Deactivate a user (`status` set in `editUser`) | `invalidarSessao(usuario.id)` |
| Change a user's `perfil` in a sistema (`usuario_sistema` update) | `invalidarSessao(data.usuario_id)` |
| Create/delete a `usuario_permissao_override` | `invalidarSessao(usuario_id)` |
| Create/delete a `perfil_permissao` row | `invalidarSessaoPorPerfil(perfil_id)` — hits every user on that perfil |

Because `perfilPermissaoService`, `usuarioSistemaService`, and
`usuarioPermissaoOverrideService` live in different domains than `usersRepository`,
their factories in `lib/factory.ts` inject `new usersRepository()` alongside each
service's own repository — this is the one sanctioned exception to "a service only
talks to its own repository," used specifically for this cross-cutting concern.

Also worth doing alongside this: `loginUser` should reject `status === false`
before issuing a token at all (`throw new AppError("Usuário desativado.", 403)`) —
otherwise a deactivated user can still start a brand-new session.

**No extra frontend work needed** — the 401 this produces is indistinguishable
from any other expired/invalid session, so the existing "A `401`... clears the
saved `AuthUser` and hard-redirects to `/login`" handling (see "Robustness
guarantees" above) already covers it.

This still isn't a full session store — it doesn't let you list or kill one
specific *device's* session while leaving others active, and it costs one indexed
query per request. If that ever becomes the requirement, that's a bigger change
(real session table, or short-lived access token + refresh token), not an
extension of this pattern.

## Real-time presence ("who's online, per sistema") — `usuario_sistema.ultimo_acesso`

Projeto-Core's `/sistemas` screen shows a live count of how many users are
currently active *in each sistema*. Because every sistema on the platform shares
the same `public.usuario_sistema` table, this pattern only works if **every
sistema writes to it the same way, with the same throttle/window constants** —
if one sistema pings on a different cadence or a different table, the counts
lie. Copy this verbatim into any sistema that wants to participate; don't
re-derive it.

**This is a write-only contract for every sistema except Core.** Every
sistema — Core included — needs the *write* side: the heartbeat inside
`getSessionPayload()` and the cleanup inside `logout`. Nothing else. The
*read* side — `contarOnlinePorSistema()`, the `/api/usuario-sistema/online`
endpoint, the polling hook, the badge on the card — only exists in Core,
because Core is the only app with a screen that lists every sistema at once.
A sistema-filho has no reason to query this data about itself or about
siblings; it just needs to keep the shared column accurate so *Core's* count
is correct. Don't port the counting/endpoint/UI pieces into a sistema-filho —
only the two write calls.

### The core idea: piggyback on `getSessionPayload()`

There is no separate "presence service" and no WebSocket/SSE server. Every
protected route already calls `getSessionPayload()` on every request (see
"Full worked reference" above) — that's the one place in the whole codebase
guaranteed to run exactly when "this specific user is actively using this
specific sistema right now." So the heartbeat is just one more line inside it:
stamp `usuario_sistema.ultimo_acesso = now()` for that `(usuario_id,
sistema_id)` pair.

No new endpoint the frontend has to remember to call, no client-side timer to
keep alive across tab switches — it rides on traffic that's already happening.

### Why a naive "UPDATE on every request" would be wrong

`getSessionPayload()` runs on *every* authenticated API call — a user clicking
around generates many requests per minute. Writing `ultimo_acesso = now()` on
every single one would turn an indexed read into a constant stream of row
updates (MVCC dead tuples, WAL, autovacuum pressure) for zero added accuracy —
"online 4 seconds ago" and "online 0 seconds ago" are the same fact to a human
looking at a counter on a screen.

**Fix: throttle the write, not the check.** The heartbeat only actually writes
if the *previous* `ultimo_acesso` is older than `HEARTBEAT_THROTTLE_MS`
(1 minute). Inside that window, the query still runs (it's a single indexed
`updateMany` on the `uq_usuario_sistema` unique key) but matches zero rows —
Postgres does an index lookup and touches nothing, functionally as cheap as a
`SELECT`. So an actively-clicking user still only produces **one real write per
minute**, no matter how many requests they make.

### Schema change (run once — shared table, affects every sistema immediately)

```sql
ALTER TABLE usuario_sistema ADD COLUMN ultimo_acesso TIMESTAMPTZ;
CREATE INDEX idx_usuario_sistema_ultimo_acesso ON usuario_sistema (sistema_id, ultimo_acesso);
```

This only needs to run **once**, against the shared Postgres — not once per
sistema. After it's run, every sistema (including this one) still needs to sync
its *own* copy of `schema.prisma`:

```bash
npx prisma db pull
npx prisma generate
```

`prisma.sistemasGetPayload`/`usuario_sistema` types won't include
`ultimo_acesso` until you do this locally in each repo, even though the column
already physically exists.

### Shared constants — must be identical across every sistema

```ts
// lib/presenca.ts
// Precisam ser as MESMAS em todo sistema que escreve nessa tabela compartilhada.

// Intervalo mínimo entre dois pings do mesmo usuário no mesmo sistema.
export const HEARTBEAT_THROTTLE_MS = 60_000

// Janela de tempo em que um `ultimo_acesso` ainda conta como "online".
// Maior que o throttle pra não "piscar" offline entre um ping e outro.
export const ONLINE_WINDOW_MS = 3 * 60_000
```

If sistema A throttles writes to 1 minute but sistema B uses 5, and both read
the online count with a 3-minute window, B's users will flicker offline
between pings while A's won't — same bug class as the `cargo`/`perfil`
divergence warned about elsewhere in this file. Copy the numbers, don't
"improve" them per-sistema.

### `repository/usuarioSistemaRepository.ts` — two new methods

```ts
async registrarAcesso(usuarioId: number, sistemaId: number) {
    // updateMany (não update) de propósito: precisa da condição extra de
    // throttle no where, que o update-por-chave-única não aceita.
    // Fora da janela de throttle, o Postgres não toca a linha — é
    // essencialmente um lookup indexado, não uma escrita.
    await prisma.usuario_sistema.updateMany({
        where: {
            usuario_id: usuarioId,
            sistema_id: sistemaId,
            OR: [
                { ultimo_acesso: null },
                { ultimo_acesso: { lt: new Date(Date.now() - HEARTBEAT_THROTTLE_MS) } },
            ],
        },
        data: { ultimo_acesso: new Date() },
    })
}

async registrarSaida(usuarioId: number, sistemaId: number) {
    // Logout explícito: não precisa esperar a janela de ONLINE_WINDOW_MS
    // expirar sozinha, já limpa aqui pra sumir da contagem na hora.
    await prisma.usuario_sistema.updateMany({
        where: { usuario_id: usuarioId, sistema_id: sistemaId },
        data: { ultimo_acesso: null },
    })
}

async contarOnlinePorSistema() {
    const cutoff = new Date(Date.now() - ONLINE_WINDOW_MS)
    const grupos = await prisma.usuario_sistema.groupBy({
        by: ["sistema_id"],
        where: { ultimo_acesso: { gt: cutoff } },
        _count: { _all: true },
    })
    return grupos
}
```

`contarOnlinePorSistema` is a single `groupBy` for *all* sistemas at once — not
one query per sistema. A sistema that only cares about its own count still
calls this and filters/ignores the rest; don't write a sistema-scoped variant,
it'd just be N+1 waiting to happen if the query is ever reused for a
multi-sistema view (like Core's).

### `services/usuarioSistemaService.ts` — heartbeat must never break the request

```ts
async registrarAcesso(usuarioId: number, sistemaId: number) {
    // Heartbeat de presença — nunca deve derrubar a requisição que o chamou,
    // é só telemetria. Erro aqui vira log, não exceção propagada.
    try {
        await this.usuarioSistemaRepository.registrarAcesso(usuarioId, sistemaId)
    } catch (error) {
        console.error("Falha ao registrar presença:", error)
    }
}

async registrarSaida(usuarioId: number, sistemaId: number) {
    // Best-effort igual ao heartbeat — falha aqui não pode travar o logout.
    try {
        await this.usuarioSistemaRepository.registrarSaida(usuarioId, sistemaId)
    } catch (error) {
        console.error("Falha ao registrar saída:", error)
    }
}

async contarOnlinePorSistema() {
    const grupos = await this.usuarioSistemaRepository.contarOnlinePorSistema()
    return Object.fromEntries(grupos.map((g) => [g.sistema_id, g._count._all]))
}
```

The `try/catch` here is deliberate and is the one place in this codebase where
swallowing an error instead of throwing `AppError` is correct — a broken
presence write is not a reason to 401/500 a real user action. Don't copy this
swallow-and-log pattern anywhere else without the same justification.

### The ping itself — one line inside `getSessionPayload()`

```ts
// lib/getSessionPayload.ts
const valida = await usersFactory.create().sessaoAindaValida(payload.id, payload.iat * 1000);
if (!valida) {
    throw new AppError("Sessão expirada. Suas permissões foram alteradas — faça login novamente.", 401);
}

// Heartbeat de presença: todo request autenticado passa por aqui, então é
// o ponto natural pra "pingar" que o usuário está ativo neste sistema.
// Tem throttle interno (lib/presenca.ts) — não é 1 escrita por request.
await usuarioSistemaFactory.create().registrarAcesso(payload.id, Number(process.env.SISTEMA_ID_ATUAL));

return payload;
```

Uses `process.env.SISTEMA_ID_ATUAL`, not a field off `payload` — the JWT never
carries `sistema_id` (see "Login" above), but it doesn't need to: whichever
sistema's process is running this code *is* the sistema the user is active in
right now.

**This assumes a long-running Node process (`next start`), not serverless
(Vercel/Lambda).** This project runs `next start -p 2332` — a persistent
process — so `await`-ing the heartbeat before returning is safe and simple: no
risk of the platform freezing the function before the write lands. If a
sistema *does* deploy serverless, fire-and-forget (`registrarAcesso(...).catch
(() => {})` without `await`) is not safe there — the platform can kill the
invocation the instant the response is sent. Use the framework's
background-task primitive (e.g. Next's `after()`) instead, or keep the
`await` (the write is one indexed lookup, the latency cost is negligible
either way).

### Clearing it on logout — don't wait for the window to expire

The heartbeat alone means a user who logs out still shows "online" for up to
`ONLINE_WINDOW_MS` (3 minutes) after leaving, since nothing tells the table
they're gone. Logout should clear `ultimo_acesso` immediately instead of
waiting it out. The catch: the existing `logout/route.ts` only clears the
cookie — it never decodes it, so it doesn't know *which* user is logging out.
Decode it first, then clear it:

```ts
// app/api/users/logout/route.ts
export async function POST(request: Request) {
    const cookieStore = await cookies();
    const token = cookieStore.get("session_token")?.value;

    if (token) {
        try {
            const payload = await decodeToken(token);
            await usuarioSistemaFactory.create().registrarSaida(payload.id, Number(process.env.SISTEMA_ID_ATUAL));
        } catch {
            // Token inválido/expirado — nada de presença pra limpar, segue o logout normal.
        }
    }

    const response = NextResponse.json({ message: "Logout realizado" });
    // ...cookie clearing continues as before
}
```

The `try/catch` swallows a decode failure on purpose — an expired/tampered
token means there's nothing valid to clean up, but the user still needs to be
able to log out (clear the cookie) regardless. Don't let a presence-cleanup
failure block that.

This only handles the *explicit* logout path. A closed tab, a crashed browser,
or a token that simply expires without the user clicking "logout" all skip
this — that's fine, that's exactly what the `ONLINE_WINDOW_MS` fallback (the
heartbeat just stops arriving, so the row ages out of the `contarOnlinePorSistema`
window on its own) is for. Logout clearing is a UX nicety for the common case,
not the mechanism the whole feature depends on.

### Reading it back: Core-only, one grouped query exposed as a cheap polling endpoint

Everything from here down — the `GET` endpoint, the polling hook, the badge —
**belongs only to Core.** A sistema-filho writes `ultimo_acesso` (previous two
sections) and stops there; it never needs to read this data back, because it
has no screen that shows presence for itself or for other sistemas. Don't
copy this half into a sistema-filho.

```ts
// app/api/usuario-sistema/online/route.ts
export async function GET() {
    const usuarioSistemaService = usuarioSistemaFactory.create()
    try {
        // getSessionPayload() já basta aqui — não é dado sensível por sistema,
        // qualquer usuário autenticado pode ver quantos estão online.
        await getSessionPayload()
        const contagem = await usuarioSistemaService.contarOnlinePorSistema()
        return okResponse(contagem)
    } catch (error) {
        return errorResponse(error)
    }
}
```

Frontend: plain React Query polling, not a WebSocket/SSE connection — simpler
to keep working across the same infra as everything else, and "at most 20s
stale" is indistinguishable from real-time for a headcount badge on a screen a
human is looking at, not a chat app.

```ts
// views/sistema/sistema.hooks.ts
const INTERVALO_POLL_ONLINE_MS = 20_000

export function useSistemasOnline() {
    const { data: online = {} } = useQuery({
        queryKey: ['sistemas', 'online'],
        queryFn: apiGetSistemasOnline, // GET /api/usuario-sistema/online -> Record<sistema_id, number>
        refetchInterval: INTERVALO_POLL_ONLINE_MS,
        refetchIntervalInBackground: false, // don't poll a backgrounded tab
    })
    return online
}
```

Kept as its own query key (`['sistemas', 'online']`), separate from the main
`['sistemas']` query that fetches full sistema records with `perfil`/`recurso`
includes — polling shouldn't refetch the heavy query every 20 seconds, only
this cheap grouped count.

### If you're porting this to a sistema-filho: only the write side

A sistema-filho's checklist is just two items — both from the *write* side
above, nothing from "Reading it back":

1. Whatever function verifies the session on every request (its own
   `getSessionPayload()`) also stamps `usuario_sistema.ultimo_acesso` with the
   *same* `HEARTBEAT_THROTTLE_MS` used here.
2. Its own `logout` route clears that column for `(usuario_id, sistema_id)`
   the same way, instead of leaving it to age out.

That's it — no endpoint, no hook, no badge, no `ONLINE_WINDOW_MS` needed on
that side at all (that constant is only read by Core's `contarOnlinePorSistema`).
The `ultimo_acesso` column and its index only need to be created **once**,
against the shared Postgres (see "Schema change" above) — not once per
sistema. Route path, hook name, and polling interval in the *reading* section
are cosmetic details of Core's own implementation, not something a
sistema-filho needs to match — because a sistema-filho isn't implementing
that half at all.

## Access audit log ("who logged in/out, and when") — `auditoria_acessos`

Where the presence feature above answers "who's online *right now*",
`auditoria_acessos` answers "who logged in/out *over time*, per sistema." They
are deliberately separate tables with separate purposes:

- `usuario_sistema.ultimo_acesso` is a single mutable pointer — every write
  overwrites the previous value, so it can never answer "when did this
  person's session start" once enough time has passed.
- `auditoria_acessos` is append-only — one row per event, never updated or
  overwritten, so it *can* answer that.

Don't try to derive login/logout history from `ultimo_acesso`; it was never
designed to hold history, only "most recent."

**Same write-only contract as presence, same exception structure.** Every
sistema — Core included — writes two kinds of events: `login` and `logout`.
Only Core *reads* this table back (the audit modal on `/sistemas`). A
sistema-filho writes and stops there, exactly like the presence section above.

### Schema — reused an existing empty table, don't recreate this pattern blindly

```sql
ALTER TABLE auditoria_acessos
    ADD COLUMN id SERIAL PRIMARY KEY,
    ADD COLUMN usuario_id INT NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    ADD COLUMN sistema_id INT NOT NULL REFERENCES sistemas(id) ON DELETE CASCADE,
    ADD COLUMN tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('login', 'logout')),
    ADD COLUMN criado_em TIMESTAMPTZ NOT NULL DEFAULT now();

CREATE INDEX idx_auditoria_acessos_sistema_criado ON auditoria_acessos (sistema_id, criado_em DESC);
CREATE INDEX idx_auditoria_acessos_usuario ON auditoria_acessos (usuario_id);
```

`auditoria_acessos` already existed in the shared Postgres with zero columns
(a placeholder someone created earlier) — that's *why* this is an `ALTER
TABLE ADD COLUMN` instead of `CREATE TABLE`. If you're porting this pattern
somewhere that has no such placeholder, use `CREATE TABLE auditoria_acessos
(...)` with the same columns instead; don't go looking for a same-named empty
table to reuse unless one is confirmed to already exist for that reason.

After running this against the shared Postgres (once — not per sistema), each
sistema still syncs its own `schema.prisma`:

```bash
npx prisma db pull
npx prisma generate
```

### Writing a `login` event — inside `loginUser`, after the permission matrix resolves

```ts
// services/usersServices.ts — end of loginUser(), right before the return
try {
    await this.auditoriaAcessoRepository.registrarLogin(user.id, sistemaId)
} catch (error) {
    console.error("Falha ao registrar login na auditoria:", error)
}
```

Best-effort, same justification as the presence heartbeat: a broken audit
write is not a reason to fail a real login. `usersFactory` injects
`auditoriaAcessoRepository` into `usersServices` alongside its own
`usersRepository` — this is the same sanctioned cross-domain exception used
throughout this file (see "Revoking a session early" above) applied a second
time to the same class.

### Writing a `logout` event — alongside the presence cleanup, same route

```ts
// app/api/users/logout/route.ts
if (token) {
    try {
        const payload = await decodeToken(token);
        const sistemaId = Number(process.env.SISTEMA_ID_ATUAL);
        await usuarioSistemaFactory.create().registrarSaida(payload.id, sistemaId);
        await auditoriaAcessoFactory.create().registrarLogout(payload.id, sistemaId);
    } catch {
        // Token inválido/expirado — nada de presença/auditoria pra limpar, segue o logout normal.
    }
}
```

Two separate factories, two separate tables, same route, same decoded token —
don't merge these into one call just because they fire together here; they're
independent concerns (`usuario_sistema.ultimo_acesso` vs. `auditoria_acessos`)
that happen to both need "who's logging out" at the same moment.

### "Logged out by inactivity" is inferred, never stored as its own event

You confirmed this explicitly: inactivity uses the *same* 3-minute
`ONLINE_WINDOW_MS` presence already uses — there's no separate timer, no cron
job, and no discrete "expired" row ever written to `auditoria_acessos`. The
table only ever gets `login` and `logout` rows. Whether a given `login` is
still active, ended by an explicit logout, or went quiet from inactivity is
computed **at read time**, in `auditoriaAcessoService.buscarAuditoria()`:

```ts
// auditoriaAcessoService.buscarAuditoria()
statusInferido: evento.tipo === "login"
    ? this.inferirStatusLogin(evento.usuario_id, evento.criado_em, logouts, ultimoAcessoPorUsuario, cutoffOnline)
    : "logout", // logout sempre carrega o próprio badge — não duplica na linha de login

private inferirStatusLogin(
    usuarioId: number,
    loginEm: Date,
    logouts: { usuario_id: number; criado_em: Date }[],
    ultimoAcessoPorUsuario: Map<number, Date | null>,
    cutoffOnline: number,
): "ativo" | "inatividade" | null {
    const teveLogoutDepois = logouts.some(
        (l) => l.usuario_id === usuarioId && l.criado_em > loginEm,
    )
    if (teveLogoutDepois) return null // a própria linha do logout já mostra isso

    const ultimoAcesso = ultimoAcessoPorUsuario.get(usuarioId)
    const aindaAtivo = !!ultimoAcesso && ultimoAcesso.getTime() > cutoffOnline
    return aindaAtivo ? "ativo" : "inatividade"
}
```

**First cut of this got the badge placement backwards** — it put "Saiu
(logout)" on the *login* row instead of the actual logout row, since only
`login` events computed a status at all. Fixed by flipping which row owns the
badge: a `logout` event is self-evident (it needs no inference, `tipo` alone
says everything), so it always shows the badge on its own row; a `login` only
gets a badge when it's still "open" (no logout has closed it yet) — `ativo`
if recent enough, `inatividade` if it went quiet. If you're implementing a
similar audit view, put the "this session ended" badge on the event that
actually represents the ending, not on the event that started it.

This is a heuristic, not a reconstructed session log: "any logout after this
login" is treated as closing it, even in the rare case of rapid re-logins
where that logout technically belongs to a later session. Good enough for an
admin glancing at an audit screen; not a source of truth for anything
security-critical (that's what `sessao_valida_apos` and the JWT are for — see
"Revoking a session early" above).

### Reading it back: Core-only, same split as presence

`auditoriaAcessoService.buscarAuditoria(sistemaId)` returns two lists in one
call:

- `ativos` — reuses `usuarioSistemaRepository.listarAtivos()` (same
  `ultimo_acesso`/`ONLINE_WINDOW_MS` logic as the presence badge, but with
  `usuarios.nome` joined in instead of just a count).
- `historico` — the last 50 `auditoria_acessos` rows for that sistema, each
  tagged with the inferred status above for `login` rows.

Exposed at `GET /api/sistema/[id]/auditoria`, gated by the same
`RECURSOS.SISTEMAS`/`ACOES.VER` permission as the rest of the sistemas
screen — not a separate `recurso`, since this is a detail view of a sistema
someone can already see. Rendered in `AuditoriaSistemaModal`, opened from a
`History` icon button in each card's footer on `/sistemas` (next to the
"Editar" pencil, same `relative z-10` treatment so it sits above the card's
invisible detail-opening overlay button) — not from inside
`SistemaDetalheModal`, so it's reachable without opening the detail modal
first. Polls every 20s the same way the presence badge does.

A sistema-filho does none of this — same reasoning as presence: it has no
screen listing sistemas, so it has no reason to read this data back.
