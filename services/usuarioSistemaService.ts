import { usuarioSistemaRepository } from "@/repository/usuarioSistemaRepository";

export class usuarioSistemaService {
    constructor(private usuarioSistemaRepository: usuarioSistemaRepository) { }

    // Heartbeat de presença — nunca deve derrubar a requisição que o chamou,
    // é só telemetria. Erro aqui vira log, não exceção propagada.
    async registrarAcesso(usuarioId: number, sistemaId: number) {
        try {
            await this.usuarioSistemaRepository.registrarAcesso(usuarioId, sistemaId);
        } catch (error) {
            console.error("Falha ao registrar presença:", error);
        }
    }

    // Best-effort igual ao heartbeat — falha aqui não pode travar o logout.
    async registrarSaida(usuarioId: number, sistemaId: number) {
        try {
            await this.usuarioSistemaRepository.registrarSaida(usuarioId, sistemaId);
        } catch (error) {
            console.error("Falha ao registrar saída:", error);
        }
    }
}
