import { useState } from "react";

const icon = (path) => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    {path}
  </svg>
);

function Sidebar({ activePage, setActivePage, user }) {
  const [counsellingOpen, setCounsellingOpen] = useState(false);

  const menu = [
    {
      name: "Dashboard",
      permission: null,
      icon: icon(
        <>
          <rect x="3" y="3" width="7" height="9" rx="1" />
          <rect x="14" y="3" width="7" height="5" rx="1" />
          <rect x="14" y="12" width="7" height="9" rx="1" />
          <rect x="3" y="16" width="7" height="5" rx="1" />
        </>
      ),
    },
    {
      name: "Students",
      permission: "students",
      icon: icon(
        <>
          <circle cx="9" cy="8" r="4" />
          <path d="M2 21c1-4 4-6 7-6s6 2 7 6M17 11a3 3 0 1 0 0-6M22 21c-.5-2.5-2-4.2-4-5" />
        </>
      ),
    },
    {
      name: "Colleges",
      permission: "colleges",
      icon: icon(
        <>
          <path d="M4 20V10l8-6 8 6v10z" />
          <path d="M9 20v-6h6v6" />
        </>
      ),
    },
    {
      name: "University",
      permission: "universities",
      icon: icon(
        <>
          <path d="m3 9 9-5 9 5-9 5z" />
          <path d="M7 11.5V16c0 1 2.2 2.5 5 2.5s5-1.5 5-2.5v-4.5" />
        </>
      ),
    },
    {
      name: "Role & Permissions",
      permission: "roles",
      icon: icon(
        <path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6z" />
      ),
    },
    {
      name: "Stream",
      permission: "streams",
      icon: icon(
        <path d="M4 5h16M4 12h16M4 19h16" />
      ),
    },
    {
      name: "Degree",
      permission: "degrees",
      icon: icon(
        <>
          <circle cx="12" cy="9" r="5" />
          <path d="m9 14-1 7 4-2 4 2-1-7" />
        </>
      ),
    },
    {
      name: "Course",
      permission: "courses",
      icon: icon(
        <>
          <path d="M5 4h11a3 3 0 0 1 3 3v13H8a3 3 0 0 1-3-3z" />
          <path d="M9 8h6M9 12h6" />
        </>
      ),
    },

    
    {
  name: "Packages",
  permission: "packages",
  icon: icon(
    <>
      <rect x="3" y="7" width="18" height="14" rx="2" />
      <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
      <path d="M3 12h18M10 12v2h4v-2" />
    </>
  ),
},


    {
      name: "Specialization",
      permission: "specializations",
      icon: icon(
        <>
          <circle cx="12" cy="12" r="9" />
          <circle cx="12" cy="12" r="4" />
        </>
      ),
    },
    {
      name: "Settings",
      permission: "settings",
      icon: icon(
        <>
          <circle cx="12" cy="12" r="3" />
          <path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2" />
        </>
      ),
    },
    {
      name: "Email Template",
      permission: "emailTemplates",
      icon: icon(
        <>
          <path d="M4 4h16v16H4z" />
          <path d="m4 7 8 6 8-6" />
        </>
      ),
    },
    {
      name: "Contact Inquiries",
      permission: null,
      icon: icon(
        <>
          <path d="M4 5h16v14H4z" />
          <path d="m4 7 8 6 8-6" />
        </>
      ),
    },
    {
      name: "College Applications",
      permission: "applications",
      icon: icon(
        <>
          <rect x="4" y="3" width="16" height="18" rx="2" />
          <path d="M8 8h8M8 12h8M8 16h5" />
        </>
      ),
    },
    {
      name: "Document Verification",
      permission: "documents",
      icon: icon(
        <>
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <path d="M14 2v6h6M8 13h8M8 17h8" />
        </>
      ),
    },
  ];

  const counsellingMenu = [
    "Counselling Dashboard",
    "Counselling Requests",
    "Counsellor Assignments",
    "Appointments",
    "Counselling Sessions",
    "Counselling Notes",
    "Follow-ups",
  ];

  // Check user role
  const isSuperAdmin = user?.role === "Super Admin";
  const isAdmin = user?.role === "Admin";

  const adminMenu = [
    "Dashboard",
    "Students",
    "Colleges",
    "University",
    "College Applications",
    "Packages"
  ];

  // Get user permissions
  const permissions = user?.permissions || [];

  // Check permission for each module
  const hasPermission = (module) => {
    if (isSuperAdmin) return true;

    if (!module) return true;

    return permissions.some((permission) =>
      permission.startsWith(`${module}_`)
    );
  };

  // Filter menu based on user permissions
  const visibleMenu = menu.filter((item) => {
    if (isSuperAdmin) return true;

    if (isAdmin) {
      return adminMenu.includes(item.name);
    }

    if (item.name === "Dashboard") return true;

    return hasPermission(item.permission);
  });

  const showCounsellingMenu =
    isSuperAdmin ||
    isAdmin ||
    user?.role === "Counsellor";

  return (
    // Transparent sidebar (thin white border on the right)
    <aside className="flex h-full w-64 shrink-0 flex-col overflow-hidden border-r-2 border-white/90 bg-white/20 text-slate-700 backdrop-blur-md">

      {/* Logo */}
      <div className="border-b border-white/70 px-5 py-5">

        <div className="flex items-center gap-3">

          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-sky-500 text-white">
            <span className="text-xl">✚</span>
          </div>

          <div className="min-w-0">
            <h1 className="text-lg font-bold leading-tight text-slate-800">
              MBBS
            </h1>

            <p className="text-xs font-semibold tracking-wide text-sky-700">
              COUNSELLING
            </p>
          </div>

        </div>

        {/* Administration label (border-only box) */}
        <div className="mt-5 rounded-xl border border-white/90 bg-white/20 px-3 py-2">
          <p className="text-[10px] font-bold uppercase tracking-widest text-sky-700">
            Administration
          </p>
          <p className="mt-0.5 text-xs text-slate-600">
            Management Portal
          </p>
        </div>

      </div>

      {/* Navigation */}
      <nav className="min-h-0 flex-1 space-y-1 overflow-y-auto overflow-x-hidden px-3 pb-4 pt-4">

        <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.15em] text-slate-500">
          Main Menu
        </p>

        {visibleMenu.map((item) => {
          const isActive = activePage === item.name;

          return (
            <button
              key={item.name}
              type="button"
              onClick={() => setActivePage(item.name)}
              className={`group flex min-h-11 w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left text-sm font-medium ${
                isActive
                  ? "border-sky-500 bg-white/40 text-sky-700"
                  : "border-transparent text-slate-700 hover:bg-white/40 hover:text-sky-700"
              }`}
            >

              <span
                className={
                  isActive
                    ? "text-sky-600"
                    : "text-slate-500 group-hover:text-sky-600"
                }
              >
                {item.icon}
              </span>

              <span className="flex-1">
                {item.name}
              </span>

              {isActive && (
                <span className="h-5 w-1 rounded-full bg-sky-500" />
              )}

            </button>
          );
        })}

        {/* Counselling Menu */}
        {showCounsellingMenu && (
          <div className="border-t border-white/70 pt-4">

            <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.15em] text-slate-500">
              Counselling
            </p>

            <button
              type="button"
              onClick={() => setCounsellingOpen(!counsellingOpen)}
              className="flex min-h-11 w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-slate-700 hover:bg-white/40 hover:text-sky-700"
            >

              <span className="flex items-center gap-3">
                <span className="text-sky-600">◈</span>
                Counselling Management
              </span>

              <span className="text-sky-700">
                {counsellingOpen ? "−" : "+"}
              </span>

            </button>

            {counsellingOpen && (
              <div className="mt-2 space-y-1 pl-3">

                {counsellingMenu.map((name) => {
                  const isActive = activePage === name;

                  return (
                    <button
                      key={name}
                      type="button"
                      onClick={() => setActivePage(name)}
                      className={`flex min-h-10 w-full items-center gap-2 rounded-lg border px-3 py-2 text-left text-xs ${
                        isActive
                          ? "border-sky-500 bg-white/40 font-semibold text-sky-700"
                          : "border-transparent text-slate-600 hover:bg-white/40 hover:text-sky-700"
                      }`}
                    >
                      <span className="text-sky-500">•</span>
                      {name}
                    </button>
                  );
                })}

              </div>
            )}

          </div>
        )}

      </nav>

      {/* Logout */}
      <div className="border-t border-white/70 p-3">

        <button
          type="button"
          onClick={() => {
            localStorage.removeItem("token");
            localStorage.removeItem("user");

            window.location.href = "/";
          }}
          className="group flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-semibold text-slate-600 hover:bg-white/40 hover:text-red-600"
        >

          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M10 17l5-5-5-5" />
            <path d="M15 12H3" />
            <path d="M21 19V5a2 2 0 0 0-2-2h-6" />
          </svg>

          <span>Logout</span>

        </button>

      </div>

    </aside>
  );
}

export default Sidebar;