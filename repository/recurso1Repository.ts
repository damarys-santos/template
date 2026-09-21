import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { CreateRecurso1DTO, Recurso1ComRelacoes, Recurso1ComRelacoesLimitadas, Recurso1FiltersState } from "@/views/recurso1/recurso1.types";

export class recurso1Repository {

    async read(id: string): Promise<Recurso1ComRelacoesLimitadas | null> {
        const item = await prisma.recurso1.findUnique({
            where: { id },
            include: {
                usuario_responsavel: {
                    select: { id: true, nome: true, email: true, status: true }
                },
                filiais: { select: { id: true, nome: true } },
                setores: { select: { id: true, nome: true } },
                fornecedores: { select: { id: true, nome_fantasia: true } },
                subcategorias: {
                    select: { id: true, nome: true }
                },
                historico: {
                    orderBy: { data_ocorrencia: 'desc' },
                    include: {
                        setor_destino_rel: { select: { id: true, nome: true } },
                        setor_origem_rel: { select: { id: true, nome: true } },
                        usuario_destino_rel: { select: { id: true, nome: true } },
                        usuario_origem_rel: { select: { id: true, nome: true } },
                        filial_atual: { select: { id: true, nome: true } },
                        filial_destino: { select: { id: true, nome: true } },
                    }
                }
            }
        });

        if (!item) return null;

        const historicos = item.historico.map((h) => ({
            id: h.id,
            data_ocorrencia: h.data_ocorrencia,
            filial_atual: h.filial_atual ? { nome: h.filial_atual.nome } : null,
            filial_destino: h.filial_destino ? { nome: h.filial_destino.nome } : null,
            usuario_origem: h.usuario_origem_rel ? { nome: h.usuario_origem_rel.nome } : null,
            usuario_destino: h.usuario_destino_rel ? { nome: h.usuario_destino_rel.nome } : null,
            setor_origem_rel: h.setor_origem_rel ? { nome: h.setor_origem_rel.nome } : null,
            setor_destino_rel: h.setor_destino_rel ? { nome: h.setor_destino_rel.nome } : null,
        }));

        return {
            ...item,
            anexo: item.anexo ?? "",
            valor: item.valor ? Number(item.valor) : null,
            id_filial: item.id_filial ?? null,
            id_setor: item.id_setor ?? null,
            id_usuario_responsavel: item.id_usuario_responsavel ?? null,
            historicos,
            usuario: item.usuario_responsavel,
            filial: item.filiais,
            setor: item.setores,
            fornecedor: item.fornecedores,
            subcategoria: item.subcategorias,
        };
    }

    async create(item: CreateRecurso1DTO) {
        const criado = await prisma.recurso1.create({
            data: {
                nome: item.nome,
                id_filial: item.id_filial,
                id_setor: item.id_setor,
                id_usuario_responsavel: item.id_usuario_responsavel ?? null,
                subcategoria_id: item.subcategoria_id ?? null,
                descricao: item.descricao ?? null,
                id_fornecedor: item.id_fornecedor ?? null,
                valor: item.valor ?? null,
                anexo: item.anexo ?? null,
            }
        });

        return criado;
    }

    async recurso1ComRelacoes(filtros: Recurso1FiltersState): Promise<{ data: Recurso1ComRelacoes[], totalPages: number }> {
        const limit = Number(filtros.limit) || 10;
        const skip = ((Number(filtros.page) || 1) - 1) * limit;

        const where: Prisma.recurso1WhereInput = {
            ...(filtros.setor_id && { id_setor: Number(filtros.setor_id) }),
            ...(filtros.filial_id && { id_filial: Number(filtros.filial_id) }),
            ...(filtros.subcategoria_id && { subcategoria_id: Number(filtros.subcategoria_id) }),
            ...(filtros.usuario_id && { id_usuario_responsavel: Number(filtros.usuario_id) }),
        };

        const [registros, total] = await Promise.all([
            prisma.recurso1.findMany({
                where,
                take: limit,
                skip,
                include: {
                    usuario_responsavel: true,
                    fornecedores: true,
                    filiais: true,
                    setores: true,
                    subcategorias: { include: { categorias: true } },
                    historico: { orderBy: { data_ocorrencia: 'desc' }, take: 1 },
                }
            }),
            prisma.recurso1.count({ where })
        ]);

        const totalPages = Math.ceil(total / limit) || 1;

        const data = registros.map((item) => ({
            ...item,
            valor: item.valor ? Number(item.valor) : null,
        }));

        return { data, totalPages };
    }
}
