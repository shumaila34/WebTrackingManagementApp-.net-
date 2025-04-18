import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { motion } from "framer-motion";

const LoginForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await fetch("https://localhost:7208/api/Auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Invalid login credentials");
      }

      const userData = await response.json();
      console.log("📦 Response from backend:", userData); // 👀

      toast.success("Login Successful! Redirecting...");

      const token =
        userData.token && typeof userData.token === "string"
          ? userData.token
          : userData.token?.token || userData.token?.accessToken || null;

      if (!token) {
        throw new Error("Token not received from backend.");
      }

      localStorage.setItem("token", token);
      localStorage.setItem("role", userData.role);

      console.log("✅ Token saved in localStorage:", token); // ✅
      console.log("✅ Role saved in localStorage:", userData.role); // ✅

      navigate("/dashboard");
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Login failed";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-white">
      <div className="w-full max-w-md px-4">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="relative bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100"
        >
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600"></div>

          <div className="px-8 pt-12 pb-10">
            <h2 className="text-2xl font-bold text-gray-800 text-center">
              Welcome Back
            </h2>
            <p className="text-gray-500 text-sm text-center mb-6">
              Login to continue
            </p>

            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="mb-4 p-3 rounded-lg bg-red-50 border-l-4 border-red-400 text-red-600 text-sm"
              >
                {error}
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="group">
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700"
                >
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="block w-full px-3 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 bg-gray-50 text-gray-900"
                  required
                />
              </div>

              <div className="group">
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700"
                >
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="block w-full px-3 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 bg-gray-50 text-gray-900"
                  required
                />
              </div>

              <button
                type="submit"
                className={`w-full py-3 text-white font-medium rounded-lg transition ${
                  loading
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700"
                }`}
                disabled={loading}
              >
                {loading ? (
                  <div className="flex justify-center">
                    <div className="w-5 h-5 border-4 border-t-transparent border-blue-600 rounded-full animate-spin"></div>
                  </div>
                ) : (
                  "Login"
                )}
              </button>
            </form>

            <p className="mt-5 text-sm text-center text-gray-600">
              Don’t have an account?{" "}
              <a href="/signup" className="text-blue-500 hover:underline">
                Sign up
              </a>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default LoginForm;
