import { Moon, Sun } from "lucide-react"

import { Button } from "@/components/ui/button"

import { useTheme } from "@/context/ThemeProvider"

export default function ToggleDarkMode() {
    const { theme, setTheme } = useTheme('')

    return (
        <Button
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
            variant="outline"
            size="icon"
            className="inline-flex shrink-0 items-center justify-center rounded-4xl border bg-clip-padding text-sm font-medium whitespace-nowrap transition-all outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30 active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-50 border-border bg-background hover:bg-muted hover:text-foreground size-9 relative"
        >
            <Sun className="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
            <Moon className="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
            <span className="sr-only">Toggle theme</span>
        </Button>
    )
}