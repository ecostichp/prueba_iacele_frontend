import { useContext } from "react";

import { RouterProvider } from "react-router/dom";
import { router } from "./router";

import Login from "@/pages/login";
import { TokenContext } from "./context/Context";


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
