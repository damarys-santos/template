import { useMutation, useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { apiGetUsuarios, apiLogin } from "./user.api";
import { useAuth } from "@/contexts/AuthContext";
import { LoginUserDTO } from "./user.type";

export function useUser() {
    const { data: usuarios = [], isLoading: loading } = useQuery({
        queryKey: ['usuarios'],
        queryFn: apiGetUsuarios,
    })

    return {
        usuarios,
        loading
    }
}

export function useAuthLogin() {
    const { login } = useAuth()
    const router = useRouter()

    const { mutateAsync: postLogin, isPending: loadingLogin } = useMutation({
        mutationFn: (data: LoginUserDTO) => apiLogin(data),
        onSuccess: ({ user }) => {
            // Salva o AuthUser (permissoes inclusas) no contexto/localStorage —
            // sem isso a sidebar e o resto do app não sabem quem está logado.
            login(user)
            router.push("/recurso1")
        },
        // Toast de sucesso via meta, não chamado manualmente — ver AGENTS.md
        // ("Errors & toasts — one chain, end to end").
        meta: { successMessage: "Login realizado com sucesso!" },
    })

    return { postLogin, loadingLogin }
}
