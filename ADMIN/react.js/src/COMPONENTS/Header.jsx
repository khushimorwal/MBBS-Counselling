function Header() {
  let user = null;

  try {
    user = JSON.parse(localStorage.getItem("user"));
  } catch {
    user = null;
  }

  const name = user?.name || "Admin";

  const initials = name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    // Clean Teal glass: frosted sticky header
    <header className="sticky top-0 z-30 flex min-h-[72px] items-center justify-between border-b border-white/70 bg-white/30 px-4 shadow-[inset_0_-1px_0_rgba(255,255,255,0.8)] backdrop-blur-2xl backdrop-saturate-150 py-3 sm:px-7">

      {/* Portal Branding */}
      <div className="min-w-0">
        <h2 className="truncate text-base font-extrabold tracking-tight text-[#0B2B2A] sm:text-lg">
          MBBS Counselling Administration
        </h2>

        <p className="mt-0.5 hidden text-xs text-[#3F5A58] sm:block sm:text-sm">
          Medical admission & counselling management
        </p>
      </div>

      {/* User Profile */}
      <div className="ml-3 flex shrink-0 items-center gap-3">

        {/* Avatar */}
        <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-teal-700 bg-white/60 text-sm font-bold text-teal-700">
          {initials}
        </div>

        <div className="hidden leading-tight sm:block">
          <p className="text-sm font-semibold text-[#0B2B2A]">
            {name}
          </p>

          <p className="mt-1 text-xs text-[#3F5A58]">
            {user?.role || "Administrator"}
          </p>
        </div>

      </div>

    </header>
  );
}

export default Header;