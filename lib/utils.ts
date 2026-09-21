import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


export function formatarMoeda(valorRaw: string) {
  // Remove tudo o que não for dígito numérico
  const apenasNumeros = valorRaw.replace(/\D/g, "");

  // Se estiver vazio, retorna string vazia
  if (!apenasNumeros) return "";

  // Converte para centavos (ex: "150" vira 1.50)
  const valorNum = (Number(apenasNumeros) / 100).toFixed(2);

  // Formata no padrão brasileiro (R$ 1.234,56)
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(Number(valorNum));
}