"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { useAuth } from "@/context/AuthContext";
import { getErrorMessage } from "@/lib/errors";
import { isEmail, minLength } from "@/lib/validators";
import FormField from "@/components/FormField";
import Button from "@/components/Button";

export default function SignupPage() {
  const { signup } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    const next = {};
    if (!form.name.trim()) next.name = "Name is required";
    if (!isEmail(form.email)) next.email = "Enter a valid email";
    if (!minLength(form.password, 8)) next.password = "Password must be at least 8 characters";
    if (form.confirm !== form.password) next.confirm = "Passwords do not match";
    setErrors(next);
    if (Object.keys(next).length) return;

    setLoading(true);
    try {
      await signup(form.name.trim(), form.email.trim(), form.password);
      toast.success("Account created. Please log in.");
      router.replace("/login");
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmit} noValidate>
      <h1 className="mb-6 font-display text-2xl font-bold">Create Account</h1>
      <FormField label="Full name" name="name" value={form.name} onChange={onChange} error={errors.name} />
      <FormField label="Email" name="email" type="email" value={form.email} onChange={onChange} error={errors.email} />
      <FormField label="Password" name="password" type="password" value={form.password} onChange={onChange} error={errors.password} />
      <FormField label="Confirm password" name="confirm" type="password" value={form.confirm} onChange={onChange} error={errors.confirm} />
      <Button type="submit" loading={loading}>Sign up</Button>
      <p className="mt-4 text-sm">
        Already registered? <Link href="/login" className="font-semibold text-brand">Login</Link>
      </p>
    </form>
  );
}
