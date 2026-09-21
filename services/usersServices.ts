import { CreateUserDTO, LoginUserDTO } from "@/views/user/user.type";
import { usersRepository } from "../repository/usersRepository";
import { auditoriaAcessoRepository } from "../repository/auditoriaAcessoRepository";
import bcrypt from 'bcrypt';
import { AppError } from "@/lib/errors";

export class usersServices {
    // `auditoriaAcessoRepository` é injetado aqui além do próprio repositório
    // do domínio — exceção sancionada em AGENTS.md ("Log de auditoria de
    // acessos") pra essa única finalidade cross-cutting.
    constructor(
        private usersRepository: usersRepository,
        private auditoriaAcessoRepository: auditoriaAcessoRepository,
    ) { }

    async fetchUsers() {
        const data = await this.usersRepository.fetchUsers();
        return data
    }

    async createUser(createUserDTO: CreateUserDTO) {
        const userWithHash = { ...createUserDTO, senha: bcrypt.hashSync(createUserDTO.senha, 10) }
        const user = await this.usersRepository.createUsers(userWithHash)
        return user
    }

    async loginUser(loginUserDto: LoginUserDTO, sistemaId: number) {
        const user = await this.usersRepository.loginUser(loginUserDto.login)
        if (!user || !user.senha) {
            throw new AppError("Credenciais inválidas.", 401, "INVALID_CREDENTIALS")
        }
        if (user.status === false) {
            throw new AppError("Usuário desativado.", 403, "USER_DISABLED")
        }

        const senhaValida = bcrypt.compareSync(loginUserDto.password, user.senha)
        if (!senhaValida) {
            throw new AppError("Credenciais inválidas.", 401, "INVALID_CREDENTIALS")
        }

        // Best-effort: um erro aqui não pode impedir um login legítimo.
        try {
            await this.auditoriaAcessoRepository.registrarLogin(user.id, sistemaId)
        } catch (error) {
            console.error("Falha ao registrar login na auditoria:", error)
        }

        return user
    }

    // Chamado por getSessionPayload() a cada request — ver AGENTS.md
    // ("Revogando uma sessão antes"). `tokenIatMs` é o `iat` (issued-at) do
    // JWT em milissegundos; se o usuário foi desativado ou teve permissões
    // alteradas DEPOIS que esse token foi emitido, a sessão morre aqui em
    // vez de esperar o token expirar sozinho (até 1 dia).
    async sessaoAindaValida(usuarioId: number, tokenIatMs: number): Promise<boolean> {
        const usuario = await this.usersRepository.buscarSessaoValidaApos(usuarioId)
        if (!usuario || usuario.status === false) return false
        if (!usuario.sessao_valida_apos) return true
        return tokenIatMs >= usuario.sessao_valida_apos.getTime()
    }

    async invalidarSessao(usuarioId: number) {
        await this.usersRepository.invalidarSessao(usuarioId)
    }

    async invalidarSessaoPorPerfil(perfilId: number) {
        await this.usersRepository.invalidarSessaoPorPerfil(perfilId)
    }
}
