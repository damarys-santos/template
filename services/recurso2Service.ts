import { recurso2Repository } from "@/repository/recurso2Repository";
import { CreateRecurso2DTO } from "@/views/recurso2/recurso2.types";

export class recurso2Service {
    constructor(private recurso2Repository: recurso2Repository) {}

    async fetchByRecurso1Id(recurso1Id: string) {
        return await this.recurso2Repository.fetchByRecurso1Id(recurso1Id);
    }

    async create(data: CreateRecurso2DTO) {
        return await this.recurso2Repository.create(data);
    }
}
