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
    // Transparent sticky header (thin white border at the bottom)
    <header className="sticky top-0 z-30 flex min-h-[72px] items-center justify-between border-b-2 border-white/90 bg-white/20 px-4 py-3 backdrop-blur-md sm:px-7">

      {/* Portal Branding */}
      <div className="min-w-0">
        <h2 className="truncate text-base font-bold tracking-tight text-slate-800 sm:text-lg">
          MBBS Counselling Administration
        </h2>

        <p className="mt-0.5 hidden text-xs text-slate-600 sm:block sm:text-sm">
          Medical admission & counselling management
        </p>
      </div>

      {/* User Profile */}
      <div className="ml-3 flex shrink-0 items-center gap-3">

        {/* Avatar (border-only circle) */}
        <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-sky-500 bg-transparent text-sm font-bold text-sky-700">
          {initials}
        </div>

        <div className="hidden leading-tight sm:block">
          <p className="text-sm font-semibold text-slate-800">
            {name}
          </p>

          <p className="mt-1 text-xs text-slate-600">
            {user?.role || "Administrator"}
          </p>
        </div>

      </div>

    </header>
  );
}

export default Header;