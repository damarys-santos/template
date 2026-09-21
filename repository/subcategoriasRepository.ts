
import { prisma } from "@/lib/prisma";

export class subcategoriaRepository {
    async fetchSubcategorias() {
        const subcategorias = await prisma.subcategorias.findMany({
            include: { categorias: true }
        })
        return subcategorias
    }
}
