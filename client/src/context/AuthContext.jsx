import { createContext, useContext } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchMe, loginUser, registerUser, logoutUser } from "../api/auth";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const qc = useQueryClient();

  const { data: user, isLoading } = useQuery({
    queryKey: ["me"],
    queryFn: async () => {
      try {
        const res = await fetchMe();
        return res.user;
      } catch (err) {
        if (err.response?.status === 401) return null; // login වෙලා නෑ, error එකක් නෙවෙයි
        throw err;
      }
    },
    staleTime: 5 * 60 * 1000,
    retry: false,
  });

  const onAuthSuccess = (data) => qc.setQueryData(["me"], data.user);

  const login = useMutation({ mutationFn: loginUser, onSuccess: onAuthSuccess });
  const register = useMutation({ mutationFn: registerUser, onSuccess: onAuthSuccess });
  const logout = useMutation({
    mutationFn: logoutUser,
    onSuccess: () => qc.setQueryData(["me"], null),
  });

  return (
    <AuthContext.Provider value={{ user: user ?? null, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);