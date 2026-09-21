import { auditoriaAcessoRepository } from "@/repository/auditoriaAcessoRepository";

// Lado de escrita da auditoria de acessos. A leitura/tela (histórico, status
// inferido "ativo"/"inatividade") é exclusiva do Core — ver AGENTS.md
// ("Log de auditoria de acessos").
export class auditoriaAcessoService {
    constructor(private auditoriaAcessoRepository: auditoriaAcessoRepository) { }

    // Best-effort — falha aqui não pode travar o logout.
    async registrarLogout(usuarioId: number, sistemaId: number) {
        try {
            await this.auditoriaAcessoRepository.registrarLogout(usuarioId, sistemaId);
        } catch (error) {
            console.error("Falha ao registrar logout na auditoria:", error);
        }
    }
}
