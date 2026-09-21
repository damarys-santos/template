import { prisma } from "@/lib/prisma";
import fs from "node:fs";
import path from "node:path";

const SISTEMA_ID_ATUAL = Number(process.env.SISTEMA_ID_ATUAL);

function paraConstante(slug: string): string {
    return slug
        .normalize("NFD").replace(new RegExp("[\\u0300-\\u036f]", "g"), "") // remove acento
        .toUpperCase()
        .replace(/[^A-Z0-9]+/g, "_")
        .replace(/^_|_$/g, "");
}

async function main() {
    if (!SISTEMA_ID_ATUAL) throw new Error("SISTEMA_ID_ATUAL não configurado no .env");

    const [recursos, acoes] = await Promise.all([
        prisma.recurso.findMany({ where: { sistema_id: SISTEMA_ID_ATUAL }, orderBy: { slug: "asc" } }),
        prisma.acao.findMany({ orderBy: { slug: "asc" } }),
    ]);

    if (!recursos.length) console.warn(`Aviso: nenhum recurso encontrado para sistema_id=${SISTEMA_ID_ATUAL}`);

    const linhasRecursos = recursos.map((r) => `    ${paraConstante(r.slug)}: "${r.slug}",`).join("\n");
    const linhasAcoes = acoes.map((a) => `    ${paraConstante(a.slug)}: "${a.slug}",`).join("\n");

    const conteudo = `// ⚠️ AUTO-GERADO por scripts/gerarPermissoes.ts — não editar manualmente.
// Para atualizar após mudanças no Core: npm run gen:permissoes

export const RECURSOS = {
${linhasRecursos}
} as const;

export const ACOES = {
${linhasAcoes}
} as const;

export type RecursoSlug = typeof RECURSOS[keyof typeof RECURSOS];
export type AcaoSlug = typeof ACOES[keyof typeof ACOES];
export type PermissaoSlug = \`${"${RecursoSlug}"}:${"${AcaoSlug}"}\`;
`;

    const destino = path.resolve(process.cwd(), "lib/permissoes.generated.ts");
    fs.writeFileSync(destino, conteudo, "utf-8");
    console.log(`✅ Gerado ${recursos.length} recursos e ${acoes.length} ações em ${destino}`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(() => prisma.$disconnect());
