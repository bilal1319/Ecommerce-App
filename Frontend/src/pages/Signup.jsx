import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { signup } from "../app/features/auth/authSlice";
import GoogleLoginButton from "../components/GoogleLoginButton";
import { axiosInstance } from "../lib/axios";

export const Signup = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  // Get step and email from URL query parameters consistently
  const getStepFromUrl = () => {
    const params = new URLSearchParams(location.search);
    const step = parseInt(params.get("step")) || 1;
    return step >= 1 && step <= 3 ? step : 1;
  };

  const getEmailFromUrl = () => {
    const params = new URLSearchParams(location.search);
    return params.get("email") || "";
  };

  // Initialize states with values from URL params if they exist
  const [name, setName] = useState("");
  const [email, setEmail] = useState(getEmailFromUrl);
  const [password, setPassword] = useState("");
  const [currentStep, setCurrentStep] = useState(getStepFromUrl);
  const [verificationCode, setVerificationCode] = useState([
    "",
    "",
    "",
    "",
    "",
    "",
  ]);

  // UI state
  const [nameFocused, setNameFocused] = useState(false);
  const [emailFocused, setEmailFocused] = useState(email ? true : false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [timer, setTimer] = useState(0);
  

  // Refs for verification code inputs
  const inputRefs = useRef([]);

  // Initialize the refs
  useEffect(() => {
    inputRefs.current = inputRefs.current.slice(0, 6);
  }, []);

  useEffect(() => {
    let interval;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer(prev => prev - 1);
      }, 1000);
    }
  
    return () => clearInterval(interval);
  }, [timer]);
  
  const startTimer = () => {
    setTimer(120); 
  };

  const { signupError } = useSelector((state) => state.auth);

  // Update URL when step or email changes
useEffect(() => {
  const params = new URLSearchParams(location.search);
  params.set("step", currentStep);

  // Only set email if step is 2 or later
  if (currentStep > 1 && email) {
    params.set("email", email);
  } else {
    params.delete("email"); // remove if it's step 1
  }

  navigate(`${location.pathname}?${params.toString()}`, { replace: true });
}, [currentStep, email, navigate, location.pathname]);


  // Handle form submission for first step (name and email)
  const handleSubmitStep1 = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // API call to send verification code to email
      const { data } = await axiosInstance.post("/auth/send-verify-code", {
        name: name.trim(),
        email: email.trim(),
      });

      console.log("Verification code sent:", data);
      setCurrentStep(2);
      startTimer();
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        "Something went wrong. Please try again.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  // Handle verification code input
  const handleCodeChange = (index, value) => {
    // Only allow digits
    if (value && !/^\d+$/.test(value)) return;

    const newCode = [...verificationCode];
    newCode[index] = value;
    setVerificationCode(newCode);

    // Auto-advance to next input field if current field is filled
    if (value && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  // Handle code backspace
  const handleKeyDown = (index, e) => {
    // Move to previous input when backspace is pressed and current input is empty
    if (e.key === "Backspace" && !verificationCode[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  // Handle verification code submission
  const handleVerifyCode = async () => {
    setError("");
    setLoading(true);

    const code = verificationCode.join("");
    if (code.length !== 6) {
      setError("Please enter the complete 6-digit code");
      setLoading(false);
      return;
    }

    try {
      // API call to verify the code
      const { data } = await axiosInstance.post("/auth/verify-email-code", {
        email: email.trim(),
        code,
      });

      console.log("Verification successful:", data);
      setCurrentStep(3);
    } catch (err) {
      setError("Invalid code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Handle final password submission
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Complete signup process after verification and password collection
      const formData = {
        name: name.trim(),
        email: email.trim(),
        password: password.trim(),
        verified: true,
      };

      dispatch(signup({ formData, navigate }));
    } catch (err) {
      setError(
        err.response?.data?.message || "Something went wrong. Please try again."
      );
      console.log("Signup error:", err);
      
    } finally {
      setLoading(false);
    }
  };

  // Go back to previous step
  const goBack = () => {
    setError("");
    setCurrentStep(currentStep - 1);
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Resend verification code
 

  return (
    <div className="flex justify-center items-center mt-3 mb-2 bg-gray-900 px-4">
      <div className="bg-gray-800 shadow-xl rounded-3xl rounded-b-lg p-8 w-full max-w-md mt-10 relative border border-gray-700">
        {/* Profile Icon - Positioned half outside the form */}
        <div className="absolute -top-10 left-1/2 transform -translate-x-1/2">
          <div className="w-20 h-20 bg-gray-700 rounded-full flex items-center justify-center border-4 border-gray-800 shadow-lg">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-12 h-12 text-purple-400"
            >
              <path
                fillRule="evenodd"
                d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        </div>

        <h2 className="text-2xl font-semibold text-center text-purple-400 mt-10 mb-8">
          {currentStep === 1 && "Create Account"}
          {currentStep === 2 && "Verify Email"}
          {currentStep === 3 && "Set Password"}
        </h2>

        {/* Display errors */}
        {(error || signupError) && (
          <div className="bg-red-900/30 border border-red-500/50 rounded-lg p-3 mb-4">
            <p className="text-red-400 text-sm">{error || signupError}</p>
          </div>
        )}

        {/* Step 1: Name and Email Form */}
        {currentStep === 1 && (
          <form onSubmit={handleSubmitStep1} className="flex flex-col gap-6">
            <div className="relative">
              <input
                type="text"
                id="name"
                className="w-full bg-gray-700 border border-gray-600 rounded-lg p-3 pt-6 pb-2 focus:outline-none focus:ring-2 focus:ring-purple-500 text-white peer"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onFocus={() => setNameFocused(true)}
                onBlur={() => setNameFocused(name.length === 0 ? false : true)}
                required
              />
              <label
                htmlFor="name"
                className={`absolute text-gray-400 duration-300 transform ${
                  nameFocused || name.length > 0
                    ? "-translate-y-3 scale-75 top-4 left-3 text-purple-400"
                    : "top-4 left-3"
                }`}
              >
                Full Name
              </label>
            </div>

            <div className="relative">
              <input
                type="email"
                id="email"
                className="w-full bg-gray-700 border border-gray-600 rounded-lg p-3 pt-6 pb-2 focus:outline-none focus:ring-2 focus:ring-purple-500 text-white peer"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onFocus={() => setEmailFocused(true)}
                onBlur={() =>
                  setEmailFocused(email.length === 0 ? false : true)
                }
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

            <button
              type="submit"
              className="bg-purple-600 text-white font-semibold py-3 rounded-lg hover:bg-purple-700 transition mt-2 flex justify-center items-center"
              disabled={loading || !name || !email}
            >
              {loading ? (
                <svg
                  className="animate-spin h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
              ) : (
                "Continue"
              )}
            </button>

            <p className="text-gray-400 text-center">
              Already have an account?{" "}
              <Link to="/login" className="text-purple-400 hover:underline">
                Login
              </Link>
            </p>
          </form>
        )}

        {/* Step 2: Verification Code Form */}
        {currentStep === 2 && (
          <div className="flex flex-col gap-4">
            <p className="text-gray-300 mb-4">
              We've sent a 6-digit verification code to{" "}
              <span className="text-purple-400">{email}</span>
            </p>

            <div className="flex justify-between gap-2 mb-4">
              {verificationCode.map((digit, index) => (
                <input
                  key={index}
                  type="text"
                  maxLength={1}
                  className="w-12 h-12 text-center text-xl font-bold bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white"
                  value={digit}
                  onChange={(e) => handleCodeChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  ref={(el) => (inputRefs.current[index] = el)}
                  autoFocus={index === 0}
                />
              ))}
            </div>

            <p className="text-gray-400 text-sm">
              Didn't receive a code?
              <span
                className="text-purple-400 hover:underline ml-1 cursor-pointer"
                onClick={handleSubmitStep1}
              >
                Resend Code
              </span>
            </p>
            <p className="text-gray-400 text-sm"> Code valid for: <span className="font-bold text-gray-300">{Math.floor(timer / 60)}:{String(timer % 60).padStart(2, '0')}</span></p>

            <div className="flex gap-3 mt-4">
              <button
                className="bg-gray-700 text-white font-semibold py-3 rounded-lg hover:bg-gray-600 transition flex-1"
                onClick={goBack}
                disabled={loading}
              >
                Back
              </button>

              <button
                className="bg-purple-600 text-white font-semibold py-3 rounded-lg hover:bg-purple-700 transition flex-1 flex justify-center items-center"
                onClick={handleVerifyCode}
                disabled={loading || verificationCode.join("").length !== 6}
              >
                {loading ? (
                  <svg
                    className="animate-spin h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                ) : (
                  "Verify"
                )}
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Password Form */}
        {currentStep === 3 && (
          <form onSubmit={handlePasswordSubmit} className="flex flex-col gap-6">
            <p className="text-gray-300 mb-2">
              Email verified successfully! Now set your password to complete
              your account.
            </p>

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                className="w-full bg-gray-700 border border-gray-600 rounded-lg p-3 pt-6 pb-2 focus:outline-none focus:ring-2 focus:ring-purple-500 pr-10 text-white peer"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={() => setPasswordFocused(true)}
                onBlur={() =>
                  setPasswordFocused(password.length === 0 ? false : true)
                }
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
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-5 h-5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"
                    />
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-5 h-5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                )}
              </button>
            </div>

            <div className="flex gap-3 mt-4">
              <button
                type="button"
                className="bg-gray-700 text-white font-semibold py-3 rounded-lg hover:bg-gray-600 transition flex-1"
                onClick={goBack}
                disabled={loading}
              >
                Back
              </button>

              <button
                type="submit"
                className="bg-purple-600 text-white font-semibold py-3 rounded-lg hover:bg-purple-700 transition flex-1 flex justify-center items-center"
                disabled={loading || !password}
              >
                {loading ? (
                  <svg
                    className="animate-spin h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                ) : (
                  "Create Account"
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
