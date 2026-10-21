import axios from "axios";


export default async function conexionServidor(setMensaje) {

  const endpoint = ''

  console.log(import.meta.env.VITE_API_HOST)

  try {
    const response = await axios.get(import.meta.env.VITE_API_HOST + endpoint)
    setMensaje(response.data.message)
  }
  catch (error) {
    setMensaje(error.name)
  }
}
