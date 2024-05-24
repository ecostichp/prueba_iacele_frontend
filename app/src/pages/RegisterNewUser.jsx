import { useState, useContext } from "react";
import axios from "axios";
import { CurrentUserContext } from '../context/Context'

import ErrorMessage from "../components/ErrorMessage";


export default function Register() {

    const current_user = useContext(CurrentUserContext)

    const [user, setUser] = useState("")
    const [name, setName] = useState("")
    const [position, setPosition] = useState("")
    const [avatar, setAvatar] = useState("no-avatar")
    const [password, setPassword] = useState("")
    const [confirmationPassword, setConfirmationPassword] = useState("")
    const [errorMessage, setErrorMessage] = useState("")


    const submitRegistration = async () => {

        const endpoint = 'authentication/newuser'
        const config = { headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' } }
        const datospost = {
            "user": user,
            "name": name,
            "position": position,
            "avatar": avatar,
            "password": password
        }

        try {
            const response = await axios.post(import.meta.env.VITE_API_HOST + endpoint, datospost, config)
        }
        catch (error) {
            setErrorMessage(error.response.data.detail)
        }
    }

    const resetForm = () => {
        setUser("")
        setName("")
        setPosition("")
        setAvatar("no-avatar")
        setPassword("")
        setConfirmationPassword("")
    }


    const handelSubmit = (e) => {
        e.preventDefault()
        if (password === confirmationPassword && password.length > 5) {
            submitRegistration()
            resetForm()
        } else {
            setErrorMessage(
                "Verifica que las contraseñas coincidan y que son mayores a 5 caracteres"
            )
        }
    }

    if (current_user.user !== 'lic') {
        return (
            <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
                <h2 className="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900 dark:text-gray-50">
                    No tienes permiso para registrar nuevos usuarios
                </h2>
                <p className="mt-10 text-center text-sm font-bold leading-9 tracking-tight text-gray-500 dark:text-gray-400">
                    Pide ayuda al administrador
                </p>
            </div>
        )
    } else {
        return (
            <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
                <div className="sm:mx-auto sm:w-full sm:max-w-sm">
                    <div className="dark:bg-neutral-700 rounded-lg p-4">
                        <img
                            className="mx-auto max-h-24 w-auto"
                            src='./brand/Logo2021.png'
                            alt="La Casa Del Carpintero"
                        />
                    </div>
                    <h2 className="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900 dark:text-gray-50">
                        Registro para nuevo usuario
                    </h2>
                </div>

                <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
                    <form className="space-y-6" onSubmit={handelSubmit}>

                        <div className="relative">
                            <input
                                required
                                type="text"
                                id="registerUser"
                                name="registerUser"
                                onChange={(e) => setUser(e.target.value.toLocaleLowerCase())}
                                value={user}
                                className="peer input_login"
                                placeholder=" " />
                            <label
                                htmlFor="registerUser"
                                className="label_input_login">
                                Usuario
                            </label>
                        </div>

                        <div className="relative">
                            <input
                                required
                                type="text"
                                id="registerUserName"
                                name="registerUserName"
                                onChange={(e) => setName(e.target.value)}
                                value={name}
                                className="peer input_login"
                                placeholder=" " />
                            <label
                                htmlFor="registerUserName"
                                className="label_input_login">
                                Nombre completo
                            </label>
                        </div>

                        <div className="relative">
                            <input
                                required
                                type="text"
                                id="registerUserJobPosition"
                                name="registerUserJobPosition"
                                onChange={(e) => setPosition(e.target.value)}
                                value={position}
                                className="peer input_login"
                                placeholder=" " />
                            <label
                                htmlFor="registerUserJobPosition"
                                className="label_input_login">
                                Puesto de trabajo
                            </label>
                        </div>

                        <div className="relative">
                            <input
                                required
                                type="text"
                                id="registerUserAvatar"
                                name="registerUserAvatar"
                                onChange={(e) => setAvatar(e.target.value)}
                                value={avatar}
                                className="peer input_login"
                                placeholder=" " />
                            <label
                                htmlFor="registerUserAvatar"
                                className="label_input_login">
                                Foto de perfil
                            </label>
                        </div>

                        <div className="relative">
                            <input
                                required
                                type="password"
                                id="registerUserPassword"
                                name="registerUserPassword"
                                onChange={(e) => setPassword(e.target.value)}
                                value={password}
                                className="peer input_login"
                                placeholder=" " />
                            <label
                                htmlFor="registerUserPassword"
                                className="label_input_login">
                                Contraseña
                            </label>
                        </div>

                        <div className="relative">
                            <input
                                required
                                type="password"
                                id="registerUserConfirmationPassword"
                                name="registerUserConfirmationPassword"
                                onChange={(e) => setConfirmationPassword(e.target.value)}
                                value={confirmationPassword}
                                className="peer input_login"
                                placeholder=" " />
                            <label
                                htmlFor="registerUserConfirmationPassword"
                                className="label_input_login">
                                Confirma la contraseña
                            </label>
                        </div>

                        <div>
                            <ErrorMessage message={errorMessage} />
                        </div>
                        <div>
                            <button
                                type="submit"
                                className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                            >
                                Registrar nuevo usuario
                            </button>
                        </div>

                    </form>

                </div>
            </div>
        )
    }
}
