
import { prisma } from "@/lib/prisma";

export class fornecedoresRepository {
    async fetchFornecedores() {
        const fornecedores = await prisma.fornecedores.findMany()
        return fornecedores
    }
}
