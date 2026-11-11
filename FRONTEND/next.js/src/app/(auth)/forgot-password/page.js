"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { api } from "@/lib/api";
import { getErrorMessage } from "@/lib/errors";
import { isEmail, minLength } from "@/lib/validators";
import FormField from "@/components/FormField";
import Button from "@/components/Button";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const run = async (fn) => {
    setLoading(true);
    try {
      await fn();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const sendOtp = (e) => {
    e.preventDefault();
    if (!isEmail(email)) return setError("Enter a valid email");
    setError("");
    run(async () => {
      await api.post("/forgotpassword", { email: email.trim() });
      toast.success("OTP sent to your email");
      setStep(2);
    });
  };

  const verifyOtp = (e) => {
    e.preventDefault();
    if (!/^\d{6}$/.test(otp.trim())) return setError("Enter the 6-digit OTP");
    setError("");
    run(async () => {
      await api.post("/verifyforgototp", { email: email.trim(), otp: otp.trim() });
      setStep(3);
    });
  };

  const resetPassword = (e) => {
    e.preventDefault();
    if (!minLength(password, 8)) return setError("Password must be at least 8 characters");
    if (password !== confirm) return setError("Passwords do not match");
    setError("");
    run(async () => {
      await api.post("/resetpassword", { email: email.trim(), password });
      toast.success("Password reset. Please log in.");
      router.replace("/login");
    });
  };

  return (
    <div>
      <h1 className="mb-6 font-display text-2xl font-bold">Reset Password</h1>

      {step === 1 && (
        <form onSubmit={sendOtp} noValidate>
          <FormField label="Email" name="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} error={error} />
          <Button type="submit" loading={loading}>Send OTP</Button>
        </form>
      )}

      {step === 2 && (
        <form onSubmit={verifyOtp} noValidate>
          <p className="mb-4 text-sm text-muted">OTP sent to {email}. It expires in 5 minutes.</p>
          <FormField label="OTP" name="otp" inputMode="numeric" maxLength={6} value={otp} onChange={(e) => setOtp(e.target.value)} error={error} />
          <Button type="submit" loading={loading}>Verify OTP</Button>
        </form>
      )}

      {step === 3 && (
        <form onSubmit={resetPassword} noValidate>
          <FormField label="New password" name="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          <FormField label="Confirm password" name="confirm" type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} error={error} />
          <Button type="submit" loading={loading}>Reset password</Button>
        </form>
      )}

      <p className="mt-4 text-sm">
        <Link href="/login" className="font-semibold text-brand">Back to login</Link>
      </p>
    </div>
  );
}
