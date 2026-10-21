import React from "react"
import { Moon, Sun, Monitor } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useTheme } from "@/components/theme-provider"

export function ToggleDarkMode() {
    const { theme, setTheme } = useTheme()

    // Alterna de forma cíclica: light -> dark -> system -> light
    const handleToggle = () => {
        if (theme === "light") {
            setTheme("dark")
        } else if (theme === "dark") {
            setTheme("system")
        } else {
            setTheme("light")
        }
    }

    // Textos descriptivos para el Tooltip flotante
    const labelText = {
        light: "Cambiar a modo oscuro",
        dark: "Cambiar a modo sistema",
        system: "Cambiar a modo claro",
    }

    return (
        <Button
            variant="ghost"
            size="icon"
            onClick={handleToggle}
            className="relative overflow-hidden"
        >
            {/* Icono Sol (Modo Claro) */}
            <Sun className={`h-[1.2rem] w-[1.2rem] transition-all duration-300 ${theme === "light" ? "scale-100 rotate-0" : "scale-0 rotate-90 opacity-0"
                }`} />

            {/* Icono Luna (Modo Oscuro) */}
            <Moon className={`absolute h-[1.2rem] w-[1.2rem] transition-all duration-300 ${theme === "dark" ? "scale-100 rotate-0" : "scale-0 -rotate-90 opacity-0"
                }`} />

            {/* Icono Monitor (Modo Sistema) */}
            <Monitor className={`absolute h-[1.2rem] w-[1.2rem] transition-all duration-300 ${theme === "system" ? "scale-100 rotate-0" : "scale-0 -rotate-90 opacity-0"
                }`} />

            <span className="sr-only">Alternar tema</span>
        </Button>
    )
}
