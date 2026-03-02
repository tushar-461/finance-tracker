import { createContext, useCallback, useEffect, useMemo, useState } from "react";
import { authApi, getApiErrorMessage, setUnauthorizedHandler } from "../api/client";

export const AuthContext = createContext(null);

function parseUser(stored) {
  try {
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

const DEMO_FALLBACK = import.meta.env.VITE_ENABLE_DEMO_FALLBACK === "true";

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem("token") || "");
  const [user, setUser] = useState(() => parseUser(localStorage.getItem("user")));
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (token) {
      localStorage.setItem("token", token);
    } else {
      localStorage.removeItem("token");
    }
  }, [token]);

  useEffect(() => {
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
    } else {
      localStorage.removeItem("user");
    }
  }, [user]);

  const logout = useCallback(() => {
    setToken("");
    setUser(null);
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(() => logout);
    return () => setUnauthorizedHandler(null);
  }, [logout]);

  const login = useCallback(async (payload) => {
    setLoading(true);
    try {
      const response = await authApi.login(payload);
      const nextToken = response?.data?.token;
      const nextUser = response?.data?.user;

      if (!nextToken || !nextUser) {
        throw new Error("Invalid login response from server.");
      }

      setToken(nextToken);
      setUser(nextUser);
      return { ok: true };
    } catch (error) {
      if (DEMO_FALLBACK) {
        setToken("demo-token");
        setUser({
          id: "demo",
          name: payload.email.split("@")[0],
          email: payload.email,
          role: "user",
        });
        return { ok: true, demo: true };
      }
      return { ok: false, message: getApiErrorMessage(error, "Unable to login.") };
    } finally {
      setLoading(false);
    }
  }, []);

  const register = useCallback(async (payload) => {
    setLoading(true);
    try {
      await authApi.register(payload);
      return { ok: true };
    } catch (error) {
      if (DEMO_FALLBACK) {
        return { ok: true, demo: true };
      }
      return { ok: false, message: getApiErrorMessage(error, "Unable to register.") };
    } finally {
      setLoading(false);
    }
  }, []);

  const value = useMemo(
    () => ({
      token,
      user,
      loading,
      isAuthenticated: Boolean(token),
      role: user?.role,
      login,
      register,
      logout,
    }),
    [token, user, loading, login, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}