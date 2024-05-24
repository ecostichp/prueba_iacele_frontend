import { useEffect, useState } from "react";
import axios from "axios";

import { TokenContext, CurrentUserContext } from "../context/Context";




const wep = {
    avatar: "no-avatar",
    hashed_password: "",
    name: "",
    position: ""
}



export default function AuthProvider({ children }) {


    const [token, setToken] = useState(localStorage.getItem("leadAppToken"));
    const [currentUser, setCurrentUser] = useState(wep);


    const fetchUser = async () => {

        const endpoint = 'authentication/users/me'
        const config = { headers: { "Authorization": "Bearer " + token } }

        try {
            const response = await axios.get(import.meta.env.VITE_API_HOST + endpoint, config)
            setCurrentUser(response.data)
        }
        catch (error) {
            setToken(null)
        }

    };


    useEffect(() => {
        fetchUser();
    }, [token]
    );


    return (
        <TokenContext.Provider value={{ token, setToken }}>
            <CurrentUserContext.Provider value={currentUser}>
                {children}
            </CurrentUserContext.Provider>
        </TokenContext.Provider>
    )
};
