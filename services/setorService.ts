import { setorRepository } from "@/repository/setorRepository";

export class setorService {
    constructor(private setorRepository: setorRepository){}

    async fetchSetores() {
        const setores = await this.setorRepository.fetchSetores()
        return setores
    }
}
