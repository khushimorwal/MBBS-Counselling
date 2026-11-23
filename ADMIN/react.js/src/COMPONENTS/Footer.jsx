function Footer() {
  return (
    // Clean Teal glass: frosted footer
    <footer className="shrink-0 border-t border-white/70 bg-white/30 px-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)] backdrop-blur-2xl backdrop-saturate-150 py-6 sm:px-7 sm:py-7">

      <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-3">

        {/* About */}
        <div>
          <div className="flex items-center gap-2">

            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-700 text-white">
              ✚
            </div>

            <h3 className="text-base font-extrabold text-[#0B2B2A]">
              MBBS Counselling
            </h3>

          </div>

          <p className="mt-3 max-w-xs text-sm leading-6 text-[#3F5A58]">
            Administration portal for managing medical colleges,
            universities, student records and counselling information.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="text-sm font-bold text-[#0B2B2A]">
            Quick Links
          </h3>

          <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-3 text-sm text-[#3F5A58]">

            <span className="hover:text-teal-700">
              Dashboard
            </span>

            <span className="hover:text-teal-700">
              Students
            </span>

            <span className="hover:text-teal-700">
              Colleges
            </span>

            <span className="hover:text-teal-700">
              Universities
            </span>

            <span className="hover:text-teal-700">
              Courses
            </span>

            <span className="hover:text-teal-700">
              Settings
            </span>

          </div>
        </div>

        {/* Contact */}
        <div>
          <h3 className="text-sm font-bold text-[#0B2B2A]">
            Support & Contact
          </h3>

          <div className="mt-3 space-y-3 text-sm text-[#3F5A58]">

            <p className="flex items-center gap-2">
              <span className="text-teal-700">✦</span>
              Help & Support
            </p>

            <p className="flex items-center gap-2">
              <span className="text-teal-700">✦</span>
              Contact your system administrator
            </p>

            <p className="flex items-center gap-2">
              <span className="text-teal-700">✦</span>
              Medical Counselling Administration
            </p>

          </div>
        </div>

      </div>

      {/* Copyright */}
      <div className="mt-7 border-t border-white/70 pt-4 text-center text-xs text-[#3F5A58]">
        © {new Date().getFullYear()} MBBS Counselling Portal.
        All rights reserved.
      </div>

    </footer>
  );
}

export default Footer;