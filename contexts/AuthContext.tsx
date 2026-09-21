"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { AuthUser, AuthContextType } from "@/contexts/auth";
import { useRouter } from "next/navigation";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();

  const [user, setUser] = useState<AuthUser | null>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("@AppTemplate:user");
      return saved ? JSON.parse(saved) : null;
    }
    return null;
  });

  const login = (userData: AuthUser) => {
    setUser(userData);
    localStorage.setItem("@AppTemplate:user", JSON.stringify(userData));
  };

  const logout = async (userData: AuthUser) => {
    try {
      await fetch("/api/users/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: userData.id,
        }),
      });
    } catch (error) {
      console.error("Erro ao limpar cookie no servidor", error);
    }
    setUser(null);
    localStorage.removeItem("@AppTemplate:user");
    router.push("/login");
    router.refresh();
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      login,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth deve ser usado dentro de um AuthProvider");
  return context;
};