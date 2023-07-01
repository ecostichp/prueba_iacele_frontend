import { useState, useContext } from "react";

import { RouterProvider } from "react-router-dom";
import { router } from "./router"

import'./dataBases/dbNames'

import './app.css'

import { TokenContext, ThemeContext } from "./context/Context";
import Login from "./pages/Login";



export default function App() {
  
  const {token} = useContext(TokenContext)


  const [themeApp, setThemeApp] = useState(localStorage.getItem("theme"))
  themeApp === 'dark' && document.documentElement.classList.add(themeApp)
  
  
 
  

  return (
    <ThemeContext.Provider value={ {themeApp, setThemeApp} }>
        {
        !token ?
        <>
        <Login />
        </>
        :
        <RouterProvider router={router}/>
        }
    </ThemeContext.Provider>
  )
}
