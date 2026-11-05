import ProductsContext from "@/context/ProductsContext"
import { useContext } from "react";

const useProducts = () => {

    const { products } = useContext(ProductsContext);

    return { products };
};

export default useProducts;
