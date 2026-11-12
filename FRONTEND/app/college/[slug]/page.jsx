"use client";

import { useParams } from "next/navigation";
import Link from "next/link";

const colleges = [
  {
    slug: "aiims-delhi",
    name: "All India Institute of Medical Sciences",
    shortName: "AIIMS Delhi",
    location: "Ansari Nagar, New Delhi, India",
    established: "1956",
    type: "Government",
    website: "https://www.aiims.edu/",
    description:
      "AIIMS New Delhi is a medical institution known for medical education, research and healthcare services.",
    courses: ["MBBS", "MD", "MS", "DM", "MCh"],
    facilities: [
      "Library",
      "Hostels",
      "Hospital",
      "Research Facilities",
      "Sports Facilities",
    ],
  },
  {
    slug: "jipmer-puducherry",
    name: "Jawaharlal Institute of Postgraduate Medical Education and Research",
    shortName: "JIPMER Puducherry",
    location: "Puducherry, India",
    established: "1823",
    type: "Government",
    website: "https://jipmer.edu.in/",
    description:
      "JIPMER is a medical institution offering medical education, postgraduate training, research and healthcare services.",
    courses: ["MBBS", "MD", "MS", "DM", "MCh"],
    facilities: [
      "Library",
      "Hostels",
      "Hospital",
      "Research Facilities",
      "Sports Facilities",
    ],
  },
  {
    slug: "sms-medical-college",
    name: "Sawai Man Singh Medical College",
    shortName: "SMS Medical College",
    location: "Jaipur, Rajasthan, India",
    established: "1947",
    type: "Government",
    website: "https://medicaleducation.rajasthan.gov.in/",
    description:
      "Sawai Man Singh Medical College is a government medical college in Jaipur, Rajasthan, providing medical education and clinical training.",
    courses: ["MBBS", "MD", "MS"],
    facilities: [
      "Library",
      "Hostels",
      "Hospital",
      "Clinical Training",
      "Sports Facilities",
    ],
  },
  {
    slug: "christian-medical-college",
    name: "Christian Medical College",
    shortName: "CMC Vellore",
    location: "Vellore, Tamil Nadu, India",
    established: "1900",
    type: "Private",
    website: "https://www.cmch-vellore.edu/",
    description:
      "Christian Medical College, Vellore, is a medical institution providing medical education, healthcare and research opportunities.",
    courses: ["MBBS", "MD", "MS", "DM", "MCh"],
    facilities: [
      "Library",
      "Hostels",
      "Hospital",
      "Research Facilities",
      "Clinical Training",
    ],
  },
  {
    slug: "kasturba-medical-college",
    name: "Kasturba Medical College",
    shortName: "KMC Manipal",
    location: "Manipal, Karnataka, India",
    established: "1953",
    type: "Private",
    website: "https://manipal.edu/kmc-manipal.html",
    description:
      "Kasturba Medical College, Manipal, offers medical education, clinical training and research opportunities.",
    courses: ["MBBS", "MD", "MS", "DM", "MCh"],
    facilities: [
      "Library",
      "Hostels",
      "Hospital",
      "Research Facilities",
      "Sports Facilities",
    ],
  },
  {
    slug: "amrita-school-of-medicine",
    name: "Amrita School of Medicine",
    shortName: "Amrita School of Medicine",
    location: "Kochi, Kerala, India",
    established: "1998",
    type: "Private",
    website: "https://www.amrita.edu/",
    description:
      "Amrita School of Medicine provides medical education and clinical learning opportunities through its academic and healthcare environment.",
    courses: ["MBBS", "MD", "MS", "DM", "MCh"],
    facilities: [
      "Library",
      "Hostels",
      "Hospital",
      "Research Facilities",
      "Clinical Training",
    ],
  },
];

export default function CollegeDetails() {
  const params = useParams();
  const slug = params.slug;

  const college = colleges.find((item) => item.slug === slug);

  if (!college) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center px-5">
        <h1 className="text-3xl font-bold text-gray-800">
          College Not Found
        </h1>

        <p className="mt-3 text-gray-500">
          The college details are not available.
        </p>

        <Link
          href="/college"
          className="mt-6 rounded-lg bg-blue-700 px-6 py-3 text-white"
        >
          Back to Colleges
        </Link>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 text-gray-800">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-slate-950 via-blue-950 to-blue-800 text-white">
        <div className="mx-auto max-w-7xl px-5 py-12 md:px-8 md:py-16">
          <div className="mb-6 flex flex-wrap gap-3">
            <span className="rounded-full bg-white/10 px-4 py-2 text-sm">
              {college.type} College
            </span>

            <span className="rounded-full bg-white/10 px-4 py-2 text-sm">
              Established {college.established}
            </span>
          </div>

          <div className="max-w-4xl">
            <p className="mb-3 text-sm font-semibold uppercase tracking-[3px] text-blue-200">
              College Details
            </p>

            <h1 className="text-3xl font-bold leading-tight md:text-5xl">
              {college.name}
            </h1>

            <p className="mt-5 flex items-center gap-2 text-blue-100">
              <span>📍</span>
              {college.location}
            </p>

            <p className="mt-5 max-w-3xl leading-7 text-gray-200">
              {college.description}
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <a
                href={college.website}
                target="_blank"
                rel="noreferrer"
                className="rounded-lg bg-white px-6 py-3 font-semibold text-blue-900 transition hover:bg-blue-50"
              >
                Official Website ↗
              </a>

              <a
                href="#courses"
                className="rounded-lg border border-white/50 px-6 py-3 font-semibold transition hover:bg-white/10"
              >
                Explore Courses
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Information */}
      <section className="mx-auto -mt-1 max-w-7xl px-5 md:px-8">
        <div className="grid grid-cols-1 gap-4 rounded-xl border border-gray-200 bg-white p-5 shadow-sm sm:grid-cols-3">
          <div className="border-b border-gray-100 pb-4 sm:border-b-0 sm:border-r sm:pb-0">
            <p className="text-sm text-gray-500">College Type</p>
            <h3 className="mt-2 text-lg font-bold">{college.type}</h3>
          </div>

          <div className="border-b border-gray-100 pb-4 sm:border-b-0 sm:border-r sm:pb-0 sm:pl-5">
            <p className="text-sm text-gray-500">Established</p>
            <h3 className="mt-2 text-lg font-bold">
              {college.established}
            </h3>
          </div>

          <div className="sm:pl-5">
            <p className="text-sm text-gray-500">Courses Listed</p>
            <h3 className="mt-2 text-lg font-bold">
              {college.courses.length} course categories
            </h3>
          </div>
        </div>
      </section>

      {/* Section Navigation */}
      <nav className="sticky top-0 z-20 mt-8 border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-7xl gap-7 overflow-x-auto px-5 md:px-8">
          <a
            href="#overview"
            className="whitespace-nowrap border-b-2 border-blue-700 py-4 text-sm font-semibold text-blue-700"
          >
            Overview
          </a>

          <a
            href="#courses"
            className="whitespace-nowrap py-4 text-sm text-gray-600 hover:text-blue-700"
          >
            Courses
          </a>

          <a
            href="#facilities"
            className="whitespace-nowrap py-4 text-sm text-gray-600 hover:text-blue-700"
          >
            Facilities
          </a>

          <a
            href="#admission"
            className="whitespace-nowrap py-4 text-sm text-gray-600 hover:text-blue-700"
          >
            Admission
          </a>

          <a
            href="#contact"
            className="whitespace-nowrap py-4 text-sm text-gray-600 hover:text-blue-700"
          >
            Contact
          </a>
        </div>
      </nav>

      {/* Main Content */}
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-5 py-10 md:px-8 lg:grid-cols-3">
        {/* Left Content */}
        <div className="space-y-8 lg:col-span-2">
          {/* Overview */}
          <section
            id="overview"
            className="scroll-mt-24 rounded-xl border border-gray-200 bg-white p-6 md:p-8"
          >
            <h2 className="text-2xl font-bold">About the College</h2>

            <div className="mt-4 h-1 w-14 rounded bg-blue-700" />

            <p className="mt-5 leading-8 text-gray-600">
              {college.description}
            </p>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="rounded-lg bg-gray-50 p-4">
                <p className="text-sm text-gray-500">College Name</p>
                <p className="mt-2 font-semibold">{college.name}</p>
              </div>

              <div className="rounded-lg bg-gray-50 p-4">
                <p className="text-sm text-gray-500">Location</p>
                <p className="mt-2 font-semibold">{college.location}</p>
              </div>

              <div className="rounded-lg bg-gray-50 p-4">
                <p className="text-sm text-gray-500">Ownership</p>
                <p className="mt-2 font-semibold">{college.type}</p>
              </div>

              <div className="rounded-lg bg-gray-50 p-4">
                <p className="text-sm text-gray-500">Established Year</p>
                <p className="mt-2 font-semibold">
                  {college.established}
                </p>
              </div>
            </div>
          </section>

          {/* Courses */}
          <section
            id="courses"
            className="scroll-mt-24 rounded-xl border border-gray-200 bg-white p-6 md:p-8"
          >
            <h2 className="text-2xl font-bold">Courses & Programs</h2>

            <p className="mt-2 text-gray-500">
              Programs listed for this college. Confirm current availability
              and eligibility with the official institution.
            </p>

            <div className="mt-6 overflow-x-auto">
              <table className="w-full min-w-[400px] text-left">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="px-4 py-3 text-sm font-semibold">
                      Course
                    </th>

                    <th className="px-4 py-3 text-sm font-semibold">
                      Details
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {college.courses.map((course) => (
                    <tr
                      key={course}
                      className="border-b border-gray-100 last:border-0"
                    >
                      <td className="px-4 py-4 font-medium">{course}</td>

                      <td className="px-4 py-4 text-sm text-gray-500">
                        Check official website
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <p className="mt-4 text-sm text-gray-500">
              Fees, seat availability and course duration should be confirmed
              using the latest official admission information.
            </p>
          </section>

          {/* Facilities */}
          <section
            id="facilities"
            className="scroll-mt-24 rounded-xl border border-gray-200 bg-white p-6 md:p-8"
          >
            <h2 className="text-2xl font-bold">Facilities & Infrastructure</h2>

            <p className="mt-2 text-gray-500">
              Check the college website for details about available facilities.
            </p>

            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
              {college.facilities.map((facility) => (
                <div
                  key={facility}
                  className="flex items-center gap-4 rounded-lg border border-gray-200 p-4 transition hover:border-blue-300 hover:bg-blue-50/40"
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-xl">
                    🏥
                  </div>

                  <div>
                    <h3 className="font-semibold">{facility}</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Check official details
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Admission */}
          <section
            id="admission"
            className="scroll-mt-24 rounded-xl border border-gray-200 bg-white p-6 md:p-8"
          >
            <h2 className="text-2xl font-bold">Admission Process</h2>

            <p className="mt-3 leading-7 text-gray-600">
              Admission eligibility, counselling procedures, cut-offs, seat
              availability and important dates may vary by course and admission
              year.
            </p>

            <div className="mt-6 space-y-4">
              {[
                {
                  number: "01",
                  title: "Check Eligibility",
                  text: "Review the eligibility criteria for your selected course.",
                },
                {
                  number: "02",
                  title: "Review Counselling Details",
                  text: "Check the applicable official counselling process.",
                },
                {
                  number: "03",
                  title: "Verify Documents",
                  text: "Prepare the documents required by the admission authority.",
                },
                {
                  number: "04",
                  title: "Confirm Admission",
                  text: "Follow the official instructions for seat allotment and reporting.",
                },
              ].map((step) => (
                <div key={step.number} className="flex gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blue-50 font-bold text-blue-700">
                    {step.number}
                  </div>

                  <div>
                    <h3 className="font-semibold">{step.title}</h3>
                    <p className="mt-1 text-sm leading-6 text-gray-500">
                      {step.text}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <a
              href={college.website}
              target="_blank"
              rel="noreferrer"
              className="mt-6 inline-flex rounded-lg bg-blue-700 px-5 py-3 font-semibold text-white transition hover:bg-blue-800"
            >
              Check Official Admission Information ↗
            </a>
          </section>
        </div>

        {/* Right Sidebar */}
        <aside className="space-y-6">
          {/* Contact Card */}
          <section
            id="contact"
            className="scroll-mt-24 rounded-xl border border-gray-200 bg-white p-6"
          >
            <h2 className="text-xl font-bold">College Information</h2>

            <p className="mt-2 text-sm leading-6 text-gray-500">
              Use the official website to verify current contact information.
            </p>

            <div className="mt-5 space-y-4">
              <div>
                <p className="text-sm text-gray-500">College</p>
                <p className="mt-1 font-medium">{college.shortName}</p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Location</p>
                <p className="mt-1 font-medium">{college.location}</p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Website</p>
                <a
                  href={college.website}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-1 inline-block break-all font-medium text-blue-700 hover:underline"
                >
                  Visit Official Website ↗
                </a>
              </div>
            </div>

            <a
              href={college.website}
              target="_blank"
              rel="noreferrer"
              className="mt-6 block rounded-lg bg-blue-700 px-5 py-3 text-center font-semibold text-white transition hover:bg-blue-800"
            >
              Visit College Website
            </a>
          </section>

          {/* Important Note */}
          <section className="rounded-xl border border-blue-100 bg-blue-50 p-6">
            <h3 className="text-lg font-bold text-blue-950">
              Admission Information
            </h3>

            <p className="mt-3 text-sm leading-6 text-blue-900/80">
              Before applying, verify the latest eligibility rules, fees,
              counselling dates and seat availability from the official
              admission authority.
            </p>
          </section>

          {/* Back Button */}
          <Link
            href="/college"
            className="block rounded-xl border border-gray-200 bg-white px-5 py-4 text-center font-semibold text-gray-700 transition hover:border-blue-300 hover:text-blue-700"
          >
            ← Back to All Colleges
          </Link>
        </aside>
      </div>
    </main>
  );
}