import Link from "next/link";

export default function Footer() {
  return (
    <footer className="relative mt-auto overflow-hidden border-t border-teal-100/70 bg-white/65 text-slate-600 backdrop-blur-xl">

      {/* Background Decoration */}
      <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-cyan-100/50 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-teal-100/50 blur-3xl" />

      <div className="relative mx-auto grid max-w-7xl grid-cols-1 gap-10 px-6 py-12 sm:grid-cols-2 lg:grid-cols-4 lg:px-8">

        {/* Brand */}
        <div>
          <h2 className="mb-4 text-2xl font-bold text-slate-800">
            MBBS <span className="text-teal-600">Counselling</span>
          </h2>

          <p className="max-w-xs text-sm leading-7 text-slate-500">
            Your trusted guide to medical education. Explore colleges,
            universities, courses and opportunities to plan your medical
            career.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="mb-5 text-lg font-bold text-slate-800">
            Quick Links
          </h3>

          <ul className="space-y-3 text-sm">
            {[
              ["Home", "/home"],
              ["About Us", "/about"],
              ["Our Services", "/services"],
              ["Contact Us", "/contact"],
            ].map(([label, href]) => (
              <li key={label}>
                <Link
                  href={href}
                  className="transition-all duration-300 hover:translate-x-1 hover:text-teal-600"
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Explore */}
        <div>
          <h3 className="mb-5 text-lg font-bold text-slate-800">
            Explore
          </h3>

          <ul className="space-y-3 text-sm">
            {[
              ["Medical Colleges", "/college"],
              ["Universities", "/universities"],
              ["Courses", "/course"],
              ["Streams", "/stream"],
            ].map(([label, href]) => (
              <li key={label}>
                <Link
                  href={href}
                  className="transition-all duration-300 hover:translate-x-1 hover:text-teal-600"
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h3 className="mb-5 text-lg font-bold text-slate-800">
            Need Help?
          </h3>

          <p className="mb-5 text-sm leading-6 text-slate-500">
            Have questions about medical colleges or counselling? We are here
            to help you.
          </p>

          <Link
            href="/contact"
            className="inline-block rounded-xl border border-teal-500/20 bg-teal-600 px-5 py-3 text-sm font-semibold text-white shadow-md shadow-teal-600/20 transition-all duration-300 hover:-translate-y-1 hover:bg-teal-700"
          >
            Get in Touch
          </Link>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="relative border-t border-teal-100/70 bg-white/30">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 py-5 text-center text-xs text-slate-500 sm:flex-row sm:px-8">

          <p>
            © {new Date().getFullYear()} MBBS Counselling. All rights reserved.
          </p>

          <div className="flex gap-6">
            <Link
              href="/privacy-policy"
              className="transition hover:text-teal-600"
            >
              Privacy Policy
            </Link>

            <Link
              href="/terms"
              className="transition hover:text-teal-600"
            >
              Terms &amp; Conditions
            </Link>
          </div>

        </div>
      </div>
    </footer>
  );
}