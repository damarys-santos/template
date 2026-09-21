import { RECURSOS, RecursoSlug } from "@/lib/permissoes.generated";

// Única fonte de verdade pra proteção de NAVEGAÇÃO (proxy.ts) e pra o que
// renderiza no menu (app-sidebar.tsx). `recurso` é o único critério — nunca
// `cargo`/`role`. Ver AGENTS.md ("Protegendo navegação").
export interface RouteConfig {
  path: string;
  label: string;
  recurso: RecursoSlug;
  icon?: string;
}

export const APP_ROUTES: RouteConfig[] = [
  {
    path: '/recurso1',
    label: 'Recurso 1',
    recurso: RECURSOS.RECURSO1,
  },
  {
    path: '/recurso2',
    label: 'Recurso 2',
    recurso: RECURSOS.RECURSO2,
  },
];

export const getRecursoForRoute = (pathname: string) => {
  return APP_ROUTES.find(route => pathname.startsWith(route.path))?.recurso;
};
