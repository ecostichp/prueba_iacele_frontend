import { useState, useEffect, useContext } from "react";
import localforage from "localforage";
import'./dataBases/dbNames'

import './app.css'

import { TokenContext, ThemeContext } from "./context/Context";
import conexionServidor from './hooks/conexionServidor'

import Login from './pages/Login'
import Dashboard from "./pages/Dashboard";
import Register from "./pages/Register";




export default function App() {
  
  const {token} = useContext(TokenContext)


  const [themeApp, setThemeApp] = useState(localStorage.getItem("theme"))
  themeApp === 'dark' && document.documentElement.classList.add(themeApp)
  
  
  const [mensaje, setMensaje] = useState("Resolviendo conexión con el servidor")
  useEffect(
    () => { conexionServidor(setMensaje) }, []
  )
  
  

  const [wep, setWep] = useState("Resolviendo conexión")
  const [error, setError] = useState(null)
  useEffect(
    () => { localforage.getItem('wep').then(setWep).catch(setError) },[]
  )
  
  

  return (
    <ThemeContext.Provider value={ {themeApp, setThemeApp} }>
        {
        !token ?
        <>
        <h1 className="text-xs text-gray-500 dark:text-gray-400">{mensaje}</h1>
        <h1 className="text-xs text-gray-500 dark:text-gray-400">{wep && wep.status}</h1>
        {/* <Register /> */}
        <Login />
        </>
        :
        <Dashboard />
        }
    </ThemeContext.Provider>
  )
}
