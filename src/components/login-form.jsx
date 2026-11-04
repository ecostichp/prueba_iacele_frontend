import { useState, useEffect, useContext } from "react";
import axios from "axios";

import conexionServidor from '@/hooks/conexionServidor'
import { TokenContext } from "@/context/Context";
import ErrorMessage from "@/components/ErrorMessage";
import ToggleDarkMode from "@/components/ToggleDarkMode";

import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";


export function LoginForm({ className, ...props }) {

  const [user, setUser] = useState("")
  const [password, setPassword] = useState("")
  const { setToken } = useContext(TokenContext)

  const [errorMessage, setErrorMessage] = useState("")
  const [mensaje, setMensaje] = useState("Resolviendo conexión con el servidor")
  useEffect(
    () => { conexionServidor(setMensaje) }, []
  )

  const [isVisible, setIsVisible] = useState(false);
  const toggleVisibility = () => { setIsVisible((prev) => !prev) };


  const submitLogin = async () => {

    const endpoint = 'authentication/token'
    const config = { headers: { 'Accept': 'application/json', 'Content-Type': 'application/x-www-form-urlencoded' } }
    const datospost = `grant_type=&username=${user}&password=${password}&scope=&client_id=&client_secret=`

    try {
      const response = await axios.post(import.meta.env.VITE_API_HOST + endpoint, datospost, config)
      const token_fetched = response.data.access_token
      localStorage.setItem("iaCeleAppToken", token_fetched);
      setToken(token_fetched)
    }
    catch (error) {
      setErrorMessage(error.response.data.detail)
    }
  }

  return (
    <>
      <div className="absolute top-3 left-4 text-xs text-muted-foreground pointer-events-none">
        {mensaje}
      </div>
      <div className={cn("flex flex-col gap-6", className)} {...props}>
        <div className="flex justify-end pt-6">
          <ToggleDarkMode />
        </div>

        <Card className="border border-border bg-card text-card-foreground shadow-lg transition-colors mb-6">
          <CardHeader className="text-center">
            <CardTitle>¡Hola! bienvenido a iaCeleApp</CardTitle>
            <CardDescription>
              Escribe tu usuario y contraseña
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={(e) => { e.preventDefault(); submitLogin(); }}>
              <FieldGroup className="space-y-4">
                <Field>
                  <FieldLabel htmlFor="username">Usuario</FieldLabel>
                  <Input
                    id="loginUser"
                    name="loginUser"
                    type="text"
                    autoComplete="loginUser"
                    required
                    onChange={(e) => setUser(e.target.value.toLocaleLowerCase())}
                    value={user}
                    className="border-input bg-background text-foreground"
                  />
                </Field>

                <Field>
                  <FieldLabel htmlFor="password">
                    Contraseña
                  </FieldLabel>

                  <div className="relative">
                    <Input
                      id="loginPassword"
                      name="loginPassword"
                      type={isVisible ? "text" : "password"}
                      autoComplete="current-password"
                      required
                      onChange={(e) => setPassword(e.target.value)}
                      value={password}
                      className="border-input bg-background pr-10 text-foreground"
                    />

                    <button
                      type="button"
                      onClick={toggleVisibility}
                      aria-label={
                        isVisible
                          ? "Ocultar contraseña"
                          : "Mostrar contraseña"
                      }
                      aria-pressed={isVisible}
                      className="absolute inset-y-0 right-0 flex items-center justify-center px-3 text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-r-md"
                    >
                      {isVisible ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  <div className="relative h-6 w-full">
                    {errorMessage && (
                      <div className="absolute top-1 left-0 w-full text-sm animate-in fade-in-50 duration-200">
                        <ErrorMessage message={errorMessage} />
                      </div>
                    )}
                  </div>
                </Field>
                <Field>
                  <Button type="submit" className="w-full">
                    Iniciar sesión
                  </Button>
                </Field>
              </FieldGroup>
            </form>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
