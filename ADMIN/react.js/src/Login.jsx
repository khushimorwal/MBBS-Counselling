import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Login = () => {
  const navigate = useNavigate();

  // Store login form data
  const [login, setLogin] = useState({
    email: "",
    password: "",
  });

  // Store forgot password form data
  const [forgotPassword, setForgotPassword] = useState(false);
  const [forgotOTP, setForgotOTP] = useState(false);
  const [forgotOTPValue, setForgotOTPValue] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [otpVerified, setOtpVerified] = useState(false);

  // Store loading states
  const [loading, setLoading] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);

  // Store password visibility
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Page background (soft sky blue, white and cream glow)
  // To use a real photo instead, replace backgroundImage with:
  // backgroundImage: "url('/login-bg.jpg')"
  // (put login-bg.jpg inside your "public" folder)
  const backgroundStyle = {
    backgroundImage:
      "radial-gradient(circle at 20% 80%, #bae6fd, transparent 45%), radial-gradient(circle at 85% 15%, #fef3c7, transparent 45%), linear-gradient(135deg, #e0f2fe, #f8fafc)",
    backgroundSize: "cover",
    backgroundPosition: "center",
  };

  // Common input styling (transparent, only a bottom line)
  const inputStyle =
    "w-full rounded-none border-0 border-b-2 border-slate-500 bg-transparent px-1 py-3 text-sm text-slate-800 outline-none placeholder:text-slate-500 focus:border-sky-600 disabled:opacity-60";

  // Common button styling (border-only button, fills on hover)
  const buttonStyle =
    "flex w-full items-center justify-center gap-2 rounded-lg border-2 border-slate-800 bg-transparent px-5 py-3 text-sm font-semibold text-slate-800 hover:bg-slate-800 hover:text-white disabled:cursor-not-allowed disabled:opacity-60";

  // Common label styling
  const labelStyle = "mb-1 block text-sm font-semibold text-slate-700";

  // Handle login form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    const email = login.email.trim();
    const password = login.password;

    if (!email || !password) {
      toast.error("Email and password are required");
      return;
    }

    try {
      setLoading(true);

      const response = await axios.post(
        "http://localhost:3000/login",
        { email, password }
      );

      const data = response.data;

      if (data.success && data.token && data.user) {
        // Save authentication details
        localStorage.setItem("token", data.token);
        localStorage.setItem("role", data.user.role);

        localStorage.setItem(
          "permissions",
          JSON.stringify(data.user.permissions || {})
        );

        localStorage.setItem("user", JSON.stringify(data.user));

        toast.success(data.message || "Login successful!");

        navigate("/dash");
      } else {
        toast.error(data.message || "Login failed");
      }
    } catch (error) {
      console.error("Login error:", error);

      if (error.response?.status === 401) {
        toast.error(
          error.response.data?.message || "Invalid email or password"
        );
      } else if (error.response?.status === 404) {
        toast.error("Login API not found. Check backend route.");
      } else if (error.response) {
        toast.error(
          error.response.data?.message || "Something went wrong"
        );
      } else {
        toast.error("Cannot connect to server");
      }
    } finally {
      setLoading(false);
    }
  };

  // Send OTP to the registered email
  const handleForgotPassword = async () => {
    const email = login.email.trim();

    if (!email) {
      toast.error("Please enter your email address");
      return;
    }

    try {
      setOtpLoading(true);

      const response = await axios.post(
        "http://localhost:3000/forgotpassword",
        { email }
      );

      const data = response.data;

      if (data.success) {
        toast.success(data.message || "OTP sent successfully");
        setForgotOTP(true);
      } else {
        toast.error(data.message || "Unable to send OTP");
      }
    } catch (error) {
      console.error("Forgot password error:", error);

      toast.error(
        error.response?.data?.message || "Unable to connect to server"
      );
    } finally {
      setOtpLoading(false);
    }
  };

  // Verify the OTP entered by the user
  const handleVerifyForgotOTP = async () => {
    if (!forgotOTPValue.trim()) {
      toast.error("Please enter verification OTP");
      return;
    }

    try {
      setOtpLoading(true);

      const response = await axios.post(
        "http://localhost:3000/verifyforgototp",
        {
          email: login.email.trim(),
          otp: forgotOTPValue,
        }
      );

      const data = response.data;

      if (data.success) {
        toast.success(data.message || "OTP verified successfully");
        setOtpVerified(true);
      } else {
        toast.error(data.message || "Invalid OTP");
      }
    } catch (error) {
      console.error("OTP verification error:", error);

      toast.error(
        error.response?.data?.message || "Unable to verify OTP"
      );
    } finally {
      setOtpLoading(false);
    }
  };

  // Update the account password
  const handleResetPassword = async () => {
    if (!newPassword || !confirmPassword) {
      toast.error("Please fill in both password fields");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    try {
      setResetLoading(true);

      const response = await axios.post(
        "http://localhost:3000/resetpassword",
        {
          email: login.email.trim(),
          password: newPassword,
        }
      );

      const data = response.data;

      if (data.success) {
        toast.success(data.message || "Password reset successfully");

        // Clear all password recovery data
        setForgotPassword(false);
        setForgotOTP(false);
        setForgotOTPValue("");
        setOtpVerified(false);
        setNewPassword("");
        setConfirmPassword("");
        setLogin({ email: "", password: "" });
      } else {
        toast.error(data.message || "Unable to reset password");
      }
    } catch (error) {
      console.error("Password reset error:", error);

      toast.error(
        error.response?.data?.message || "Unable to connect to server"
      );
    } finally {
      setResetLoading(false);
    }
  };

  // Return to login and clear recovery form
  const handleBackToLogin = () => {
    setForgotPassword(false);
    setForgotOTP(false);
    setForgotOTPValue("");
    setOtpVerified(false);
    setNewPassword("");
    setConfirmPassword("");
    setShowNewPassword(false);
    setShowConfirmPassword(false);
  };

  return (
    // Full page with one background for both sides
    <div className="min-h-screen" style={backgroundStyle}>

      {/* Display success and error messages */}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        newestOnTop
        closeOnClick
        pauseOnHover
        theme="colored"
      />

      <div className="grid min-h-screen md:grid-cols-2">

        {/* Left branding section (transparent, background shows through) */}
        <div className="hidden min-h-screen px-10 py-12 text-slate-800 md:flex md:flex-col md:justify-between lg:px-16">

          <div>

            {/* Project logo and name */}
            <div className="flex items-center gap-3">

              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-sky-500 text-xl font-bold text-white">
                M
              </div>

              <div>
                <h2 className="text-lg font-bold tracking-wide text-slate-800">
                  MBBS COUNSELLING
                </h2>

                <p className="mt-1 text-xs tracking-wider text-slate-600">
                  ADMINISTRATION PORTAL
                </p>
              </div>

            </div>

            {/* Main branding content */}
            <div className="mt-20 max-w-lg lg:mt-24">

              {/* Small badge (border-only) */}
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-sky-400 px-4 py-2 text-xs font-semibold text-sky-700">
                <span className="h-2 w-2 rounded-full bg-sky-500" />
                Smart Counselling Management
              </div>

              <h1 className="text-4xl font-bold leading-tight text-slate-800 lg:text-5xl">
                Every seat
                <br />
                counselled.
                <br />

                <span className="text-sky-600">
                  Every student guided.
                </span>
              </h1>

              <p className="mt-6 max-w-md text-sm leading-7 text-slate-600">
                Manage students, colleges, applications and counselling
                activities through one simple and powerful platform.
              </p>

            </div>

            {/* Platform highlights (border-only transparent cards) */}
            <div className="mt-12 grid grid-cols-2 gap-4">

              <div className="rounded-xl border-2 border-white/90 bg-white/10 p-5 backdrop-blur-md">
                <p className="text-xl font-bold text-sky-600">
                  Secure
                </p>

                <p className="mt-2 text-xs text-slate-600">
                  Protected admin access
                </p>
              </div>

              <div className="rounded-xl border-2 border-white/90 bg-white/10 p-5 backdrop-blur-md">
                <p className="text-xl font-bold text-sky-600">
                  Simple
                </p>

                <p className="mt-2 text-xs text-slate-600">
                  Easy management system
                </p>
              </div>

            </div>

          </div>

          {/* Left section footer */}
          <div className="border-t border-white/70 pt-6">
            <p className="text-xs text-slate-600">
              © {new Date().getFullYear()} MBBS Counselling. All rights reserved.
            </p>
          </div>

        </div>

        {/* Right login section */}
        <div className="flex min-h-screen items-center justify-center px-5 py-10 sm:px-10 lg:px-16">

          <div className="w-full max-w-md">

            {/* Mobile branding (visible only on small screens) */}
            <div className="mb-8 flex items-center gap-3 md:hidden">

              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-sky-500 text-xl font-bold text-white">
                M
              </div>

              <div>
                <h2 className="text-base font-bold text-slate-800">
                  MBBS COUNSELLING
                </h2>

                <p className="text-xs text-slate-600">
                  Administration Portal
                </p>
              </div>

            </div>

            {/* Transparent card (thin white border, background shows through) */}
            <div className="rounded-2xl border-2 border-white/90 bg-white/10 p-6 shadow-lg backdrop-blur-md sm:p-8">

              {/* Form heading */}
              <div className="mb-6">

                <div className="mb-3 inline-flex items-center rounded-full border border-sky-400 px-3 py-1 text-xs font-bold tracking-wide text-sky-700">
                  {forgotPassword ? "ACCOUNT RECOVERY" : "ADMIN PORTAL"}
                </div>

                <h1 className="text-3xl font-semibold text-slate-800">
                  {forgotPassword
                    ? otpVerified
                      ? "Create new password"
                      : forgotOTP
                        ? "Verify your email"
                        : "Forgot password?"
                    : "Welcome back!"}
                </h1>

                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {forgotPassword
                    ? otpVerified
                      ? "Create a strong new password for your account."
                      : forgotOTP
                        ? "Enter the verification code sent to your email."
                        : "Enter your registered email to receive an OTP."
                    : "Enter your credentials to access your dashboard."}
                </p>

              </div>

              {/* Login form */}
              {!forgotPassword && (

                <form onSubmit={handleSubmit} className="space-y-5">

                  {/* Email input */}
                  <div>
                    <label className={labelStyle}>
                      Email Address
                    </label>

                    <input
                      type="email"
                      placeholder="name@example.com"
                      className={inputStyle}
                      value={login.email}
                      onChange={(e) =>
                        setLogin({
                          ...login,
                          email: e.target.value,
                        })
                      }
                      autoComplete="email"
                      required
                    />
                  </div>

                  {/* Password input */}
                  <div>
                    <label className={labelStyle}>
                      Password
                    </label>

                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        className={`${inputStyle} pr-14`}
                        value={login.password}
                        onChange={(e) =>
                          setLogin({
                            ...login,
                            password: e.target.value,
                          })
                        }
                        autoComplete="current-password"
                        required
                      />

                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-1 top-1/2 -translate-y-1/2 text-xs font-semibold text-sky-700 hover:text-sky-900"
                      >
                        {showPassword ? "Hide" : "Show"}
                      </button>
                    </div>
                  </div>

                  {/* Forgot password link */}
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => setForgotPassword(true)}
                      className="text-sm font-semibold text-sky-700 hover:text-sky-900"
                    >
                      Forgot Password?
                    </button>
                  </div>

                  {/* Login button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className={buttonStyle}
                  >
                    {loading ? (
                      <>
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-400 border-t-slate-800" />
                        Signing In...
                      </>
                    ) : (
                      <>
                        Sign In
                        <span>→</span>
                      </>
                    )}
                  </button>

                  <p className="pt-1 text-center text-xs leading-6 text-slate-600">
                    Authorized access only. Keep your credentials secure.
                  </p>

                </form>

              )}

              {/* Forgot password form */}
              {forgotPassword && (

                <div className="space-y-5">

                  {/* Registered email input */}
                  <div>
                    <label className={labelStyle}>
                      Registered Email Address
                    </label>

                    <input
                      type="email"
                      placeholder="name@example.com"
                      className={inputStyle}
                      value={login.email}
                      onChange={(e) =>
                        setLogin({
                          ...login,
                          email: e.target.value,
                        })
                      }
                      disabled={forgotOTP}
                      autoComplete="email"
                      required
                    />
                  </div>

                  {/* Send OTP button */}
                  {!forgotOTP && (
                    <button
                      type="button"
                      onClick={handleForgotPassword}
                      disabled={otpLoading}
                      className={buttonStyle}
                    >
                      {otpLoading ? "Sending OTP..." : "Send Verification OTP"}
                    </button>
                  )}

                  {/* OTP verification section */}
                  {forgotOTP && !otpVerified && (

                    <div className="space-y-4">

                      <div>
                        <label className={labelStyle}>
                          Verification OTP
                        </label>

                        <input
                          type="text"
                          placeholder="Enter OTP"
                          className={inputStyle}
                          value={forgotOTPValue}
                          onChange={(e) =>
                            setForgotOTPValue(e.target.value)
                          }
                          autoComplete="one-time-code"
                          required
                        />
                      </div>

                      <button
                        type="button"
                        onClick={handleVerifyForgotOTP}
                        disabled={otpLoading}
                        className={buttonStyle}
                      >
                        {otpLoading ? "Verifying..." : "Verify OTP"}
                      </button>

                    </div>

                  )}

                  {/* New password section */}
                  {otpVerified && (

                    <div className="space-y-4">

                      <div>
                        <label className={labelStyle}>
                          New Password
                        </label>

                        <div className="relative">
                          <input
                            type={showNewPassword ? "text" : "password"}
                            placeholder="Enter new password"
                            className={`${inputStyle} pr-14`}
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            autoComplete="new-password"
                            required
                          />

                          <button
                            type="button"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                            className="absolute right-1 top-1/2 -translate-y-1/2 text-xs font-semibold text-sky-700 hover:text-sky-900"
                          >
                            {showNewPassword ? "Hide" : "Show"}
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className={labelStyle}>
                          Confirm Password
                        </label>

                        <div className="relative">
                          <input
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder="Confirm new password"
                            className={`${inputStyle} pr-14`}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            autoComplete="new-password"
                            required
                          />

                          <button
                            type="button"
                            onClick={() =>
                              setShowConfirmPassword(!showConfirmPassword)
                            }
                            className="absolute right-1 top-1/2 -translate-y-1/2 text-xs font-semibold text-sky-700 hover:text-sky-900"
                          >
                            {showConfirmPassword ? "Hide" : "Show"}
                          </button>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={handleResetPassword}
                        disabled={resetLoading}
                        className={buttonStyle}
                      >
                        {resetLoading ? "Updating Password..." : "Reset Password"}
                      </button>

                    </div>

                  )}

                  {/* Back to login button */}
                  <button
                    type="button"
                    onClick={handleBackToLogin}
                    className="flex w-full items-center justify-center gap-2 rounded-lg border border-slate-400 bg-transparent px-5 py-3 text-sm font-semibold text-slate-700 hover:border-sky-600 hover:text-sky-800"
                  >
                    <span>←</span>
                    Back to Login
                  </button>

                </div>

              )}

              {/* Form footer */}
              <div className="mt-6 border-t border-white/70 pt-4 text-center">
                <p className="text-xs text-slate-600">
                  MBBS Counselling
                  <span className="mx-2 text-sky-600">•</span>
                  Admin Panel
                </p>
              </div>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
};

export default Login;