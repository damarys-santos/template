// repository/permissoesRepository.ts
import { prisma } from "@/lib/prisma";

export class permissoesRepository {

    // usado no login: qual sistema o usuário tem vínculo e qual o perfil dele nesse sistema
    async fetchVinculoUsuarioSistema(usuarioId: number, sistemaId: number) {
        return prisma.usuario_sistema.findUnique({
            where: { usuario_id_sistema_id: { usuario_id: usuarioId, sistema_id: sistemaId } },
            include: { perfil: true }
        });
    }

    // todas as permissões do perfil, já com recurso+ação resolvidos
    async fetchPermissoesDoPerfil(perfilId: number) {
        return prisma.perfil_permissao.findMany({
            where: { perfil_id: perfilId },
            include: { recurso: true, acao: true }
        });
    }

    // overrides individuais do usuário nesse sistema
    async fetchOverridesDoUsuario(usuarioId: number, sistemaId: number) {
        return prisma.usuario_permissao_override.findMany({
            where: { usuario_id: usuarioId, sistema_id: sistemaId },
            include: { recurso: true, acao: true }
        });
    }
}
