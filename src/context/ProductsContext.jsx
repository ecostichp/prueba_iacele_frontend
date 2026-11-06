import { createContext } from "react";

const ProductsContext = createContext({
    products: [],
    status: "loading",
    error: "",
});

export default ProductsContext;
