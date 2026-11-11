"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const onLogout = () => {
    logout();
    router.replace("/login");
  };

  return (
    <nav className="flex items-center justify-between border-b border-line bg-white px-6 py-3">
      <div className="flex items-center gap-6">
        <span className="font-display font-bold text-brand">MBBS Counselling</span>
        <Link href="/dashboard" className="text-sm font-medium hover:text-brand">Dashboard</Link>
        <Link href="/profile" className="text-sm font-medium hover:text-brand">Profile</Link>
      </div>
      <div className="flex items-center gap-4 text-sm">
        <span>{user?.name}</span>
        <button onClick={onLogout} className="rounded-xl border border-line px-3 py-1.5 font-medium hover:bg-surface">
          Logout
        </button>
      </div>
    </nav>
  );
}
