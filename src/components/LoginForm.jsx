import { useState, useEffect } from "react";
import axios from "axios";

import { checkServerConnection } from "@/hooks/checkServerConnection";
import { API_URL } from "@/constants/api";
import { useAuth } from "@/context/auth";
import ErrorMessage from "@/components/ErrorMessage";
import ThemeToggle from "@/components/ThemeToggle";

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
  const { login } = useAuth()

  const [errorMessage, setErrorMessage] = useState("")
  const [entryClosed, setEntryClosed] = useState(false)
  const [serverMessage, setServerMessage] = useState("Resolviendo conexión con el servidor")
  useEffect(
    () => { checkServerConnection(setServerMessage) }, []
  )
  useEffect(() => {
    axios
      .get(`${API_URL}authentication/access`)
      .then((response) => setEntryClosed(response.data?.login_open === false))
      .catch(() => setEntryClosed(false))
  }, [])

  const [passwordVisible, setPasswordVisible] = useState(false);
  const togglePasswordVisibility = () => { setPasswordVisible((current) => !current) };


  const submitLogin = async (event) => {
    const typedUser = event.currentTarget.elements.loginUser?.value ?? user
    const username = typedUser.trim().toLocaleLowerCase("es-MX")
    setUser(username)

    const endpoint = 'authentication/token'
    const config = { headers: { 'Accept': 'application/json', 'Content-Type': 'application/x-www-form-urlencoded' } }
    const requestBody = new URLSearchParams({
      grant_type: "",
      username,
      password,
      scope: "",
      client_id: "",
      client_secret: "",
    })

    try {
      const response = await axios.post(`${API_URL}${endpoint}`, requestBody, config)
      login(response.data.access_token)
    }
    catch (error) {
      setErrorMessage(error.response.data.detail)
    }
  }

  return (
    <>
      <div className="absolute top-3 left-4 text-xs text-muted-foreground pointer-events-none">
        {serverMessage}
      </div>
      <div className={cn("flex flex-col gap-6", className)} {...props}>
        <div className="flex justify-end pt-6">
          <ThemeToggle />
        </div>

        <Card className="border border-border bg-card text-card-foreground shadow-lg transition-colors mb-6">
          <CardHeader className="text-center">
            <CardTitle>¡Hola! Bienvenido a iaCeleApp</CardTitle>
            <CardDescription>
              Escribe tu usuario y contraseña
            </CardDescription>
            {entryClosed && (
              <p className="text-sm text-destructive">
                La entrada está cerrada. El personal no puede iniciar sesión.
              </p>
            )}
          </CardHeader>

          <CardContent>
            <form onSubmit={(e) => { e.preventDefault(); submitLogin(e); }}>
              <FieldGroup className="space-y-4">
                <Field>
                  <FieldLabel htmlFor="loginUser">Usuario</FieldLabel>
                  <Input
                    id="loginUser"
                    name="loginUser"
                    type="text"
                    autoComplete="username"
                    required
                    onChange={(e) => setUser(e.target.value.trim().toLocaleLowerCase("es-MX"))}
                    value={user}
                    className="border-input bg-background text-foreground"
                  />
                </Field>

                <Field>
                  <FieldLabel htmlFor="loginPassword">
                    Contraseña
                  </FieldLabel>

                  <div className="relative">
                    <Input
                      id="loginPassword"
                      name="loginPassword"
                      type={passwordVisible ? "text" : "password"}
                      autoComplete="current-password"
                      required
                      onChange={(e) => setPassword(e.target.value)}
                      value={password}
                      className="border-input bg-background pr-10 text-foreground"
                    />

                    <button
                      type="button"
                      onClick={togglePasswordVisibility}
                      aria-label={
                        passwordVisible
                          ? "Ocultar contraseña"
                          : "Mostrar contraseña"
                      }
                      aria-pressed={passwordVisible}
                      className="absolute inset-y-0 right-0 flex items-center justify-center px-3 text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-r-md"
                    >
                      {passwordVisible ? (
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
