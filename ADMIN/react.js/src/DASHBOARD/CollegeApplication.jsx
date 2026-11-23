import { useEffect, useState } from "react";
import { FiEye } from "react-icons/fi";
import { API } from "../api/axios.js";

const statusOptions = [
  "Submitted",
  "Pending",
  "Under Review",
  "Approved",
  "Rejected",
];

const statusColors = {
  Submitted: "bg-blue-100 text-blue-700",
  Pending: "bg-yellow-100 text-yellow-700",
  "Under Review": "bg-purple-100 text-purple-700",
  Approved: "bg-teal-100 text-teal-800",
  Rejected: "bg-red-100 text-red-700",
};

const actionButton =
  "inline-flex h-9 w-9 items-center justify-center rounded-lg border transition";

const glassCard =
  "rounded-2xl border border-white bg-white/65 p-5 text-[#0B2B2A] shadow-[0_4px_24px_rgba(15,118,110,0.08)] backdrop-blur-xl";

const CollegeApplications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  const fetchApplications = async () => {
    try {
      setLoading(true);

      const response = await API.get("/application/all");

      setApplications(response.data.applications || []);
    } catch (error) {
      console.error("Fetch Applications Error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const updateStatus = async (id, status) => {
    try {
      setUpdatingId(id);

      const response = await API.put(`/application/update-status/${id}`, {
        status,
      });

      setApplications((previous) =>
        previous.map((application) =>
          application._id === id
            ? { ...application, status: response.data.application.status }
            : application
        )
      );

      if (selectedApplication?._id === id) {
        setSelectedApplication(response.data.application);
      }
    } catch (error) {
      console.error("Update Status Error:", error);
      alert(
        error.response?.data?.message || "Unable to update application status"
      );
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredApplications = applications.filter((application) => {
    const studentName = application.student?.name || "";
    const studentEmail = application.student?.email || "";

    const searchText = [
      application.applicationId,
      studentName,
      studentEmail,
      application.collegeName,
      application.course,
      application.state,
    ]
      .join(" ")
      .toLowerCase();

    return searchText.includes(search.toLowerCase());
  });

  const totalApplications = applications.length;
  const pendingApplications = applications.filter(
    (application) =>
      application.status === "Pending" ||
      application.status === "Submitted" ||
      application.status === "Under Review"
  ).length;
  const approvedApplications = applications.filter(
    (application) => application.status === "Approved"
  ).length;
  const rejectedApplications = applications.filter(
    (application) => application.status === "Rejected"
  ).length;

  return (
    <div className="min-w-0 space-y-6">

      {/* PAGE HEADER */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#0B2B2A]">
            College Applications
          </h1>

          <p className="mt-1 text-sm text-[#3F5A58]">
            Manage and track student college applications
          </p>
        </div>

        <button
          type="button"
          onClick={fetchApplications}
          className="rounded-xl border border-[#CFE5E2] bg-white px-5 py-2.5 text-sm font-semibold text-[#0B2B2A] hover:bg-teal-50"
        >
          ↻ Refresh
        </button>
      </div>

      {/* STATISTICS */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className={glassCard}>
          <p className="text-sm font-medium text-[#3F5A58]">
            Total Applications
          </p>
          <h2 className="mt-2 text-3xl font-bold text-[#0B2B2A]">
            {totalApplications}
          </h2>
          <span className="mt-2 block text-xs text-[#3F5A58]">
            All applications
          </span>
        </div>

        <div className={glassCard}>
          <p className="text-sm font-medium text-[#3F5A58]">In Progress</p>
          <h2 className="mt-2 text-3xl font-bold text-yellow-600">
            {pendingApplications}
          </h2>
          <span className="mt-2 block text-xs text-[#3F5A58]">
            Awaiting decision
          </span>
        </div>

        <div className={glassCard}>
          <p className="text-sm font-medium text-[#3F5A58]">Approved</p>
          <h2 className="mt-2 text-3xl font-bold text-teal-700">
            {approvedApplications}
          </h2>
          <span className="mt-2 block text-xs text-[#3F5A58]">
            Successfully approved
          </span>
        </div>

        <div className={glassCard}>
          <p className="text-sm font-medium text-[#3F5A58]">Rejected</p>
          <h2 className="mt-2 text-3xl font-bold text-red-600">
            {rejectedApplications}
          </h2>
          <span className="mt-2 block text-xs text-[#3F5A58]">
            Rejected applications
          </span>
        </div>
      </div>

      {/* SEARCH */}
      <input
        type="text"
        placeholder="Search student, college, course..."
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        className="w-full max-w-sm rounded-xl border border-[#9DBDBA] bg-white/80 px-4 py-2.5 text-sm text-[#0B2B2A] outline-none placeholder:text-[#4B6463] focus:border-teal-700 focus:ring-2 focus:ring-teal-200"
      />

      {/* APPLICATIONS TABLE */}
      <div className="overflow-x-auto rounded-2xl border border-white bg-white/65 text-[#0B2B2A] shadow-[0_4px_24px_rgba(15,118,110,0.08)] backdrop-blur-xl">
        <table className="w-full min-w-[1050px] text-left text-sm">
          <thead className="bg-[#F1F8F7] text-[11px] font-bold uppercase tracking-wider text-[#3F5A58]">
            <tr>
              <th className="px-4 py-4">Application ID</th>
              <th className="px-4 py-4">Student</th>
              <th className="px-4 py-4">College</th>
              <th className="px-4 py-4">Course</th>
              <th className="px-4 py-4">Round</th>
              <th className="px-4 py-4">Status</th>
              <th className="px-4 py-4">Submitted</th>
              <th className="px-4 py-4">Actions</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan="8"
                  className="px-4 py-10 text-center text-[#3F5A58]"
                >
                  Loading applications...
                </td>
              </tr>
            ) : filteredApplications.length === 0 ? (
              <tr>
                <td
                  colSpan="8"
                  className="px-4 py-10 text-center text-[#3F5A58]"
                >
                  No applications found.
                </td>
              </tr>
            ) : (
              filteredApplications.map((application) => (
                <tr
                  key={application._id}
                  className="border-t border-[#CFE5E2] hover:bg-teal-50/70"
                >
                  <td className="px-4 py-4 font-semibold text-teal-700">
                    {application.applicationId}
                  </td>

                  <td className="px-4 py-4">
                    <p className="font-medium text-[#0B2B2A]">
                      {application.student?.name || "Student unavailable"}
                    </p>
                    <p className="mt-0.5 text-xs text-[#3F5A58]">
                      {application.student?.email || "-"}
                    </p>
                  </td>

                  <td className="px-4 py-4">{application.collegeName}</td>

                  <td className="px-4 py-4">{application.course}</td>

                  <td className="px-4 py-4">{application.round}</td>

                  <td className="px-4 py-4">
                    <select
                      value={application.status}
                      disabled={updatingId === application._id}
                      onChange={(event) =>
                        updateStatus(application._id, event.target.value)
                      }
                      className={`rounded-full border-0 px-3 py-1.5 text-xs font-semibold outline-none disabled:opacity-50 ${statusColors[application.status] ||
                        "bg-gray-100 text-gray-600"
                        }`}
                    >
                      {statusOptions.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </td>

                  <td className="px-4 py-4">
                    {application.submittedAt
                      ? new Date(application.submittedAt).toLocaleDateString()
                      : "-"}
                  </td>

                  <td className="px-4 py-4">
                    <button
                      type="button"
                      onClick={() => setSelectedApplication(application)}
                      title="View Application"
                      aria-label="View Application"
                      className={`${actionButton} border-teal-200 bg-teal-50 text-teal-700 hover:bg-teal-700 hover:text-white`}
                    >
                      <FiEye size={17} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* VIEW APPLICATION */}
      {selectedApplication && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6">

            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-[#0B2B2A]">
                  Application Details
                </h2>

                <p className="mt-1 text-xs text-[#3F5A58]">
                  {selectedApplication.applicationId}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedApplication(null)}
                aria-label="Close"
                className="text-2xl text-[#3F5A58]"
              >
                &times;
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <p>
                <b>Student Name:</b> {selectedApplication.student?.name || "-"}
              </p>

              <p className="break-all">
                <b>Student Email:</b>{" "}
                {selectedApplication.student?.email || "-"}
              </p>

              <p>
                <b>College:</b> {selectedApplication.collegeName || "-"}
              </p>

              <p>
                <b>Course:</b> {selectedApplication.course || "-"}
              </p>

              <p>
                <b>State:</b> {selectedApplication.state || "-"}
              </p>

              <p>
                <b>Round:</b> {selectedApplication.round || "-"}
              </p>

              <p>
                <b>Submitted:</b>{" "}
                {selectedApplication.submittedAt
                  ? new Date(selectedApplication.submittedAt).toLocaleString()
                  : "-"}
              </p>

              <p>
                <b>Status:</b>{" "}
                <span
                  className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${statusColors[selectedApplication.status] ||
                    "bg-gray-100 text-gray-600"
                    }`}
                >
                  {selectedApplication.status}
                </span>
              </p>

              <p className="whitespace-pre-wrap sm:col-span-2">
                <b>Remarks:</b>{" "}
                {selectedApplication.remarks || "No remarks available"}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setSelectedApplication(null)}
              className="mt-6 rounded-lg bg-teal-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-teal-800"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CollegeApplications;