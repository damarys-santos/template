import { subcategoriaRepository } from "@/repository/subcategoriasRepository";

export class subcategoriaService {
    constructor(private subcategoriaRepository: subcategoriaRepository){}

    async fetchSubcategorias() {
        const subcategorias = await this.subcategoriaRepository.fetchSubcategorias()
        return subcategorias
    }
}
