export interface AuthUser {
  id: number;
  nome: string;
  login: string;
  filial: {
    id: number;
    nome: string;
  };
  // Display-only (rodapé da sidebar) — nunca usar pra decidir o que renderizar
  // ou liberar acesso. Ver AGENTS.md ("cargo nunca concede acesso").
  cargo: {
    nome: string;
  };
  // Cópia cosmética de `payload.permissoes` pro frontend decidir o que
  // renderizar (ex: app-sidebar.tsx). A fonte de verdade continua sendo o
  // cookie httpOnly — adulterar essa cópia no client não libera nada.
  permissoes: string[];
}

export interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  login: (userData: AuthUser) => void;
  logout: (userData: AuthUser) => void;
}