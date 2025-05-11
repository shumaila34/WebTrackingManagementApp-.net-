import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import { User, Lock, ArrowRight, AlertCircle } from "lucide-react";

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
      toast.success("Login Successful! Redirecting...");

      localStorage.setItem("token", userData.token);
      localStorage.setItem("role", userData.role);

      // Redirect based on role
      if (userData?.role === "Admin") {
        navigate("/dashboard");
      } else if (userData?.role === "User") {
        navigate("/user/dashboard");
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Login failed";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900">
      <div className="w-full max-w-md px-4">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="bg-white/5 backdrop-blur-md rounded-2xl shadow-2xl p-8 border border-white/10"
        >
          <h2 className="text-3xl font-bold text-white text-center mb-6">
            Welcome Back
          </h2>
          <p className="text-gray-400 text-center mb-8">
            Login to your account to continue
          </p>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-lg mb-6 flex items-start gap-2">
              <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
              <div>{error}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-300"
              >
                Email
              </label>
              <div className="relative">
                <input
                  id="email"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="block w-full px-5 py-3 border border-gray-700 rounded-full focus:ring-2 focus:ring-blue-500 bg-black/20 text-white placeholder:text-gray-500 transition-all duration-300"
                  required
                  placeholder="Enter your email"
                />
                <User className="absolute right-4 top-3 h-5 w-5 text-gray-400" />
              </div>
            </div>
            <div className="space-y-2">
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-300"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="block w-full px-5 py-3 border border-gray-700 rounded-full focus:ring-2 focus:ring-blue-500 bg-black/20 text-white placeholder:text-gray-500 transition-all duration-300"
                  required
                  placeholder="Enter your password"
                />
                <Lock className="absolute right-4 top-3 h-5 w-5 text-gray-400" />
              </div>
            </div>
            <button
              type="submit"
              className={`w-full py-3 text-white font-semibold rounded-full transition-all duration-300 flex items-center justify-center gap-2 ${
                loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
              }`}
              disabled={loading}
            >
              {loading ? (
                "Logging in..."
              ) : (
                <>
                  Login
                  <ArrowRight className="h-5 w-5" />
                </>
              )}
            </button>
          </form>

          <p className="mt-6 text-sm text-center text-gray-400">
            Don’t have an account?{" "}
            <a
              href="/signup"
              className="text-blue-300 hover:underline font-medium transition-colors"
            >
              Sign up
            </a>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default LoginForm;
