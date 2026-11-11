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
<> <rect x="3" y="3" width="7" height="9" rx="1" /> <rect x="14" y="3" width="7" height="5" rx="1" /> <rect x="14" y="12" width="7" height="9" rx="1" /> <rect x="3" y="16" width="7" height="5" rx="1" />
</>
),
},
{
name: "Students",
permission: "students",
icon: icon(
<> <circle cx="9" cy="8" r="4" /> <path d="M2 21c1-4 4-6 7-6s6 2 7 6M17 11a3 3 0 1 0 0-6M22 21c-.5-2.5-2-4.2-4-5" />
</>
),
},
{
name: "Colleges",
permission: "colleges",
icon: icon(
<> <path d="M4 20V10l8-6 8 6v10z" /> <path d="M9 20v-6h6v6" />
</>
),
},
{
name: "University",
permission: "universities",
icon: icon(
<> <path d="m3 9 9-5 9 5-9 5z" /> <path d="M7 11.5V16c0 1 2.2 2.5 5 2.5s5-1.5 5-2.5v-4.5" />
</>
),
},
{
name: "Role & Permissions",
permission: "roles",
icon: icon( <path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6z" />
),
},
{
name: "Stream",
permission: "streams",
icon: icon( <path d="M4 5h16M4 12h16M4 19h16" />
),
},
{
name: "Degree",
permission: "degrees",
icon: icon(
<> <circle cx="12" cy="9" r="5" /> <path d="m9 14-1 7 4-2 4 2-1-7" />
</>
),
},
{
name: "Course",
permission: "courses",
icon: icon(
<> <path d="M5 4h11a3 3 0 0 1 3 3v13H8a3 3 0 0 1-3-3z" /> <path d="M9 8h6M9 12h6" />
</>
),
},
{
name: "Specialization",
permission: "specializations",
icon: icon(
<> <circle cx="12" cy="12" r="9" /> <circle cx="12" cy="12" r="4" />
</>
),
},
{
name: "Settings",
permission: "settings",
icon: icon(
<> <circle cx="12" cy="12" r="3" /> <path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2" />
</>
),
},
{
name: "Email Template",
permission: "emailTemplates",
icon: icon(
<> <path d="M4 4h16v16H4z" /> <path d="m4 7 8 6 8-6" />
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

// Super Admin can see everything
const isSuperAdmin = user?.role === "Super Admin";
const isAdmin = user?.role === "Admin";

const adminMenu = [
  "Dashboard",
  "Students",
  "Colleges",
  "University",
  "College Applications",
];

// User permissions
const permissions = user?.permissions || [];

// Check whether user has at least one permission for a module
const hasPermission = (module) => {
  if (isSuperAdmin) {
    return true;
  }
  if (!module) {
    return true;
  }
  return permissions.some((permission) =>
    permission.startsWith(`${module}_`)
  );
};



// Filter menu according to permissions
const visibleMenu = menu.filter((item) => {
  // Super Admin can see everything
  if (isSuperAdmin) {
    return true;
  }

  // Admin can see only these modules
  if (isAdmin) {
    return adminMenu.includes(item.name);
  }

  // Other users: Dashboard always visible
  if (item.name === "Dashboard") {
    return true;
  }

  return hasPermission(item.permission);
});

const showCounsellingMenu =
  isSuperAdmin ||
  isAdmin ||
  user?.role === "Counsellor";

return ( <aside className="flex h-full w-64 shrink-0 flex-col overflow-hidden bg-brand-dark text-white">


  {/* Logo */}
  <div className="border-b border-white/10 px-5 py-5">
    <div className="flex items-center gap-3">

      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-brand">
        <span className="text-xl">✚</span>
      </div>

      <div className="min-w-0">
        <h1 className="font-display text-lg font-bold leading-tight sm:text-xl">
          MBBS <span className="text-accent">Counselling</span>
        </h1>
      </div>

    </div>
  </div>


  {/* Navigation */}
  <nav className="min-h-0 flex-1 space-y-1 overflow-y-auto overflow-x-hidden px-2 pb-2 pt-1">

    {visibleMenu.map((item) => (

      <button
        key={item.name}
        type="button"
        onClick={() => setActivePage(item.name)}
        className={`flex min-h-10 w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition ${
          activePage === item.name
            ? "bg-accent text-white"
            : "text-white/75 hover:bg-white/10 hover:text-white"
        }`}
      >

        {item.icon}

        <span>{item.name}</span>

        {activePage === item.name && (
          <span className="ml-auto h-1.5 w-1.5 rounded-full bg-white" />
        )}

      </button>

    ))}

    {showCounsellingMenu && (
  <div className="pt-2">
    <button
      type="button"
      onClick={() => setCounsellingOpen(!counsellingOpen)}
      className="flex min-h-10 w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-white/75 transition hover:bg-white/10 hover:text-white"
    >
      <span>Counselling Management</span>
      <span>{counsellingOpen ? "−" : "+"}</span>
    </button>

    {counsellingOpen && (
      <div className="mt-1 space-y-1 pl-3">
        {counsellingMenu.map((name) => (
          <button
            key={name}
            type="button"
            onClick={() => setActivePage(name)}
            className={`flex min-h-9 w-full items-center rounded-lg px-3 py-2 text-left text-sm transition ${
              activePage === name
                ? "bg-accent text-white"
                : "text-white/70 hover:bg-white/10 hover:text-white"
            }`}
          >
            {name}
          </button>
        ))}
      </div>
    )}
  </div>
)}

  </nav>


  {/* Logout */}
  <div className="border-t border-white/10 p-3">

    <button
      type="button"
      onClick={() => {

        localStorage.removeItem("token");
        localStorage.removeItem("user");

        window.location.href = "/";
      }}
      className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-medium text-white/75 transition hover:bg-red-500 hover:text-white"
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
