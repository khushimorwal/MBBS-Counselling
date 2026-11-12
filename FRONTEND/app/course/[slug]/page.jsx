"use client";

import { useParams } from "next/navigation";
import Link from "next/link";

const courseDetails = {
  mbbs: {
    name: "MBBS",
    fullName: "Bachelor of Medicine and Bachelor of Surgery",
    duration: "5.5 Years",
    level: "Undergraduate",
    icon: "🩺",
    description:
      "MBBS is a professional medical degree that prepares students to become qualified doctors. The course focuses on medical science, diagnosis, treatment and patient care.",
    eligibility:
      "Students must have completed 10+2 with Physics, Chemistry and Biology and must qualify NEET UG.",
    colleges: [
      "AIIMS Delhi",
      "JIPMER Puducherry",
      "SMS Medical College Jaipur",
      "Christian Medical College Vellore",
    ],
  },

  bds: {
    name: "BDS",
    fullName: "Bachelor of Dental Surgery",
    duration: "5 Years",
    level: "Undergraduate",
    icon: "🦷",
    description:
      "BDS is an undergraduate dental course that focuses on oral health, dental diseases, diagnosis and dental treatment.",
    eligibility:
      "Students must have completed 10+2 with Physics, Chemistry and Biology and must qualify NEET UG.",
    colleges: [
      "Maulana Azad Institute of Dental Sciences",
      "Government Dental College Jaipur",
      "Manipal College of Dental Sciences",
      "Saveetha Dental College",
    ],
  },

  bams: {
    name: "BAMS",
    fullName: "Bachelor of Ayurvedic Medicine and Surgery",
    duration: "5.5 Years",
    level: "Undergraduate",
    icon: "🌿",
    description:
      "BAMS is a professional degree focused on Ayurvedic medicine, traditional healthcare practices and holistic approaches to treatment.",
    eligibility:
      "Students must have completed 10+2 with Physics, Chemistry and Biology and must qualify NEET UG.",
    colleges: [
      "National Institute of Ayurveda Jaipur",
      "Institute of Medical Sciences BHU",
      "Government Ayurvedic College",
      "Rajasthan Ayurved University",
    ],
  },

  bhms: {
    name: "BHMS",
    fullName: "Bachelor of Homeopathic Medicine and Surgery",
    duration: "5.5 Years",
    level: "Undergraduate",
    icon: "⚕️",
    description:
      "BHMS is an undergraduate medical program that focuses on homeopathic medicine, healthcare and patient management.",
    eligibility:
      "Students must have completed 10+2 with Physics, Chemistry and Biology and must qualify NEET UG.",
    colleges: [
      "National Institute of Homoeopathy Kolkata",
      "Nehru Homoeopathic Medical College",
      "Dr. M.P.K. Homoeopathic Medical College",
      "Government Homoeopathic Medical College",
    ],
  },

  "b-sc-nursing": {
    name: "B.Sc Nursing",
    fullName: "Bachelor of Science in Nursing",
    duration: "4 Years",
    level: "Undergraduate",
    icon: "👩‍⚕️",
    description:
      "B.Sc Nursing is a professional course that prepares students for nursing practice, patient care, clinical services and healthcare management.",
    eligibility:
      "Students generally need 10+2 with Physics, Chemistry and Biology. Admission requirements may vary by institution.",
    colleges: [
      "AIIMS Delhi",
      "College of Nursing PGIMER Chandigarh",
      "RUHS College of Nursing Jaipur",
      "CMC Vellore",
    ],
  },

  "md-ms": {
    name: "MD/MS",
    fullName: "Doctor of Medicine / Master of Surgery",
    duration: "3 Years",
    level: "Postgraduate",
    icon: "🏥",
    description:
      "MD and MS are postgraduate medical programs designed for doctors who want to specialize in medical or surgical fields.",
    eligibility:
      "Students must have an MBBS degree, complete the required internship and qualify the applicable NEET PG examination.",
    colleges: [
      "AIIMS Delhi",
      "PGIMER Chandigarh",
      "SMS Medical College Jaipur",
      "KGMU Lucknow",
    ],
  },
};

export default function CourseDetailPage() {
  const params = useParams();
  const slug = params.slug;

  const course = courseDetails[slug];

  if (!course) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#edfafa] px-5">
        <div className="rounded-3xl border border-white bg-white/80 p-10 text-center shadow-xl backdrop-blur-xl">
          <div className="text-5xl">📚</div>

          <h2 className="mt-5 text-2xl font-bold text-slate-800">
            Course Not Found
          </h2>

          <p className="mt-3 text-slate-500">
            The course you are looking for is not available.
          </p>

          <Link
            href="/courses"
            className="mt-6 inline-block rounded-xl bg-teal-600 px-6 py-3 font-semibold text-white transition hover:bg-teal-700"
          >
            Back to Courses
          </Link>
        </div>
      </main>
    );
  }

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

        <div className="absolute inset-0 bg-gradient-to-r from-[#073e46]/90 via-[#075b62]/80 to-[#087d83]/45" />

        <div className="relative mx-auto flex min-h-[390px] max-w-7xl items-center px-6 py-14 sm:px-12 lg:px-16">

          <div className="max-w-3xl animate-fade-up text-white">

            <Link
              href="/courses"
              className="inline-flex items-center gap-2 text-sm font-medium text-cyan-100 transition hover:text-white"
            >
              ← Back to Courses
            </Link>

            <div className="mt-7 flex flex-wrap items-center gap-4">

              <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-white/30 bg-white/15 text-3xl backdrop-blur-md">
                {course.icon}
              </div>

              <span className="rounded-full border border-white/30 bg-white/15 px-4 py-2 text-sm backdrop-blur-md">
                {course.level}
              </span>

            </div>

            <h1 className="mt-6 text-4xl font-bold leading-tight sm:text-5xl">
              {course.name}
            </h1>

            <p className="mt-3 text-lg font-medium text-cyan-100 sm:text-xl">
              {course.fullName}
            </p>

            <p className="mt-4 max-w-2xl leading-7 text-white/85">
              {course.description}
            </p>

          </div>
        </div>
      </section>

      {/* Course Overview */}
      <section className="relative mx-auto max-w-7xl px-5 py-14 sm:px-8">

        <div className="mb-8">
          <span className="text-sm font-bold uppercase tracking-[3px] text-teal-600">
            Course Overview
          </span>

          <h2 className="mt-2 text-3xl font-bold text-slate-800">
            About {course.name}
          </h2>
        </div>

        <div className="grid gap-6 md:grid-cols-3">

          {/* Course Name */}
          <div className="detail-card rounded-3xl border border-white/80 bg-white/75 p-6 shadow-lg shadow-teal-900/5 backdrop-blur-xl">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-100 text-2xl">
              📖
            </div>

            <p className="mt-5 text-sm text-slate-500">
              Course Name
            </p>

            <h3 className="mt-1 text-xl font-bold text-slate-800">
              {course.name}
            </h3>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              {course.fullName}
            </p>
          </div>

          {/* Duration */}
          <div className="detail-card rounded-3xl border border-white/80 bg-white/75 p-6 shadow-lg shadow-teal-900/5 backdrop-blur-xl">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-teal-100 text-2xl">
              ⏳
            </div>

            <p className="mt-5 text-sm text-slate-500">
              Course Duration
            </p>

            <h3 className="mt-1 text-xl font-bold text-slate-800">
              {course.duration}
            </h3>

            <p className="mt-2 text-sm text-slate-500">
              Duration of the academic program
            </p>
          </div>

          {/* Level */}
          <div className="detail-card rounded-3xl border border-white/80 bg-white/75 p-6 shadow-lg shadow-teal-900/5 backdrop-blur-xl">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-100 text-2xl">
              🎓
            </div>

            <p className="mt-5 text-sm text-slate-500">
              Education Level
            </p>

            <h3 className="mt-1 text-xl font-bold text-slate-800">
              {course.level}
            </h3>

            <p className="mt-2 text-sm text-slate-500">
              Academic program category
            </p>
          </div>

        </div>
      </section>

      {/* Description and Eligibility */}
      <section className="relative mx-auto grid max-w-7xl gap-6 px-5 pb-16 sm:px-8 lg:grid-cols-2">

        {/* About Course */}
        <div className="rounded-3xl border border-white/80 bg-white/75 p-7 shadow-lg shadow-teal-900/5 backdrop-blur-xl sm:p-9">

          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-teal-100 text-2xl">
            🏥
          </div>

          <h2 className="mt-5 text-2xl font-bold text-slate-800">
            About the Course
          </h2>

          <p className="mt-4 leading-8 text-slate-600">
            {course.description}
          </p>

          <div className="mt-6 rounded-2xl bg-[#effafa] p-5">
            <p className="text-sm font-semibold text-teal-800">
              Program Information
            </p>

            <p className="mt-2 text-sm leading-7 text-slate-600">
              This program belongs to the {course.level.toLowerCase()} level
              and has a duration of {course.duration}.
            </p>
          </div>

        </div>

        {/* Eligibility */}
        <div className="rounded-3xl border border-white/80 bg-white/75 p-7 shadow-lg shadow-teal-900/5 backdrop-blur-xl sm:p-9">

          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-100 text-2xl">
            📋
          </div>

          <h2 className="mt-5 text-2xl font-bold text-slate-800">
            Eligibility Criteria
          </h2>

          <p className="mt-4 leading-8 text-slate-600">
            {course.eligibility}
          </p>

          <div className="mt-6 rounded-2xl bg-[#effafa] p-5">
            <p className="text-sm font-semibold text-teal-800">
              Important Note
            </p>

            <p className="mt-2 text-sm leading-7 text-slate-600">
              Admission criteria, eligibility and counselling requirements
              may vary according to the course and institution. Always check
              the applicable official admission guidelines.
            </p>
          </div>

        </div>

      </section>

      {/* Colleges Section */}
      <section className="relative mx-auto max-w-7xl px-5 pb-20 sm:px-8">

        <div className="mb-8">
          <span className="text-sm font-bold uppercase tracking-[3px] text-teal-600">
            Explore Institutions
          </span>

          <h2 className="mt-2 text-3xl font-bold text-slate-800">
            Colleges Offering {course.name}
          </h2>

          <p className="mt-3 max-w-2xl leading-7 text-slate-600">
            Explore some institutions associated with this course.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">

          {course.colleges.map((college, index) => (
            <div
              key={index}
              className="detail-card group rounded-2xl border border-white/80 bg-white/75 p-6 shadow-md shadow-teal-900/5 backdrop-blur-xl transition duration-300 hover:-translate-y-2 hover:border-teal-200 hover:shadow-xl"
            >

              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-100 to-teal-100 text-xl transition group-hover:scale-110">
                🏛️
              </div>

              <h3 className="mt-5 font-bold leading-6 text-slate-800 transition group-hover:text-teal-700">
                {college}
              </h3>

              <p className="mt-2 text-sm text-slate-500">
                Medical Institution
              </p>

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
            Need Guidance?
          </span>

          <h2 className="mt-4 text-3xl font-bold sm:text-4xl">
            Start Your Medical Journey
          </h2>

          <p className="mt-4 leading-7 text-white/85">
            Need help understanding admission procedures, eligibility
            or college selection? Get in touch with our team.
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

        .detail-card {
          animation: fadeUp 0.7s ease-out both;
        }

        @media (prefers-reduced-motion: reduce) {
          .animate-fade-up,
          .detail-card {
            animation: none;
          }

          .detail-card,
          .detail-card * {
            transition: none !important;
          }
        }
      `}</style>

    </main>
  );
}