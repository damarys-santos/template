import { prisma } from '@/lib/prisma'
import { CreateUserDTO } from '@/views/user/user.type'

export class usersRepository {
    async fetchUsers() {
        return prisma.usuarios.findMany()
    }

    async createUsers(createUserDTO: CreateUserDTO) {
        const {
            nome,
            email,
            filial_id,
            setor_id,
            cargo_id,
            status,
            criado_em,
            atualizado_em,
            username,
            senha,
        } = createUserDTO

        const user = await prisma.usuarios.create({
            data: {
                nome,
                email,
                login: username,
                senha,
                filial_id,
                setor_id,
                cargo_id,
                status,
                criado_em,
                atualizado_em,
            },
        })

        return user
    }

    async loginUser(login: string) {
        const user = await prisma.usuarios.findFirst({
            where: { login },
            include: {
                filiais: true,
                setores: true,
                cargos: true,
            },
        })

        return user ?? null
    }

    // Usado por getSessionPayload() a cada request pra saber se a sessão
    // (token já validado por assinatura) ainda é válida ou foi revogada
    // desde que foi emitida. Ver AGENTS.md ("Revogando uma sessão antes").
    async buscarSessaoValidaApos(usuarioId: number) {
        return prisma.usuarios.findUnique({
            where: { id: usuarioId },
            select: { status: true, sessao_valida_apos: true },
        })
    }

    // Derruba a sessão de UM usuário no próximo request dele (não espera o
    // token expirar). Chamar depois de: desativar usuário, trocar o perfil
    // dele num sistema, ou criar/apagar um usuario_permissao_override dele.
    async invalidarSessao(usuarioId: number) {
        await prisma.usuarios.update({
            where: { id: usuarioId },
            data: { sessao_valida_apos: new Date() },
        })
    }

    // Mesma coisa, mas pra TODO usuário vinculado a um perfil — usar quando
    // uma linha de perfil_permissao for criada/apagada, já que isso afeta
    // todo mundo naquele perfil, não um usuário só.
    async invalidarSessaoPorPerfil(perfilId: number) {
        await prisma.usuarios.updateMany({
            where: { usuario_sistema: { some: { perfil_id: perfilId } } },
            data: { sessao_valida_apos: new Date() },
        })
    }
}
