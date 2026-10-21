import { useContext } from "react";

import { RouterProvider } from "react-router/dom";
import { router } from "./router"

import { TokenContext } from "./context/Context";
import Login from "./pages/Login";


function App() {

  const { token } = useContext(TokenContext)

  return (
    <>
      {
        !token ?
          <>
            <Login />
          </>
          :
          <RouterProvider router={router} />
      }
    </>
  )
}

export default App
