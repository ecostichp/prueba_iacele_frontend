import BACKEND_URL from "@/constants/values";
import ProductsContext from "@/context/ProductsContext";
import axios from "axios";
import { useEffect, useState } from "react";

const AppProvider = ({ children }) => {

    const { products } = useGetProducts();

    return (
        <ProductsContext.Provider value={{ products }}>
            {children}
        </ProductsContext.Provider>
    );
};

const useGetProducts = () => {

    const [ products, setProducts ] = useState([]);

    const get = async () => {
        const response = await axios.get(`${BACKEND_URL}/products`);
        setProducts(response.data);
    };

    useEffect(
        () => {
            get();
        }, []
    );

    return { products };
};

export default AppProvider;
