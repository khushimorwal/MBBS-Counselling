"use client";

import { useState } from "react";
import {
  FiBell,
  FiInfo,
  FiCheckCircle,
  FiAlertCircle,
  FiCalendar,
  FiCheck,
  FiTrash2,
  FiFilter,
} from "react-icons/fi";

const initialNotifications = [
  {
    id: 1,
    title: "Choice Filling Started",
    message: "You can now fill your college preferences for Round 1.",
    category: "Important",
    date: "20 Oct 2026",
    time: "11:30 AM",
    read: false,
    icon: <FiAlertCircle />,
    color: "red",
  },
  {
    id: 2,
    title: "Document Verified",
    message: "Your 10th Marksheet has been successfully verified.",
    category: "Updates",
    date: "19 Oct 2026",
    time: "05:20 PM",
    read: false,
    icon: <FiCheckCircle />,
    color: "blue",
  },
  {
    id: 3,
    title: "Application Confirmed",
    message: "Your application has been successfully submitted.",
    category: "Important",
    date: "18 Oct 2026",
    time: "10:15 AM",
    read: true,
    icon: <FiCheckCircle />,
    color: "green",
  },
  {
    id: 4,
    title: "Counselling Schedule",
    message: "Counselling dates will be announced soon.",
    category: "General",
    date: "16 Oct 2026",
    time: "09:00 AM",
    read: true,
    icon: <FiCalendar />,
    color: "purple",
  },
  {
    id: 5,
    title: "Welcome to MBBS Counselling",
    message: "Your student account is ready. Complete your profile to continue.",
    category: "Updates",
    date: "15 Oct 2026",
    time: "12:00 PM",
    read: true,
    icon: <FiInfo />,
    color: "teal",
  },
];

export default function Notification() {
  const [notifications, setNotifications] = useState(initialNotifications);
  const [activeTab, setActiveTab] = useState("All");

  const tabs = ["All", "Important", "Updates", "General"];

  const filteredNotifications = notifications.filter((item) =>
    activeTab === "All" ? true : item.category === activeTab
  );

  const unreadCount = notifications.filter((item) => !item.read).length;

  const markAsRead = (id) => {
    setNotifications((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, read: true } : item
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) =>
      prev.map((item) => ({ ...item, read: true }))
    );
  };

  const deleteNotification = (id) => {
    setNotifications((prev) =>
      prev.filter((item) => item.id !== id)
    );
  };

  const colorStyles = {
    red: "bg-red-50 text-red-600",
    blue: "bg-blue-50 text-blue-600",
    green: "bg-green-50 text-green-600",
    purple: "bg-purple-50 text-purple-600",
    teal: "bg-teal-50 text-teal-600",
  };

  return (
    <div className="min-h-screen space-y-7 bg-[#f8fafc] p-4 sm:p-6 lg:p-8">

      {/* HEADER */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-[#142653]">
              Notifications
            </h1>
            {unreadCount > 0 && (
              <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-bold text-red-600">
                {unreadCount} New
              </span>
            )}
          </div>

          <p className="mt-1 text-sm text-slate-500">
            Stay updated with your latest counselling information.
          </p>
        </div>

        <button
          onClick={markAllAsRead}
          className="flex items-center justify-center gap-2 rounded-xl border border-teal-200 bg-white px-4 py-3 text-sm font-semibold text-teal-700 transition hover:bg-teal-50"
        >
          <FiCheck />
          Mark All as Read
        </button>
      </div>

      {/* SUMMARY */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <SummaryCard
          title="Total Notifications"
          value={notifications.length}
          icon={<FiBell />}
          color="bg-blue-50 text-blue-600"
        />

        <SummaryCard
          title="Unread"
          value={unreadCount}
          icon={<FiAlertCircle />}
          color="bg-red-50 text-red-600"
        />

        <SummaryCard
          title="Read"
          value={notifications.length - unreadCount}
          icon={<FiCheckCircle />}
          color="bg-green-50 text-green-600"
        />
      </div>

      {/* NOTIFICATIONS LIST */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

        <div className="flex flex-col justify-between gap-4 border-b border-slate-100 p-5 sm:flex-row sm:items-center">

          <div>
            <h2 className="text-lg font-bold text-[#142653]">
              All Notifications
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Your latest updates and announcements.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`rounded-lg px-4 py-2 text-xs font-semibold transition ${
                  activeTab === tab
                    ? "bg-teal-600 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {tab}
                {tab === "All"
                  ? ` (${notifications.length})`
                  : ` (${notifications.filter((n) => n.category === tab).length})`}
              </button>
            ))}
          </div>
        </div>

        <div className="divide-y divide-slate-100">

          {filteredNotifications.length === 0 ? (
            <div className="py-16 text-center">
              <FiBell className="mx-auto mb-3 text-4xl text-slate-300" />
              <p className="font-semibold text-slate-600">
                No notifications found
              </p>
            </div>
          ) : (
            filteredNotifications.map((item) => (
              <div
                key={item.id}
                className={`flex flex-col justify-between gap-4 p-5 transition hover:bg-slate-50 sm:flex-row sm:items-center ${
                  !item.read ? "bg-teal-50/30" : ""
                }`}
              >
                <div className="flex gap-4">

                  <div
                    className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-xl ${colorStyles[item.color]}`}
                  >
                    {item.icon}
                  </div>

                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-sm font-bold text-slate-800">
                        {item.title}
                      </h3>

                      {!item.read && (
                        <span className="h-2 w-2 rounded-full bg-teal-600" />
                      )}
                    </div>

                    <p className="mt-1 text-sm text-slate-500">
                      {item.message}
                    </p>

                    <p className="mt-2 text-xs text-slate-400">
                      {item.date} · {item.time}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 pl-16 sm:pl-0">
                  {!item.read && (
                    <button
                      onClick={() => markAsRead(item.id)}
                      title="Mark as Read"
                      className="text-teal-600 hover:text-teal-800"
                    >
                      <FiCheck size={18} />
                    </button>
                  )}

                  <button
                    onClick={() => deleteNotification(item.id)}
                    title="Delete"
                    className="text-red-400 hover:text-red-600"
                  >
                    <FiTrash2 size={18} />
                  </button>
                </div>
              </div>
            ))
          )}

        </div>
      </div>
    </div>
  );
}

function SummaryCard({ title, value, icon, color }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <h3 className="mt-2 text-2xl font-bold text-[#142653]">
            {value}
          </h3>
        </div>

        <div className={`flex h-12 w-12 items-center justify-center rounded-xl text-xl ${color}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}