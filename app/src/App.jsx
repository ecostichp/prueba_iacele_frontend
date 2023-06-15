import { useState, useEffect, useContext } from "react";
import axios from "axios";

import { TokenContext } from "./context/Context";

import Login from './components/Login'
import Dashboard from "./Dashboard";
import Register from "./components/Register";


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
      <h1 className="text-xs text-gray-500">{mensaje}</h1>
      {/* <Register /> */}
      <Login />
      </>
      :
      <Dashboard />
      }
    </>
  )
}
