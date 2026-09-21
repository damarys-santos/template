import { usersRepository } from "@/repository/usersRepository";
import { usersServices } from "@/services/usersServices";

import { auditoriaAcessoRepository } from "@/repository/auditoriaAcessoRepository";
import { auditoriaAcessoService } from "@/services/auditoriaAcessoService";

import { usuarioSistemaRepository } from "@/repository/usuarioSistemaRepository";
import { usuarioSistemaService } from "@/services/usuarioSistemaService";

import { permissoesRepository } from "@/repository/permissoesRepository";
import { permissoesService } from "@/services/permissoesService";

import { recurso1Repository } from "@/repository/recurso1Repository";
import { recurso1Service } from "@/services/recurso1Service";

import { recurso2Repository } from "@/repository/recurso2Repository";
import { recurso2Service } from "@/services/recurso2Service";

import { filiaisRepository } from "@/repository/filiaisRepository";
import { filiaisService } from "@/services/filiaisService";

import { setorRepository } from "@/repository/setorRepository";
import { setorService } from "@/services/setorService";

import { fornecedoresRepository } from "@/repository/fornecedoresRepository";
import { fornecedoresService } from "@/services/fornecedoresService";

import { subcategoriaRepository } from "@/repository/subcategoriasRepository";
import { subcategoriaService } from "@/services/subcategoriasService";

export class usersFactory {
    static create() {
        const repo = new usersRepository
        // Injeta o repo de auditoria além do próprio — exceção sancionada em
        // AGENTS.md ("Log de auditoria de acessos") pra registrar o evento
        // "login" no fim de loginUser().
        const auditoriaRepo = new auditoriaAcessoRepository
        return new usersServices(repo, auditoriaRepo);
    }
}

export class auditoriaAcessoFactory {
    static create() {
        const repo = new auditoriaAcessoRepository
        return new auditoriaAcessoService(repo)
    }
}

export class usuarioSistemaFactory {
    static create() {
        const repo = new usuarioSistemaRepository
        return new usuarioSistemaService(repo)
    }
}

export class permissoesFactory {
    static create() {
        const repo = new permissoesRepository
        return new permissoesService(repo)
    }
}

export class recurso1Factory {
    static create() {
        const repo = new recurso1Repository
        return new recurso1Service(repo)
    }
}

export class recurso2Factory {
    static create() {
        const repo = new recurso2Repository
        return new recurso2Service(repo)
    }
}

export class filiaisFactory {
    static create() {
        const repo = new filiaisRepository
        return new filiaisService(repo)
    }
}

export class setorFactory {
    static create() {
        const repo = new setorRepository
        return new setorService(repo)
    }
}

export class fornecedoresFactory {
    static create() {
        const repo = new fornecedoresRepository
        return new fornecedoresService(repo)
    }
}

export class subcategoriasFactory {
    static create() {
        const repo = new subcategoriaRepository
        return new subcategoriaService(repo)
    }
}
