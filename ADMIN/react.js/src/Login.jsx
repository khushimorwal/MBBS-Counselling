
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Login = () => {
  const navigate = useNavigate();

  const [login, setLogin] = useState({
    email: "",
    password: "",
  });

  const [forgotPassword, setForgotPassword] = useState(false);
  const [forgotOTP, setForgotOTP] = useState(false);
  const [forgotOTPValue, setForgotOTPValue] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [otpVerified, setOtpVerified] = useState(false);

  // ================= LOGIN =================

  const handleSubmit = async (e) => {
    e.preventDefault();

    const email = login.email.trim();
    const password = login.password;

    if (!email || !password) {
      alert("Email and password are required");
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:3000/login",
        {
          email,
          password,
        }
      );

      const data = response.data;

      if (data.success && data.token) {
        // Save token
        localStorage.setItem("token", data.token);

        // Save role
        localStorage.setItem("role", data.user.role);

        // Save permissions
        localStorage.setItem(
          "permissions",
          JSON.stringify(data.user.permissions || {})
        );

        // Save complete user data
        localStorage.setItem(
          "user",
          JSON.stringify(data.user)
        );

        alert(data.message || "Login successful");

        navigate("/dash");
      } else {
        alert(
          data.message ||
            "Login failed. Please check your credentials."
        );
      }
    } catch (error) {
      console.error(
        "Login error:",
        error.response?.data || error.message
      );

      if (error.response?.status === 401) {
        alert(
          error.response?.data?.message ||
            "Invalid email or password. Please try again."
        );
      } else if (error.response?.status === 404) {
        alert(
          "Login API not found. Please check the backend route."
        );
      } else if (error.response) {
        alert(
          error.response.data?.message ||
            `Login failed. Server returned ${error.response.status}.`
        );
      } else {
        alert(
          "Cannot connect to the server. Please check if the backend is running."
        );
      }
    }
  };

  // ================= FORGOT PASSWORD =================

  const handleForgotPassword = async () => {
    try {
      if (!login.email) {
        return alert("Please enter your email");
      }

      const response = await axios.post(
        "http://localhost:3000/forgotpassword",
        {
          email: login.email,
        }
      );

      const data = response.data;

      alert(data.message);

      if (data.success) {
        setForgotOTP(true);
      }
    } catch (error) {
      console.error("Forgot password error:", error);
      alert(
        error.response?.data?.message ||
          "Unable to connect to the server"
      );
    }
  };

  // ================= VERIFY OTP =================

  const handleVerifyForgotOTP = async () => {
    try {
      const response = await axios.post(
        "http://localhost:3000/verifyforgototp",
        {
          email: login.email,
          otp: forgotOTPValue,
        }
      );

      const data = response.data;

      alert(data.message);

      if (data.success) {
        setOtpVerified(true);
      }
    } catch (error) {
      console.error("OTP verification error:", error);

      alert(
        error.response?.data?.message ||
          "Unable to connect to the server"
      );
    }
  };

  // ================= RESET PASSWORD =================

  const handleResetPassword = async () => {
    if (newPassword !== confirmPassword) {
      return alert("Passwords do not match");
    }

    try {
      const response = await axios.post(
        "http://localhost:3000/resetpassword",
        {
          email: login.email,
          password: newPassword,
        }
      );

      const data = response.data;

      alert(data.message);

      if (data.success) {
        setForgotPassword(false);
        setForgotOTP(false);
        setForgotOTPValue("");
        setOtpVerified(false);
        setNewPassword("");
        setConfirmPassword("");
        setLogin({
          email: "",
          password: "",
        });
      }
    } catch (error) {
      console.error("Password reset error:", error);

      alert(
        error.response?.data?.message ||
          "Unable to connect to the server"
      );
    }
  };

  const inputStyle =
    "w-full rounded-xl border border-line bg-surface px-4 py-3.5 text-sm text-brand-dark outline-none transition placeholder:text-gray-400 focus:border-brand focus:ring-2 focus:ring-brand/15";

  const buttonStyle =
    "w-full rounded-xl bg-accent px-4 py-3.5 text-sm font-bold text-white transition hover:bg-[#cf4a24] active:scale-[0.99]";

  return (
    <div className="min-h-screen bg-white">
      <div className="grid min-h-screen w-full md:grid-cols-[5fr_6fr]">

        {/* Left section */}
        <div className="relative hidden flex-col justify-between overflow-hidden bg-brand-dark p-10 text-white md:flex lg:p-16">
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full border border-white/10" />
          <div className="absolute -bottom-24 -left-20 h-72 w-72 rounded-full bg-white/5" />
          <div className="absolute bottom-24 right-10 h-28 w-28 rounded-full border border-accent/60" />

          <div className="relative z-10">
            <div className="mb-12 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent text-lg font-bold text-white">
                ✚
              </div>

              <div>
                <h2 className="text-lg font-bold tracking-wide">
                  MBBS COUNSELLING
                </h2>

                <p className="text-xs text-white/65">
                  Administration Portal
                </p>
              </div>
            </div>

            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.25em] text-white/65">
              Admin Console
            </p>

            <h1 className="max-w-sm text-4xl font-bold leading-tight lg:text-5xl">
              Every seat counselled.
              <span className="text-accent"> Every student guided.</span>
            </h1>

            <p className="mt-6 max-w-sm text-sm leading-7 text-white/70">
              Manage colleges, applications, documents and counselling
              sessions from one place.
            </p>
          </div>

          <div className="relative z-10 flex items-center gap-3 border-t border-white/15 pt-6">
            <div className="h-2 w-2 rounded-full bg-accent" />

            <p className="text-xs text-white/65">
              Secure access to your administration panel
            </p>
          </div>
        </div>

        {/* Right section */}
        <div className="flex items-center justify-center px-6 py-10 sm:px-10 lg:px-14">
          <div className="w-full max-w-sm">

            <div className="mb-8 md:hidden">
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-brand text-xl font-bold text-white">
                M
              </div>

              <h2 className="text-lg font-bold text-brand">
                MBBS COUNSELLING
              </h2>

              <p className="mt-1 text-sm text-muted">
                Administration Portal
              </p>
            </div>

            <div className="mb-8">
              <div className="mb-3 inline-flex rounded-full bg-brand-soft px-3 py-1.5 text-xs font-semibold text-brand">
                {forgotPassword
                  ? "ACCOUNT RECOVERY"
                  : "ADMIN PORTAL"}
              </div>

              <h1 className="font-display text-3xl font-bold tracking-tight text-brand-dark">
                {forgotPassword
                  ? "Reset your password"
                  : "Welcome back"}
              </h1>

              <p className="mt-2 text-sm leading-6 text-muted">
                {forgotPassword
                  ? "Follow the steps below to recover your account."
                  : "Enter your credentials to access your dashboard."}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {!forgotPassword ? (
                <>
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-brand-dark">
                      Email Address
                    </label>

                    <input
                      type="email"
                      placeholder="Enter your email"
                      className={inputStyle}
                      value={login.email}
                      onChange={(e) =>
                        setLogin({
                          ...login,
                          email: e.target.value,
                        })
                      }
                      required
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-brand-dark">
                      Password
                    </label>

                    <input
                      type="password"
                      placeholder="Enter your password"
                      className={inputStyle}
                      value={login.password}
                      onChange={(e) =>
                        setLogin({
                          ...login,
                          password: e.target.value,
                        })
                      }
                      required
                    />
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => setForgotPassword(true)}
                      className="text-sm font-semibold text-brand transition hover:text-accent"
                    >
                      Forgot Password?
                    </button>
                  </div>

                  <button type="submit" className={buttonStyle}>
                    Sign In
                  </button>

                  <p className="pt-3 text-center text-xs leading-5 text-muted">
                    Authorized access only. Please keep your credentials secure.
                  </p>
                </>
              ) : (
                <>
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-brand-dark">
                      Email Address
                    </label>

                    <input
                      type="email"
                      placeholder="Enter your email"
                      className={inputStyle}
                      value={login.email}
                      onChange={(e) =>
                        setLogin({
                          ...login,
                          email: e.target.value,
                        })
                      }
                      required
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleForgotPassword}
                    className={buttonStyle}
                  >
                    Send OTP
                  </button>

                  {forgotOTP && (
                    <div className="space-y-4">
                      <div>
                        <label className="mb-2 block text-sm font-semibold text-brand-dark">
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
                          required
                        />
                      </div>

                      <button
                        type="button"
                        onClick={handleVerifyForgotOTP}
                        className={buttonStyle}
                      >
                        Verify OTP
                      </button>
                    </div>
                  )}

                  {otpVerified && (
                    <div className="space-y-4">
                      <div>
                        <label className="mb-2 block text-sm font-semibold text-brand-dark">
                          New Password
                        </label>

                        <input
                          type="password"
                          placeholder="Enter new password"
                          className={inputStyle}
                          value={newPassword}
                          onChange={(e) =>
                            setNewPassword(e.target.value)
                          }
                          required
                        />
                      </div>

                      <div>
                        <label className="mb-2 block text-sm font-semibold text-brand-dark">
                          Confirm Password
                        </label>

                        <input
                          type="password"
                          placeholder="Confirm new password"
                          className={inputStyle}
                          value={confirmPassword}
                          onChange={(e) =>
                            setConfirmPassword(e.target.value)
                          }
                          required
                        />
                      </div>

                      <button
                        type="button"
                        onClick={handleResetPassword}
                        className={buttonStyle}
                      >
                        Reset Password
                      </button>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      setForgotPassword(false);
                      setForgotOTP(false);
                      setForgotOTPValue("");
                      setOtpVerified(false);
                      setNewPassword("");
                      setConfirmPassword("");
                    }}
                    className="w-full rounded-xl border border-line px-4 py-3 text-sm font-semibold text-brand transition hover:bg-brand-soft"
                  >
                    Back to Login
                  </button>
                </>
              )}
            </form>

            <div className="mt-8 border-t border-line pt-5 text-center">
              <p className="text-xs text-muted">
                MBBS Counselling
                <span className="mx-1 text-accent">•</span>
                Admin Panel
              </p>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;

