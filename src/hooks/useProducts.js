import ProductsContext from "@/context/ProductsContext"
import { useContext } from "react";

const useProducts = () => {

    const { products, status, error } = useContext(ProductsContext);

    return { products, status, error };
};

export default useProducts;
