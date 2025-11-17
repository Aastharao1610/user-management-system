"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";

const IconMap = {
  Loader: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="animate-spin duration-700"
    >
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  ),
  Mail: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="20" height="16" x="2" y="4" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  ),
  Lock: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  ),
  ArrowRight: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  ),
};

const Icon = ({ name, className }) => {
  return <span className={className}>{IconMap[name] || null}</span>;
};

const page = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const router = useRouter();

  const API_URL = "http://localhost:3000/api/auth/login";

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Invalid credentials");
      } else {
        router.push("/user");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex font-sans">
      {/* Left Half (Black Background) - Professional and Bold */}
      <div className="hidden lg:flex w-1/2 bg-black text-gray-50 items-center justify-center p-16 shadow-2xl">
        <div className="max-w-md space-y-6 text-left">
          <h1 className="text-6xl font-extrabold tracking-tighter leading-tight">
            Welcome
          </h1>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center bg-white text-gray-900 p-8 sm:p-12">
        <div className="w-full max-w-sm space-y-8">
          <div className="">
            <h2 className="text-3xl font-bold tracking-tight">Login</h2>
          </div>

          <form className="space-y-6" onSubmit={handleLogin}>
            {/* Error Message */}
            {error && (
              <div
                className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg transition duration-300"
                role="alert"
              >
                {error}
              </div>
            )}

            {/* Email Input */}
            <div>
              <label htmlFor="email" className="sr-only">
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Icon name="Mail" className="w-5 h-5 text-gray-700" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none rounded-lg relative block w-full px-10 py-3.5 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-0 input-focus-black transition duration-200 sm:text-base shadow-sm"
                  placeholder="Email address"
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Icon name="Lock" className="w-5 h-5 text-gray-700" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none rounded-lg relative block w-full px-10 py-3.5 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-0 input-focus-black transition duration-200 sm:text-base shadow-sm"
                  placeholder="Password"
                  disabled={isLoading}
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className={`group relative cursor-pointer w-full flex justify-center items-center py-3.5 px-4 border border-transparent text-base font-semibold rounded-lg shadow-lg transition duration-300 ease-in-out ${
                  isLoading
                    ? "bg-gray-600 cursor-not-allowed text-white"
                    : "bg-gray-900 text-white hover:bg-gray-700 hover:shadow-xl focus:ring-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2"
                }`}
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <Icon name="Loader" className="w-6 h-6" />
                    <span>Loging In...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <span>Login</span>
                    <Icon
                      name="ArrowRight"
                      className="w-5 h-5 opacity-0 group-hover:opacity-100 transition duration-300 ease-in-out transform group-hover:translate-x-1"
                    />
                  </div>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default page;
