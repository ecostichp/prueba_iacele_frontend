import { useContext, useState, useEffect } from "react";
import axios from "axios";

import { TokenContext } from "../context/Context";

import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

import ErrorMessage from "../components/ErrorMessage";
import ToggleDarkMode from "../components/ToggleDarkMode";

import conexionServidor from '../hooks/conexionServidor'



export default function Login () {
    
    const [user, setUser] = useState("")
    const [password, setPassword] = useState("")
    const [errorMessage, setErrorMessage] = useState("")
    const {setToken} = useContext(TokenContext)


    const [isVisible, setIsVisible] = useState(false);

    const toggleVisibility = () => setIsVisible(!isVisible);

    const [mensaje, setMensaje] = useState("Resolviendo conexión con el servidor")
    useEffect(
      () => { conexionServidor(setMensaje) }, []
    )


    const submitLogin = async () => {
        
        const endpoint = '/token'
        const config = { headers: {'Accept': 'application/json', 'Content-Type': 'application/x-www-form-urlencoded' } }
        const datospost = `grant_type=&username=${user}&password=${password}&scope=&client_id=&client_secret=`

        try {
            const response = await axios.post(import.meta.env.VITE_API_HOST + endpoint, datospost, config)
            const token_fetched = response.data.access_token
            localStorage.setItem("leadAppToken", token_fetched);
            setToken(token_fetched)
        }
        catch(error) {
            setErrorMessage (error.response.data.detail)
        }
    }


    const handelSubmit = (e) => {
        e.preventDefault()
        submitLogin()
    } 



    return (
        <>
        <p className="text-xs text-gray-500 dark:text-gray-400">{mensaje}</p>
        <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-sm">
            <div className="dark:bg-neutral-700 rounded-lg p-4">
                <img
                    className="mx-auto max-h-24 w-auto"
                    src='./brand/Logo2021.png'
                    alt="La Casa Del Carpintero"
                />
            </div>
            </div>
            <h2 className="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900 dark:text-gray-50">
                ¡Hola! bienvenido
            </h2>

            <div className="mt-12 sm:mx-auto sm:w-full sm:max-w-sm">
            <form className="space-y-8" onSubmit={ handelSubmit }>
                

                <div className="relative">
                    <input
                        required
                        type="text" 
                        id="loginUser"
                        name="loginUser"
                        onChange={(e) => setUser(e.target.value.toLocaleLowerCase())}
                        className="peer input_login"
                        placeholder=" " />
                    <label 
                        htmlFor="loginUser"
                        className="label_input_login">
                            Usuario
                    </label>
                </div>

                <div className="relative">
                    <input
                    required
                    type={isVisible ? "text" : "password"}
                    id="loginPassword"
                    name="loginPassword"
                    onChange={(e) => setPassword(e.target.value)}
                    className="peer input_login"
                    placeholder=" " />
                    <div className="absolute inset-y-0 right-2 flex items-center">
                        <button className="focus:outline-none" type="button" onClick={toggleVisibility}>
                            {isVisible ? (
                                <EyeIcon className="h-6 w-6 text-blue-600 dark:text-blue-500" />
                            ) : (
                                <EyeSlashIcon className="h-6 w-6 text-gray-600 dark:text-gray-500" />
                            )}
                        </button>
                    </div>
                    <label 
                        htmlFor="loginPassword"
                        className="label_input_login">
                        Constraseña
                    </label>
                </div>

                <div>
                    <ErrorMessage message={errorMessage} />
                </div>
                <div>
                <button
                    type="submit"
                    className="flex w-full justify-center rounded-md bg-indigo-600 dark:bg-indigo-500 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 dark:hover:bg-indigo-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 dark:focus-visible:outline-indigo-500"
                >
                    Iniciar sesión
                </button>
                </div>

            </form>

            <div className="mt-4">
                <ToggleDarkMode />
            </div>


            </div>

        </div>
        </>
    )
}
