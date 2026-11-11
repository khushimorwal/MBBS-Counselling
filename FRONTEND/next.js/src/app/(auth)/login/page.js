"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { useAuth } from "@/context/AuthContext";
import { getErrorMessage } from "@/lib/errors";
import { isEmail } from "@/lib/validators";
import FormField from "@/components/FormField";
import Button from "@/components/Button";

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    const next = {};
    if (!isEmail(form.email)) next.email = "Enter a valid email";
    if (!form.password) next.password = "Password is required";
    setErrors(next);
    if (Object.keys(next).length) return;

    setLoading(true);
    try {
      await login(form.email.trim(), form.password);
      router.replace("/dashboard");
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmit} noValidate>
      <h1 className="mb-6 font-display text-2xl font-bold">Student Login</h1>
      <FormField label="Email" name="email" type="email" value={form.email} onChange={onChange} error={errors.email} />
      <FormField label="Password" name="password" type="password" value={form.password} onChange={onChange} error={errors.password} />
      <Button type="submit" loading={loading}>Login</Button>
      <div className="mt-4 flex justify-between text-sm">
        <Link href="/forgot-password" className="font-semibold text-brand">Forgot password?</Link>
        <Link href="/signup" className="font-semibold text-brand">Create account</Link>
      </div>
    </form>
  );
}
