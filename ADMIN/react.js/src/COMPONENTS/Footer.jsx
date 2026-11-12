function Footer() {
  return (
    // Transparent footer (thin white border at the top)
    <footer className="shrink-0 border-t-2 border-white/90 bg-white/20 px-5 py-6 backdrop-blur-md sm:px-7 sm:py-7">

      <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-3">

        {/* About */}
        <div>
          <div className="flex items-center gap-2">

            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-500 text-white">
              ✚
            </div>

            <h3 className="text-base font-bold text-slate-800">
              MBBS Counselling
            </h3>

          </div>

          <p className="mt-3 max-w-xs text-sm leading-6 text-slate-600">
            Administration portal for managing medical colleges,
            universities, student records and counselling information.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="text-sm font-bold text-slate-800">
            Quick Links
          </h3>

          <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-3 text-sm text-slate-600">

            <span className="hover:text-sky-700">
              Dashboard
            </span>

            <span className="hover:text-sky-700">
              Students
            </span>

            <span className="hover:text-sky-700">
              Colleges
            </span>

            <span className="hover:text-sky-700">
              Universities
            </span>

            <span className="hover:text-sky-700">
              Courses
            </span>

            <span className="hover:text-sky-700">
              Settings
            </span>

          </div>
        </div>

        {/* Contact */}
        <div>
          <h3 className="text-sm font-bold text-slate-800">
            Support & Contact
          </h3>

          <div className="mt-3 space-y-3 text-sm text-slate-600">

            <p className="flex items-center gap-2">
              <span className="text-sky-600">✦</span>
              Help & Support
            </p>

            <p className="flex items-center gap-2">
              <span className="text-sky-600">✦</span>
              Contact your system administrator
            </p>

            <p className="flex items-center gap-2">
              <span className="text-sky-600">✦</span>
              Medical Counselling Administration
            </p>

          </div>
        </div>

      </div>

      {/* Copyright */}
      <div className="mt-7 border-t border-white/70 pt-4 text-center text-xs text-slate-600">
        © {new Date().getFullYear()} MBBS Counselling Portal.
        All rights reserved.
      </div>

    </footer>
  );
}

export default Footer;