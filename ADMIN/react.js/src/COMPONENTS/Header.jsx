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
    <header className="flex min-h-[68px] items-center justify-between border-b border-line bg-white px-5 py-3 sm:px-8">
      <div className="min-w-0">
        <h2 className="truncate font-display text-base font-bold text-brand-dark sm:text-lg">
          MBBS Counselling Administration
        </h2>

        <p className="mt-0.5 text-xs text-muted sm:text-sm">
          Medical admission & counselling management
        </p>
      </div>

      <div className="flex shrink-0 items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-soft text-xs font-bold text-brand">
          {initials}
        </div>

        <div className="hidden leading-tight sm:block">
          <p className="text-sm font-semibold text-brand-dark">{name}</p>
          <p className="text-xs text-muted">{user?.role || "Administrator"}</p>
        </div>
      </div>
    </header>
  );
}

export default Header;
