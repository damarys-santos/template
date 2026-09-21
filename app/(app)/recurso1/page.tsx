import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Package } from "lucide-react"

// Placeholder do template — a listagem real (recurso1.hooks.ts, tabela,
// filtros, criação) já está esboçada em views/recurso1/, mas depende de
// repository/recurso1Repository.ts, que hoje referencia um modelo
// `recurso1` que não existe mais em prisma/schema.prisma. Essa página só
// existe pra a rota renderizar dentro do shell (sidebar/proxy) enquanto
// esse domínio não é implementado de verdade.
export default function Recurso1Page() {
    return (
        <div className="flex flex-col gap-6">
            <div>
                <h1 className="text-2xl font-semibold text-foreground">Recurso 1</h1>
                <p className="text-sm text-muted-foreground">
                    Página de exemplo do template — substitua pelo domínio real do seu sistema.
                </p>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                            <Package className="h-5 w-5" />
                        </div>
                        <div>
                            <CardTitle>Nenhum dado ainda</CardTitle>
                            <CardDescription>
                                Implemente a listagem em views/recurso1/ e conecte a route → factory → service → repository.
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground">
                        Essa é uma tela placeholder — sem chamadas ao banco ainda. Veja AGENTS.md
                        (&quot;Backend: route → factory → service → repository&quot;) pra saber onde
                        cada peça entra.
                    </p>
                </CardContent>
            </Card>
        </div>
    )
}
