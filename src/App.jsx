import { RouterProvider } from "react-router/dom";
import { router } from "./router";

import Login from "@/pages/Login";
import { useAuth } from "@/context/auth";
import { ProductsProvider } from "@/context/products";

function App() {
  const { token } = useAuth();

  if (!token) return <Login />;

  return (
    <ProductsProvider>
      <RouterProvider router={router} />
    </ProductsProvider>
  );
}

export default App;
