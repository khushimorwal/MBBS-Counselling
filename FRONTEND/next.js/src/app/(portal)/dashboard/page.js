"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "react-toastify";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { getErrorMessage } from "@/lib/errors";
import { profileCompleteness } from "@/lib/profile";

export default function DashboardPage() {
  const { user } = useAuth();
  const [percent, setPercent] = useState(null);

  useEffect(() => {
    api
      .get("/student-profile")
      .then(({ data }) => setPercent(profileCompleteness(data.profile)))
      .catch((err) => toast.error(getErrorMessage(err)));
  }, []);

  return (
    <div>
      <h1 className="mb-2 font-display text-3xl font-bold">Welcome, {user?.name}</h1>
      <p className="mb-6 text-muted">Complete your profile to get started.</p>

      <div className="rounded-2xl border border-line bg-white p-6">
        <div className="mb-2 flex justify-between text-sm">
          <span>Profile completeness</span>
          <span>{percent === null ? "..." : `${percent}%`}</span>
        </div>
        <div className="h-2 w-full rounded bg-line">
          <div className="h-2 rounded bg-brand" style={{ width: `${percent ?? 0}%` }} />
        </div>
        <Link href="/profile" className="mt-4 inline-block text-sm font-semibold text-brand">
          {percent === 100 ? "View profile" : "Complete profile"}
        </Link>
      </div>
    </div>
  );
}
