// lib/errors/AppError.ts
// ─────────────────────────────────────────────────────────────
// Erro de regra de negócio — lançado pelo Service.
//
// Como usar:
//   throw new AppError("Mensagem pro usuário", 400, "CODIGO_DO_ERRO")
//
// Códigos sugeridos por categoria:
//   400 → dados inválidos / campo obrigatório
//   404 → recurso não encontrado
//   409 → conflito (duplicado, estado inválido)
//   403 → sem permissão
// ─────────────────────────────────────────────────────────────

export class AppError extends Error {
  constructor(
    public message: string,   // mensagem amigável que chega no frontend
    public status: number = 400,
    public code: string = "BUSINESS_ERROR"
  ) {
    super(message)
    this.name = "AppError"
  }
}

// ── Exemplos de uso no Service ────────────────────────────────
//
// if (!safra.empresaId)
//   throw new AppError("Informe a empresa para criar a safra.", 400, "EMPRESA_REQUIRED")
//
// if (safra.dataFim <= safra.dataInicio)
//   throw new AppError("A data fim deve ser maior que a data início.", 400, "DATA_INVALIDA")
//
// if (!usuarioExiste)
//   throw new AppError("Usuário não encontrado.", 404, "USER_NOT_FOUND")