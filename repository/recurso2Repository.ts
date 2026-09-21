import { prisma } from "@/lib/prisma";
import { CreateRecurso2DTO } from "@/views/recurso2/recurso2.types";


export class recurso2Repository {

    async fetchByRecurso1Id(recurso1Id: string) {
        const historico = await prisma.recurso2.findMany({
            where: { id_recurso1: recurso1Id },
            orderBy: { data_ocorrencia: 'desc' },
        });
        return historico;
    }

    async create(data: CreateRecurso2DTO) {
        await prisma.recurso1.update({
            where: { id: data.id_recurso1 },
            data: {
                id_filial: data.id_filial_destino,
                id_setor: data.setor_destino,
            }
        })

        const criado = await prisma.recurso2.create({
            data: {
                ...data,
                data_ocorrencia: new Date(), // gerado no servidor, não vem do DTO
            }
        })

        return criado
    }
}
