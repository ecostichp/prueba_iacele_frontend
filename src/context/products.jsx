import { createContext, useContext, useEffect, useMemo, useState } from "react";
import axios from "axios";

import { API_URL } from "@/constants/api";

const ProductsContext = createContext(null);

function isAbort(error) {
  return error?.code === "ERR_CANCELED" || error?.name === "CanceledError";
}

export function ProductsProvider({ children }) {
  const [products, setProducts] = useState([]);
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    axios
      .get(`${API_URL}products/`, { signal: controller.signal })
      .then((response) => {
        setProducts(response.data);
        setStatus("ready");
      })
      .catch((requestError) => {
        if (isAbort(requestError)) return;
        setError("No se pudieron cargar los productos.");
        setStatus("error");
      });

    return () => controller.abort();
  }, []);

  const value = useMemo(
    () => ({ products, status, error }),
    [products, status, error]
  );

  return (
    <ProductsContext.Provider value={value}>{children}</ProductsContext.Provider>
  );
}

export function useProducts() {
  const context = useContext(ProductsContext);
  if (!context) {
    throw new Error("useProducts debe usarse dentro de ProductsProvider.");
  }
  return context;
}
