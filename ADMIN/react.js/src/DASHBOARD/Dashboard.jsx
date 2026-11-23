import { useState } from "react";

import Header from "../COMPONENTS/Header";
import Sidebar from "../COMPONENTS/Sidebar";
import Footer from "../COMPONENTS/Footer";
import Packages from "./Packages";

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
import FollowUps from "./COUNSELLING/FollowUps"
import Recommendation from "./COUNSELLING/Recommendation";

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

// Clean Teal Glass: soft mint page with light teal glow (cards blur this)
const backgroundStyle = {
  backgroundImage:
    "radial-gradient(circle at 8% 10%, rgba(45,212,191,0.28), transparent 35%), radial-gradient(circle at 95% 85%, rgba(103,232,249,0.25), transparent 38%)",
  backgroundColor: "#F1F8F7",
  backgroundSize: "cover",
  backgroundPosition: "center",
  backgroundAttachment: "fixed", // keeps the glow still while scrolling
};

// Clean Teal glass card: frosted white, thin white border, soft teal shadow
const glassCard =
  "rounded-2xl border border-white bg-white/65 shadow-[0_4px_24px_rgba(15,118,110,0.08)] backdrop-blur-xl";

// Primary teal button
const navyButton =
  "min-h-11 rounded-xl bg-teal-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-teal-800";

function Dashboard() {
  const [activePage, setActivePage] = useState("Dashboard");
  const [search, setSearch] = useState("");

  // Get logged-in user safely
  let user = null;

  try {
    user = JSON.parse(localStorage.getItem("user"));
  } catch {
    user = null;
  }

  const cards = [
    {
      title: "Total Students",
      count: "—",
      note: "Registered student records",
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

  const counsellingActions = [
    ["Counselling Requests", "New Requests"],
    ["Appointments", "Appointments"],
    ["Follow-ups", "Follow-ups"],
  ];

  const renderContent = () => {
    if (activePage === "Dashboard") {
      return (
        <div className="mx-auto w-full max-w-[1500px]">

          {/* Welcome Section */}
          <div className="mb-7 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div>
              <p className="text-sm font-semibold tracking-wide text-teal-700">
                ADMINISTRATOR PANEL
              </p>

              <h1 className="mt-1 text-3xl font-bold tracking-tight text-[#0B2B2A] sm:text-4xl">
                Welcome
              </h1>


            </div>

            {/* System status badge */}
            <div className="flex h-11 w-fit items-center gap-2 rounded-full border border-white bg-white/70 px-5 shadow-sm backdrop-blur-xl">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
              <span className="text-sm font-semibold text-[#0B2B2A]">
                System Active
              </span>
            </div>
          </div>

          {/* Counselling Banner */}
          <section className={`mb-7 p-5 sm:p-7 ${glassCard}`}>

            <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-center">

              <div className="max-w-xl">
                <div className="inline-flex items-center gap-2 rounded-full border border-teal-200 bg-teal-50/80 px-3 py-1 text-xs font-bold uppercase tracking-wider text-teal-800">
                  <span className="h-2 w-2 rounded-full bg-teal-700" />
                  Counselling Desk
                </div>

                <h2 className="mt-4 text-2xl font-bold leading-tight tracking-tight text-[#0B2B2A] sm:text-3xl">
                  Sessions, follow-ups and new requests
                </h2>

                <p className="mt-2 text-sm leading-6 text-[#3F5A58]">
                  Manage counselling activities and stay updated with
                  student requests and appointments.
                </p>
              </div>

              {/* Counselling buttons */}
              <div className="flex flex-wrap gap-2">
                {counsellingActions.map(([page, label]) => (
                  <button
                    key={page}
                    type="button"
                    onClick={() => setActivePage(page)}
                    className={navyButton}
                  >
                    {label}
                    <span className="ml-2">→</span>
                  </button>
                ))}
              </div>

            </div>
          </section>

          {/* Dashboard Search */}
          <section className={`mb-7 p-4 sm:p-5 ${glassCard}`}>

            <div className="mb-3">
              <h2 className="text-base font-bold text-[#0B2B2A]">
                Quick Search
              </h2>

              <p className="mt-1 text-xs text-[#3F5A58]">
                Quickly find and open dashboard sections.
              </p>
            </div>

            <div className="relative max-w-xl">
              <svg
                className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#4B6463]"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden="true"
              >
                <circle cx="11" cy="11" r="7" />
                <path d="m16 16 4 4" />
              </svg>

              {/* Search input */}
              <input
                id="dashboard-search"
                type="search"
                aria-label="Search dashboard sections"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search dashboard sections..."
                className="min-h-11 w-full rounded-xl border border-[#9DBDBA] bg-white/80 py-3 pl-11 pr-4 text-sm text-[#0B2B2A] outline-none placeholder:text-[#4B6463] focus:border-teal-700 focus:ring-2 focus:ring-teal-200"
              />
            </div>

            {search.trim() && (
              <div className="mt-3 flex flex-wrap gap-2">

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
                      className="min-h-11 rounded-xl border border-teal-700 bg-white/80 px-4 py-2 text-sm font-semibold text-teal-800 hover:bg-teal-50"
                    >
                      Open {title} →
                    </button>
                  ))}

                {!quickActions.some(([title, desc]) =>
                  `${title} ${desc}`
                    .toLowerCase()
                    .includes(search.toLowerCase())
                ) && (
                    <p className="px-1 py-2 text-sm text-[#3F5A58]">
                      No matching dashboard sections.
                    </p>
                  )}

              </div>
            )}

          </section>

          {/* Statistics Cards */}
          <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

            {cards.map((card) => (
              <div
                key={card.title}
                className={`group p-5 hover:bg-white/90 ${glassCard}`}
              >
                <div className="flex items-start justify-between">

                  <div>
                    <p className="text-sm font-medium text-[#3F5A58]">
                      {card.title}
                    </p>

                    <h2 className="mt-3 text-3xl font-bold tracking-tight text-[#0B2B2A]">
                      {card.count}
                    </h2>
                  </div>

                  {/* Icon circle (mint, turns teal on hover) */}
                  <div className="flex h-12 w-12 items-center justify-center rounded-full border border-white bg-white/80 text-teal-700 shadow-sm group-hover:bg-teal-700 group-hover:text-white">
                    {card.icon}
                  </div>

                </div>

                <div className="mt-4 border-t border-teal-900/10 pt-3">
                  <p className="text-xs font-medium text-[#3F5A58]">
                    {card.note}
                  </p>
                </div>
              </div>
            ))}

          </section>

          {/* Workspace and Quick Access */}
          <div className="mt-7 grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">

            {/* Workspace Card */}
            <section className={`p-6 sm:p-7 ${glassCard}`}>

              <div className="flex h-11 w-11 items-center justify-center rounded-full border border-white bg-white/80 text-teal-700 shadow-sm">
                <svg
                  {...iconProps}
                  width={23}
                  height={23}
                >
                  <rect x="3" y="3" width="18" height="18" rx="3" />
                  <path d="M3 9h18M9 21V9" />
                </svg>
              </div>

              <p className="mt-5 text-xs font-bold uppercase tracking-widest text-teal-700">
                Workspace
              </p>

              <h2 className="mt-2 text-2xl font-bold tracking-tight text-[#0B2B2A] sm:text-3xl">
                Manage your counselling platform
              </h2>

              <p className="mt-3 max-w-2xl text-sm leading-7 text-[#3F5A58]">
                Keep student information, medical college listings,
                university details and academic course data organized
                from one place.
              </p>

              <div className="mt-5 h-1 w-16 rounded-full bg-teal-700" />

            </section>

            {/* Quick Access Card */}
            <section className={`p-5 sm:p-6 ${glassCard}`}>

              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-[#0B2B2A]">
                    Quick Access
                  </h2>

                  <p className="mt-1 text-xs text-[#3F5A58]">
                    Frequently used sections
                  </p>
                </div>

                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-teal-700 text-white">
                  →
                </div>
              </div>

              <div className="mt-4 divide-y divide-teal-900/10">

                {quickActions.map(([title, desc]) => (
                  <button
                    key={title}
                    type="button"
                    onClick={() => setActivePage(title)}
                    className="group flex w-full items-center justify-between gap-3 rounded-lg px-2 py-3 text-left hover:bg-teal-50"
                  >
                    <span className="min-w-0">
                      <span className="block text-sm font-semibold text-[#0B2B2A] group-hover:text-teal-800">
                        {title}
                      </span>

                      <span className="mt-1 block text-xs text-[#3F5A58]">
                        {desc}
                      </span>
                    </span>

                    <span className="text-lg text-[#4B6463] group-hover:text-teal-800">
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

    // Counselling pages
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

    if (activePage === "Recommendations") {
      return <Recommendation />;
    }

    // Main dashboard pages
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

    if (activePage === "Packages") return <Packages />;

    // Default content
    return (
      <div className={`p-8 ${glassCard}`}>
        <h1 className="text-2xl font-bold tracking-tight text-[#0B2B2A]">
          {activePage}
        </h1>

        <p className="mt-3 text-sm text-[#3F5A58]">
          Welcome to {activePage}.
        </p>
      </div>
    );
  };

  return (
    // Full page with the soft mint background
    <div className="flex min-h-screen" style={backgroundStyle}>

      {/* Sidebar */}
      <div className="sticky top-0 h-screen shrink-0">
        <Sidebar
          activePage={activePage}
          setActivePage={setActivePage}
          user={user}
        />
      </div>

      {/* Main Dashboard Area */}
      <div className="flex min-h-screen min-w-0 flex-1 flex-col">

        {/* Header */}
        <div className="shrink-0">
          <Header />
        </div>

        {/* Page Content */}
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
