import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { login } from "../app/features/auth/authSlice";

export const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { error } = useSelector(state => state.auth);
  
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = {
      email: email.trim(), 
      password: password.trim()
    };
    
    dispatch(login({formData, navigate}));
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-900 px-4">
      <div className="bg-gray-800 shadow-xl rounded-3xl rounded-b-lg p-8 w-full max-w-md mt-10 relative border border-gray-700">
        {/* Profile Icon - Positioned half outside the form */}
        <div className="absolute -top-10 left-1/2 transform -translate-x-1/2">
          <div className="w-20 h-20 bg-gray-700 rounded-full flex items-center justify-center border-4 border-gray-800 shadow-lg">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-12 h-12 text-purple-400">
              <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z" clipRule="evenodd" />
            </svg>
          </div>
        </div>
        
        <h2 className="text-2xl font-semibold text-center text-purple-400 mt-10 mb-8">
          Login to your Account
        </h2>

        {error && (
          <p className="text-red-400 text-lg my-2 text-center">{error}</p>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div className="relative">
            <input
              type="email"
              id="email"
              className="w-full bg-gray-700 border border-gray-600 rounded-lg p-3 pt-6 pb-2 focus:outline-none focus:ring-2 focus:ring-purple-500 text-white peer"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onFocus={() => setEmailFocused(true)}
              onBlur={() => setEmailFocused(email.length === 0 ? false : true)}
              required
            />
            <label 
              htmlFor="email" 
              className={`absolute text-gray-400 duration-300 transform ${
                emailFocused || email.length > 0 
                  ? "-translate-y-3 scale-75 top-4 left-3 text-purple-400"
                  : "top-4 left-3"
              }`}
            >
              Email
            </label>
          </div>

          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              className="w-full bg-gray-700 border border-gray-600 rounded-lg p-3 pt-6 pb-2 focus:outline-none focus:ring-2 focus:ring-purple-500 pr-10 text-white peer"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onFocus={() => setPasswordFocused(true)}
              onBlur={() => setPasswordFocused(password.length === 0 ? false : true)}
              required
            />
            <label 
              htmlFor="password" 
              className={`absolute text-gray-400 duration-300 transform ${
                passwordFocused || password.length > 0 
                  ? "-translate-y-3 scale-75 top-4 left-3 text-purple-400"
                  : "top-4 left-3"
              }`}
            >
              Password
            </label>
            
            {/* Password visibility toggle */}
            <button 
              type="button"
              className="absolute right-3 top-4 text-gray-400 hover:text-purple-400"
              onClick={togglePasswordVisibility}
            >
              {showPassword ? (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              )}
            </button>
          </div>

          <button className="bg-purple-600 text-white font-semibold py-3 rounded-lg hover:bg-purple-700 transition mt-2">
            Login
          </button>

          <p className="text-gray-400 text-center">
            Don't have an account?{" "}
            <Link to={'/'}>
              <span className="text-purple-400 hover:underline cursor-pointer">
                Signup
              </span>
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};