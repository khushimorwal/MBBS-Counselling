"use client";

import React, { useEffect } from "react";

const features = [
  {
    icon: "🎓",
    title: "Expert Guidance",
    description:
      "Get guidance to understand medical admission processes and make informed college choices.",
  },
  {
    icon: "🏥",
    title: "College Information",
    description:
      "Explore medical colleges and learn about available courses and admission opportunities.",
  },
  {
    icon: "📋",
    title: "Counselling Support",
    description:
      "Understand counselling procedures, choice filling, document verification and seat allotment.",
  },
  {
    icon: "🤝",
    title: "Student Support",
    description:
      "We aim to make the admission journey clearer and easier for students and their families.",
  },
];

export default function AboutPage() {
  useEffect(() => {
    const elements = document.querySelectorAll(".about-reveal");

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("about-visible");
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
    <main className="overflow-hidden bg-[#edfafa] text-slate-800">

      {/* HERO SECTION */}
      <section className="relative px-5 pb-14 pt-12 sm:px-8 md:px-12 lg:px-20">

        <div className="relative mx-auto max-w-7xl overflow-hidden rounded-[30px] border border-white/70 bg-white/30 shadow-[0_15px_50px_rgba(45,120,130,0.12)]">

          {/* Background Image */}
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage:
                "url('https://i.pinimg.com/736x/0f/13/80/0f13808a821861cee3a358a38c174df9.jpg')",
            }}
          />

          {/* Image Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#e8fafa]/95 via-[#e8fafa]/80 to-[#d6f4f3]/30" />

          <div className="relative z-10 grid items-center gap-10 px-7 py-14 sm:px-10 md:grid-cols-2 md:px-14 md:py-20">

            {/* Hero Content */}
            <div className="about-reveal translate-y-8 opacity-0 transition-all duration-700">

              <span className="mb-5 inline-flex rounded-full border border-teal-200/70 bg-white/50 px-5 py-2 text-xs font-bold uppercase tracking-[0.2em] text-teal-700 shadow-sm backdrop-blur-md">
                About Us
              </span>

              <h1 className="mb-6 text-4xl font-extrabold leading-tight text-slate-900 sm:text-5xl lg:text-[54px]">
                Helping You Take the First Step Towards Your{" "}
                <span className="text-teal-700">
                  Medical Career
                </span>
              </h1>

              <p className="max-w-xl text-base leading-8 text-slate-600 sm:text-lg">
                MBBS Counselling is designed to help aspiring medical students
                understand the admission process, explore colleges and make
                informed decisions about their future.
              </p>

              <a
                href="/college"
                className="mt-8 inline-flex items-center gap-3 rounded-full bg-gradient-to-r from-teal-600 to-cyan-600 px-7 py-3.5 text-sm font-bold text-white shadow-lg shadow-teal-700/20 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
              >
                Explore Colleges
                <span>→</span>
              </a>
            </div>

            {/* Hero Image Card */}
            <div className="about-reveal translate-y-8 opacity-0 transition-all duration-700 md:delay-200">

              <div className="relative rounded-[28px] border border-white/70 bg-white/30 p-3 shadow-2xl shadow-teal-900/10 backdrop-blur-md">

                <img
                  src="https://i.pinimg.com/736x/0f/13/80/0f13808a821861cee3a358a38c174df9.jpg"
                  alt="Medical professionals working together"
                  className="h-72 w-full rounded-[22px] object-cover sm:h-80 md:h-[400px]"
                />

                <div className="absolute -bottom-5 left-5 right-5 rounded-2xl border border-white/70 bg-white/75 p-4 shadow-xl backdrop-blur-xl sm:left-8 sm:right-8">
                  <p className="text-sm font-bold text-slate-800">
                    Your Medical Journey Starts Here
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    Explore opportunities and plan your future with confidence.
                  </p>
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* WHO WE ARE */}
      <section className="px-5 py-14 sm:px-8 md:px-12 lg:px-20">

        <div className="about-reveal mx-auto max-w-4xl rounded-[28px] border border-white/80 bg-white/55 px-7 py-12 text-center shadow-[0_12px_40px_rgba(45,120,130,0.07)] backdrop-blur-xl sm:px-12">

          <span className="mb-4 inline-block rounded-full bg-teal-50 px-5 py-2 text-xs font-bold uppercase tracking-[0.2em] text-teal-700">
            Who We Are
          </span>

          <h2 className="mb-6 text-3xl font-extrabold text-slate-900 md:text-4xl">
            Your Partner in the{" "}
            <span className="text-teal-700">
              Medical Admission Journey
            </span>
          </h2>

          <p className="text-base leading-8 text-slate-600 sm:text-lg">
            Choosing the right medical college is an important decision.
            Our platform brings useful college information and counselling
            guidance together so that students can better understand their
            options and prepare for the admission process with confidence.
          </p>

        </div>
      </section>

      {/* MISSION AND VISION */}
      <section className="relative bg-gradient-to-br from-[#dff5f5] via-[#eafafa] to-[#d9f0f4] px-5 py-16 sm:px-8 md:px-12 lg:px-20">

        <div className="mx-auto max-w-7xl">

          <div className="about-reveal mb-10 text-center">
            <span className="mb-3 inline-block text-xs font-bold uppercase tracking-[0.2em] text-teal-700">
              What Drives Us
            </span>

            <h2 className="text-3xl font-extrabold text-slate-900 md:text-4xl">
              Our Mission & Vision
            </h2>
          </div>

          <div className="grid gap-7 md:grid-cols-2">

            {/* Mission */}
            <div className="about-reveal group rounded-[26px] border border-white/80 bg-white/55 p-8 shadow-[0_12px_35px_rgba(45,120,130,0.08)] backdrop-blur-xl transition-all duration-500 hover:-translate-y-2 hover:bg-white/80 hover:shadow-xl">

              <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-teal-100 bg-gradient-to-br from-teal-50 to-cyan-100 text-3xl shadow-sm transition-transform duration-300 group-hover:scale-110">
                🎯
              </div>

              <h2 className="mb-4 text-2xl font-bold text-slate-900">
                Our Mission
              </h2>

              <p className="leading-8 text-slate-600">
                Our mission is to provide students with clear, accessible and
                useful information about medical colleges and counselling
                procedures, helping them make informed admission decisions.
              </p>

            </div>

            {/* Vision */}
            <div className="about-reveal group rounded-[26px] border border-white/80 bg-white/55 p-8 shadow-[0_12px_35px_rgba(45,120,130,0.08)] backdrop-blur-xl transition-all duration-500 hover:-translate-y-2 hover:bg-white/80 hover:shadow-xl md:[transition-delay:150ms]">

              <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-cyan-100 bg-gradient-to-br from-cyan-50 to-teal-100 text-3xl shadow-sm transition-transform duration-300 group-hover:scale-110">
                🌟
              </div>

              <h2 className="mb-4 text-2xl font-bold text-slate-900">
                Our Vision
              </h2>

              <p className="leading-8 text-slate-600">
                Our vision is to make the medical admission journey simpler
                and more transparent by helping aspiring doctors access the
                information they need to plan their future.
              </p>

            </div>

          </div>
        </div>
      </section>

      {/* WHY CHOOSE US */}
      <section className="px-5 py-16 sm:px-8 md:px-12 lg:px-20">

        <div className="mx-auto max-w-7xl">

          <div className="about-reveal mb-12 text-center">

            <span className="mb-3 inline-block rounded-full bg-teal-50 px-5 py-2 text-xs font-bold uppercase tracking-[0.2em] text-teal-700">
              Why Choose Us
            </span>

            <h2 className="text-3xl font-extrabold text-slate-900 md:text-4xl">
              Support for Every Step of Your Journey
            </h2>

            <p className="mx-auto mt-4 max-w-2xl leading-7 text-slate-600">
              Find helpful information and guidance as you explore your
              medical education opportunities.
            </p>

          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">

            {features.map((feature, index) => (
              <div
                key={feature.title}
                style={{ transitionDelay: `${index * 100}ms` }}
                className="about-reveal group rounded-[24px] border border-white/80 bg-white/55 p-6 shadow-[0_10px_30px_rgba(45,120,130,0.07)] backdrop-blur-xl transition-all duration-500 hover:-translate-y-2 hover:border-teal-200 hover:bg-white/85 hover:shadow-xl"
              >

                <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-teal-100 bg-gradient-to-br from-teal-50 to-cyan-100 text-3xl shadow-sm transition-all duration-300 group-hover:scale-110 group-hover:rotate-3">
                  {feature.icon}
                </div>

                <h3 className="mb-3 text-lg font-bold text-slate-900">
                  {feature.title}
                </h3>

                <p className="text-sm leading-7 text-slate-600">
                  {feature.description}
                </p>

                <div className="mt-5 h-1 w-10 rounded-full bg-gradient-to-r from-teal-500 to-cyan-400 transition-all duration-300 group-hover:w-20" />

              </div>
            ))}

          </div>
        </div>
      </section>

      {/* CALL TO ACTION */}
      <section className="px-5 pb-16 sm:px-8 md:px-12 lg:px-20">

        <div className="about-reveal relative mx-auto max-w-7xl overflow-hidden rounded-[30px] border border-white/50 shadow-[0_15px_45px_rgba(20,100,110,0.15)]">

          {/* Background */}
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage:
                "url('https://www.augusta.edu/gradschool/images/harrison-jpg.jpg')",
            }}
          />

          <div className="absolute inset-0 bg-gradient-to-r from-[#073f4b]/90 via-[#087b83]/80 to-[#0e9b9c]/65" />

          <div className="relative z-10 px-7 py-14 text-center sm:px-12 md:py-16">

            <h2 className="text-3xl font-extrabold text-white md:text-4xl">
              Ready to Explore Your Medical Career?
            </h2>

            <p className="mx-auto mt-4 max-w-2xl leading-7 text-teal-50">
              Start exploring medical colleges and learn more about your
              admission options.
            </p>

            <a
              href="/college"
              className="mt-8 inline-flex items-center gap-3 rounded-full border border-white/60 bg-white/90 px-8 py-3.5 font-bold text-teal-800 shadow-lg backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:bg-white hover:shadow-xl"
            >
              Explore Colleges
              <span>→</span>
            </a>

          </div>
        </div>
      </section>

      {/* SCROLL ANIMATION STYLES */}
      <style jsx global>{`
        .about-reveal {
          opacity: 0;
          transform: translateY(30px);
          transition:
            opacity 0.7s ease,
            transform 0.7s ease;
        }

        .about-reveal.about-visible {
          opacity: 1;
          transform: translateY(0);
        }

        @media (prefers-reduced-motion: reduce) {
          .about-reveal {
            opacity: 1;
            transform: none;
            transition: none;
          }
        }
      `}</style>

    </main>
  );
}