import { filiaisRepository } from "@/repository/filiaisRepository";

export class filiaisService {
    constructor(private filiaisRepository: filiaisRepository){}

    async fetchFiliais() {
        const filiais = await this.filiaisRepository.fetchFiliais()
        return filiais
    }
}
