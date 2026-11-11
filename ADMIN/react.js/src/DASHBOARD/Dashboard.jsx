import { useState } from "react";

import Header from "../COMPONENTS/Header";
import Sidebar from "../COMPONENTS/Sidebar";
import Footer from "../COMPONENTS/Footer";

import Student from "./Student";
import Colleges from "./Colleges";
import University from "./University";
import RolePermissions from "./RolePermissions";
import Stream from "./Stream";
import Degree from "./Degree";
import Course from "./Course";
import Specialization from "./Specialization";
import EmailTemplate from "./EmailTemplate";
import Setting from "./Setting";
import ContactInquiries from "./ContactInquiries";
import CollegeApplication from "./CollegeApplication";
import DocumentVerification from "./DocumentVerification";
import CounsellingDashboard from "./COUNSELLING/CounsellingDashboard";
import CounsellingRequests from "./COUNSELLING/CounsellingRequests";
import CounsellorAssignments from "./COUNSELLING/CounsellorAssignments";
import Appointments from "./COUNSELLING/Appointments";
import CounsellingSessions from "./COUNSELLING/CounsellingSessions";
import CounsellingNotes from "./COUNSELLING/CounsellingNotes";
import FollowUps from "./COUNSELLING/FollowUps";

const iconProps = {
  width: 25,
  height: 25,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": true,
};

function Dashboard() {
  const [activePage, setActivePage] = useState("Dashboard");
  const [search, setSearch] = useState("");

    const user = JSON.parse(localStorage.getItem("user"));

  const cards = [
    {
      title: "Total Students",
      count: "—",
      note: "Registered student records",
      color: "bg-brand-soft text-brand",
      icon: (
        <svg {...iconProps}>
          <circle cx="9" cy="8" r="4" />
          <path d="M2 21c1-4 4-6 7-6s6 2 7 6M17 11a3 3 0 1 0 0-6M22 21c-.5-2.5-2-4.2-4-5" />
        </svg>
      ),
    },
    {
      title: "Medical Colleges",
      count: "—",
      note: "Colleges in the directory",
      color: "bg-emerald-50 text-emerald-700",
      icon: (
        <svg {...iconProps}>
          <path d="M4 21V7l8-4 8 4v14M2 21h20M9 21v-5h6v5M8 10h1M15 10h1M8 13h1M15 13h1" />
        </svg>
      ),
    },
    {
      title: "Universities",
      count: "—",
      note: "Universities registered",
      color: "bg-sky-50 text-sky-700",
      icon: (
        <svg {...iconProps}>
          <path d="m3 9 9-5 9 5-9 5z" />
          <path d="M5 11v7M9 13v5M15 13v5M19 11v7M3 21h18" />
        </svg>
      ),
    },
    {
      title: "Counselling Status",
      count: "Manage",
      note: "Review records and updates",
      color: "bg-orange-50 text-accent",
      icon: (
        <svg {...iconProps}>
          <circle cx="12" cy="12" r="9" />
          <path d="M12 7v5l3 2" />
        </svg>
      ),
    },
  ];

  const quickActions = [
    ["Students", "Manage student records"],
    ["Colleges", "Maintain medical college details"],
    ["University", "Manage university information"],
    ["Role & Permissions", "Control access and permissions"],
  ];

  const renderContent = () => {
    if (activePage === "Dashboard") {
      return (
        <div className="mx-auto w-full max-w-[1500px]">

          {/* Page heading */}
          <div className="mb-6">
            <h1 className="font-display text-3xl font-bold tracking-tight text-brand-dark sm:text-4xl">
              Welcome, {user?.name || "Admin"}
            </h1>

            <p className="mt-2 text-sm text-muted sm:text-base">
              {new Date().toLocaleDateString("en-IN", {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
          </div>

          {/* Counselling desk */}
          <section className="relative mb-6 overflow-hidden rounded-2xl bg-brand p-6 text-white sm:p-7">
            <div className="absolute -right-16 -top-28 h-80 w-80 rounded-full border border-white/10" />

            <div className="relative flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#8FC9BF]">
                  Counselling desk
                </p>

                <h2 className="mt-1 font-display text-2xl font-bold sm:text-3xl">
                  Sessions, follow-ups and new requests
                </h2>

                <p className="mt-1 text-sm text-[#B9D8D2]">
                  Jump straight into today&apos;s counselling work.
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                {[
                  ["Counselling Requests", "New requests"],
                  ["Appointments", "Appointments"],
                  ["Follow-ups", "Follow-ups"],
                ].map(([page, label]) => (
                  <button
                    key={page}
                    type="button"
                    onClick={() => setActivePage(page)}
                    className="rounded-xl bg-white/15 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/25"
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* Dashboard search */}
          <div className="mb-6 rounded-2xl border border-line bg-white p-3 sm:p-4">
            <label
              htmlFor="dashboard-search"
              className="mb-2 block text-xs font-semibold text-muted"
            >
              Quick Search
            </label>

            <input
              id="dashboard-search"
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search dashboard sections..."
              className="w-full rounded-xl border border-line bg-surface px-4 py-3 text-sm text-brand-dark outline-none placeholder:text-muted/70 focus:border-brand sm:max-w-lg"
            />

            {search.trim() && (
              <div className="mt-2 flex flex-wrap gap-2">
                {quickActions
                  .filter(([title, desc]) =>
                    `${title} ${desc}`
                      .toLowerCase()
                      .includes(search.toLowerCase())
                  )
                  .map(([title]) => (
                    <button
                      key={title}
                      type="button"
                      onClick={() => {
                        setActivePage(title);
                        setSearch("");
                      }}
                      className="rounded-lg bg-brand-soft px-3 py-2 text-sm font-medium text-brand hover:bg-brand/10"
                    >
                      Open {title}
                    </button>
                  ))}

                {!quickActions.some(([title, desc]) =>
                  `${title} ${desc}`
                    .toLowerCase()
                    .includes(search.toLowerCase())
                ) && (
                  <p className="px-1 py-2 text-sm text-muted">
                    No matching dashboard sections.
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-1 rounded-2xl border border-line bg-white py-5 sm:grid-cols-2 xl:grid-cols-4">
            {cards.map((card, i) => (
              <div
                key={card.title}
                className={`flex items-start justify-between gap-3 px-6 py-2 ${
                  i > 0 ? "xl:border-l xl:border-line" : ""
                }`}
              >
                <div>
                  <p className="text-sm font-medium text-muted">
                    {card.title}
                  </p>

                  <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-brand-dark">
                    {card.count}
                  </h2>

                  <p className="mt-1 text-xs font-medium text-brand">
                    {card.note}
                  </p>
                </div>

                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${card.color}`}
                >
                  {card.icon}
                </div>
              </div>
            ))}
          </div>

          {/* Welcome and Quick Access */}
          <div className="mt-6 grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">

            <section className="rounded-2xl border border-line bg-white p-5 sm:p-6">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-accent">
                Workspace
              </p>

              <h2 className="mt-2 font-display text-xl font-bold text-brand-dark sm:text-2xl">
                Manage your counselling platform
              </h2>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
                Keep student information, medical college listings,
                university details and academic course data organized
                from one place.
              </p>

              <div className="mt-5 h-1 w-14 rounded-full bg-accent" />
            </section>

            <section className="rounded-2xl border border-line bg-white p-5 sm:p-6">
              <h2 className="font-display text-lg font-bold text-brand-dark">
                Quick Access
              </h2>

              <div className="mt-3 divide-y divide-line">
                {quickActions.map(([title, desc]) => (
                  <button
                    key={title}
                    type="button"
                    onClick={() => setActivePage(title)}
                    className="flex w-full items-center justify-between gap-3 py-3 text-left"
                  >
                    <span>
                      <span className="block text-sm font-semibold text-brand-dark">
                        {title}
                      </span>

                      <span className="mt-1 block text-xs text-muted">
                        {desc}
                      </span>
                    </span>

                    <span className="text-lg text-accent" aria-hidden="true">
                      →
                    </span>
                  </button>
                ))}
              </div>
            </section>

          </div>
        </div>
      );
    }



  if (activePage === "Counselling Dashboard") {
  return <CounsellingDashboard />;
}

if (activePage === "Counselling Requests") {
  return <CounsellingRequests />;
}

if (activePage === "Counsellor Assignments") {
  return <CounsellorAssignments />;
}

if (activePage === "Appointments") {
  return <Appointments />;
}

if (activePage === "Counselling Sessions") {
  return <CounsellingSessions />;
}

if (activePage === "Counselling Notes") {
  return <CounsellingNotes />;
}

if (activePage === "Follow-ups") {
  return <FollowUps />;
}


if (activePage === "Students") return <Student />;
if (activePage === "Colleges") return <Colleges />;
if (activePage === "University") return <University />;
if (activePage === "Role & Permissions") return <RolePermissions />;
if (activePage === "Stream") return <Stream />;
if (activePage === "Degree") return <Degree />;
if (activePage === "Course") return <Course />;
if (activePage === "Specialization") return <Specialization />;
if (activePage === "Email Template") return <EmailTemplate />;
if (activePage === "Settings") return <Setting />;
if (activePage === "Contact Inquiries") return <ContactInquiries />;
if (activePage === "College Applications") {
  return <CollegeApplication />;
}
if (activePage === "Document Verification") {
  return <DocumentVerification />;
}


    return (
      <div className="rounded-2xl border border-line bg-white p-8">
        <h1 className="font-display text-3xl font-bold text-brand-dark">
          {activePage}
        </h1>

        <p className="mt-3 text-sm text-muted">
          Welcome to {activePage}.
        </p>
      </div>
    );
  };


  return (
  <div className="flex min-h-screen bg-surface">
    {/* Sidebar */}
    <div className="sticky top-0 h-screen shrink-0">
      <Sidebar
        activePage={activePage}
        setActivePage={setActivePage}
        user={user}
      />
    </div>

    {/* Right Side */}
    <div className="flex min-h-screen min-w-0 flex-1 flex-col">
      {/* Header */}
      <div className="shrink-0">
        <Header />
      </div>

      {/* Main Content */}
      <main className="min-w-0 flex-1 p-4 sm:p-6 lg:p-7">
        {renderContent()}
      </main>

      {/* Footer */}
      <div className="mt-auto shrink-0">
        <Footer />
      </div>
    </div>
  </div>
);
}

export default Dashboard;