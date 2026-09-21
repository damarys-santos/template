"use client"

import { ApiError } from "@/lib/fetchClients";
import { QueryClient, QueryClientProvider, QueryCache, MutationCache } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";

// Sessão expirada/revogada (login inválido, `sessao_valida_apos` disparado
// por um admin desativando o usuário, etc.) sempre chega aqui como um 401.
// Sem isso, o usuário fica preso num loop de "toast de erro" a cada ação,
// nunca sendo mandado de volta pro /login. Ver AGENTS.md ("garantias de
// robustez" — tratamento especial do 401).
function tratarErroGlobal(error: unknown) {
    if (!(error instanceof ApiError)) return;

    toast.error(error.message);
    console.error(`[${error.code}] ${error.message}`);

    if (error.status === 401) {
        localStorage.removeItem("@AppTemplate:user");
        window.location.href = "/login";
    }
}

export function QueryProvider({ children }: { children: React.ReactNode }) {
    const [queryClient] = useState(() => new QueryClient({
        queryCache: new QueryCache({
            onError: tratarErroGlobal,
        }),
        mutationCache: new MutationCache({
            onError: tratarErroGlobal,
            // Usamos o terceiro parâmetro (mutation) para ler os metadados
            onSuccess: (data, variables, context, mutation) => {
                // Captura a mensagem definida na tela/hook, ou usa um fallback seguro
                const successMessage = mutation.meta?.successMessage as string | undefined;
                
                if (successMessage) {
                    toast.success(successMessage);
                }
            }
        }),
        defaultOptions: {
            queries: {
                staleTime: 1000 * 60 * 5, // 5 min
                retry: false, 
            },
        },
    }))

    return (
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    )
}