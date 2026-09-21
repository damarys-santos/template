# Template Projetos

Boilerplate interno para novos sistemas que se conectam ao mesmo banco
Postgres **core** corporativo (usuários, cargos, filiais, setores e o motor
de permissões RBAC), mantendo seu **próprio schema** de domínio.

O sistema **não gerencia autenticação e permissões de forma isolada**: ele se
integra a um **"sistema core"** compartilhado, que centraliza usuários,
cargos e o motor de permissões (RBAC) usados por vários sistemas internos da
empresa. Cada novo projeto criado a partir deste template é um dos
"sistemas" cadastrados nesse core, identificado pela variável
`SISTEMA_ID_ATUAL`.

O banco é um único Postgres com **dois schemas**:

- `app` — dados próprios deste sistema. Vem com um domínio de exemplo:
  `recurso1` (entidade principal) e `recurso2` (histórico/relacionado a
  `recurso1`) — **renomeie ou remova ao começar um projeto real**, eles só
  existem para ilustrar o padrão.
- `public` — dados **compartilhados com o core**: `usuarios`, `cargos`,
  `setores`, `filiais`, `municipios`, `sistemas` e todo o motor de RBAC
  (`perfil`, `recurso`, `acao`, `perfil_permissao`, `usuario_sistema`,
  `usuario_permissao_override`), além de `categorias`, `subcategorias` e
  `fornecedores` — cadastros comuns que qualquer sistema pode consultar.

Stack: Next.js 16 (App Router) + React 19 + TypeScript, PostgreSQL via Prisma
7, Tailwind 4 + Radix UI, React Hook Form + Zod, TanStack Query, autenticação
via JWT (`jose`) em cookie httpOnly.

> ⚠️ **Atenção:** este projeto usa uma versão do Next.js com mudanças de
> comportamento em relação ao que normalmente se espera (ex.: o middleware de
> rotas se chama `proxy.ts`, não `middleware.ts` — veja a seção
> [Segurança das rotas de API](#segurança-das-rotas-de-api)). Antes de mexer
> em convenções de roteamento, consulte `node_modules/next/dist/docs/`.

## Usando este template para um projeto novo

1. Clone/copie esta pasta para o novo projeto e ajuste `package.json` (nome,
   versão) e `.env`.
2. Cadastre o novo sistema na tabela `sistemas` do core (nome, stack,
   repositório etc.) e anote o `id` gerado — é o valor de
   `SISTEMA_ID_ATUAL`.
3. Cadastre em `recurso` (schema `public` do core) uma linha por tela/módulo
   protegido do seu sistema (ex.: `recurso1`, `recurso2` ou os nomes reais
   que você escolher), vinculada ao `sistema_id` do passo anterior. Cadastre
   também os vínculos de perfil em `perfil_permissao`.
4. Renomeie/remova os models `recurso1`/`recurso2` em `prisma/schema.prisma`
   para o domínio real do seu projeto, mantendo o padrão de duas partes:
   schema `app` (seus models) + schema `public` (core, não mexer).
5. Rode `npx prisma migrate dev` (ou `db push`) para aplicar o schema `app`
   no banco. O schema `public` já existe (é gerenciado pelo core) — não
   crie migração para ele.
6. Renomeie as pastas/arquivos `recurso1`/`recurso2` em `repository/`,
   `services/`, `app/api/` e `views/` para o nome do seu domínio, seguindo o
   padrão descrito abaixo.

## Como colocar para rodar

### Pré-requisitos

- Node.js compatível com Next.js 16
- Acesso a um PostgreSQL com os schemas `app` e `public` (neste projeto,
  ambos vivem no mesmo banco/host)

### Passo a passo

1. Instale as dependências:

   ```bash
   npm install
   ```

2. Crie um arquivo `.env` na raiz com as variáveis abaixo (peça os valores
   reais a um dev do time — não estão neste README por serem credenciais):

   | Variável | Finalidade |
   |---|---|
   | `DATABASE_URL` | Connection string do Postgres usada pelo Prisma (o client lê os dois schemas declarados em `prisma/schema.prisma`) |
   | `DB_USER`, `DB_HOST`, `DB_DATABASE`, `DB_PASSWORD`, `DB_PORT` | Credenciais usadas pelo `pg`/`@prisma/adapter-pg` |
   | `SISTEMA_ID_ATUAL` | ID deste sistema dentro da tabela `sistemas` do core — usado para resolver perfil/permissões do usuário no login |
   | `JWT_SECRET` | Segredo usado para assinar/verificar o `session_token` (JWT) |
   | `CLIENT_URL` | URL base do front (usada em e-mails/links) |
   | `EMAIL_USERNAME`, `EMAIL_PASSWORD` | Credenciais de envio de e-mail |

3. Gere o client do Prisma (o client é gerado em `generated/prisma`):

   ```bash
   npx prisma generate
   ```

4. (Opcional, mas recomendado após qualquer mudança de permissões no core)
   Sincronize o catálogo local de permissões:

   ```bash
   npm run gen:permissoes
   ```

   Isso regrava `lib/permissoes.generated.ts` com os recursos/ações
   cadastrados no core para `SISTEMA_ID_ATUAL`.

5. Suba o servidor de desenvolvimento:

   ```bash
   npm run dev
   ```

6. Acesse [http://localhost:3000](http://localhost:3000). A rota `/login` é
   a porta de entrada — sem sessão válida, as rotas protegidas redirecionam
   para lá (ver seção de segurança).

Outros scripts úteis: `npm run build` (build de produção), `npm run start`
(roda o build), `npm run lint`.

## Arquitetura e camadas

O backend segue consistentemente o mesmo pipeline em **todos** os domínios
(`recurso1`, `recurso2`, `filiais`, `setor`, `fornecedores`,
`subcategorias`, `users`, e qualquer domínio novo que você adicionar):

```
app/api/**/route.ts  →  Service (services/*Service.ts)  →  Repository (repository/*Repository.ts)  →  Prisma (lib/prisma.ts)
```

- **Route (`app/api/<dominio>/**/route.ts`)** — camada HTTP. Recebe a
  request, valida sessão/permissão (ver seção de segurança), faz parsing do
  body/formData, chama o service e devolve a resposta via
  `okResponse`/`errorResponse` (`lib/errors/`).
- **Service (`services/<dominio>Service.ts`)** — regra de
  negócio/orquestração. Recebe um repository por injeção de construtor e
  expõe métodos de alto nível. Não conhece Prisma diretamente.
- **Repository (`repository/<dominio>Repository.ts`)** — acesso a dados. É a
  única camada que fala com o Prisma (`lib/prisma.ts`), monta
  `include`/`where`/filtros e retorna os dados já tipados.

Erros são padronizados em `lib/errors/`: lance um `AppError(mensagem,
statusCode)` em qualquer camada e a route captura com `errorResponse(error)`;
respostas de sucesso usam `okResponse(dado)`.

### Factory (`lib/factory.ts`)

Cada domínio tem uma classe `*Factory` com um método estático `create()` que
instancia o repository e injeta no service, devolvendo o service pronto para
uso:

```ts
export class recurso1Factory {
    static create() {
        const repo = new recurso1Repository
        return new recurso1Service(repo)
    }
}
```

Isso mantém a instanciação (Factory Method) fora das routes — cada
`route.ts` só faz `const service = recurso1Factory.create()` e usa o
service, sem se preocupar em montar a cadeia repository → service
manualmente. Ao adicionar um domínio novo, crie o repository, o service e
registre a factory correspondente aqui.

### Pasta `views/` (frontend por domínio)

O frontend espelha os mesmos domínios do backend em `views/<dominio>/`, com
uma convenção fixa de arquivos:

```
views/<dominio>/
  <dominio>.api.ts     → funções que chamam a API via fetchClient (lib/fetchClients.ts) — ex.: apiGetRecurso1(), apiCreateRecurso1()
  <dominio>.hooks.ts    → hooks de dados com TanStack Query (useQuery/useMutation) que consomem as funções do .api.ts
  <dominio>.types.ts    → tipos/DTOs do domínio, compartilhados entre api, hooks e componentes
  components/           → componentes de UI específicos do domínio (quando houver)
```

Todo client-side usa `fetchClient` (fetch nativo, sem axios) — não introduza
axios em um domínio novo, siga o mesmo padrão dos domínios existentes.

Exemplos reais: `views/recurso1/`, `views/recurso2/` (domínio de exemplo —
renomeie para o seu), `views/filiais/`, `views/setor/`,
`views/fornecedores/`, `views/subcategorias/` (consultas ao core, prontas
para reuso), `views/user/`.

Regra geral para quem for mexer num domínio: a página em
`app/(app)/<dominio>/page.tsx` consome os hooks de
`views/<dominio>/<dominio>.hooks.ts`; os hooks chamam as funções de
`<dominio>.api.ts`; o tipo do dado trafega por `<dominio>.types.ts`.

## Autenticação: login, cookies e permissões

### Login (`app/api/users/login/route.ts`)

1. Recebe `login`/senha, autentica via `usersFactory.create().loginUser(...)`.
2. Resolve as permissões do usuário **para este sistema** via
   `permissoesFactory.create().resolverPermissoesDoLogin(user.id,
   SISTEMA_ID_ATUAL)`, que cruza `perfil_permissao` (permissões do perfil)
   com `usuario_permissao_override` (permissões específicas daquele
   usuário) e devolve um mapa `recurso:acao → permitido`.
3. Monta um JWT (via `jose`/`SignJWT`) com `id`, `login`, `role` (cargo),
   `perfil` e a lista `permissoes` (strings no formato `"recurso:acao"`),
   válido por 1 dia.
4. Grava o token no cookie **`session_token`**, `httpOnly`, `sameSite:
   "lax"`, `secure` em produção.
5. Devolve também um `AuthUser` (id, nome, login, filial, cargo) no corpo da
   resposta — esse objeto é salvo no client em `localStorage`
   (`@AppTemplate:user`) pelo `AuthProvider` (`contexts/AuthContext.tsx`) e
   exposto via o hook `useAuth()`. Ele alimenta a UI, mas **não** é a fonte
   de verdade de permissão — isso vive só no JWT do cookie, validado no
   servidor.

### Checagem de sessão e permissão (`lib/getSessionpPayload.ts`)

Duas funções usadas por praticamente toda rota de API protegida:

```ts
export async function getSessionPayload(): Promise<TokenPayload> {
    const token = cookieStore.get("session_token")?.value;
    if (!token) throw new AppError("Acesso não autorizado", 401);
    return await decodeToken(token); // valida assinatura via jose (Utils/jwtController.ts)
}

export function temPermissao(payload: TokenPayload, recurso: RecursoSlug, acao: AcaoSlug): boolean {
    return payload.permissoes.includes(`${recurso}:${acao}`);
}
```

- `getSessionPayload()` lê o cookie `session_token`, valida a assinatura do
  JWT (`Utils/jwtController.ts` → `decodeToken`) e devolve o payload
  tipado (`TokenPayload`). Se não houver cookie ou o token for
  inválido/expirado, lança `AppError` (401).
- `temPermissao(payload, recurso, acao)` apenas verifica se a string
  `"recurso:acao"` está na lista de permissões que já veio embutida no JWT
  — não bate no banco a cada request.
- `RECURSOS` e `ACOES` vêm de `lib/permissoes.generated.ts`, **arquivo
  auto-gerado** por `npm run gen:permissoes` a partir do catálogo de
  recursos/ações cadastrado no core para `SISTEMA_ID_ATUAL`. Não editar esse
  arquivo manualmente — rodar o script quando o core cadastrar/alterar
  permissões. O arquivo já vem com um seed inicial (`RECURSO1`, `RECURSO2`)
  para o template funcionar antes do primeiro `gen:permissoes`.

## Navegação e AppSidebar

- `config/permissions.ts` define `APP_ROUTES`: uma lista de rotas do app
  (`/recurso1`, `/recurso2`, ...) com `label`, `roles` (cargos que podem
  acessar) e um `icon` opcional. É a fonte única tanto para o menu quanto
  para a proteção de rotas.
- `components/ui/app-sidebar.tsx` (`AppSidebar`) lê o usuário logado via
  `useAuth()`, pega `user.cargo.nome` e filtra `APP_ROUTES` para montar o
  menu só com as rotas cujo `roles` inclui o cargo do usuário.
- `app/(app)/layout.tsx` é quem monta o layout com sidebar: envolve as
  páginas do grupo `(app)` em `SidebarProvider` + `TooltipProvider`,
  renderiza `AppSidebar` (via `dynamic()`, sem SSR) ao lado do `<main>`, e
  injeta o `QueryProvider` (TanStack Query) e o `Toaster` por cima do
  conteúdo da página.
- Importante: o menu (`AppSidebar`) só **esconde** itens que o usuário não
  pode ver — quem de fato **bloqueia** o acesso à rota é a checagem de
  `roles` no `proxy.ts` (próxima seção) e a checagem de `recurso:acao` em
  cada `route.ts` de API. Nunca confiar apenas na UI para segurança.

## Segurança das rotas de API

Duas camadas de proteção, uma antes da outra:

### 1. Proxy de rotas de página (`proxy.ts`)

Nesta versão do Next.js o middleware de roteamento é declarado em
`proxy.ts` (não `middleware.ts`). Ele roda antes de renderizar as páginas
casadas pelo `matcher`:

```ts
export const config = {
  matcher: ["/recurso1", "/recurso1/:path*", "/recurso2/:path*", "/usuarios/:path*"],
};
```

Fluxo:

1. Lê o cookie `session_token`. Sem cookie → redireciona para `/login`.
2. Verifica a assinatura do JWT com `jwtVerify` (`jose`). Falha → redireciona
   para `/login`.
3. Extrai `role` (cargo) do payload e busca as `roles` exigidas para a rota
   atual em `getRolesForRoute(pathname)` (`config/permissions.ts`).
4. Se a rota exige roles e o cargo do usuário não está na lista →
   redireciona para `/login`.

Isso protege a **navegação/página**, mas não substitui a checagem dentro da
API — os dados só ficam realmente protegidos na camada abaixo.

### 2. Checagem dentro de cada `route.ts` (token + permissão granular)

Todo endpoint de API que precisa de autenticação segue o mesmo padrão,
exemplificado em `app/api/recurso1/create/route.ts`:

```ts
const payload = await getSessionPayload();                          // 1. valida token/sessão (401 se ausente/expirado)
if (!temPermissao(payload, RECURSOS.RECURSO1, ACOES.CREATE)) {      // 2. valida permissão granular (403 se não tiver)
    throw new AppError("Sem permissão para criar recurso1.", 403);
}
```

Esse par de checagens (sessão + permissão granular) deve ser replicado em
**toda** nova rota de API que mexa em dado sensível, usando os
`RECURSOS`/`ACOES` gerados em `lib/permissoes.generated.ts`. Se o
recurso/ação ainda não existir nesse arquivo, ele precisa ser cadastrado
primeiro no core e depois sincronizado com `npm run gen:permissoes`.

Os endpoints de leitura de cadastros compartilhados (`filiais`, `setor`,
`fornecedores`, `subcategorias`) não fazem checagem granular — são dados de
apoio (dropdowns) usados por qualquer sistema conectado ao core.

## Learn More

- [Next.js Documentation](https://nextjs.org/docs) — mas veja a ressalva no
  topo deste README: esta versão do Next tem diferenças de comportamento em
  relação à documentação pública/ao treinamento de LLMs. Confira
  `node_modules/next/dist/docs/` para o comportamento real desta versão
  antes de assumir algo.
