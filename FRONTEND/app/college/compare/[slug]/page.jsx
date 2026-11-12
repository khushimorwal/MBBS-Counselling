"use client";

import { useParams } from "next/navigation";
import { useState } from "react";

const colleges = [
  {
    slug: "aiims-delhi",
    name: "AIIMS Delhi",
    city: "New Delhi",
    state: "Delhi",
    type: "Government",
    fees: "Check official website",
    duration: "5.5 Years",
    semesters: "10",
    rating: "—",
    reviews: "—",
    courses: ["MBBS"],
    image:
      "https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=900&q=85",
  },
  {
    slug: "sms-medical-college",
    name: "SMS Medical College",
    city: "Jaipur",
    state: "Rajasthan",
    type: "Government",
    fees: "Check official website",
    duration: "5.5 Years",
    semesters: "10",
    rating: "—",
    reviews: "—",
    courses: ["MBBS"],
    image:
      "https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?auto=format&fit=crop&w=900&q=85",
  },
  {
    slug: "aiims-jodhpur",
    name: "AIIMS Jodhpur",
    city: "Jodhpur",
    state: "Rajasthan",
    type: "Government",
    fees: "Check official website",
    duration: "5.5 Years",
    semesters: "10",
    rating: "—",
    reviews: "—",
    courses: ["MBBS"],
    image:
      "https://images.unsplash.com/photo-1564981797816-1043664bf78d?auto=format&fit=crop&w=900&q=85",
  },
  {
    slug: "pgimer-chandigarh",
    name: "PGIMER Chandigarh",
    city: "Chandigarh",
    state: "Chandigarh",
    type: "Government",
    fees: "Check official website",
    duration: "Course dependent",
    semesters: "—",
    rating: "—",
    reviews: "—",
    courses: ["Medical courses"],
    image:
      "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=900&q=85",
  },
  {
    slug: "kgmu-lucknow",
    name: "KGMU Lucknow",
    city: "Lucknow",
    state: "Uttar Pradesh",
    type: "Government",
    fees: "Check official website",
    duration: "5.5 Years",
    semesters: "10",
    rating: "—",
    reviews: "—",
    courses: ["MBBS"],
    image:
      "https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&w=900&q=85",
  },
  {
    slug: "aiims-bhopal",
    name: "AIIMS Bhopal",
    city: "Bhopal",
    state: "Madhya Pradesh",
    type: "Government",
    fees: "Check official website",
    duration: "5.5 Years",
    semesters: "10",
    rating: "—",
    reviews: "—",
    courses: ["MBBS"],
    image:
      "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=900&q=85",
  },
];

export default function CompareCollegePage() {
  const params = useParams();

  const [firstSlug, setFirstSlug] = useState(params.slug || "");
  const [secondSlug, setSecondSlug] = useState("");
  const [thirdSlug, setThirdSlug] = useState("");

  const firstCollege = colleges.find(
    (college) => college.slug === firstSlug
  );

  const secondCollege = colleges.find(
    (college) => college.slug === secondSlug
  );

  const thirdCollege = colleges.find(
    (college) => college.slug === thirdSlug
  );

  const selectedSlugs = [
    firstSlug,
    secondSlug,
    thirdSlug,
  ].filter(Boolean);

  const availableColleges = colleges.filter(
    (college) => !selectedSlugs.includes(college.slug)
  );

  function handleCollegeChange(value, position) {
    const selected = colleges.find(
      (college) =>
        college.name.toLowerCase() === value.toLowerCase()
    );

    if (position === 1) {
      setFirstSlug(selected?.slug || "");
    }

    if (position === 2) {
      setSecondSlug(selected?.slug || "");
    }

    if (position === 3) {
      setThirdSlug(selected?.slug || "");
    }
  }

  function clearCollege(position) {
    if (position === 1) setFirstSlug("");
    if (position === 2) setSecondSlug("");
    if (position === 3) setThirdSlug("");
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#eaf8fa] pb-16 pt-28">

      {/* Background Image */}
      <div
        className="absolute inset-0 h-[430px] bg-cover bg-center"
        style={{
          backgroundImage:
            "linear-gradient(90deg, rgba(220,246,248,0.88), rgba(220,246,248,0.55)), url('https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=2000&q=90')",
        }}
      />

      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#eaf8fa]/90 to-[#eaf8fa]" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        {/* Heading */}
        <div className="mb-8 max-w-2xl">

          <span className="inline-block rounded-full border border-teal-200 bg-white/60 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-teal-700 backdrop-blur-xl">
            Medical Education
          </span>

          <h1 className="mt-4 text-2xl font-extrabold text-slate-800 sm:text-3xl">
            Compare Colleges
          </h1>

          <p className="mt-2 max-w-xl text-sm leading-6 text-slate-600">
            Compare medical colleges side by side and explore
            their courses, fees and other important details.
          </p>

        </div>

        {/* Search Inputs */}
        <div className="mb-9 rounded-3xl border border-white/80 bg-white/50 p-5 shadow-[0_12px_40px_rgba(35,112,120,0.12)] backdrop-blur-2xl sm:p-7">

          <div className="mb-5">
            <h2 className="text-lg font-bold text-slate-800">
              Select Colleges to Compare
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Search and select up to three medical colleges.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">

            <CollegeSearch
              label="College 1"
              college={firstCollege}
              colleges={availableColleges}
              onChange={(value) =>
                handleCollegeChange(value, 1)
              }
              onClear={() => clearCollege(1)}
            />

            <CollegeSearch
              label="College 2"
              college={secondCollege}
              colleges={availableColleges}
              onChange={(value) =>
                handleCollegeChange(value, 2)
              }
              onClear={() => clearCollege(2)}
            />

            <CollegeSearch
              label="College 3"
              college={thirdCollege}
              colleges={availableColleges}
              onChange={(value) =>
                handleCollegeChange(value, 3)
              }
              onClear={() => clearCollege(3)}
            />

          </div>
        </div>

        {/* Selected College Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">

          {firstCollege && (
            <CollegeCard
              college={firstCollege}
              title="College 1"
            />
          )}

          {secondCollege && (
            <CollegeCard
              college={secondCollege}
              title="College 2"
            />
          )}

          {thirdCollege && (
            <CollegeCard
              college={thirdCollege}
              title="College 3"
            />
          )}

        </div>

        {/* Comparison Table */}
        {selectedSlugs.length >= 2 && (
          <div className="mt-12">

            <div className="mb-6">
              <span className="text-xs font-bold uppercase tracking-widest text-teal-600">
                Side By Side
              </span>

              <h2 className="mt-2 text-2xl font-extrabold text-slate-800 sm:text-3xl">
                College Comparison Details
              </h2>
            </div>

            <div className="overflow-hidden rounded-3xl border border-white/80 bg-white/50 shadow-xl backdrop-blur-2xl">

              <div className="overflow-x-auto">
                <table className="w-full min-w-[650px] border-collapse text-left text-sm">

                  <thead>
                    <tr className="bg-teal-700 text-white">

                      <th className="p-4">
                        Details
                      </th>

                      {selectedSlugs.map((slug) => {
                        const college = colleges.find(
                          (item) => item.slug === slug
                        );

                        return (
                          <th key={slug} className="p-4">
                            {college.name}
                          </th>
                        );
                      })}

                    </tr>
                  </thead>

                  <tbody>

                    {[
                      ["Location", "city", "state"],
                      ["College Type", "type"],
                      ["Fees", "fees"],
                      ["Duration", "duration"],
                      ["Semesters", "semesters"],
                      ["Rating", "rating"],
                      ["Reviews", "reviews"],
                      ["Courses", "courses"],
                    ].map(([label, ...keys]) => (
                      <tr
                        key={label}
                        className="border-t border-teal-100 transition hover:bg-teal-50/60"
                      >

                        <th className="bg-white/40 p-4 font-semibold text-slate-600">
                          {label}
                        </th>

                        {selectedSlugs.map((slug) => {
                          const college = colleges.find(
                            (item) => item.slug === slug
                          );

                          let value;

                          if (label === "Location") {
                            value = `${college.city}, ${college.state}`;
                          } else if (label === "Courses") {
                            value = college.courses.join(", ");
                          } else {
                            value = college[keys[0]];
                          }

                          return (
                            <td
                              key={slug}
                              className="p-4 font-medium text-slate-700"
                            >
                              {value}
                            </td>
                          );
                        })}

                      </tr>
                    ))}

                  </tbody>

                </table>
              </div>
            </div>
          </div>
        )}

      </div>
    </main>
  );
}

/* Search Input */

function CollegeSearch({
  label,
  college,
  colleges,
  onChange,
  onClear,
}) {
  const listId = `college-list-${label.replace(" ", "")}`;

  return (
    <div>
      <label className="mb-2 block text-sm font-bold text-slate-700">
        {label}
      </label>

      <div className="relative">

        <input
          type="text"
          list={listId}
          value={college?.name || ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Search college..."
          className="w-full rounded-2xl border border-white bg-white/75 px-4 py-3.5 pr-12 text-sm text-slate-700 shadow-sm outline-none backdrop-blur-xl transition placeholder:text-slate-400 focus:border-teal-400 focus:ring-4 focus:ring-teal-100"
        />

        <datalist id={listId}>
          {colleges.map((item) => (
            <option key={item.slug} value={item.name} />
          ))}
        </datalist>

        {college && (
          <button
            type="button"
            onClick={onClear}
            aria-label={`Remove ${label}`}
            className="absolute right-3 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full bg-rose-50 text-lg font-bold text-rose-500 transition hover:bg-rose-100"
          >
            ×
          </button>
        )}

      </div>
    </div>
  );
}

/* College Card */

function CollegeCard({ college, title }) {
  return (
    <div className="group overflow-hidden rounded-3xl border border-white/80 bg-white/50 shadow-[0_12px_40px_rgba(35,112,120,0.12)] backdrop-blur-2xl transition duration-300 hover:-translate-y-2 hover:shadow-xl">

      <div className="relative h-48 overflow-hidden">

        <img
          src={college.image}
          alt={college.name}
          className="h-full w-full object-cover transition duration-700 group-hover:scale-110"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent" />

        <span className="absolute bottom-4 left-4 rounded-full border border-white/50 bg-white/80 px-3 py-1 text-xs font-bold text-teal-800 backdrop-blur-md">
          {title}
        </span>

      </div>

      <div className="p-5">

        <span className="rounded-full bg-teal-100 px-3 py-1 text-xs font-semibold text-teal-700">
          {college.type}
        </span>

        <h3 className="mt-4 text-xl font-extrabold text-slate-800">
          {college.name}
        </h3>

        <p className="mt-2 text-sm text-slate-500">
          📍 {college.city}, {college.state}
        </p>

        <div className="mt-5 space-y-3 border-t border-teal-100 pt-4">

          <DetailItem
            label="Course"
            value={college.courses.join(", ")}
          />

          <DetailItem
            label="Duration"
            value={college.duration}
          />

          <DetailItem
            label="Fees"
            value={college.fees}
          />

        </div>

      </div>
    </div>
  );
}

/* Detail Item */

function DetailItem({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-3 text-sm">

      <span className="text-slate-500">
        {label}
      </span>

      <span className="text-right font-semibold text-slate-700">
        {value}
      </span>

    </div>
  );
}