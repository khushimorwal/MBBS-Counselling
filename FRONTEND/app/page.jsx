
"use client";

import { useEffect } from "react";

const colleges = [
  {
    name: "AIIMS Delhi",
    location: "New Delhi, Delhi",
    type: "Government",
    image:
      "https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&w=800&q=90",
    website: "https://www.aiims.edu/",
  },
  {
    name: "JIPMER Puducherry",
    location: "Puducherry",
    type: "Government",
    image:
      "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=800&q=90",
    website: "https://jipmer.edu.in/",
  },
  {
    name: "St. John's Medical College",
    location: "Bengaluru, Karnataka",
    type: "Private",
    image:
      "https://images.unsplash.com/photo-1538108149393-fbbd81895907?auto=format&fit=crop&w=800&q=90",
    website: "https://www.stjohns.in/",
  },
  {
    name: "Kasturba Medical College",
    location: "Manipal, Karnataka",
    type: "Private",
    image:
      "https://images.unsplash.com/photo-1584982751601-97dcc096659c?auto=format&fit=crop&w=800&q=90",
    website: "https://manipal.edu/kmc-manipal.html",
  },
];

const steps = [
  {
    number: "01",
    icon: "🔍",
    title: "Explore Colleges",
    description:
      "Discover medical colleges and compare available admission options.",
  },
  {
    number: "02",
    icon: "💬",
    title: "Get Expert Advice",
    description:
      "Understand your admission possibilities with proper guidance.",
  },
  {
    number: "03",
    icon: "📋",
    title: "Complete Process",
    description:
      "Learn about counselling rounds, documents and admission steps.",
  },
  {
    number: "04",
    icon: "🎓",
    title: "Start Your Journey",
    description:
      "Move forward towards your dream of becoming a doctor.",
  },
];

export default function Home() {
  useEffect(() => {
    const items = document.querySelectorAll(".reveal");

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );

    items.forEach((item) => observer.observe(item));

    return () => observer.disconnect();
  }, []);

  return (
    <main className="overflow-hidden bg-[#eaf8fa] text-slate-800">

      <style>{`
        .reveal {
          opacity: 0;
          transform: translateY(32px);
          transition: opacity .8s ease, transform .8s cubic-bezier(.2,.7,.2,1);
        }

        .reveal.visible {
          opacity: 1;
          transform: translateY(0);
        }

        .reveal-left {
          transform: translateX(-35px);
        }

        .reveal-right {
          transform: translateX(35px);
        }

        .reveal-left.visible,
        .reveal-right.visible {
          transform: translateX(0);
        }

        .delay-1 { transition-delay: .1s; }
        .delay-2 { transition-delay: .2s; }
        .delay-3 { transition-delay: .3s; }
        .delay-4 { transition-delay: .4s; }

        .hero-photo {
          animation: heroZoom 1.3s ease-out both;
        }

        @keyframes heroZoom {
          from { transform: scale(1.08); }
          to { transform: scale(1); }
        }

        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-9px); }
        }

        .float-image {
          animation: float 5s ease-in-out infinite;
        }

        .college-card {
          transition: transform .4s ease, box-shadow .4s ease;
        }

        .college-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 20px 40px rgba(20,130,145,.16);
        }

        .college-card img {
          transition: transform .6s ease;
        }

        .college-card:hover img {
          transform: scale(1.08);
        }

        .step-card {
          transition: transform .35s ease, box-shadow .35s ease;
        }

        .step-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 18px 35px rgba(20,130,145,.13);
        }

        .soft-glass {
          background: rgba(255,255,255,.76);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
        }

        @media (prefers-reduced-motion: reduce) {
          .reveal, .hero-photo, .float-image,
          .college-card, .college-card img, .step-card {
            animation: none;
            transition: none;
            transform: none;
            opacity: 1;
          }
        }
      `}</style>

      {/* HERO SECTION */}
      <section className="px-3 pb-6 pt-4 sm:px-5 md:px-7">

        <div className="relative mx-auto max-w-7xl overflow-hidden rounded-[28px] shadow-xl shadow-teal-900/10">

          <img
            src="https://www.unthealth.edu/financial-aid/_binaries/HSC-STOCK-014-1-scaled.jpg"
            alt="Medical students outside a modern university building"
            className="hero-photo absolute inset-0 h-full w-full object-cover object-center"
          />

          <div className="absolute inset-0 bg-gradient-to-r from-[#eaf9fa]/95 via-[#eaf9fa]/80 to-[#c6edf0]/35" />

          <div className="relative grid min-h-[520px] items-center gap-8 px-6 py-12 md:grid-cols-2 md:px-12 lg:px-16">

            <div className="reveal reveal-left">

              <span className="inline-flex items-center gap-2 rounded-full border border-teal-200 bg-white/80 px-4 py-2 text-sm font-bold text-teal-700 shadow-sm">
                <span className="h-2 w-2 rounded-full bg-teal-500" />
                Your MBBS Admission Partner
              </span>

              <h1 className="mt-6 max-w-xl text-4xl font-extrabold leading-tight tracking-tight text-slate-900 md:text-5xl lg:text-[58px]">
                Your Dream.
                <br />
                Your Medical Career.
                <br />
                <span className="text-teal-600">
                  Your Future.
                </span>
              </h1>

              <p className="mt-5 max-w-lg text-base leading-7 text-slate-600 md:text-lg">
                Find the right medical college, explore admission
                opportunities and get the guidance you need for
                your MBBS counselling journey.
              </p>

              <div className="mt-7 flex flex-wrap gap-3">

                <a
                  href="/college"
                  className="rounded-xl bg-teal-600 px-7 py-3.5 font-bold text-white shadow-lg shadow-teal-600/20 transition duration-300 hover:-translate-y-1 hover:bg-teal-700"
                >
                  Explore Colleges →
                </a>

                <a
                  href="/services"
                  className="rounded-xl border border-teal-600 bg-white/90 px-7 py-3.5 font-bold text-teal-700 transition duration-300 hover:-translate-y-1 hover:bg-teal-50"
                >
                  Our Services
                </a>

              </div>

              <div className="mt-9 flex flex-wrap gap-x-7 gap-y-4">

                {[
                  ["🛡️", "Trusted Guidance"],
                  ["🏥", "College Information"],
                  ["✓", "Clear Process"],
                ].map(([icon, label]) => (
                  <div key={label} className="flex items-center gap-2">
                    <span className="text-xl">{icon}</span>
                    <span className="text-sm font-semibold text-slate-700">
                      {label}
                    </span>
                  </div>
                ))}

              </div>
            </div>

            <div className="reveal reveal-right hidden md:block">

              <div className="float-image relative ml-auto max-w-[440px]">

                <div className="overflow-hidden rounded-[25px] border-[7px] border-white/80 shadow-2xl">
                  <img
                    src="https://d26uhjq9x2kecg.cloudfront.net/generated-images/60fbdb82-a1d5-42dd-8c3b-83ef4fcba6cc.jpg"
                    alt="Medical students at a university campus"
                    className="h-[380px] w-full object-cover"
                  />
                </div>

                <div className="soft-glass absolute -bottom-5 -left-8 max-w-[290px] rounded-2xl border border-white/80 p-5 shadow-xl">
                  <p className="text-xs font-bold uppercase tracking-widest text-teal-600">
                    Your Future Starts Here
                  </p>
                  <h3 className="mt-2 text-lg font-bold text-slate-900">
                    Take the first step towards your dream.
                  </h3>
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* COLLEGES SECTION */}
      <section className="mx-auto max-w-7xl px-5 py-10 md:px-10">

        <div className="reveal mb-7 flex flex-wrap items-end justify-between gap-4">

          <div>
            <span className="text-sm font-bold uppercase tracking-widest text-teal-600">
              Discover Your Options
            </span>

            <h2 className="mt-2 text-3xl font-extrabold text-slate-900 md:text-4xl">
              Explore Medical Colleges
            </h2>

            <p className="mt-2 text-slate-600">
              Discover institutions and explore your admission options.
            </p>
          </div>

          <a
            href="/college"
            className="font-bold text-teal-700 transition hover:translate-x-1"
          >
            View All Colleges →
          </a>

        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">

          {colleges.map((college, index) => (
            <div
              key={college.name}
              className={`reveal college-card overflow-hidden rounded-2xl border border-cyan-100 bg-white shadow-md shadow-teal-900/5 delay-${index + 1}`}
            >

              <div className="relative overflow-hidden">
                <img
                  src={college.image}
                  alt={`${college.name} campus`}
                  className="h-48 w-full object-cover"
                />

                <span
                  className={`absolute left-3 top-3 rounded-full px-3 py-1.5 text-xs font-bold ${
                    college.type === "Government"
                      ? "bg-green-100 text-green-700"
                      : "bg-purple-100 text-purple-700"
                  }`}
                >
                  {college.type}
                </span>
              </div>

              <div className="p-5">

                <h3 className="text-lg font-bold text-slate-900">
                  {college.name}
                </h3>

                <p className="mt-2 text-sm text-slate-500">
                  📍 {college.location}
                </p>

                <a
                  href={college.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-flex items-center gap-2 border-t border-slate-100 pt-4 text-sm font-bold text-teal-700 transition hover:gap-4"
                >
                  Explore College →
                </a>

              </div>
            </div>
          ))}

        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="bg-gradient-to-br from-[#d7f1f3] via-[#eaf8fa] to-white px-5 py-12 md:px-10">

        <div className="mx-auto max-w-7xl">

          <div className="reveal text-center">

            <span className="rounded-full border border-teal-200 bg-white px-4 py-2 text-sm font-bold text-teal-700">
              SIMPLE PROCESS
            </span>

            <h2 className="mt-5 text-3xl font-extrabold text-slate-900 md:text-4xl">
              How It Works
            </h2>

            <p className="mx-auto mt-3 max-w-2xl text-slate-600">
              Four simple steps to help you understand your MBBS admission journey.
            </p>

          </div>

          <div className="mt-9 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">

            {steps.map((step, index) => (
              <div
                key={step.number}
                className={`reveal step-card rounded-2xl border border-cyan-100 bg-white p-6 shadow-md shadow-teal-900/5 delay-${index + 1}`}
              >

                <div className="flex items-center justify-between">

                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#dff5f6] text-3xl">
                    {step.icon}
                  </div>

                  <span className="text-4xl font-extrabold text-teal-100">
                    {step.number}
                  </span>

                </div>

                <h3 className="mt-5 text-xl font-bold text-slate-900">
                  {step.title}
                </h3>

                <p className="mt-3 text-sm leading-6 text-slate-600">
                  {step.description}
                </p>

              </div>
            ))}

          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="px-4 py-9 sm:px-6 md:px-10">

        <div className="reveal relative mx-auto max-w-7xl overflow-hidden rounded-[28px] shadow-xl">

          <img
            src="https://www.augusta.edu/gradschool/images/harrison-jpg.jpg"
            alt="Medical students outside a college of medicine"
            className="absolute inset-0 h-full w-full object-cover object-center"
          />

          <div className="absolute inset-0 bg-gradient-to-r from-teal-950/90 via-teal-900/80 to-cyan-900/60" />

          <div className="relative px-6 py-14 text-center md:px-16">

            <span className="text-sm font-bold uppercase tracking-widest text-cyan-200">
              Take the Next Step
            </span>

            <h2 className="mx-auto mt-4 max-w-3xl text-3xl font-extrabold text-white md:text-4xl">
              Ready to Begin Your MBBS Journey?
            </h2>

            <p className="mx-auto mt-4 max-w-2xl leading-7 text-cyan-50">
              Explore medical colleges, understand your options
              and take an informed step towards your future.
            </p>

            <a
              href="/college"
              className="mt-7 inline-flex items-center gap-2 rounded-xl bg-white px-8 py-3.5 font-bold text-teal-800 shadow-lg transition duration-300 hover:-translate-y-1 hover:bg-cyan-50"
            >
              Explore Colleges →
            </a>

          </div>
        </div>
      </section>

    </main>
  );
}
