import { useState, useEffect, useContext } from "react";
import localforage from "localforage";
import'./dataBases/dbNames'

import './app.css'

import { TokenContext, ThemeContext } from "./context/Context";
import { localForageGet } from './hooks/localForageCRUD'
import conexionServidor from './hooks/conexionServidor'

import Login from './pages/Login'
import Dashboard from "./pages/Dashboard";
import Register from "./pages/Register";




export default function App() {
  
  const {token} = useContext(TokenContext)


  const [themeApp, setThemeApp] = useState(localStorage.getItem("theme"))
  themeApp === 'dark' && document.documentElement.classList.add(themeApp)
  
  
  const [mensaje, setMensaje] = useState("")
  useEffect(
    () => { conexionServidor(setMensaje)}, []
  )
  
  

  const [wep, setWep] = useState(null )
  const [error, setError] = useState(null)
  useEffect(
    () => { localForageGet('wep', setWep, setError) },[]
  )
  
  console.log(wep, 'wep')
  

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
