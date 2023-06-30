import axios from "axios";


export default async function conexionServidor(setMensaje) {
    
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