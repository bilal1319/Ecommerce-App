import { useState, useRef, useEffect } from "react";
import { axiosInstance } from "../lib/axios";
import { Link, useNavigate, useLocation } from "react-router-dom";

// Main component containing all three forms
export default function ForgotPasswordFlow() {
  const navigate = useNavigate();
  const location = useLocation();

  // Get step and email from URL query parameters
  const getStepFromUrl = () => {
    const params = new URLSearchParams(location.search);
    const step = parseInt(params.get("step")) || 1;
    return step >= 1 && step <= 3 ? step : 1;
  };

  const getEmailFromUrl = () => {
    const params = new URLSearchParams(location.search);
    return params.get("email") || "";
  };

  // Initialize state
  const [currentStep, setCurrentStep] = useState(getStepFromUrl);
  const [email, setEmail] = useState(getEmailFromUrl);
  const [emailFocused, setEmailFocused] = useState(false);
  const [verificationCode, setVerificationCode] = useState([
    "",
    "",
    "",
    "",
    "",
    "",
  ]);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [confirmPasswordFocused, setConfirmPasswordFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [timer, setTimer] = useState(0);


  // Refs for the verification code inputs
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

  // Update URL when step or email changes
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    params.set("step", currentStep);

    // Add email to URL params if it exists
    if (email) {
      params.set("email", email);
    }

    navigate(`${location.pathname}?${params.toString()}`, { replace: true });
  }, [currentStep, email, navigate, location.pathname]);

  useEffect(() => {
    if (!email) return;

    if (verificationCode.every((char) => char === "") && currentStep === 3) {
      const getCode = async () => {
        try {
          const { data } = await axiosInstance.get(
            `/auth/get-reset-code/${email}`
          );
          if (data.code) {
            setVerificationCode(data.code.split(""));
            console.log("Code fetched from server:", data);
          }
        } catch (error) {
          console.log("getResetCode", error);
        }
      };

      getCode();
    }
  }, [email, verificationCode]);

  // Toggle password visibility
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Toggle confirm password visibility
  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  // Handle email submission
  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // API call to /api/forgot-password
      const { data } = await axiosInstance.post("/auth/forgot-password", {
        email,
      });
      console.log("Email sent response:", data);
      startTimer();

      setCurrentStep(2);
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong. Please try again.");
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
      // API call to /api/verify-code
      const { data } = await axiosInstance.post("/auth/verify-reset-code", {
        email,
        code,
      });
      console.log("Verify code response", data);

      setCurrentStep(3);
    } catch (err) {
      setError("Invalid code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Handle new password submission
  const handleResetPassword = async () => {
    setError("");

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters long");
      return;
    }

    setLoading(true);

    try {
      // API call to /api/reset-password
      const code = verificationCode.join("");
      const { data } = await axiosInstance.post("/auth/reset-password", {
        email,
        code,
        newPassword: confirmPassword,
      });
      console.log("Reset password response", data);

      setSuccess(true);

      // Clear reset password data from sessionStorage after success
      sessionStorage.removeItem("resetPasswordEmail");
    } catch (err) {
      setError("Failed to reset password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Go back to previous step
  const goBack = () => {
    setError("");
    setCurrentStep(currentStep - 1);
  };

  // Reset the entire flow
  const resetFlow = () => {
    navigate("/login", { replace: true });
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-900 px-4 py-10">
      <div className="bg-gray-800 shadow-xl rounded-3xl p-8 w-full max-w-md relative border border-gray-700">
        {/* Profile Icon */}
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
                d="M12 1.5a5.25 5.25 0 00-5.25 5.25v3a3 3 0 00-3 3v6.75a3 3 0 003 3h10.5a3 3 0 003-3v-6.75a3 3 0 00-3-3v-3c0-2.9-2.35-5.25-5.25-5.25zm3.75 8.25v-3a3.75 3.75 0 10-7.5 0v3h7.5z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        </div>

        <h2 className="text-2xl font-semibold text-center text-purple-400 mt-10 mb-6">
          {currentStep === 1 && "Forgot Password"}
          {currentStep === 2 && "Verify Code"}
          {currentStep === 3 && "Reset Password"}
          {success && "Password Reset"}
        </h2>

        {error && (
          <div className="bg-red-900/30 border border-red-500/50 rounded-lg p-3 mb-4">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {success ? (
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-16 w-16 text-green-500"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <p className="text-gray-300 mb-6">
              Your password has been successfully reset!
            </p>
            <Link to="/login">
              <button
                className="bg-purple-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-purple-700 transition w-full"
                onClick={resetFlow}
              >
                Back to Login
              </button>
            </Link>
          </div>
        ) : (
          <>
            {/* Step 1: Email Form */}
            {currentStep === 1 && (
              <div className="flex flex-col gap-4">
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
                  />
                  <label
                    htmlFor="email"
                    className={`absolute text-gray-400 duration-300 transform ${
                      emailFocused || email.length > 0
                        ? "-translate-y-3 scale-75 top-4 left-3 text-purple-400"
                        : "top-4 left-3"
                    }`}
                  >
                    Email Address
                  </label>
                </div>

                <p className="text-gray-400 text-sm mt-2">
                  Enter the email address associated with your account, and
                  we'll send you a verification code to reset your password.
                </p>

                <button
                  onClick={handleEmailSubmit}
                  className="bg-purple-600 text-white font-semibold py-3 rounded-lg hover:bg-purple-700 transition mt-4 flex justify-center items-center"
                  disabled={loading || !email}
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
                    "Send Verification Code"
                  )}
                </button>

                <p className="text-gray-400 text-center mt-4">
                  Remember your password?{" "}
                  <Link to="/login">
                    <span className="text-purple-400 hover:underline cursor-pointer">
                      Back to Login
                    </span>
                  </Link>
                </p>
              </div>
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
                      className="w-10 h-10 sm:w-12 sm:h-12 text-center text-xl font-bold bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white"
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
                    onClick={handleEmailSubmit}
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
                      "Verify Code"
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: New Password Form */}
            {currentStep === 3 && (
              <div className="flex flex-col gap-4">
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="newPassword"
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg p-3 pt-6 pb-2 focus:outline-none focus:ring-2 focus:ring-purple-500 pr-10 text-white peer"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    onFocus={() => setPasswordFocused(true)}
                    onBlur={() =>
                      setPasswordFocused(
                        newPassword.length === 0 ? false : true
                      )
                    }
                    minLength={8}
                  />
                  <label
                    htmlFor="newPassword"
                    className={`absolute text-gray-400 duration-300 transform ${
                      passwordFocused || newPassword.length > 0
                        ? "-translate-y-3 scale-75 top-4 left-3 text-purple-400"
                        : "top-4 left-3"
                    }`}
                  >
                    New Password
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

                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    id="confirmPassword"
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg p-3 pt-6 pb-2 focus:outline-none focus:ring-2 focus:ring-purple-500 pr-10 text-white peer"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    onFocus={() => setConfirmPasswordFocused(true)}
                    onBlur={() =>
                      setConfirmPasswordFocused(
                        confirmPassword.length === 0 ? false : true
                      )
                    }
                  />
                  <label
                    htmlFor="confirmPassword"
                    className={`absolute text-gray-400 duration-300 transform ${
                      confirmPasswordFocused || confirmPassword.length > 0
                        ? "-translate-y-3 scale-75 top-4 left-3 text-purple-400"
                        : "top-4 left-3"
                    }`}
                  >
                    Confirm Password
                  </label>

                  {/* Password visibility toggle */}
                  <button
                    type="button"
                    className="absolute right-3 top-4 text-gray-400 hover:text-purple-400"
                    onClick={toggleConfirmPasswordVisibility}
                  >
                    {showConfirmPassword ? (
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

                <p className="text-gray-400 text-sm mt-1">
                  Password must be at least 8 characters long.
                </p>

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
                    onClick={handleResetPassword}
                    disabled={
                      loading ||
                      !newPassword ||
                      !confirmPassword ||
                      newPassword.length < 8
                    }
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
                      "Reset Password"
                    )}
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
