// lib/errors/errorResponse.ts
// ─────────────────────────────────────────────────────────────
// Usado nas API Routes para retornar respostas padronizadas.
//
// Uso:
//   try {
//     const data = await service.fazAlgo()
//     return okResponse(data, 201)
//   } catch (error) {
//     return errorResponse(error)
//   }
// ─────────────────────────────────────────────────────────────
import { NextResponse } from "next/server";
import { AppError } from "./AppError";
import { parsePrismaError } from "./PrismaErrors";

// Resposta de sucesso padronizada
export function okResponse(data: unknown, status = 200) {
  return NextResponse.json(data, { status });
}

// Resposta de erro — distingue AppError (regra de negócio) de erro do Prisma
export function errorResponse(error: unknown) {
  // Erro de regra de negócio — mensagem já vem pronta do Service
  if (error instanceof AppError) {
    return NextResponse.json(
      { error: error.message, code: error.code },
      { status: error.status },
    );
  }

  // Erro do Prisma ou desconhecido — parseia e traduz
  const { message, code, status } = parsePrismaError(error);
  return NextResponse.json({ error: message, code }, { status });
}
