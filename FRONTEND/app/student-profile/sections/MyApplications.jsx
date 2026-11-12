"use client";

import { useEffect, useMemo, useState } from "react";

const API_URL = "http://localhost:3000";

export default function MyApplications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [colleges, setColleges] = useState([]);
  const [selectedCollege, setSelectedCollege] = useState("");
  const [selectedRound, setSelectedRound] = useState("Round 1");
  const [selectedApplication, setSelectedApplication] = useState(null);

  // FETCH MY APPLICATIONS
  const fetchApplications = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      const response = await fetch(
        `${API_URL}/application/my-applications`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to fetch applications");
      }

      // Supports common API response formats
      const applicationList = Array.isArray(data)
        ? data
        : data.applications || data.data || [];

      setApplications(applicationList);

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  // FETCH ALL COLLEGES
  const fetchColleges = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        `${API_URL}/college/public-list`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to fetch colleges");
      }

      const collegeList = Array.isArray(data)
        ? data
        : data.colleges || data.data || [];

      setColleges(collegeList);

      console.log("COLLEGES:", collegeList);

    } catch (error) {
      console.error("College Fetch Error:", error);
    }
  };

  useEffect(() => {
    fetchColleges();
  }, []);

  // SEARCH AND FILTER
  const filteredApplications = useMemo(() => {
    return applications.filter((application) => {
      const collegeName =
        application.collegeName ||
        application.college?.name ||
        "";

      const applicationId =
        application.applicationId ||
        application._id ||
        "";

      const courseName =
        application.courseName ||
        application.course?.name ||
        application.course ||
        "";

      const searchText = search.toLowerCase();

      const matchesSearch =
        collegeName.toLowerCase().includes(searchText) ||
        String(applicationId).toLowerCase().includes(searchText) ||
        String(courseName).toLowerCase().includes(searchText);

      const status = String(application.status || "").toLowerCase();

      const matchesStatus =
        statusFilter === "all" ||
        status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [applications, search, statusFilter]);

  // SUMMARY COUNTS
  const totalApplications = applications.length;

  const pendingApplications = applications.filter(
    (app) => String(app.status).toLowerCase() === "pending"
  ).length;

  const approvedApplications = applications.filter(
    (app) => String(app.status).toLowerCase() === "approved"
  ).length;

  const rejectedApplications = applications.filter(
    (app) => String(app.status).toLowerCase() === "rejected"
  ).length;

  // STATUS BADGE
  const getStatusStyle = (status) => {
    switch (String(status || "").toLowerCase()) {
      case "approved":
        return "bg-green-100 text-green-700";

      case "rejected":
        return "bg-red-100 text-red-700";

      case "pending":
        return "bg-yellow-100 text-yellow-700";

      default:
        return "bg-slate-100 text-slate-600";
    }
  };

  if (loading) {
    return (
      <div className="rounded-2xl bg-white p-10 text-center shadow-sm">
        Loading applications...
      </div>
    );
  }

  const handleApply = async () => {
    try {
      if (!selectedCollege) {
        alert("Please select a college");
        return;
      }

      const college = colleges.find(
        (item) => item._id === selectedCollege
      );

      if (!college) {
        alert("College not found");
        return;
      }

      const token = localStorage.getItem("token");

      const response = await fetch(
        `${API_URL}/application/create`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            collegeName: college.name,
            course: "MBBS",
            state: college.location?.state,
            round: selectedRound,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Application failed");
      }

      alert("Application submitted successfully!");

      setShowApplyModal(false);
      setSelectedCollege("");
      setSelectedRound("Round 1");

      fetchApplications();

    } catch (error) {
      console.error("Application Error:", error);
      alert(error.message);
    }
  };

  return (
    <div className="space-y-6">

      {/* PAGE HEADER */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#142653]">
            My Applications
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Track and manage your college applications.
          </p>



        </div>

        <button
          onClick={() => setShowApplyModal(true)}
          className="rounded-xl bg-teal-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-700"
        >
          + Apply to New College
        </button>


      </div>

      {/* APPLY TO NEW COLLEGE MODAL */}
      {showApplyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">

          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">

            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-bold text-[#142653]">
                Apply to New College
              </h2>

              <button
                onClick={() => setShowApplyModal(false)}
                className="text-2xl text-slate-400 hover:text-red-500"
              >
                ×
              </button>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Select College
              </label>

              <select
                value={selectedCollege}
                onChange={(e) => setSelectedCollege(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-teal-500"
              >
                <option value="">Choose a college</option>

                {colleges.map((college) => (
                  <option key={college._id} value={college._id}>
                    {college.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="mt-5">
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Counselling Round
              </label>

              <select
                value={selectedRound}
                onChange={(e) => setSelectedRound(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-teal-500"
              >
                <option value="Round 1">Round 1</option>
                <option value="Round 2">Round 2</option>
                <option value="Mop-up Round">Mop-up Round</option>
                <option value="Stray Vacancy Round">Stray Vacancy Round</option>
              </select>
            </div>

            <button
              onClick={handleApply}
              className="mt-7 w-full rounded-xl bg-teal-600 py-3 font-semibold text-white transition hover:bg-teal-700"
            >
              Continue
            </button>

          </div>
        </div>
      )}

      {/* ERROR */}
      {error && (
        <div className="rounded-xl bg-red-50 p-4 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* SUMMARY CARDS */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

        <SummaryCard
          title="Total Applications"
          count={totalApplications}
          icon="📄"
          color="bg-blue-50 text-blue-600"
        />

        <SummaryCard
          title="Pending"
          count={pendingApplications}
          icon="⏳"
          color="bg-yellow-50 text-yellow-600"
        />

        <SummaryCard
          title="Approved"
          count={approvedApplications}
          icon="✓"
          color="bg-green-50 text-green-600"
        />

        <SummaryCard
          title="Rejected"
          count={rejectedApplications}
          icon="✕"
          color="bg-red-50 text-red-600"
        />

      </div>

      {/* APPLICATION LIST */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">

        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-[#142653]">
              Application History
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Your submitted college applications
            </p>
          </div>

          <span className="text-sm font-medium text-slate-500">
            {filteredApplications.length} Applications
          </span>
        </div>

        {/* SEARCH AND FILTER */}
        <div className="mt-6 grid gap-3 sm:grid-cols-[1fr_200px]">

          <input
            type="text"
            placeholder="Search college, course or application ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
          />

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-teal-500"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>

        </div>

        {/* APPLICATION LIST */}
        <div className="mt-6 space-y-4">

          {filteredApplications.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-300 py-12 text-center">
              <div className="text-5xl">📄</div>
              <h3 className="mt-4 font-semibold text-slate-700">
                No Applications Found
              </h3>
              <p className="mt-2 text-sm text-slate-500">
                Your applications will appear here.
              </p>
            </div>
          ) : (
            filteredApplications.map((application) => {

              const collegeName =
                application.collegeName ||
                application.college?.name ||
                "College Name Not Available";

              const courseName =
                application.courseName ||
                application.course?.name ||
                application.course ||
                "MBBS";

              const applicationId =
                application.applicationId ||
                application._id;

              const appliedDate =
                application.createdAt ||
                application.appliedAt;

              const round =
                application.round || "Round 1";

              return (
                <div
                  key={application._id}
                  className="rounded-xl border border-slate-200 bg-white p-5 transition hover:border-teal-300 hover:shadow-md"
                >

                  <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

                    {/* COLLEGE DETAILS */}
                    <div className="flex items-start gap-4">

                      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-2xl">
                        🏛️
                      </div>

                      <div>
                        <h3 className="text-lg font-bold text-[#142653]">
                          {collegeName}
                        </h3>

                        <p className="mt-1 text-sm text-slate-500">
                          {courseName}
                        </p>
                      </div>

                    </div>

                    {/* APPLICATION INFORMATION */}
                    <div className="grid flex-1 gap-4 sm:grid-cols-3 lg:max-w-[550px]">

                      <div>
                        <p className="text-xs text-slate-400">
                          Application ID
                        </p>

                        <p className="mt-1 break-all text-sm font-semibold text-slate-700">
                          {applicationId}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-slate-400">
                          Submitted On
                        </p>

                        <p className="mt-1 text-sm font-semibold text-slate-700">
                          {appliedDate
                            ? new Date(appliedDate).toLocaleDateString("en-IN")
                            : "Not Available"}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-slate-400">
                          Counselling Round
                        </p>

                        <p className="mt-1 text-sm font-semibold text-slate-700">
                          {round}
                        </p>
                      </div>

                    </div>

                    {/* STATUS AND ACTION */}
                    <div className="flex flex-wrap items-center gap-3">

                      <span
                        className={`rounded-full px-4 py-2 text-xs font-semibold capitalize ${getStatusStyle(application.status)}`}
                      >
                        {application.status || "Submitted"}
                      </span>

                      <button
                        onClick={() => setSelectedApplication(application)}
                        className="rounded-lg border border-teal-500 px-4 py-2 text-sm font-semibold text-teal-600 transition hover:bg-teal-50"
                      >
                        View Details →
                      </button>

                    </div>

                  </div>

                </div>
              );
            })
          )}

        </div>

      </div>

      {/* APPLICATION DETAILS MODAL */}
      {selectedApplication && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">

          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">

            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-[#142653]">
                Application Details
              </h2>

              <button
                onClick={() => setSelectedApplication(null)}
                className="text-2xl text-slate-400 hover:text-red-500"
              >
                ×
              </button>
            </div>

            <div className="mt-6 space-y-4">

              <Info
                label="College"
                value={
                  selectedApplication.collegeName ||
                  selectedApplication.college?.name
                }
              />

              <Info
                label="Course"
                value={
                  selectedApplication.courseName ||
                  selectedApplication.course?.name ||
                  selectedApplication.course
                }
              />

              <Info
                label="Application ID"
                value={
                  selectedApplication.applicationId ||
                  selectedApplication._id
                }
              />

              <Info
                label="Status"
                value={selectedApplication.status}
              />

              <Info
                label="Applied Date"
                value={
                  selectedApplication.createdAt
                    ? new Date(
                      selectedApplication.createdAt
                   ).toLocaleDateString("en-IN")
                    : "Not Available"
                }
              />

              <Info
                label="State"
                value={selectedApplication.state || "N/A"}
              />

              <Info
                label="Counselling Round"
                value={selectedApplication.round || "N/A"}
              />

            </div>

            <button
              onClick={() => setSelectedApplication(null)}
              className="mt-6 w-full rounded-xl bg-teal-600 py-3 font-semibold text-white hover:bg-teal-700"
            >
              Close
            </button>

          </div>

        </div>
      )}

    </div>
  );
}

// SUMMARY CARD
function SummaryCard({ title, count, icon, color }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

      <div className="flex items-center justify-between">

        <div>
          <p className="text-sm font-medium text-slate-500">
            {title}
          </p>

          <h3 className="mt-2 text-3xl font-bold text-[#142653]">
            {count}
          </h3>
        </div>

        <div className={`flex h-12 w-12 items-center justify-center rounded-xl text-xl ${color}`}>
          {icon}
        </div>

      </div>

    </div>
  );
}

// DETAILS INFO
function Info({ label, value }) {
  return (
    <div>
      <p className="text-sm text-slate-400">{label}</p>

      <p className="mt-1 break-words font-semibold text-[#142653]">
        {value || "Not Available"}
      </p>
    </div>
  );
}