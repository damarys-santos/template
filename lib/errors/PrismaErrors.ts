// lib/errors/prismaErrors.ts
// ─────────────────────────────────────────────────────────────
// Traduz erros do Prisma em mensagens legíveis e status HTTP.
//
// Como adicionar novos códigos:
//   1. Veja o código no terminal (ex: "PrismaClientKnownRequestError P2002")
//   2. Consulte: https://www.prisma.io/docs/orm/reference/error-reference
//   3. Adicione um novo case no switch abaixo
// ─────────────────────────────────────────────────────────────

import { Prisma } from "@/generated/prisma/client"


export interface PrismaErrorResult {
  message: string
  code: string
  status: number
}

export function parsePrismaError(error: unknown): PrismaErrorResult {

  // ── Erros conhecidos do Prisma ──────────────────────────────
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {

      case "P2002":
        // Unique constraint — valor duplicado
        const campo = (error.meta?.target as string[])?.join(", ") ?? "campo"
        return {
          message: `Já existe um registro com esse ${campo}.`,
          code: "DUPLICATE",
          status: 409,
        }

      case "P2025":
        // Registro não encontrado no update/delete
        return {
          message: "Registro não encontrado.",
          code: "NOT_FOUND",
          status: 404,
        }

      case "P2003":
        // Foreign key — relacionamento inválido
        return {
          message: "Referência inválida. Verifique os dados relacionados.",
          code: "FOREIGN_KEY",
          status: 400,
        }

      case "P2014":
        // Relação obrigatória violada
        return {
          message: "Não é possível remover pois existem registros vinculados.",
          code: "RELATION_CONFLICT",
          status: 409,
        }

      case "P2000":
        // Valor muito longo pro campo
        return {
          message: "Um dos valores informados é muito longo.",
          code: "VALUE_TOO_LONG",
          status: 400,
        }

        case "P2022":
          return {
            message: "Column does not exist",
            code: "COLUMN_NOT_FOUND",
            status: 400
          }
      // ── Adicione novos casos aqui ───────────────────────────
      // case "P2xxx":
      //   return { message: "...", code: "...", status: xxx }

      default:
        console.error(`[Prisma] Erro não mapeado (${error.code}):`, error)
        return {
          message: "Erro no banco de dados.",
          code: "DB_ERROR",
          status: 500,
        }
    }
  }

  // ── Dados inválidos passados pro Prisma ─────────────────────
  if (error instanceof Prisma.PrismaClientValidationError) {
    console.error("[Prisma] Validation error:", error.message)
    return {
      message: "Dados inválidos.",
      code: "VALIDATION",
      status: 400,
    }
  }

  // ── Falha de conexão com o banco ────────────────────────────
  if (error instanceof Prisma.PrismaClientInitializationError) {
    console.error("[Prisma] Conexão falhou:", error.message)
    return {
      message: "Serviço indisponível no momento.",
      code: "DB_CONNECTION",
      status: 503,
    }
  }

  // ── Erro completamente desconhecido — loga tudo ─────────────
  console.error("[Erro desconhecido]", error)
  return {
    message: "Erro interno do sistema.",
    code: "UNKNOWN",
    status: 500,
  }
}