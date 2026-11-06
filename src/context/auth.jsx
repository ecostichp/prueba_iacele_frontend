import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import axios from "axios";

import { API_URL } from "@/constants/api";

const TOKEN_KEY = "iaCeleAppToken";
const AuthContext = createContext(null);

function isAbort(error) {
  return error?.code === "ERR_CANCELED" || error?.name === "CanceledError";
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));
  const [user, setUser] = useState(null);

  const login = useCallback((accessToken) => {
    localStorage.setItem(TOKEN_KEY, accessToken);
    setToken(accessToken);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
  }, []);

  useEffect(() => {
    if (!token) {
      setUser(null);
      return;
    }

    const controller = new AbortController();

    axios
      .get(`${API_URL}authentication/user/me`, {
        headers: { Authorization: `Bearer ${token}` },
        signal: controller.signal,
      })
      .then((response) => {
        setUser(response.data);
      })
      .catch((error) => {
        if (isAbort(error)) return;
        if (error?.response?.status === 401) logout();
      });

    const intervalId = setInterval(() => {
      axios
        .get(`${API_URL}authentication/user/me`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .catch((error) => {
          if (isAbort(error)) return;
          if (error?.response?.status === 401) logout();
        });
    }, 8000);

    const onVisible = () => {
      if (document.visibilityState !== "visible") return;
      axios
        .get(`${API_URL}authentication/user/me`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .catch((error) => {
          if (isAbort(error)) return;
          if (error?.response?.status === 401) logout();
        });
    };
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      controller.abort();
      clearInterval(intervalId);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [token, logout]);

  const value = useMemo(
    () => ({ token, user, login, logout }),
    [token, user, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe usarse dentro de AuthProvider.");
  }
  return context;
}
