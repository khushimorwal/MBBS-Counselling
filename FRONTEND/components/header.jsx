"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import axios from "axios";

const API_URL = "http://localhost:3000";

export default function Header() {
  const router = useRouter();

  const [formModal, setFormModal] = useState("");

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [forgotEmail, setForgotEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");

  // CHECK LOGIN STATUS
  useEffect(() => {
    const token = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");

    if (token) {
      setIsLoggedIn(true);

      if (savedUser) {
        try {
          setUser(JSON.parse(savedUser));
        } catch (error) {
          console.error("User data error:", error);
        }
      }
    }
  }, []);

  // LOGIN REQUIRED POPUP EVENT
useEffect(() => {
  const openLoginPopup = () => {
    setFormModal("loginRequired");
  };

  window.addEventListener("open-login-required", openLoginPopup);

  return () => {
    window.removeEventListener("open-login-required", openLoginPopup);
  };
}, []);

  // LOGIN
  const handleLogin = async (e) => {
    e.preventDefault();

    if (!form.email.trim() || !form.password) {
      alert("Please enter email and password");
      return;
    }

    try {
      const response = await axios.post(`${API_URL}/login`, {
        email: form.email.trim(),
        password: form.password,
      });

      const data = response.data;

      if (data.token) {
        localStorage.setItem("token", data.token);
      }

      if (data.user) {
        localStorage.setItem("user", JSON.stringify(data.user));
      }

      setIsLoggedIn(true);
      setUser(data.user);
      setDropdownOpen(false);

      alert(data.message || "Login successful");

      setFormModal("");
    } catch (error) {
      console.error("Login error:", error);
      alert(error.response?.data?.message || "Login failed");
    }
  };

  // LOGOUT
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setIsLoggedIn(false);
    setUser(null);
    setDropdownOpen(false);

    alert("Logout successful");

    router.push("/");
  };

  // SIGNUP
  const handleSignup = async (e) => {
    e.preventDefault();

    if (
      !form.name.trim() ||
      !form.email.trim() ||
      !form.password ||
      !form.confirmPassword
    ) {
      alert("Please fill all fields");
      return;
    }

    if (form.password !== form.confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    try {
      const response = await axios.post(`${API_URL}/signup`, {
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
      });

      alert(response.data.message || "Signup successful");

      setForm({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
      });

      setFormModal("login");
    } catch (error) {
      console.error("Signup error:", error);

      alert(
        error.response?.data?.message ||
          "Signup failed. Please try again."
      );
    }
  };

  // SEND OTP
  const handleSendOtp = async (e) => {
    e.preventDefault();

    if (!forgotEmail.trim()) {
      alert("Please enter your registered email");
      return;
    }

    try {
      const response = await axios.post(
        `${API_URL}/forgetpassword`,
        {
          email: forgotEmail.trim(),
        }
      );

      alert(response.data.message || "OTP sent successfully");

      setOtp("");
      setFormModal("verifyOtp");
    } catch (error) {
      console.error("Send OTP error:", error);

      alert(
        error.response?.data?.message ||
          "Could not send OTP. Please try again."
      );
    }
  };

  // VERIFY OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault();

    if (!otp.trim()) {
      alert("Please enter OTP");
      return;
    }

    try {
      const response = await axios.post(
        `${API_URL}/verifyforgetotp`,
        {
          email: forgotEmail.trim(),
          otp: otp.trim(),
        }
      );

      alert(response.data.message || "OTP verified successfully");

      setFormModal("resetPassword");
    } catch (error) {
      console.error("OTP verification error:", error);

      alert(
        error.response?.data?.message ||
          "OTP verification failed"
      );
    }
  };

  // RESET PASSWORD
  const handleResetPassword = async (e) => {
    e.preventDefault();

    if (!newPassword || !confirmNewPassword) {
      alert("Please fill both password fields");
      return;
    }

    if (newPassword !== confirmNewPassword) {
      alert("Passwords do not match");
      return;
    }

    if (newPassword.length < 8) {
      alert("Password must contain at least 8 characters");
      return;
    }

    try {
      const response = await axios.post(
        `${API_URL}/resetpassword`,
        {
          email: forgotEmail.trim(),
          password: newPassword,
        }
      );

      alert(response.data.message || "Password reset successful");

      setForgotEmail("");
      setOtp("");
      setNewPassword("");
      setConfirmNewPassword("");

      setForm({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
      });

      setFormModal("login");
    } catch (error) {
      console.error("Reset password error:", error);

      alert(
        error.response?.data?.message ||
          "Password reset failed"
      );
    }
  };

  // CLOSE MODAL
  const closeModal = () => {
    setFormModal("");
    setOtp("");
  };

  // INPUT STYLE
  const inputStyle =
    "mb-4 w-full rounded-xl border border-teal-100 bg-white/80 px-4 py-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10";

  // BUTTON STYLE
  const buttonStyle =
    "w-full rounded-xl bg-teal-600 px-5 py-3 text-sm font-semibold text-white shadow-md shadow-teal-600/20 transition-all duration-300 hover:-translate-y-0.5 hover:bg-teal-700";

  const linkStyle =
    "font-semibold text-teal-600 transition hover:text-teal-800";

  const navLinks = [
    ["Home", "/"],
    ["About", "/about"],
    ["Services", "/services"],
    ["Colleges", "/college"],
    ["Courses", "/course"],
    ["Contact", "/contact"],
    ["Plans", "/plans"],
  ];
7
  return (
    <>
      {/* HEADER */}
      <header className="relative z-50 w-full px-4 pt-4 sm:px-6 lg:px-8">
        <div
          className="
            mx-auto flex max-w-7xl flex-wrap
            items-center justify-between gap-4
            rounded-full
            border border-white/50
            bg-white/35
            px-5 py-3
            shadow-[0_8px_32px_rgba(31,85,90,0.12)]
            backdrop-blur-2xl
            backdrop-saturate-150
            transition-all duration-300
            sm:px-7
          "
        >
          {/* LOGO */}
          <Link
            href="/"
            className="flex shrink-0 items-center gap-2.5"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/60 bg-white/30 text-xl font-bold text-teal-700 shadow-sm backdrop-blur-md">
              ✚
            </div>

            <div>
              <h1 className="text-base font-extrabold leading-tight text-slate-800 sm:text-lg">
                MBBS{" "}
                <span className="text-teal-700">
                  Counselling
                </span>
              </h1>

              <p className="text-[10px] font-semibold tracking-wide text-slate-600 sm:text-xs">
                MEDICAL EDUCATION
              </p>
            </div>
          </Link>

          {/* NAVIGATION */}
          <nav className="order-3 flex w-full flex-wrap items-center justify-center gap-x-5 gap-y-2 border-t border-white/30 pt-3 text-xs font-semibold text-slate-700 sm:order-none sm:w-auto sm:border-0 sm:pt-0 sm:text-sm">
            {navLinks.map(([label, href]) => (
              <Link
                key={label}
                href={href}
                className="relative py-1 transition-all duration-300 hover:text-teal-700"
              >
                {label}
              </Link>
            ))}
          </nav>

          {/* LOGIN / ACCOUNT DROPDOWN */}
          <div className="relative shrink-0">

            {!isLoggedIn ? (
              <button
                type="button"
                onClick={() => setFormModal("login")}
                className="
                  rounded-full
                  border border-white/30
                  bg-gradient-to-r from-teal-500/90 to-cyan-600/90
                  px-5 py-2.5
                  text-xs font-semibold text-white
                  shadow-lg shadow-teal-700/20
                  backdrop-blur-md
                  transition-all duration-300
                  hover:-translate-y-0.5
                  hover:from-teal-600
                  hover:to-cyan-700
                  hover:shadow-xl
                  sm:px-7 sm:text-sm
                "
              >
                Login
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="
                    flex items-center gap-2
                    rounded-full
                    border border-teal-100
                    bg-white/80
                    px-4 py-2.5
                    text-sm font-semibold text-teal-800
                    shadow-md shadow-teal-700/10
                    transition-all duration-300
                    hover:bg-white
                  "
                >
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-teal-100 text-teal-700">
                    👤
                  </span>

                  <span className="max-w-[100px] truncate">
                    {user?.name || "My Account"}
                  </span>

                  <svg
                    className={`h-4 w-4 transition-transform ${
                      dropdownOpen ? "rotate-180" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="m19 9-7 7-7-7"
                    />
                  </svg>
                </button>

                {/* DROPDOWN MENU */}
                {dropdownOpen && (
                  <div className="
                    absolute right-0 top-full mt-3
                    w-52 overflow-hidden
                    rounded-2xl
                    border border-teal-100
                    bg-white
                    p-2
                    shadow-xl shadow-teal-900/10
                  ">

                    {/* STUDENT PROFILE */}
                    <Link
                      href="/student-profile"
                      onClick={() => setDropdownOpen(false)}
                      className="
                        flex items-center gap-3
                        rounded-xl px-4 py-3
                        text-sm font-semibold text-slate-700
                        transition hover:bg-teal-50 hover:text-teal-700
                      "
                    >
                      <span>👤</span>
                      Student Profile
                    </Link>

                    <div className="my-1 border-t border-slate-100" />

                    {/* LOGOUT */}
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="
                        flex w-full items-center gap-3
                        rounded-xl px-4 py-3
                        text-left text-sm font-semibold text-red-600
                        transition hover:bg-red-50
                      "
                    >
                      <span>↪</span>
                      Logout
                    </button>

                  </div>
                )}
              </>
            )}

          </div>
        </div>
      </header>

      {/* COMMON MODAL */}
      {formModal && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/30 p-4 backdrop-blur-md"
          onClick={closeModal}
        >
          <div
            className="relative max-h-[90vh] w-full max-w-md overflow-y-auto rounded-3xl border border-white/80 bg-white/90 p-6 shadow-2xl shadow-teal-900/15 backdrop-blur-2xl sm:p-8"
            onClick={(e) => e.stopPropagation()}
          >
            {/* DECORATION */}
            <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-cyan-100/60 blur-3xl" />

            <div className="relative">

              {/* LOGIN REQUIRED */}
{formModal === "loginRequired" && (
  <div className="text-center">
    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-teal-50 text-3xl">
      🔒
    </div>

    <h2 className="text-2xl font-bold text-slate-800">
      Login Required
    </h2>

    <p className="mt-3 text-sm leading-6 text-slate-500">
      Please login first to explore college and course details.
    </p>

    <button
      type="button"
      onClick={() => setFormModal("login")}
      className={`${buttonStyle} mt-6`}
    >
      Login Now
    </button>

    <button
      type="button"
      onClick={closeModal}
      className="mt-3 w-full rounded-xl border border-slate-200 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
    >
      Cancel
    </button>
  </div>
)}

              {/* LOGIN */}
              {formModal === "login" && (
                <>
                  <div className="mb-6 text-center">
                    <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-50 text-2xl text-teal-600">
                      ✦
                    </div>

                    <h2 className="text-2xl font-bold text-slate-800">
                      Welcome Back!
                    </h2>

                    <p className="mt-2 text-sm text-slate-500">
                      Login to continue your journey.
                    </p>
                  </div>

                  <form onSubmit={handleLogin}>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Email Address
                    </label>

                    <input
                      type="email"
                      placeholder="Enter your email"
                      value={form.email}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          email: e.target.value,
                        })
                      }
                      className={inputStyle}
                    />

                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Password
                    </label>

                    <input
                      type="password"
                      placeholder="Enter your password"
                      value={form.password}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          password: e.target.value,
                        })
                      }
                      className={inputStyle}
                    />

                    <button type="submit" className={buttonStyle}>
                      Login to Account
                    </button>
                  </form>

                  <p className="mt-5 text-center text-sm text-slate-500">
                    Don't have an account?{" "}
                    <button
                      type="button"
                      onClick={() => setFormModal("signup")}
                      className={linkStyle}
                    >
                      Sign Up
                    </button>
                  </p>

                  <p className="mt-3 text-center text-sm">
                    <button
                      type="button"
                      onClick={() => {
                        setForgotEmail(form.email);
                        setFormModal("forget");
                      }}
                      className={linkStyle}
                    >
                      Forgot Password?
                    </button>
                  </p>
                </>
              )}

              {/* SIGNUP */}
              {formModal === "signup" && (
                <>
                  <div className="mb-6 text-center">
                    <h2 className="text-2xl font-bold text-slate-800">
                      Create Account
                    </h2>

                    <p className="mt-2 text-sm text-slate-500">
                      Join us and explore your opportunities.
                    </p>
                  </div>

                  <form onSubmit={handleSignup}>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Full Name
                    </label>

                    <input
                      type="text"
                      placeholder="Enter your full name"
                      value={form.name}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          name: e.target.value,
                        })
                      }
                      className={inputStyle}
                    />

                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Email Address
                    </label>

                    <input
                      type="email"
                      placeholder="Enter your email"
                      value={form.email}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          email: e.target.value,
                        })
                      }
                      className={inputStyle}
                    />

                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Password
                    </label>

                    <input
                      type="password"
                      placeholder="Enter your password"
                      value={form.password}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          password: e.target.value,
                        })
                      }
                      className={inputStyle}
                    />

                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Confirm Password
                    </label>

                    <input
                      type="password"
                      placeholder="Confirm your password"
                      value={form.confirmPassword}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          confirmPassword: e.target.value,
                        })
                      }
                      className={inputStyle}
                    />

                    <button type="submit" className={buttonStyle}>
                      Create Account
                    </button>
                  </form>

                  <p className="mt-5 text-center text-sm text-slate-500">
                    Already have an account?{" "}
                    <button
                      type="button"
                      onClick={() => setFormModal("login")}
                      className={linkStyle}
                    >
                      Login
                    </button>
                  </p>
                </>
              )}

              {/* FORGOT PASSWORD */}
              {formModal === "forget" && (
                <>
                  <div className="mb-6 text-center">
                    <h2 className="text-2xl font-bold text-slate-800">
                      Forgot Password?
                    </h2>

                    <p className="mt-2 text-sm leading-6 text-slate-500">
                      Enter your registered email address. We will send you
                      an OTP to reset your password.
                    </p>
                  </div>

                  <form onSubmit={handleSendOtp}>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Registered Email
                    </label>

                    <input
                      type="email"
                      placeholder="Enter your registered email"
                      value={forgotEmail}
                      onChange={(e) =>
                        setForgotEmail(e.target.value)
                      }
                      className={inputStyle}
                    />

                    <button type="submit" className={buttonStyle}>
                      Send OTP
                    </button>
                  </form>

                  <p className="mt-5 text-center text-sm text-slate-500">
                    Remember your password?{" "}
                    <button
                      type="button"
                      onClick={() => setFormModal("login")}
                      className={linkStyle}
                    >
                      Login
                    </button>
                  </p>
                </>
              )}

              {/* VERIFY OTP */}
              {formModal === "verifyOtp" && (
                <>
                  <div className="mb-6 text-center">
                    <h2 className="text-2xl font-bold text-slate-800">
                      Verify OTP
                    </h2>

                    <p className="mt-2 text-sm text-slate-500">
                      Enter the OTP sent to your registered email.
                    </p>
                  </div>

                  <form onSubmit={handleVerifyOtp}>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      One Time Password
                    </label>

                    <input
                      type="text"
                      placeholder="Enter OTP"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      className={inputStyle}
                    />

                    <button type="submit" className={buttonStyle}>
                      Verify OTP
                    </button>
                  </form>

                  <button
                    type="button"
                    onClick={() => setFormModal("forget")}
                    className="mt-5 text-sm font-semibold text-teal-600 hover:text-teal-800"
                  >
                    Change Email Address
                  </button>
                </>
              )}

              {/* RESET PASSWORD */}
              {formModal === "resetPassword" && (
                <>
                  <div className="mb-6 text-center">
                    <h2 className="text-2xl font-bold text-slate-800">
                      Reset Password
                    </h2>

                    <p className="mt-2 text-sm text-slate-500">
                      Create a new password for your account.
                    </p>
                  </div>

                  <form onSubmit={handleResetPassword}>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      New Password
                    </label>

                    <input
                      type="password"
                      placeholder="Enter new password"
                      value={newPassword}
                      onChange={(e) =>
                        setNewPassword(e.target.value)
                      }
                      className={inputStyle}
                    />

                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Confirm New Password
                    </label>

                    <input
                      type="password"
                      placeholder="Confirm new password"
                      value={confirmNewPassword}
                      onChange={(e) =>
                        setConfirmNewPassword(e.target.value)
                      }
                      className={inputStyle}
                    />

                    <button type="submit" className={buttonStyle}>
                      Reset Password
                    </button>
                  </form>
                </>
              )}

              {/* CLOSE */}
              <button
                type="button"
                onClick={closeModal}
                className="mt-6 w-full rounded-xl border border-slate-200 bg-white/70 py-2.5 text-sm font-semibold text-slate-500 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-500"
              >
                Close
              </button>

            </div>
          </div>
        </div>
      )}
    </>
  );
}