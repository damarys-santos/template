"use client"

import { useTheme } from "next-themes"
import { Moon, Sun } from "lucide-react"
import { Button } from "@/components/ui/button"

export function ThemeToggle() {
    const { theme, setTheme } = useTheme()

    return (
        <div className="flex w-full gap-2 p-2 items-center justify-center">
            <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme("light")}
                className={theme === "light" ? "bg-white text-black" : "text-gray-400"}
            >
                <Sun className="h-4 w-4" />
            </Button>

            <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme("dark")}
                className={theme === "dark" ? "bg-blue-600/20 text-blue-400" : "text-gray-400"}
            >
                <Moon className="h-4 w-4" />
            </Button>

        </div>
    )
}