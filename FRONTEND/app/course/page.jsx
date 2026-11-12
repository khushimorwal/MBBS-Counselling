"use client";

import Link from "next/link";

const courses = [
  {
    name: "MBBS",
    slug: "mbbs",
    fullName: "Bachelor of Medicine and Bachelor of Surgery",
    duration: "5.5 Years",
    level: "Undergraduate",
    description:
      "MBBS is a professional medical degree that prepares students to become qualified doctors and provide medical care.",
    eligibility: "10+2 with Physics, Chemistry and Biology. NEET qualification is required.",
    icon: "🩺",
  },
  {
    name: "BDS",
    slug: "bds",
    fullName: "Bachelor of Dental Surgery",
    duration: "5 Years",
    level: "Undergraduate",
    description:
      "BDS focuses on dental health, oral hygiene, diagnosis and treatment of dental diseases.",
    eligibility: "10+2 with Physics, Chemistry and Biology. NEET qualification is required.",
    icon: "🦷",
  },
  {
    name: "BAMS",
    slug: "bams",
    fullName: "Bachelor of Ayurvedic Medicine and Surgery",
    duration: "5.5 Years",
    level: "Undergraduate",
    description:
      "BAMS is a medical degree focused on Ayurvedic medicine, traditional healthcare and treatment methods.",
    eligibility: "10+2 with Physics, Chemistry and Biology. NEET qualification is required.",
    icon: "🌿",
  },
  {
    name: "BHMS",
    slug: "bhms",
    fullName: "Bachelor of Homeopathic Medicine and Surgery",
    duration: "5.5 Years",
    level: "Undergraduate",
    description:
      "BHMS focuses on homeopathic medicine, patient care and alternative approaches to healthcare.",
    eligibility: "10+2 with Physics, Chemistry and Biology. NEET qualification is required.",
    icon: "⚕️",
  },
  {
    name: "B.Sc Nursing",
    slug: "b-sc-nursing",
    fullName: "Bachelor of Science in Nursing",
    duration: "4 Years",
    level: "Undergraduate",
    description:
      "B.Sc Nursing prepares students for professional nursing practice, patient care and healthcare services.",
    eligibility: "10+2 with Physics, Chemistry and Biology. Admission criteria may vary by institution.",
    icon: "👩‍⚕️",
  },
  {
    name: "MD/MS",
    slug: "md-ms",
    fullName: "Doctor of Medicine / Master of Surgery",
    duration: "3 Years",
    level: "Postgraduate",
    description:
      "MD and MS are postgraduate medical programs that allow doctors to specialize in medical and surgical fields.",
    eligibility: "MBBS degree with completion of internship and NEET PG qualification.",
    icon: "🏥",
  },
];

export default function CoursesPage() {
  const handleLoginCheck = (e) => {
  const token = localStorage.getItem("token");

  if (!token) {
    e.preventDefault();

    window.dispatchEvent(
      new Event("open-login-required")
    );
  }
};
  return (
    <main className="min-h-screen overflow-hidden bg-[#edfafa] text-slate-800">

      {/* Background Effects */}
      <div className="pointer-events-none fixed inset-0 -z-0">
        <div className="absolute -left-32 top-40 h-80 w-80 rounded-full bg-cyan-200/30 blur-3xl" />
        <div className="absolute -right-32 top-[550px] h-96 w-96 rounded-full bg-teal-200/30 blur-3xl" />
      </div>

      {/* Hero Section */}
      <section className="relative mx-4 mt-5 overflow-hidden rounded-[30px] sm:mx-8 lg:mx-12">

        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?q=85&w=2000')",
          }}
        />

        <div className="absolute inset-0 bg-gradient-to-r from-[#073e46]/90 via-[#075b62]/75 to-[#087d83]/40" />

        <div className="relative mx-auto flex min-h-[390px] max-w-7xl items-center px-6 py-16 sm:px-12 lg:px-16">
          <div className="max-w-2xl animate-fade-up text-white">

            <span className="inline-block rounded-full border border-white/30 bg-white/15 px-5 py-2 text-sm font-medium backdrop-blur-md">
              Explore Medical Education
            </span>

            <h1 className="mt-6 text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">
              Discover Your
              <span className="block text-cyan-200">
                Medical Career
              </span>
            </h1>

            <p className="mt-5 max-w-xl text-base leading-7 text-white/85 sm:text-lg">
              Explore medical courses, understand eligibility criteria
              and take the next step towards your dream healthcare career.
            </p>

            <a
              href="#courses"
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-white px-7 py-3.5 font-semibold text-teal-800 shadow-lg transition duration-300 hover:-translate-y-1 hover:bg-cyan-50"
            >
              Explore Courses
              <span>→</span>
            </a>

          </div>
        </div>
      </section>

      {/* Introduction */}
      <section className="relative mx-auto max-w-7xl px-5 py-16 sm:px-8">

        <div className="mx-auto max-w-3xl text-center">
          <span className="text-sm font-bold uppercase tracking-[3px] text-teal-600">
            Find Your Path
          </span>

          <h2 className="mt-3 text-3xl font-bold text-slate-800 sm:text-4xl">
            Explore Medical Courses
          </h2>

          <p className="mt-4 leading-7 text-slate-600">
            Choose from a range of undergraduate and postgraduate medical
            programs. Explore course details, duration and eligibility
            requirements to make an informed decision.
          </p>
        </div>

      </section>

      {/* Courses Section */}
      <section
        id="courses"
        className="relative mx-auto max-w-7xl scroll-mt-20 px-5 pb-20 sm:px-8"
      >

        <div className="mb-9 flex flex-wrap items-end justify-between gap-4">
          <div>
            <span className="text-sm font-semibold text-teal-600">
              OUR PROGRAMS
            </span>

            <h2 className="mt-2 text-2xl font-bold text-slate-800 sm:text-3xl">
              Medical Programs
            </h2>
          </div>

          <span className="rounded-full border border-teal-100 bg-white/70 px-4 py-2 text-sm font-medium text-teal-700 shadow-sm backdrop-blur-md">
            {courses.length} Courses Available
          </span>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">

          {courses.map((course, index) => (
            <div
              key={course.slug}
              className="course-card group flex flex-col overflow-hidden rounded-3xl border border-white/80 bg-white/75 p-6 shadow-[0_8px_30px_rgba(15,118,110,0.07)] backdrop-blur-xl transition duration-500 hover:-translate-y-2 hover:border-teal-200 hover:shadow-[0_18px_40px_rgba(15,118,110,0.15)]"
              style={{ animationDelay: `${index * 100}ms` }}
            >

              {/* Card Top */}
              <div className="flex items-start justify-between">

                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-100 to-teal-100 text-3xl transition duration-300 group-hover:scale-110">
                  {course.icon}
                </div>

                <span className="rounded-full bg-teal-50 px-3 py-1.5 text-xs font-semibold text-teal-700">
                  {course.level}
                </span>

              </div>

              {/* Course Information */}
              <div className="mt-6 flex-1">

                <h3 className="text-2xl font-bold text-slate-800 transition group-hover:text-teal-700">
                  {course.name}
                </h3>

                <p className="mt-2 min-h-[44px] text-sm font-medium leading-6 text-slate-500">
                  {course.fullName}
                </p>

                <p className="mt-4 text-sm leading-7 text-slate-600">
                  {course.description}
                </p>

                {/* Duration */}
                <div className="mt-5 flex items-center gap-3 rounded-xl bg-[#effafa] px-4 py-3">
                  <span className="text-xl">⏳</span>

                  <div>
                    <p className="text-xs text-slate-500">
                      Course Duration
                    </p>
                    <p className="text-sm font-semibold text-slate-700">
                      {course.duration}
                    </p>
                  </div>
                </div>

              </div>

              {/* Button */}
              <Link
                href={`/course/${course.slug}`}
                onClick={handleLoginCheck}
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-teal-600 to-cyan-600 px-5 py-3.5 text-sm font-semibold text-white shadow-md shadow-teal-600/15 transition duration-300 hover:from-teal-700 hover:to-cyan-700 hover:shadow-lg"
              >
                View Course Details
                <span className="transition duration-300 group-hover:translate-x-1">
                  →
                </span>
              </Link>

            </div>
          ))}

        </div>

      </section>

      {/* CTA Section */}
      <section className="relative mx-4 mb-10 overflow-hidden rounded-[30px] bg-gradient-to-r from-[#075b62] to-[#07969a] px-6 py-14 text-center text-white shadow-xl sm:mx-8 sm:px-12 lg:mx-12">

        <div className="absolute -right-16 -top-20 h-64 w-64 rounded-full border-[35px] border-white/10" />
        <div className="absolute -bottom-28 -left-12 h-64 w-64 rounded-full border-[35px] border-white/10" />

        <div className="relative mx-auto max-w-2xl">

          <span className="text-sm font-semibold uppercase tracking-[3px] text-cyan-100">
            Need Assistance?
          </span>

          <h2 className="mt-4 text-3xl font-bold sm:text-4xl">
            Let's Plan Your Medical Journey
          </h2>

          <p className="mt-4 leading-7 text-white/85">
            Have questions about medical courses or admissions?
            Our team is here to guide you through the process.
          </p>

          <Link
            href="/contact"
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-white px-8 py-3.5 font-semibold text-teal-800 transition duration-300 hover:-translate-y-1 hover:bg-cyan-50 hover:shadow-lg"
          >
            Contact Us
            <span>→</span>
          </Link>

        </div>
      </section>

      {/* Animations */}
      <style jsx>{`
        @keyframes fadeUp {
          from {
            opacity: 0;
            transform: translateY(25px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-up {
          animation: fadeUp 0.8s ease-out both;
        }

        .course-card {
          animation: fadeUp 0.7s ease-out both;
        }

        @media (prefers-reduced-motion: reduce) {
          .animate-fade-up,
          .course-card {
            animation: none;
          }

          .course-card,
          .course-card * {
            transition: none !important;
          }
        }
      `}</style>

    </main>
  );
}