"use client"

import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { LoginUserDTO } from "@/views/user/user.type"
import { useAuthLogin } from "@/views/user/user.hooks"
import Image from "next/image"

export default function Login() {
  const currentYear = new Date().getFullYear()

  // O hook cuida de: chamar a API, salvar o AuthUser no contexto, mostrar o
  // toast de sucesso/erro e redirecionar — a página só desenha o form.
  const { postLogin, loadingLogin } = useAuthLogin()

  const { register, handleSubmit } = useForm<LoginUserDTO>({
    defaultValues: { login: "", password: "" }
  })

  const onSubmit = async (data: LoginUserDTO) => {
    await postLogin(data)
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-[#020817] p-4 sm:p-6 text-white font-sans">

      {/* Imagem de fundo */}
      <Image
        src="/TRANSCLEBER.png"
        alt=""
        fill
        className="object-fill opacity-80 z-0"
        priority
      />

      {/* Overlay */}
      <div className="absolute inset-0 bg-[#020817]/20 z-1" />

      {/* Blur decorativo */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-1">
        <div className="absolute -top-[25%] -left-[10%] w-[50%] h-[50%] rounded-full bg-blue-500/5 blur-[120px]" />
      </div>

      <Card className="relative z-2 w-full max-w-sm sm:max-w-100 border-white/5 bg-[#090e1a]/80 backdrop-blur-xl shadow-[0_0_50px_-12px_rgba(0,0,0,0.5)]">
        <CardHeader className="space-y-2 pt-8 pb-5 text-center px-6 sm:px-8">
          <CardTitle className="text-2xl sm:text-3xl font-semibold tracking-tight text-white">
            Template
          </CardTitle>
          <CardDescription className="text-gray-400 text-sm">
            Acesse sua conta
          </CardDescription>
        </CardHeader>

        <CardContent className="pb-8 px-6 sm:px-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 sm:space-y-5">

            {/* Campo Login */}
            <div className="space-y-2">
              <Label htmlFor="login" className="text-xs font-medium text-gray-400 ml-1 uppercase tracking-wider">
                Login
              </Label>
              <Input
                id="login"
                {...register("login", { required: true })}
                type="text"
                autoCapitalize="none"
                autoCorrect="off"
                autoComplete="username"
                placeholder="Ex: nome.ultimoNome"
                className="h-12 border-white/5 bg-[#18181B] text-white placeholder:text-gray-600 focus:ring-1 focus:ring-blue-600/50 transition-all border-none text-base" // ← text-base evita zoom no iOS (< 16px = zoom)
              />
            </div>

            {/* Campo Senha */}
            <div className="space-y-2">
              <div className="flex items-center justify-between ml-1">
                <Label htmlFor="password" className="text-xs font-medium text-gray-400 uppercase tracking-wider">Senha</Label>
                <button type="button" className="text-[10px] text-blue-400 hover:underline">Esqueceu a senha?</button>
              </div>
              <Input
                id="password"
                {...register("password", { required: true })}
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
                className="h-12 border-white/5 bg-[#18181B] text-white placeholder:text-gray-600 focus:ring-1 focus:ring-blue-600/50 transition-all border-none text-base"
              />
            </div>

            <Button
              type="submit"
              disabled={loadingLogin}
              className="w-full h-12 mt-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg shadow-lg shadow-blue-900/20 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loadingLogin ? "Entrando..." : "Entrar"}
            </Button>

            <p className="text-center text-[11px] text-gray-500 mt-4">
              © {currentYear} Grupo JB • Todos os direitos reservados<br />Powered by Equipe de Desenvolvimento
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
