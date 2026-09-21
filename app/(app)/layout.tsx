// app/(app)/layout.tsx
"use client"

import dynamic from 'next/dynamic'
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { TooltipProvider } from "@/components/ui/tooltip"
import { Skeleton } from "@/components/ui/skeleton"

// Importação Dinâmica com Skeleton
const AppSidebar = dynamic(
    () => import("@/components/ui/app-sidebar").then((mod) => mod.AppSidebar),
    {
        ssr: false,
        loading: () => (
            <aside className="w-66 h-screen bg-[#090e1a] border-r border-white/5 p-4 flex flex-col gap-6">
                {/* Simulação do Header da Sidebar */}
                <div className="flex items-center gap-2 px-2">
                    <Skeleton className="h-8 w-8 rounded-md bg-white/5" />
                    <Skeleton className="h-4 w-32 bg-white/5" />
                </div>

                {/* Simulação dos Itens do Menu */}
                <div className="space-y-4 px-2">
                    <div className="space-y-2">
                        <Skeleton className="h-3 w-16 bg-white/10" /> {/* Label do Grupo */}
                        <Skeleton className="h-10 w-full bg-white/5" />
                        <Skeleton className="h-10 w-full bg-white/5" />
                        <Skeleton className="h-10 w-full bg-white/5" />
                    </div>
                </div>

                {/* Simulação do Footer (Usuário) */}
                <div className="mt-auto border-t border-white/5 pt-4 flex items-center gap-3">
                    <Skeleton className="h-9 w-9 rounded-full bg-white/5" />
                    <div className="space-y-2">
                        <Skeleton className="h-3 w-20 bg-white/5" />
                        <Skeleton className="h-2 w-12 bg-white/5" />
                    </div>
                </div>
            </aside>
        ),
    }
)

export default function AppLayout({ children }: { children: React.ReactNode }) {

    return (
        <TooltipProvider delayDuration={0}>
            <SidebarProvider>
                <div className="flex min-h-screen w-full bg-background">
                    <AppSidebar />
                    <main className="flex-1 flex flex-col overflow-hidden relative">
                        <SidebarTrigger className="absolute top-4 left-4 z-10 text-foreground hover:bg-accent transition-colors" />
                        <div className="flex-1 overflow-auto p-6 text-white">{children}</div>
                    </main>
                </div>
            </SidebarProvider>
        </TooltipProvider>
    )
}