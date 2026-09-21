import { prisma } from "@/lib/prisma";

// Escreve em `auditoria_acessos` — append-only, nunca sobrescreve/atualiza
// uma linha. Só os dois eventos abaixo existem; "sessão caiu por
// inatividade" é inferido depois na leitura (que é exclusiva do Core), não
// um terceiro tipo de linha aqui. Ver AGENTS.md ("Log de auditoria de
// acessos").
export class auditoriaAcessoRepository {
    async registrarLogin(usuarioId: number, sistemaId: number) {
        await prisma.auditoria_acessos.create({
            data: { usuario_id: usuarioId, sistema_id: sistemaId, tipo: "login" },
        });
    }

    async registrarLogout(usuarioId: number, sistemaId: number) {
        await prisma.auditoria_acessos.create({
            data: { usuario_id: usuarioId, sistema_id: sistemaId, tipo: "logout" },
        });
    }
}
