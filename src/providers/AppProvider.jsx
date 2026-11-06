import BACKEND_URL from "@/constants/values";
import ProductsContext from "@/context/ProductsContext";
import axios from "axios";
import { useEffect, useState } from "react";

const AppProvider = ({ children }) => {

    const productsState = useGetProducts();

    return (
        <ProductsContext.Provider value={productsState}>
            {children}
        </ProductsContext.Provider>
    );
};

const useGetProducts = () => {

    const [ products, setProducts ] = useState([]);
    const [ status, setStatus ] = useState("loading");
    const [ error, setError ] = useState("");

    useEffect(() => {
        let cancelled = false;

        const get = async () => {
            try {
                const response = await axios.get(`${BACKEND_URL}products/`);
                if (cancelled) return;
                setProducts(response.data);
                setStatus("ready");
            } catch {
                if (cancelled) return;
                setError("No se pudieron cargar los productos.");
                setStatus("error");
            }
        };

        get();

        return () => {
            cancelled = true;
        };
    }, []);

    return { products, status, error };
};

export default AppProvider;
