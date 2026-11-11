import React, { useEffect, useState } from "react";
import { API } from "../../api/axios";

const statsConfig = [
  {
    key: "totalRequests",
    title: "Total Requests",
    color: "bg-blue-50 text-blue-700",
    icon: "📋",
  },
  {
    key: "newRequests",
    title: "New Requests",
    color: "bg-amber-50 text-amber-700",
    icon: "🆕",
  },
  {
    key: "assignedRequests",
    title: "Assigned Requests",
    color: "bg-purple-50 text-purple-700",
    icon: "👥",
  },
  {
    key: "inProgressRequests",
    title: "In Progress",
    color: "bg-indigo-50 text-indigo-700",
    icon: "⏳",
  },
  {
    key: "completedRequests",
    title: "Completed Requests",
    color: "bg-green-50 text-green-700",
    icon: "✅",
  },
  {
    key: "convertedRequests",
    title: "Converted Requests",
    color: "bg-teal-50 text-teal-700",
    icon: "🎯",
  },
  {
    key: "totalAssignments",
    title: "Total Assignments",
    color: "bg-pink-50 text-pink-700",
    icon: "🧑‍💼",
  },
  {
    key: "todayAppointments",
    title: "Today's Appointments",
    color: "bg-orange-50 text-orange-700",
    icon: "📅",
  },
  {
    key: "upcomingAppointments",
    title: "Upcoming Appointments",
    color: "bg-cyan-50 text-cyan-700",
    icon: "🗓️",
  },
  {
    key: "pendingFollowUps",
    title: "Pending Follow-ups",
    color: "bg-yellow-50 text-yellow-700",
    icon: "🔔",
  },
  {
    key: "overdueFollowUps",
    title: "Overdue Follow-ups",
    color: "bg-red-50 text-red-700",
    icon: "⚠️",
  },
  {
    key: "totalCounsellors",
    title: "Total Counsellors",
    color: "bg-violet-50 text-violet-700",
    icon: "👨‍🏫",
  },
];

function CounsellingDashboard() {
  const [dashboard, setDashboard] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await API.get("/counselling-dashboard/stats");

      if (response.data.success) {
        setDashboard(response.data.dashboard || {});
      } else {
        setError(
          response.data.message || "Unable to load dashboard data."
        );
      }
    } catch (err) {
      console.error("Counselling Dashboard Error:", err);

      setError(
        err.response?.data?.message ||
          "Failed to load counselling dashboard."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  return (
    <div className="mx-auto w-full max-w-[1500px]">

      {/* Heading */}
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-accent">
            MBBS COUNSELLING PORTAL
          </p>

          <h1 className="mt-2 font-display text-3xl font-bold text-brand-dark">
            Counselling Dashboard
          </h1>

          <p className="mt-2 text-sm text-muted">
            Monitor counselling requests, counsellors and appointments.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchDashboard}
          disabled={loading}
          className="rounded-xl bg-brand px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Refreshing..." : "↻ Refresh"}
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-5 flex items-center justify-between rounded-xl border border-red-200 bg-red-50 px-4 py-3">
          <p className="text-sm text-red-700">{error}</p>

          <button
            type="button"
            onClick={fetchDashboard}
            className="text-sm font-semibold text-red-700 underline"
          >
            Retry
          </button>
        </div>
      )}

      {/* Statistics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
        {statsConfig.map((item) => (
          <div
            key={item.key}
            className="rounded-2xl border border-line bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
          >
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-muted">
                {item.title}
              </p>

              <span
                className={`rounded-xl px-3 py-2 text-lg ${item.color}`}
              >
                {item.icon}
              </span>
            </div>

            <div className="mt-5">
              <h2 className="font-display text-3xl font-bold text-brand-dark">
                {loading ? (
                  <span className="inline-block h-8 w-12 animate-pulse rounded bg-gray-200" />
                ) : (
                  dashboard[item.key] ?? 0
                )}
              </h2>

              <p className="mt-2 text-xs text-muted">
                Live counselling overview
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Last Updated Information */}
      {!loading && !error && (
        <div className="mt-6 rounded-xl border border-line bg-white px-5 py-4">
          <p className="text-sm text-muted">
            Dashboard data fetched successfully.
          </p>
        </div>
      )}
    </div>
  );
}

export default CounsellingDashboard;