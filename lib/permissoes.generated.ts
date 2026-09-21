// ⚠️ AUTO-GERADO por scripts/gerarPermissoes.ts — não editar manualmente.
// Para atualizar após mudanças no Core: npm run gen:permissoes
//
// Este é o seed inicial (placeholder) para os dois recursos de exemplo do
// template. Após cadastrar seu sistema/recursos reais no core, rode
// `npm run gen:permissoes` para sobrescrever este arquivo com os slugs reais.

export const RECURSOS = {
    RECURSO1: "recurso1",
    RECURSO2: "recurso2",
} as const;

export const ACOES = {
    CREATE: "create",
    EDIT: "edit",
    EXCLUIR: "excluir",
    VER: "ver",
} as const;

export type RecursoSlug = typeof RECURSOS[keyof typeof RECURSOS];
export type AcaoSlug = typeof ACOES[keyof typeof ACOES];
export type PermissaoSlug = `${RecursoSlug}:${AcaoSlug}`;
