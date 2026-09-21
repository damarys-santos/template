"use client"

import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarGroup,
    SidebarGroupLabel,
    SidebarGroupContent,
    SidebarMenu,
    SidebarMenuItem,
    SidebarMenuButton,
} from "@/components/ui/sidebar"
import { useAuth } from "@/contexts/AuthContext"
import { APP_ROUTES } from "@/config/permissions"
// ⚠️ TEMPORÁRIO — só usado pelo filtro por permissão comentado abaixo.
// import { ACOES } from "@/lib/permissoes.generated"
import { usePathname } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { LogOut, Package, Layers, LucideIcon } from "lucide-react"
import { ThemeToggle } from "./theme-toggle"

// Mapeamento de ícones para bater com o label do APP_ROUTES
const iconMap: Record<string, LucideIcon> = {
    "Recurso 1": Package,
    "Recurso 2": Layers,
}

export function AppSidebar() {
    const { user, logout } = useAuth()
    const pathname = usePathname()
    // Display-only (rodapé) — nunca decide o que renderiza. Ver AGENTS.md.
    const cargoUsuario = user?.cargo.nome
    // ⚠️ TEMPORÁRIO — filtro por permissão desligado de propósito. Projeto
    // TEMPLATE ainda sem `recurso`/`perfil_permissao` reais cadastrados, então
    // `permissoes` vem sempre vazio e o menu ficaria vazio pra todo mundo.
    // Enquanto isso não virar um sistema oficial, mostra todas as rotas pra
    // qualquer usuário logado. Quando virar oficial: apague a linha solta
    // abaixo e descomente o filtro por permissão.
    const menuItems = APP_ROUTES
    // const permissoesUsuario = user?.permissoes ?? []
    // const menuItems = APP_ROUTES.filter(route =>
    //     permissoesUsuario.includes(`${route.recurso}:${ACOES.VER}`)
    // )

    return (
        <Sidebar variant="sidebar" collapsible="icon" >
            <SidebarHeader className="p-4 font-bold text-lg">
                <div className="flex flex-col items-center gap-2 group-data-[collapsible=icon]:items-center">
                    <Image
                        src="/GRUPOJB-sembg.png"
                        alt="Grupo JB"
                        width={200}
                        height={200}
                        className=" w-auto object-contain group-data-[collapsible=icon]:h-6"
                        priority
                    />
                    <span className="group-data-[collapsible=icon]:hidden text-primary">
                        Templete Projetos
                    </span>
                </div>
            </SidebarHeader>

            <SidebarContent className="flex flex-col h-full">
                <SidebarGroup>
                    <SidebarGroupLabel>Menu Principal</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {menuItems.map((item) => {
                                const Icon = iconMap[item.label] || Package
                                return (
                                    <SidebarMenuItem key={item.path}>
                                        <SidebarMenuButton
                                            asChild
                                            isActive={pathname === item.path}
                                            tooltip={item.label}
                                        >
                                            <Link href={item.path} className="mb-1">
                                                <Icon className="w-4 h-4" />
                                                <span>{item.label}</span>
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                )
                            })}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>

                <SidebarGroup className="mt-auto">
                    <SidebarGroupContent>
                        <SidebarMenu>
                            <ThemeToggle />
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>

            <SidebarFooter className="p-4 border-t">
                <div className="flex flex-col gap-4 group-data-[collapsible=icon]:items-center">
                    <div className="flex flex-col group-data-[collapsible=icon]:hidden">
                        <p className="text-sm font-medium">{user?.nome}</p>
                        <p className="text-xs text-muted-foreground">{cargoUsuario}</p>
                    </div>
                    <SidebarMenuButton
                        onClick={() => {
                            if (!user) return;
                            logout(user)
                        }}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                        <LogOut className="w-4 h-4" />
                        <span>Sair</span>
                    </SidebarMenuButton>
                </div>
            </SidebarFooter>
        </Sidebar>
    )
}