import { prisma } from "@/lib/prisma";
import { HEARTBEAT_THROTTLE_MS } from "@/lib/presenca";

// Lado de escrita da presença online. A leitura/contagem por sistema é
// exclusiva do Core — ver AGENTS.md ("Presença online").
export class usuarioSistemaRepository {
    async registrarAcesso(usuarioId: number, sistemaId: number) {
        // updateMany (não update) de propósito: precisa da condição extra de
        // throttle no where, que o update-por-chave-única não aceita. Fora
        // da janela de throttle, o Postgres não toca a linha — é
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
        });
    }

    async registrarSaida(usuarioId: number, sistemaId: number) {
        // Logout explícito: não precisa esperar a janela de presença expirar
        // sozinha, já limpa aqui pra sumir da contagem na hora.
        await prisma.usuario_sistema.updateMany({
            where: { usuario_id: usuarioId, sistema_id: sistemaId },
            data: { ultimo_acesso: null },
        });
    }
}
