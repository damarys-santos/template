// services/permissoesService.ts
import { AppError } from "@/lib/errors";
import { permissoesRepository } from "@/repository/permissoesRepository";

export type MapaPermissoes = Map<string, boolean>; // chave: "recursoSlug:acaoSlug"

function chave(recursoSlug: string, acaoSlug: string) {
    return `${recursoSlug}:${acaoSlug}`;
}

export class permissoesService {

    constructor(private permissoesRepository: permissoesRepository){}

    // chamado no LOGIN — valida vínculo e monta o mapa completo de uma vez
    async resolverPermissoesDoLogin(usuarioId: number, sistemaId: number) {
        const vinculo = await this.permissoesRepository.fetchVinculoUsuarioSistema(usuarioId, sistemaId);

        if (!vinculo) {
            // ⚠️ TEMPORÁRIO — projeto TEMPLATE ainda sem `usuario_sistema`
            // cadastrado no core (nenhum usuário tem vínculo oficial com este
            // `sistema_id` ainda). Em vez de bloquear o login de todo mundo,
            // deixa entrar com um mapa de permissões vazio (a checagem
            // granular já está desligada em `temPermissao`, ver AGENTS.md).
            //
            // Quando este projeto virar um sistema oficial: apague o `return`
            // abaixo e descomente o `throw` real.
            return { perfilId: null, perfilNome: null, mapa: new Map<string, boolean>() };
            // throw new AppError("Usuário sem permissão de acesso a este sistema.", 403);
        }

        const [permissoesPerfil, overrides] = await Promise.all([
            this.permissoesRepository.fetchPermissoesDoPerfil(vinculo.perfil_id),
            this.permissoesRepository.fetchOverridesDoUsuario(usuarioId, sistemaId),
        ]);

        const mapa: MapaPermissoes = new Map();

        // 1. base: o que o perfil permite
        permissoesPerfil.forEach((p) => {
            mapa.set(chave(p.recurso.slug, p.acao.slug), true);
        });

        // 2. overrides sobrescrevem o perfil (podem tanto LIBERAR quanto BLOQUEAR)
        overrides.forEach((o) => {
            mapa.set(chave(o.recurso.slug, o.acao.slug), o.permitido);
        });

        return {
            perfilId: vinculo.perfil_id,
            perfilNome: vinculo.perfil.perfil,
            mapa,
        };
    }

    // usado depois, em qualquer checagem pontual (guard de rota, botão desabilitado, etc.)
    podeExecutar(mapa: MapaPermissoes, recursoSlug: string, acaoSlug: string): boolean {
        return mapa.get(chave(recursoSlug, acaoSlug)) ?? false;
    }
}
