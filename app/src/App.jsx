import { useState, useEffect, useContext } from "react";
import axios from "axios";
import './app.css'

import { TokenContext } from "./context/Context";

import Login from './pages/Login'
import Dashboard from "./pages/Dashboard";
import Register from "./pages/Register";


export default function App() {

  const {token} = useContext(TokenContext)

  const [mensaje, setMensaje] = useState("")




  async function conexionServidor() {
    
    const endpoint = '/'
    
    try {
      const response = await axios.get(import.meta.env.VITE_API_HOST + endpoint)
      const data = response.data
      setMensaje(data.message)
      return
    }
    catch(error) {
      setMensaje(error.name)
      return
    }
  }

  useEffect(
    () => { conexionServidor()}, []
  )


  return (
    <>
      {
      !token ?
      <>
      <h1 className="text-xs text-gray-500 dark:text-gray-400">{mensaje}</h1>
      {/* <Register /> */}
      <Login />
      </>
      :
      <Dashboard />
      }
    </>
  )
}
