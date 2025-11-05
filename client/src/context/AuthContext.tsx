import React, { createContext, useState, useEffect, ReactNode } from "react";
import { userLogin } from "../services/auth/login";
import { userSignin } from "../services/auth/signin";
import { userLogout } from "../services/auth/logout";
import api from "../services/api";

interface User {
  _id: string;
  name: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api.get("/user/profile", {
          withCredentials: true,
        });

        // ✅ Fix: your backend returns the user object directly
        setUser({
          _id: res.data.id,
          name: res.data.name,
          email: res.data.email,
        });
      } catch (err) {
        console.error("Failed to fetch user:", err);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  // ✅ Login Function
  const login = async (email: string, password: string) => {
    const res = await userLogin(email, password);
    setUser({ _id: res.userId, name: res.name, email });
  };

  // ✅ Register Function
  const register = async (name: string, email: string, password: string) => {
    await userSignin(name, email, password);
    // optional: auto-login after registration
    await login(email, password);
  };

  // ✅ Logout Function
  const logout = async () => {
    await userLogout();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
