import { recurso1Repository } from "@/repository/recurso1Repository";
import { CreateRecurso1DTO, Recurso1FiltersState } from "@/views/recurso1/recurso1.types";

export class recurso1Service {
    constructor(private recurso1Repository: recurso1Repository) { }

    async getItem(id: string) {
        const item = await this.recurso1Repository.read(id)
        return item
    }

    async create(item: CreateRecurso1DTO) {
        const criado = await this.recurso1Repository.create(item)
        return criado
    }

    async fetchRecurso1(filtros: Recurso1FiltersState) {
        const registros = await this.recurso1Repository.recurso1ComRelacoes(filtros)
        return registros
    }
}
