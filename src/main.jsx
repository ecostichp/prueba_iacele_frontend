import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './index.css'

import { TooltipProvider } from "@/components/ui/tooltip"
import { ThemeProvider } from "@/context/ThemeProvider"
import AuthProvider from './context/AuthProvider'
import AppProvider from './providers/AppProvider'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider defaultTheme="light" storageKey="themeIACeleApp">
      <TooltipProvider>
        <AuthProvider>
          <AppProvider>
            <App />
          </AppProvider>
        </AuthProvider>
      </TooltipProvider>
    </ThemeProvider>
  </StrictMode>,
)
