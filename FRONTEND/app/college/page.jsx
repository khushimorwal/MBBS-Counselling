"use client";

import Link from "next/link";
import { useEffect } from "react";

const colleges = [
  {
    name: "AIIMS Delhi",
    slug: "aiims-delhi",
    location: "New Delhi, India",
    type: "Government",
    image:
      "https://commons.wikimedia.org/wiki/Special:FilePath/AIIMS_DELHI_Building.jpg",
    description:
      "Explore college information, medical education and admission details.",
  },
  {
    name: "JIPMER Puducherry",
    slug: "jipmer-puducherry",
    location: "Puducherry, India",
    type: "Government",
    image:
      "https://commons.wikimedia.org/wiki/Special:FilePath/JIPMER.jpg",
    description:
      "Learn about available medical courses and admission opportunities.",
  },
  {
    name: "SMS Medical College",
    slug: "sms-medical-college",
    location: "Jaipur, Rajasthan",
    type: "Government",
    image:
      "https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=1000&q=85",
    description:
      "Explore medical college information and counselling resources.",
  },
  {
    name: "Christian Medical College",
    slug: "christian-medical-college",
    location: "Vellore, Tamil Nadu",
    type: "Private",
    image:
      "https://commons.wikimedia.org/wiki/Special:FilePath/CMC_Main_building.jpg",
    description:
      "Discover college information and explore medical education options.",
  },
  {
    name: "Kasturba Medical College",
    slug: "kasturba-medical-college",
    location: "Manipal, Karnataka",
    type: "Private",
    image:
      "https://commons.wikimedia.org/wiki/Special:FilePath/Manipal_rocks_copy.jpg",
    description:
      "Find useful information to help plan your medical education journey.",
  },
  {
    name: "Amrita School of Medicine",
    slug: "amrita-school-of-medicine",
    location: "Kochi, Kerala",
    type: "Private",
    image:
      "https://commons.wikimedia.org/wiki/Special:FilePath/AIMS_Cochin.jpg",
    description:
      "Explore medical education information and available admission options.",
  },
];

const fallbackImage =
  "https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=1000&q=85";

export default function CollegePage() {

  const handleLoginCheck = (e) => {
  const token = localStorage.getItem("token");

  if (!token) {
    e.preventDefault();

    window.dispatchEvent(
      new Event("open-login-required")
    );
  }
};


  useEffect(() => {
    const elements = document.querySelectorAll(".college-reveal");

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("college-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );

    elements.forEach((element) => observer.observe(element));

    return () => observer.disconnect();
  }, []);

  return (
    <main className="min-h-screen overflow-hidden bg-[#eaf8f9] text-slate-800">

      {/* HERO SECTION */}
      <section className="px-5 pb-12 pt-12 sm:px-8 md:px-12 lg:px-20">
        <div className="relative mx-auto max-w-7xl overflow-hidden rounded-[30px] border border-white/70 shadow-[0_15px_45px_rgba(45,120,130,0.12)]">

          {/* Background Image */}
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage:
                "url('https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=1800&q=90')",
            }}
          />

          {/* Glass Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#e8fafa]/95 via-[#e8fafa]/85 to-[#d8f4f3]/35" />

          <div className="relative z-10 px-7 py-16 sm:px-10 md:px-14 md:py-20">

            <div className="college-reveal max-w-3xl translate-y-8 opacity-0 transition-all duration-700">

              <span className="inline-block rounded-full border border-teal-200/70 bg-white/50 px-5 py-2 text-xs font-bold uppercase tracking-[0.2em] text-teal-700 shadow-sm backdrop-blur-lg">
                Explore Medical Colleges
              </span>

              <h1 className="mt-6 text-4xl font-extrabold leading-tight text-slate-900 sm:text-5xl md:text-6xl">
                Find the Right Medical College for Your{" "}
                <span className="text-teal-700">
                  Future
                </span>
              </h1>

              <p className="mt-5 max-w-2xl text-base leading-8 text-slate-600 sm:text-lg">
                Explore medical colleges, compare college types and discover
                information to help you plan your medical education journey.
              </p>

              <div className="mt-8 flex flex-wrap gap-4">
                <a
                  href="#colleges"
                  className="rounded-full bg-gradient-to-r from-teal-600 to-cyan-600 px-7 py-3.5 text-sm font-bold text-white shadow-lg shadow-teal-700/20 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                >
                  Browse Colleges →
                </a>

                <span className="rounded-full border border-white/70 bg-white/45 px-6 py-3.5 text-sm font-semibold text-teal-800 backdrop-blur-xl">
                  Medical Education & Counselling
                </span>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* COLLEGE LISTING */}
      <section
        id="colleges"
        className="px-5 py-12 sm:px-8 md:px-12 lg:px-20"
      >
        <div className="mx-auto max-w-7xl">

          {/* Heading */}
          <div className="college-reveal mb-10 text-center">

            <span className="inline-block rounded-full bg-teal-50 px-5 py-2 text-xs font-bold uppercase tracking-[0.2em] text-teal-700">
              Discover Your Options
            </span>

            <h2 className="mt-4 text-3xl font-extrabold text-slate-900 md:text-4xl">
              Explore Medical Colleges
            </h2>

            <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
              Discover government and private medical colleges and explore
              the information you need for your admission journey.
            </p>

          </div>

          {/* College Cards */}
          <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-3">

            {colleges.map((college, index) => (
              <div
                key={college.slug}
                style={{ transitionDelay: `${index * 80}ms` }}
                className="college-reveal group overflow-hidden rounded-[25px] border border-white/80 bg-white/55 opacity-0 shadow-[0_10px_30px_rgba(45,120,130,0.08)] backdrop-blur-xl transition-all duration-500 hover:-translate-y-2 hover:border-teal-200 hover:bg-white/85 hover:shadow-xl"
              >

                {/* College Image */}
                <Link
                  href={`/college/${college.slug}`}
                  className="relative block overflow-hidden p-3"
                >
                  <div className="relative overflow-hidden rounded-[19px]">

                    <img
                      src={college.image}
                      alt={college.name}
                      onError={(e) => {
                        e.currentTarget.src = fallbackImage;
                      }}
                      className="h-52 w-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />

                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/35 to-transparent" />

                    <span
                      className={`absolute left-4 top-4 rounded-full border border-white/50 px-4 py-1.5 text-xs font-bold shadow-sm backdrop-blur-md ${
                        college.type === "Government"
                          ? "bg-emerald-100/85 text-emerald-800"
                          : "bg-cyan-100/85 text-cyan-800"
                      }`}
                    >
                      {college.type}
                    </span>

                  </div>
                </Link>

                {/* College Information */}
                <div className="px-6 pb-6 pt-3">

                  <h3 className="text-xl font-extrabold text-slate-900 transition-colors duration-300 group-hover:text-teal-700">
                    {college.name}
                  </h3>

                  <p className="mt-2 flex items-center gap-2 text-sm text-slate-500">
                    <span className="text-teal-600">📍</span>
                    {college.location}
                  </p>

                  <p className="mt-4 min-h-[72px] text-sm leading-7 text-slate-600">
                    {college.description}
                  </p>

                  {/* Buttons */}
                  <div className="mt-5 flex flex-wrap gap-3">

                    <Link
                      href={`/college/${college.slug}`}
                      onClick={handleLoginCheck}
                      className="flex-1 rounded-full bg-gradient-to-r from-teal-600 to-cyan-600 px-4 py-3 text-center text-xs font-bold text-white shadow-md shadow-teal-700/15 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg sm:text-sm"
                    >
                      View Details →
                    </Link>

                    <Link
                      href={`/college/compare/${college.slug}`}
                      onClick={handleLoginCheck}
                      className="flex-1 rounded-full border border-teal-200 bg-white/70 px-4 py-3 text-center text-xs font-bold text-teal-700 transition-all duration-300 hover:-translate-y-0.5 hover:border-teal-400 hover:bg-teal-50 sm:text-sm"
                    >
                      ⇄ Compare
                    </Link>

                  </div>

                </div>
              </div>
            ))}

          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="px-5 pb-16 pt-10 sm:px-8 md:px-12 lg:px-20">

        <div className="college-reveal relative mx-auto max-w-7xl overflow-hidden rounded-[30px] border border-white/60 shadow-[0_15px_45px_rgba(20,100,110,0.15)]">

          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage:
                "url('https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=1800&q=90')",
            }}
          />

          <div className="absolute inset-0 bg-gradient-to-r from-[#07515c]/95 via-[#087e83]/85 to-[#0e9b9c]/60" />

          <div className="relative z-10 px-7 py-14 text-center sm:px-12 md:py-16">

            <h2 className="text-3xl font-extrabold text-white md:text-4xl">
              Start Exploring Your Options
            </h2>

            <p className="mx-auto mt-4 max-w-2xl leading-7 text-teal-50">
              Learn about medical colleges and prepare for your admission journey.
            </p>

            <Link
              href="/contact"
              className="mt-8 inline-flex items-center gap-3 rounded-full border border-white/60 bg-white/90 px-8 py-3.5 font-bold text-teal-800 shadow-lg backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:bg-white hover:shadow-xl"
            >
              Contact Us →
            </Link>

          </div>
        </div>
      </section>

      {/* SCROLL ANIMATIONS */}
      <style jsx global>{`
        .college-reveal {
          opacity: 0;
          transform: translateY(30px);
          transition:
            opacity 0.7s ease,
            transform 0.7s ease;
        }

        .college-reveal.college-visible {
          opacity: 1;
          transform: translateY(0);
        }

        @media (prefers-reduced-motion: reduce) {
          .college-reveal {
            opacity: 1;
            transform: none;
            transition: none;
          }
        }
      `}</style>

    </main>
  );
}