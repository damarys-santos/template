
import { prisma } from "@/lib/prisma";

export class filiaisRepository {
    async fetchFiliais() {
        const filiais = await prisma.filiais.findMany()
        return filiais
    }
}
