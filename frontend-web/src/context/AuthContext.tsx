import { createContext, useState, ReactNode } from "react";
import { useNavigate } from "react-router-dom";

interface User {
  email: string;
  role: string;
}

const AuthContext = createContext({
  user: null as User | null,
  loginUser: async (credentials: any) => null as User | null,
  logout: () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();

  const loginUser = async (credentials: { email: string }) => {
    // Mock API call (Replace this with real API call)
    const mockUsers = [
      { email: "admin@example.com", role: "admin" },
      { email: "user@example.com", role: "user" },
    ];
    const foundUser = mockUsers.find((u) => u.email === credentials.email);

    if (foundUser) {
      setUser(foundUser);
      localStorage.setItem("user", JSON.stringify(foundUser));

      // Redirect based on role
      if (foundUser.role === "admin") {
        navigate("/admin-dashboard");
      } else {
        navigate("/task-list");
      }
      return foundUser;
    }
    return null;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <AuthContext.Provider value={{ user, loginUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
