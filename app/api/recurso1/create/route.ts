import { AppError, errorResponse, okResponse } from "@/lib/errors";
import { recurso1Factory } from "@/lib/factory";
import { CreateRecurso1DTO } from "@/views/recurso1/recurso1.types";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { randomBytes } from "crypto";
import { getSessionPayload, temPermissao } from "@/lib/getSessionpPayload";
import { ACOES, RECURSOS } from "@/lib/permissoes.generated";

const TIPOS_PERMITIDOS = ["image/jpeg", "image/png"];

export async function POST(request: Request) {
    const recurso1Service = recurso1Factory.create();

    try {
        const payload = await getSessionPayload()
        if (!temPermissao(payload, RECURSOS.RECURSO1, ACOES.CREATE)) {
            throw new AppError("Sem permissão para criar recurso1.", 403);
        }

        const formData = await request.formData();

        const nome = formData.get("nome") as string;
        if (!nome) throw new Error("nome é obrigatório");

        const foto = formData.get("anexo") as File | null;
        let anexo: string | undefined;

        if (foto && foto.size > 0) {
            if (!TIPOS_PERMITIDOS.includes(foto.type)) {
                throw new Error("Tipo de arquivo não permitido. Use JPEG ou PNG.");
            }

            const pasta = path.join(process.cwd(), "public", "uploads", "recurso1");
            await mkdir(pasta, { recursive: true });

            const ext = foto.type === "image/png" ? ".png" : ".jpg";
            const nomeArquivo = `${Date.now()}-${randomBytes(4).toString("hex")}${ext}`;
            const caminhoFisico = path.join(pasta, nomeArquivo);

            const buffer = Buffer.from(await foto.arrayBuffer());
            await writeFile(caminhoFisico, buffer);

            anexo = `/uploads/recurso1/${nomeArquivo}`;
        }

        const body: CreateRecurso1DTO = {
            nome,
            id_filial: Number(formData.get("id_filial")),
            id_setor: Number(formData.get("id_setor")),
            id_usuario_responsavel: Number(formData.get("id_usuario_responsavel")),
            subcategoria_id: Number(formData.get("subcategoria_id")),

            ...(anexo && { anexo }),
            ...(formData.get("descricao") && { descricao: formData.get("descricao") as string }),
            ...(formData.get("id_fornecedor") && { id_fornecedor: Number(formData.get("id_fornecedor")) }),
            ...(formData.get("valor") && { valor: parseFloat(formData.get("valor") as string) }),
        };

        const criado = await recurso1Service.create(body);
        return okResponse(criado);
    } catch (error) {
        return errorResponse(error);
    }
}
