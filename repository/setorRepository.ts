
import { prisma } from "@/lib/prisma";

export class setorRepository {
    async fetchSetores() {
        const setores = await prisma.setores.findMany()
        return setores
    }
}
