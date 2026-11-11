import { useEffect, useState } from "react";
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
  Approved: "bg-green-100 text-green-700",
  Rejected: "bg-red-100 text-red-700",
};

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
    <div className="space-y-6 p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            College Applications
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage and track student college applications.
          </p>
        </div>

        <button
          onClick={fetchApplications}
          className="rounded-xl bg-brand px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
        >
          ↻ Refresh
        </button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Total Applications</p>
          <h2 className="mt-2 text-3xl font-bold text-gray-800">
            {totalApplications}
          </h2>
          <span className="mt-2 block text-xs text-blue-600">
            All applications
          </span>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">In Progress</p>
          <h2 className="mt-2 text-3xl font-bold text-yellow-600">
            {pendingApplications}
          </h2>
          <span className="mt-2 block text-xs text-gray-400">
            Awaiting decision
          </span>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Approved</p>
          <h2 className="mt-2 text-3xl font-bold text-green-600">
            {approvedApplications}
          </h2>
          <span className="mt-2 block text-xs text-gray-400">
            Successfully approved
          </span>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Rejected</p>
          <h2 className="mt-2 text-3xl font-bold text-red-600">
            {rejectedApplications}
          </h2>
          <span className="mt-2 block text-xs text-gray-400">
            Rejected applications
          </span>
        </div>
      </div>

      {/* Applications Table */}
      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        <div className="flex flex-col justify-between gap-3 border-b border-gray-100 p-5 sm:flex-row sm:items-center">
          <div>
            <h2 className="font-bold text-gray-800">All Applications</h2>
            <p className="mt-1 text-xs text-gray-500">
              {filteredApplications.length} applications found
            </p>
          </div>

          <input
            type="text"
            placeholder="Search student, college, course..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-brand sm:max-w-xs"
          />
        </div>

        {loading ? (
          <div className="p-12 text-center text-sm text-gray-500">
            Loading applications...
          </div>
        ) : filteredApplications.length === 0 ? (
          <div className="p-12 text-center">
            <div className="mb-3 text-4xl">📋</div>
            <h3 className="font-semibold text-gray-700">
              No Applications Found
            </h3>
            <p className="mt-1 text-sm text-gray-400">
              Student applications will appear here.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1050px] text-left text-sm">
              <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                <tr>
                  <th className="px-5 py-4">Application ID</th>
                  <th className="px-5 py-4">Student</th>
                  <th className="px-5 py-4">College</th>
                  <th className="px-5 py-4">Course</th>
                  <th className="px-5 py-4">Round</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4">Submitted</th>
                  <th className="px-5 py-4">Action</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {filteredApplications.map((application) => (
                  <tr
                    key={application._id}
                    className="transition hover:bg-gray-50"
                  >
                    <td className="px-5 py-4 font-semibold text-brand">
                      {application.applicationId}
                    </td>

                    <td className="px-5 py-4">
                      <p className="font-semibold text-gray-800">
                        {application.student?.name || "Student unavailable"}
                      </p>
                      <p className="mt-1 text-xs text-gray-400">
                        {application.student?.email || "—"}
                      </p>
                    </td>

                    <td className="px-5 py-4 font-medium text-gray-700">
                      {application.collegeName}
                    </td>

                    <td className="px-5 py-4 text-gray-600">
                      {application.course}
                    </td>

                    <td className="px-5 py-4 text-gray-600">
                      {application.round}
                    </td>

                    <td className="px-5 py-4">
                      <select
                        value={application.status}
                        disabled={updatingId === application._id}
                        onChange={(event) =>
                          updateStatus(application._id, event.target.value)
                        }
                        className={`rounded-full border-0 px-3 py-1.5 text-xs font-semibold outline-none disabled:opacity-50 ${
                          statusColors[application.status] ||
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

                    <td className="px-5 py-4 text-gray-500">
                      {application.submittedAt
                        ? new Date(application.submittedAt).toLocaleDateString()
                        : "—"}
                    </td>

                    <td className="px-5 py-4">
                      <button
                        onClick={() => setSelectedApplication(application)}
                        className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-semibold text-brand transition hover:bg-brand hover:text-white"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Application Details Modal */}
      {selectedApplication && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b p-5">
              <div>
                <h2 className="text-lg font-bold text-gray-800">
                  Application Details
                </h2>
                <p className="mt-1 text-xs text-gray-400">
                  {selectedApplication.applicationId}
                </p>
              </div>

              <button
                onClick={() => setSelectedApplication(null)}
                className="rounded-lg px-3 py-1 text-xl text-gray-500 hover:bg-gray-100"
              >
                ×
              </button>
            </div>

            <div className="grid grid-cols-1 gap-5 p-5 sm:grid-cols-2">
              <div>
                <p className="text-xs text-gray-400">Student Name</p>
                <p className="mt-1 font-semibold text-gray-800">
                  {selectedApplication.student?.name || "—"}
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-400">Student Email</p>
                <p className="mt-1 font-semibold text-gray-800">
                  {selectedApplication.student?.email || "—"}
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-400">College Name</p>
                <p className="mt-1 font-semibold text-gray-800">
                  {selectedApplication.collegeName}
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-400">Course</p>
                <p className="mt-1 font-semibold text-gray-800">
                  {selectedApplication.course}
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-400">State</p>
                <p className="mt-1 font-semibold text-gray-800">
                  {selectedApplication.state}
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-400">Round</p>
                <p className="mt-1 font-semibold text-gray-800">
                  {selectedApplication.round}
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-400">Submitted Date</p>
                <p className="mt-1 font-semibold text-gray-800">
                  {selectedApplication.submittedAt
                    ? new Date(
                        selectedApplication.submittedAt
                      ).toLocaleString()
                    : "—"}
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-400">Status</p>
                <span
                  className={`mt-1 inline-block rounded-full px-3 py-1 text-xs font-semibold ${
                    statusColors[selectedApplication.status] ||
                    "bg-gray-100 text-gray-600"
                  }`}
                >
                  {selectedApplication.status}
                </span>
              </div>

              <div className="sm:col-span-2">
                <p className="text-xs text-gray-400">Remarks</p>
                <p className="mt-1 whitespace-pre-wrap text-sm text-gray-700">
                  {selectedApplication.remarks || "No remarks available"}
                </p>
              </div>
            </div>

            <div className="flex justify-end border-t p-5">
              <button
                onClick={() => setSelectedApplication(null)}
                className="rounded-xl bg-gray-100 px-5 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CollegeApplications;