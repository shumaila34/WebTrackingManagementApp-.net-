import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import { User, Mail, Lock, AlertCircle } from "lucide-react";

const SignupForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "user", // default to user role
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("https://localhost:7208/api/Auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Signup failed");
      }

      const userData = await response.json();
      toast.success("Registration Successful! Redirecting to login...");

      // Redirect to the login page after successful registration
      navigate("/login");
    } catch (error: any) {
      setError(error?.message || "An error occurred");
      toast.error(error?.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 to-black">
      <div className="w-full max-w-md px-4">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="bg-white/5 backdrop-blur-md rounded-2xl shadow-2xl p-8 border border-white/10"
        >
          <h2 className="text-3xl font-bold text-white text-center mb-6">
            Create Account
          </h2>
          <p className="text-gray-400 text-center mb-8">
            Join our community and start your journey
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
                htmlFor="username"
                className="block text-sm font-medium text-gray-300"
              >
                Username
              </label>
              <div className="relative">
                <input
                  id="username"
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  className="block w-full px-5 py-3 border border-gray-700 rounded-full focus:ring-2 focus:ring-blue-500 bg-black/20 text-white placeholder:text-gray-500 transition-all duration-300"
                  required
                  placeholder="Enter your username"
                />
                <User className="absolute right-4 top-3 h-5 w-5 text-gray-400" />
              </div>
            </div>

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
                <Mail className="absolute right-4 top-3 h-5 w-5 text-gray-400" />
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

            <div className="space-y-2">
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-gray-300"
              >
                Confirm Password
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="block w-full px-5 py-3 border border-gray-700 rounded-full focus:ring-2 focus:ring-blue-500 bg-black/20 text-white placeholder:text-gray-500 transition-all duration-300"
                  required
                  placeholder="Confirm your password"
                />
                <Lock className="absolute right-4 top-3 h-5 w-5 text-gray-400" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 text-white font-semibold rounded-full transition-all duration-300 ${
                loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
              }`}
            >
              {loading ? "Signing Up..." : "Sign Up"}
            </button>
          </form>

          <p className="mt-6 text-sm text-center text-gray-400">
            Already have an account?{" "}
            <a
              href="/login"
              className="text-blue-300 hover:underline font-medium transition-colors"
            >
              Log in
            </a>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default SignupForm;
s