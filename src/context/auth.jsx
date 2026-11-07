import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Dialog } from "@base-ui/react/dialog";

import { API_URL } from "@/constants/api";

const TOKEN_KEY = "iaCeleAppToken";
const AuthContext = createContext(null);

function isAbort(error) {
  return error?.code === "ERR_CANCELED" || error?.name === "CanceledError";
}

function authHeaders(token) {
  return { Authorization: `Bearer ${token}` };
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));
  const [user, setUser] = useState(null);
  const [notices, setNotices] = useState([]);

  const login = useCallback((accessToken) => {
    localStorage.setItem(TOKEN_KEY, accessToken);
    setToken(accessToken);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
    setNotices([]);
  }, []);

  const refreshUser = useCallback(async () => {
    if (!token) {
      setUser(null);
      return null;
    }

    const headers = authHeaders(token);
    const response = await axios.get(`${API_URL}authentication/user/me`, { headers });
    setUser(response.data);

    try {
      const noticesResponse = await axios.get(`${API_URL}authentication/notices`, { headers });
      setNotices((current) => {
        const known = new Set(current.map((item) => item.id));
        const incoming = noticesResponse.data.filter((item) => !known.has(item.id));
        return incoming.length ? [...current, ...incoming] : current;
      });
    } catch (error) {
      if (error?.response?.status === 401) logout();
    }

    return response.data;
  }, [token, logout]);

  useEffect(() => {
    if (!token) {
      setUser(null);
      return undefined;
    }

    const controller = new AbortController();

    refreshUser().catch((error) => {
      if (isAbort(error)) return;
      if (error?.response?.status === 401) logout();
    });

    const intervalId = setInterval(() => {
      refreshUser().catch((error) => {
        if (isAbort(error)) return;
        if (error?.response?.status === 401) logout();
      });
    }, 4000);

    const onVisible = () => {
      if (document.visibilityState !== "visible") return;
      refreshUser().catch((error) => {
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
  }, [token, logout, refreshUser]);

  const value = useMemo(
    () => ({ token, user, login, logout, refreshUser }),
    [token, user, login, logout, refreshUser]
  );

  const notice = notices[0] || null;

  return (
    <AuthContext.Provider value={value}>
      {children}
      <Dialog.Root
        open={Boolean(notice)}
        onOpenChange={(nextOpen) => {
          if (!nextOpen) setNotices((current) => current.slice(1));
        }}
      >
        <Dialog.Portal>
          <Dialog.Backdrop className="fixed inset-0 z-50 bg-black/40" />
          <Dialog.Popup className="fixed top-1/2 left-1/2 z-50 w-[min(24rem,calc(100vw-2rem))] -translate-x-1/2 -translate-y-1/2 rounded-2xl border bg-popover p-6 text-popover-foreground shadow-lg outline-none">
            <Dialog.Title className="text-base font-semibold">
              Cambio de asignación
            </Dialog.Title>
            <Dialog.Description className="mt-2 text-sm text-muted-foreground">
              {notice?.message}
            </Dialog.Description>
          </Dialog.Popup>
        </Dialog.Portal>
      </Dialog.Root>
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe usarse dentro de AuthProvider.");
  }
  return context;
}
