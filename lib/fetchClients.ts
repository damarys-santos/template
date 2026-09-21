// lib/fetchClient.ts
// ─────────────────────────────────────────────────────────────
// Único ponto por onde toda requisição do client passa. PRECISA sempre
// lançar ApiError, em qualquer caminho de falha — inclusive o próprio
// fetch() rejeitando (offline, DNS, servidor inalcançável) e o res.json()
// falhando no caminho de sucesso (corpo vazio/malformado num 2xx). Se um
// erro cru escapar daqui, o onError global (que só reconhece `instanceof
// ApiError`) o ignora silenciosamente — a query/mutation falha sem NENHUM
// feedback pro usuário. Ver AGENTS.md ("garantias de robustez").
// ─────────────────────────────────────────────────────────────
export class ApiError extends Error {
  constructor(
    public message: string,
    public code: string,
    public status: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export async function fetchClient(url: string, options?: RequestInit) {
  const isFormData = options?.body instanceof FormData;

  let res: Response;
  try {
    res = await fetch(url, {
      // Se for FormData, não passa Content-Type — o browser seta sozinho com o boundary
      headers: isFormData ? {} : { "Content-Type": "application/json" },
      ...options,
    });
  } catch {
    // fetch() em si falhou antes de qualquer resposta chegar.
    throw new ApiError("Não foi possível conectar ao servidor.", "NETWORK_ERROR", 0);
  }

  if (!res.ok) {
    try {
      const data = await res.json();
      throw new ApiError(
        data.error ?? "Erro desconhecido",
        data.code ?? "UNKNOWN",
        res.status,
      );
    } catch (e) {
      if (e instanceof ApiError) throw e;
      throw new ApiError(
        "Erro ao processar resposta",
        "PARSE_ERROR",
        res.status,
      );
    }
  }

  try {
    return await res.json();
  } catch {
    // 2xx mas corpo vazio/malformado — não deixa o erro cru do JSON.parse escapar.
    throw new ApiError("Resposta inválida do servidor.", "PARSE_ERROR", res.status);
  }
}
