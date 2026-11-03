function Footer() {
  return (
    <footer className="shrink-0 bg-brand-dark px-5 py-6 text-white sm:px-7 sm:py-7">
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">

        {/* About */}
        <div>
          <h3 className="font-display text-base font-bold">
            MBBS Counselling
          </h3>

          <p className="mt-2 max-w-xs text-sm leading-6 text-white/65">
            Administration portal for managing medical colleges,
            universities, student records and counselling information.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="text-sm font-semibold">
            Quick Links
          </h3>

          <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-sm text-white/65">
            <span>Dashboard</span>
            <span>Students</span>
            <span>Colleges</span>
            <span>Universities</span>
            <span>Courses</span>
            <span>Settings</span>
          </div>
        </div>

        {/* Contact */}
        <div>
          <h3 className="text-sm font-semibold">
            Support & Contact
          </h3>

          <p className="mt-3 text-sm text-white/65">
            Help & Support
          </p>

          <p className="mt-2 text-sm text-white/65">
            Contact your system administrator
          </p>

          <p className="mt-2 text-sm text-white/65">
            Medical Counselling Administration
          </p>
        </div>

      </div>

      {/* Copyright */}
      <div className="mt-6 border-t border-white/15 pt-4 text-center text-xs text-white/55">
        © {new Date().getFullYear()} MBBS Counselling Portal.
        All rights reserved.
      </div>
    </footer>
  );
}

export default Footer;