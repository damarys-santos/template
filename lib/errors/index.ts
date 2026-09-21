// lib/errors/index.ts
// ─────────────────────────────────────────────────────────────
// Exporta tudo da pasta errors em um lugar só.
//
// Uso:
//   import { AppError, okResponse, errorResponse } from "@/lib/errors"
// ─────────────────────────────────────────────────────────────

export { AppError } from "./AppError"
export { parsePrismaError } from "./PrismaErrors"
export { okResponse, errorResponse } from "./errorResponse"