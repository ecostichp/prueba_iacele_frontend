import { useContext, useState } from "react";
import axios from "axios";

import ErrorMessage from "./ErrorMessage";
import { TokenContext } from "../context/Context";



export default function Login () {
    
    const [user, setUser] = useState("")
    const [password, setPassword] = useState("")
    const [errorMessage, setErrorMessage] = useState("")
    const {setToken} = useContext(TokenContext)


    
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
        <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-sm">
            <img
                className="mx-auto max-h-24 w-auto"
                src="Logo2021.png"
                alt="La Casa Del Carpintero"
            />
            <h2 className="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">
                ¡Hola! bienvenido
            </h2>
            </div>

            <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
            <form className="space-y-6" onSubmit={ handelSubmit }>
                
                <div>
                <label htmlFor="user" className="block text-sm font-medium leading-6 text-gray-900">
                    Usuario
                </label>
                <div className="mt-2">
                    <input
                    id="user"
                    name="user"
                    type="text"
                    placeholder="Ingresa tu usuario"
                    onChange={(e) => setUser(e.target.value.toLocaleLowerCase())}
                    required
                    className="block w-full rounded-md border-0 py-1.5 ps-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                    />
                </div>
                </div>

                <div>
                <label htmlFor="password" className="block text-sm font-medium leading-6 text-gray-900">
                Contraseña
                </label>
                <div className="mt-2">
                    <input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="Ingresa tu contraseña"
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="block w-full rounded-md border-0 py-1.5 ps-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                    />
                </div>
                </div>

                <div>
                    <ErrorMessage message={errorMessage} />
                </div>
                <div>
                <button
                    type="submit"
                    className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                >
                    Iniciar sesión
                </button>
                </div>

            </form>

            </div>

        </div>
    )
}
