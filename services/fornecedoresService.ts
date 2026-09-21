import { fornecedoresRepository } from "@/repository/fornecedoresRepository";

export class fornecedoresService {
    constructor(private fornecedoresRepository: fornecedoresRepository){}

    async fetchFornecedores() {
        const fornecedores = await this.fornecedoresRepository.fetchFornecedores()
        return fornecedores
    }
}
