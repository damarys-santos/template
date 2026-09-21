import { useState } from "react"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

interface FreeComboboxProps {
  usuarios: { id: number; nome: string | null }[] // Aceitando null conforme o erro anterior
  idValue: string
  nomeExternoValue: string
  onSelectUsuario: (id: string) => void
  onFreeText: (nome: string) => void
}

export function FreeCombobox({
  usuarios,
  idValue,
  nomeExternoValue,
  onSelectUsuario,
  onFreeText,
}: FreeComboboxProps) {
  const [open, setOpen] = useState(false)
  const [inputValue, setInputValue] = useState("")

  // Define o que mostrar no botão principal
  const displayLabel = idValue
    ? (usuarios.find((u) => u.id.toString() === idValue)?.nome ?? "")
    : (nomeExternoValue || inputValue) // Se estiver digitando, mostra o inputValue como preview

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      // Se houver texto digitado, transforma em texto livre e fecha o menu
      if (inputValue.trim()) {
        e.preventDefault()
        e.stopPropagation()
        onFreeText(inputValue.trim())
        setOpen(false)
      }
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          className="w-full justify-between bg-white/60 font-normal dark:bg-white/5"
        >
          <span className={cn(!displayLabel && "text-muted-foreground")}>
            {displayLabel || "Selecione ou digite um nome..."}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command>
          <CommandInput
            placeholder="Buscar ou digitar nome..."
            value={inputValue}
            onValueChange={setInputValue}
            onKeyDown={handleKeyDown} // <-- Captura o Enter aqui para evitar a auto-seleção
          />
          <CommandList>
            <CommandEmpty>
              {inputValue.trim() ? (
                <button
                  type="button"
                  className="w-full px-4 py-2 text-left text-sm hover:bg-accent"
                  onClick={() => {
                    onFreeText(inputValue.trim())
                    setOpen(false)
                  }}
                >
                  Usar <strong>&quot;{inputValue}&quot;</strong> como nome livre
                </button>
              ) : (
                <p className="px-4 py-2 text-sm text-muted-foreground">Nenhum usuário encontrado.</p>
              )}
            </CommandEmpty>
            
            <CommandGroup heading="Usuários do sistema">
              {usuarios.map((user) => (
                <CommandItem
                  key={user.id}
                  value={user.nome ?? ""}
                  onSelect={() => {
                    onSelectUsuario(user.id.toString())
                    setInputValue("")
                    setOpen(false)
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      idValue === user.id.toString() ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {user.nome ?? "Usuário sem nome"}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}