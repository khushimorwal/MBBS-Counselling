"use client";

import { useEffect } from "react";

const services = [
  {
    icon: "🎓",
    title: "College Selection Guidance",
    description:
      "Explore medical colleges and understand the available options based on your preferences, rank and eligibility.",
    number: "01",
  },
  {
    icon: "📝",
    title: "Choice Filling Support",
    description:
      "Understand the choice-filling process and organize your preferred colleges carefully during counselling.",
    number: "02",
  },
  {
    icon: "📋",
    title: "Counselling Process Guidance",
    description:
      "Learn about counselling rounds, registration procedures, important dates and admission requirements.",
    number: "03",
  },
  {
    icon: "📂",
    title: "Document Verification",
    description:
      "Understand the documents generally required for medical admission and prepare them before verification.",
    number: "04",
  },
  {
    icon: "🏥",
    title: "Seat Allotment Support",
    description:
      "Understand seat allotment results, available options and the next steps after allotment.",
    number: "05",
  },
  {
    icon: "🤝",
    title: "Post Admission Support",
    description:
      "Get information about reporting procedures, admission formalities and the next steps after selection.",
    number: "06",
  },
];

export default function ServicesPage() {
  useEffect(() => {
    const elements = document.querySelectorAll(".service-reveal");

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("service-visible");
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
    <main className="overflow-hidden bg-[#eaf8f9] text-slate-800">

      {/* HERO SECTION */}
      <section className="px-5 pb-12 pt-12 sm:px-8 md:px-12 lg:px-20">
        <div className="relative mx-auto max-w-7xl overflow-hidden rounded-[30px] border border-white/70 shadow-[0_15px_45px_rgba(45,120,130,0.12)]">

          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage:
                "url('https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=1800&q=90')",
            }}
          />

          <div className="absolute inset-0 bg-gradient-to-r from-[#e9fbfb]/95 via-[#e9fbfb]/85 to-[#d7f3f3]/20" />

          <div className="relative z-10 grid items-center gap-8 px-7 py-16 sm:px-10 md:grid-cols-2 md:px-14 md:py-20">

            <div className="service-reveal translate-y-8 opacity-0 transition-all duration-700">

              <span className="inline-block rounded-full border border-teal-200/70 bg-white/50 px-5 py-2 text-xs font-bold uppercase tracking-[0.2em] text-teal-700 shadow-sm backdrop-blur-lg">
                Our Services
              </span>

              <h1 className="mt-6 text-4xl font-extrabold leading-tight text-slate-900 sm:text-5xl">
                Your Medical Admission Journey,{" "}
                <span className="text-teal-700">
                  Made Easier
                </span>
              </h1>

              <p className="mt-5 max-w-xl text-base leading-8 text-slate-600 sm:text-lg">
                From choosing the right medical college to understanding
                counselling procedures, we help you navigate each step with
                useful information and guidance.
              </p>

              <a
                href="/college"
                className="mt-8 inline-flex items-center gap-3 rounded-full bg-gradient-to-r from-teal-600 to-cyan-600 px-7 py-3.5 text-sm font-bold text-white shadow-lg shadow-teal-700/20 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
              >
                Explore Colleges
                <span>→</span>
              </a>

            </div>

            <div className="service-reveal translate-y-8 opacity-0 transition-all duration-700 md:delay-200">
              <div className="rounded-[26px] border border-white/70 bg-white/30 p-3 shadow-2xl backdrop-blur-md">
                <img
                  src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1000&q=90"
                  alt="Medical professionals discussing healthcare"
                  className="h-72 w-full rounded-[20px] object-cover sm:h-80 md:h-[370px]"
                />
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* SERVICES SECTION */}
      <section className="px-5 py-14 sm:px-8 md:px-12 lg:px-20">
        <div className="mx-auto max-w-7xl">

          <div className="service-reveal mb-10 text-center">

            <span className="inline-block rounded-full bg-teal-50 px-5 py-2 text-xs font-bold uppercase tracking-[0.2em] text-teal-700">
              What We Offer
            </span>

            <h2 className="mt-4 text-3xl font-extrabold text-slate-900 md:text-4xl">
              Services Designed for Medical Aspirants
            </h2>

            <p className="mx-auto mt-4 max-w-2xl leading-7 text-slate-600">
              Find useful information to help you understand the medical
              admission and counselling process.
            </p>

          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">

            {services.map((service, index) => (
              <div
                key={service.number}
                style={{ transitionDelay: `${index * 80}ms` }}
                className="service-reveal group rounded-[25px] border border-white/80 bg-white/55 p-7 shadow-[0_10px_30px_rgba(45,120,130,0.07)] backdrop-blur-xl transition-all duration-500 hover:-translate-y-2 hover:border-teal-200 hover:bg-white/85 hover:shadow-xl"
              >

                <div className="mb-6 flex items-center justify-between">

                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-teal-100 bg-gradient-to-br from-teal-50 to-cyan-100 text-3xl shadow-sm transition-all duration-300 group-hover:scale-110 group-hover:rotate-3">
                    {service.icon}
                  </div>

                  <span className="text-3xl font-extrabold text-teal-200">
                    {service.number}
                  </span>

                </div>

                <h3 className="mb-3 text-xl font-bold text-slate-900">
                  {service.title}
                </h3>

                <p className="text-sm leading-7 text-slate-600">
                  {service.description}
                </p>

                <div className="mt-6 h-1 w-10 rounded-full bg-gradient-to-r from-teal-500 to-cyan-400 transition-all duration-300 group-hover:w-20" />

              </div>
            ))}

          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="bg-gradient-to-br from-[#dff5f5] via-[#eafafa] to-[#d9f0f4] px-5 py-16 sm:px-8 md:px-12 lg:px-20">

        <div className="mx-auto max-w-6xl">

          <div className="service-reveal mb-12 text-center">

            <span className="inline-block rounded-full border border-teal-100 bg-white/50 px-5 py-2 text-xs font-bold uppercase tracking-[0.2em] text-teal-700">
              Simple Process
            </span>

            <h2 className="mt-4 text-3xl font-extrabold text-slate-900 md:text-4xl">
              How We Help You
            </h2>

          </div>

          <div className="grid gap-8 md:grid-cols-3">

            {[
              {
                number: "1",
                icon: "🔍",
                title: "Explore",
                description:
                  "Explore colleges and understand your available options.",
              },
              {
                number: "2",
                icon: "📄",
                title: "Prepare",
                description:
                  "Understand the counselling process and prepare the required documents.",
              },
              {
                number: "3",
                icon: "🚀",
                title: "Move Forward",
                description:
                  "Follow the admission steps and plan your next move.",
              },
            ].map((step, index) => (
              <div
                key={step.number}
                style={{ transitionDelay: `${index * 120}ms` }}
                className="service-reveal group rounded-[25px] border border-white/80 bg-white/50 p-8 text-center shadow-sm backdrop-blur-xl transition-all duration-500 hover:-translate-y-2 hover:bg-white/80 hover:shadow-xl"
              >

                <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full border border-white bg-gradient-to-br from-teal-500 to-cyan-600 text-2xl text-white shadow-lg shadow-teal-700/20 transition-transform duration-300 group-hover:scale-110">
                  {step.icon}
                </div>

                <h3 className="mb-3 text-xl font-bold text-slate-900">
                  {step.number}. {step.title}
                </h3>

                <p className="leading-7 text-slate-600">
                  {step.description}
                </p>

              </div>
            ))}

          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="px-5 py-14 sm:px-8 md:px-12 lg:px-20">

        <div className="service-reveal relative mx-auto max-w-7xl overflow-hidden rounded-[30px] border border-white/60 shadow-[0_15px_45px_rgba(20,100,110,0.15)]">

          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage:
                "url('https://images.unsplash.com/photo-1504813184591-01572f98c85f?auto=format&fit=crop&w=1800&q=90')",
            }}
          />

          <div className="absolute inset-0 bg-gradient-to-r from-[#07515c]/95 via-[#087e83]/80 to-[#0e9b9c]/50" />

          <div className="relative z-10 px-7 py-14 text-center sm:px-12 md:py-16">

            <h2 className="text-3xl font-extrabold text-white md:text-4xl">
              Ready to Begin Your Medical Journey?
            </h2>

            <p className="mx-auto mt-4 max-w-2xl leading-7 text-teal-50">
              Explore medical colleges and take the next step towards your future.
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

      {/* ANIMATIONS */}
      <style jsx global>{`
        .service-reveal {
          opacity: 0;
          transform: translateY(30px);
          transition:
            opacity 0.7s ease,
            transform 0.7s ease;
        }

        .service-reveal.service-visible {
          opacity: 1;
          transform: translateY(0);
        }

        @media (prefers-reduced-motion: reduce) {
          .service-reveal {
            opacity: 1;
            transform: none;
            transition: none;
          }
        }
      `}</style>

    </main>
  );
}