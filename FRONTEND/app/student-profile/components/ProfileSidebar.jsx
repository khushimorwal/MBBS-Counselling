"use client";

const sidebarItems = [
{ id: "profile", label: "My Profile", icon: "👤" },
{ id: "applications", label: "My Applications", icon: "📄" },
{ id: "documents", label: "My Documents", icon: "📁" },
{ id: "counselling", label: "Counselling Status", icon: "📊" },
{ id: "notifications", label: "Notifications", icon: "🔔" },
{ id: "settings", label: "Settings", icon: "⚙️" },
];

export default function ProfileSidebar({
activeSection,
setActiveSection,
}) {
const handleSidebarClick = (section) => {
setActiveSection(section);
};

const handleLogout = () => {
localStorage.removeItem("token");
localStorage.removeItem("user");
window.location.href = "/";
};

return ( <aside className="flex min-h-screen w-64 shrink-0 flex-col border-r border-slate-200 bg-white">

  {/* Profile Heading */}
  <div className="border-b border-slate-100 px-6 py-6">
    <h2 className="text-xl font-bold text-slate-800">
      Student Portal
    </h2>
    <p className="mt-1 text-sm text-slate-500">
      Manage your profile
    </p>
  </div>

  {/* Navigation */}
  <nav className="flex-1 space-y-2 px-4 py-6">
    {sidebarItems.map((item) => (
      <button
        key={item.id}
        onClick={() => handleSidebarClick(item.id)}
        className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium transition ${
          activeSection === item.id
            ? "bg-blue-50 text-blue-700"
            : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
        }`}
      >
        <span className="text-lg">{item.icon}</span>
        <span>{item.label}</span>
      </button>
    ))}
  </nav>

  {/* Logout */}
  <div className="border-t border-slate-100 p-4">
    <button
      onClick={handleLogout}
      className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-50"
    >
      <span className="text-lg">🚪</span>
      Logout
    </button>
  </div>

</aside>

);
}
