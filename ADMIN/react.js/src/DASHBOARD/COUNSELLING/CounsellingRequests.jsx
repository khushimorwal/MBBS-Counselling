
import React, { useEffect, useState } from "react";
import { API } from "../../api/axios";

const statuses = [
  "new",
  "assigned",
  "contact_pending",
  "in_progress",
  "recommendations_shared",
  "converted",
  "closed",
  "cancelled",
];

const statusLabels = {
  new: "New",
  assigned: "Assigned",
  contact_pending: "Contact Pending",
  in_progress: "In Progress",
  recommendations_shared: "Recommendations Shared",
  converted: "Converted",
  closed: "Closed",
  cancelled: "Cancelled",
};

const statusColors = {
  new: "bg-blue-100 text-blue-700",
  assigned: "bg-purple-100 text-purple-700",
  contact_pending: "bg-yellow-100 text-yellow-700",
  in_progress: "bg-indigo-100 text-indigo-700",
  recommendations_shared: "bg-cyan-100 text-cyan-700",
  converted: "bg-green-100 text-green-700",
  closed: "bg-gray-100 text-gray-700",
  cancelled: "bg-red-100 text-red-700",
};

const priorityColors = {
  low: "bg-gray-100 text-gray-700",
  normal: "bg-blue-100 text-blue-700",
  high: "bg-red-100 text-red-700",
};

const formatDate = (date) => {
  if (!date) return "—";

  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatLabel = (value) => {
  if (!value) return "—";

  return value
    .replaceAll("_", " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

function CounsellingRequests() {
  // Main States
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Counsellor States
  const [counsellors, setCounsellors] = useState([]);
  const [loadingCounsellors, setLoadingCounsellors] = useState(false);
  const [selectedCounsellor, setSelectedCounsellor] = useState("");

  // Filters
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [priority, setPriority] = useState("");
  const [admissionLevel, setAdmissionLevel] = useState("");

  // Pagination
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
  });

  // Modal States
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);

  // Workflow Modal States
  const [showWorkflowModal, setShowWorkflowModal] = useState(false);
  const [workflowStages, setWorkflowStages] = useState([]);
  const [loadingWorkflow, setLoadingWorkflow] = useState(false);
  const [savingWorkflow, setSavingWorkflow] = useState(false);

  // Status States
  const [newStatus, setNewStatus] = useState("");
  const [cancellationReason, setCancellationReason] = useState("");
  const [updating, setUpdating] = useState(false);
  const [assigning, setAssigning] = useState(false);

  // Fetch Requests
  const fetchRequests = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await API.get("/counselling/all", {
        params: {
          search: search.trim() || undefined,
          status: status || undefined,
          priority: priority || undefined,
          admissionLevel: admissionLevel || undefined,
          page,
          limit: 10,
        },
      });

      if (response.data.success) {
        setRequests(response.data.data || []);

        setPagination(
          response.data.pagination || {
            total: 0,
            page: 1,
            limit: 10,
            totalPages: 1,
          }
        );
      } else {
        setRequests([]);
        setError(
          response.data.message || "Unable to fetch counselling requests."
        );
      }
    } catch (err) {
      console.error("Counselling Requests Error:", err);

      setRequests([]);

      setError(
        err.response?.data?.message ||
          "Failed to load counselling requests."
      );
    } finally {
      setLoading(false);
    }
  };

  // Fetch Counsellors
  const fetchCounsellors = async () => {
    try {
      setLoadingCounsellors(true);
      setError("");

      const response = await API.get("/user/counsellors");

      if (response.data.status) {
        setCounsellors(response.data.data || []);
      } else {
        setCounsellors([]);
        setError(
          response.data.message || "Unable to fetch counsellors."
        );
      }
    } catch (err) {
      console.error("Counsellors Fetch Error:", err);

      setCounsellors([]);

      setError(
        err.response?.data?.message ||
          "Failed to fetch counsellors."
      );
    } finally {
      setLoadingCounsellors(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchRequests();
    }, 400);

    return () => clearTimeout(timer);
  }, [search, status, priority, admissionLevel, page]);

  // Reset Pagination
  const handleFilterChange = (setter, value) => {
    setter(value);
    setPage(1);
  };

  // Open Workflow Modal
  const openWorkflowModal = async (request) => {
    try {
      setError("");
      setSuccess("");
      setLoadingWorkflow(true);
      setSelectedRequest(request);
      setWorkflowStages([]);

      const response = await API.get(`/workflow/${request._id}`);

      if (response.data.success) {
        setWorkflowStages(response.data.workflowStages || []);
        setShowWorkflowModal(true);
      } else {
        setError(
          response.data.message || "Unable to load workflow stages."
        );
      }
    } catch (err) {
      console.error("Workflow Fetch Error:", err);

      setError(
        err.response?.data?.message ||
          "Unable to load workflow stages."
      );
    } finally {
      setLoadingWorkflow(false);
    }
  };

  // Save Workflow
  const handleSaveWorkflow = async () => {
    if (!selectedRequest) return;

    try {
      setSavingWorkflow(true);
      setError("");
      setSuccess("");

      for (const stage of workflowStages) {
        await API.put(
          `/workflow/${selectedRequest._id}/${stage.id}`,
          {
            status: stage.status,
            remarks: stage.remarks || "",
          }
        );
      }

      setShowWorkflowModal(false);

      setSuccess("Counselling workflow updated successfully.");
    } catch (err) {
      console.error("Save Workflow Error:", err);

      setError(
        err.response?.data?.message ||
          "Unable to save workflow."
      );
    } finally {
      setSavingWorkflow(false);
    }
  };

  // Open Details
  const openDetails = async (request) => {
    try {
      setError("");

      const response = await API.get(`/counselling/${request._id}`);

      if (response.data.success) {
        setSelectedRequest(response.data.data);
        setShowDetails(true);
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to load request details."
      );
    }
  };

  // Open Status Modal
  const openStatusModal = (request) => {
    setSelectedRequest(request);
    setNewStatus(request.status);
    setCancellationReason("");
    setShowStatusModal(true);
  };

  // Open Assign Counsellor Modal
  const openAssignModal = async (request) => {
    setSelectedRequest(request);
    setSelectedCounsellor("");
    setShowAssignModal(true);

    await fetchCounsellors();
  };

  // Assign Counsellor
  const handleAssignCounsellor = async (e) => {
    e.preventDefault();

    if (!selectedRequest) return;

    if (!selectedCounsellor) {
      setError("Please select a counsellor.");
      return;
    }

    try {
      setAssigning(true);
      setError("");
      setSuccess("");

      const response = await API.post(
        "/counselling-assignment/assign",
        {
          counsellingRequest: selectedRequest._id,
          counsellor: selectedCounsellor,
          assignmentType: "manual",
        }
      );

      if (response.data.success) {
        setShowAssignModal(false);
        setSelectedRequest(null);
        setSelectedCounsellor("");

        setSuccess(
          response.data.message ||
            "Counsellor assigned successfully."
        );

        await fetchRequests();
      }
    } catch (err) {
      console.error("Assign Counsellor Error:", err);

      setError(
        err.response?.data?.message ||
          "Unable to assign counsellor."
      );
    } finally {
      setAssigning(false);
    }
  };

  // Update Status
  const handleStatusUpdate = async (e) => {
    e.preventDefault();

    if (!selectedRequest) return;

    if (
      newStatus === "cancelled" &&
      !cancellationReason.trim()
    ) {
      setError("Cancellation reason is required.");
      return;
    }

    try {
      setUpdating(true);
      setError("");
      setSuccess("");

      const payload = {
        status: newStatus,
      };

      if (newStatus === "cancelled") {
        payload.cancellationReason = cancellationReason.trim();
      }

      const response = await API.patch(
        `/counselling/status/${selectedRequest._id}`,
        payload
      );

      if (response.data.success) {
        setShowStatusModal(false);
        setSelectedRequest(null);

        setSuccess(
          response.data.message ||
            "Request status updated successfully."
        );

        fetchRequests();
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to update request status."
      );
    } finally {
      setUpdating(false);
    }
  };

  // Clear Filters
  const clearFilters = () => {
    setSearch("");
    setStatus("");
    setPriority("");
    setAdmissionLevel("");
    setPage(1);
  };

  const hasFilters =
    search || status || priority || admissionLevel;

  return (
    <div className="mx-auto w-full max-w-[1500px]">

      {/* Heading */}
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>

          <h1 className="mt-2 font-display text-3xl font-bold text-brand-dark">
            Counselling Requests
          </h1>

          <p className="mt-2 text-sm text-muted">
            View and manage student counselling requests.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchRequests}
          disabled={loading}
          className="rounded-xl bg-accent px-5 py-3 text-sm font-bold text-white hover:bg-[#cf4a24] disabled:opacity-50"
        >
          {loading ? "Loading..." : "↻ Refresh"}
        </button>
      </div>

      {/* Messages */}
      {error && (
        <div className="mb-4 flex items-center justify-between rounded-xl border border-red-200 bg-red-50 px-4 py-3">
          <p className="text-sm text-red-700">{error}</p>

          <button
            type="button"
            onClick={() => setError("")}
            className="font-bold text-red-700"
          >
            ✕
          </button>
        </div>
      )}

      {success && (
        <div className="mb-4 flex items-center justify-between rounded-xl border border-green-200 bg-green-50 px-4 py-3">
          <p className="text-sm text-green-700">{success}</p>

          <button
            type="button"
            onClick={() => setSuccess("")}
            className="font-bold text-green-700"
          >
            ✕
          </button>
        </div>
      )}

      {/* Summary */}
      <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-line bg-white p-5 shadow-sm">
          <p className="text-sm text-muted">Total Requests</p>

          <h2 className="mt-2 font-display text-2xl font-bold text-brand-dark">
            {pagination.total}
          </h2>
        </div>

        <div className="rounded-2xl border border-line bg-white p-5 shadow-sm">
          <p className="text-sm text-muted">Current Page</p>

          <h2 className="mt-2 font-display text-2xl font-bold text-brand-dark">
            {pagination.page || 1}
          </h2>
        </div>

        <div className="rounded-2xl border border-line bg-white p-5 shadow-sm">
          <p className="text-sm text-muted">Total Pages</p>

          <h2 className="mt-2 font-display text-2xl font-bold text-brand-dark">
            {pagination.totalPages || 1}
          </h2>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-5 rounded-2xl border border-line bg-white p-4 shadow-sm">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">

          <input
            type="search"
            value={search}
            onChange={(e) =>
              handleFilterChange(setSearch, e.target.value)
            }
            placeholder="Search name, email or request number..."
            className="min-w-0 rounded-xl border border-line px-4 py-3 text-sm outline-none focus:border-brand"
          />

          <select
            value={status}
            onChange={(e) =>
              handleFilterChange(setStatus, e.target.value)
            }
            className="rounded-xl border border-line bg-white px-4 py-3 text-sm outline-none focus:border-brand"
          >
            <option value="">All Status</option>

            {statuses.map((item) => (
              <option key={item} value={item}>
                {statusLabels[item]}
              </option>
            ))}
          </select>

          <select
            value={priority}
            onChange={(e) =>
              handleFilterChange(setPriority, e.target.value)
            }
            className="rounded-xl border border-line bg-white px-4 py-3 text-sm outline-none focus:border-brand"
          >
            <option value="">All Priorities</option>
            <option value="low">Low</option>
            <option value="normal">Normal</option>
            <option value="high">High</option>
          </select>

          <select
            value={admissionLevel}
            onChange={(e) =>
              handleFilterChange(setAdmissionLevel, e.target.value)
            }
            className="rounded-xl border border-line bg-white px-4 py-3 text-sm outline-none focus:border-brand"
          >
            <option value="">All Admission Levels</option>
            <option value="UG">UG</option>
            <option value="PG">PG</option>
            <option value="Diploma">Diploma</option>
            <option value="Doctorate">Doctorate</option>
            <option value="Other">Other</option>
          </select>
        </div>

        {hasFilters && (
          <div className="mt-3 flex justify-end">
            <button
              type="button"
              onClick={clearFilters}
              className="text-sm font-semibold text-brand hover:underline"
            >
              Clear Filters ✕
            </button>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-line bg-white shadow-sm">

        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <div>
            <h2 className="font-display text-lg font-bold text-brand-dark">
              All Counselling Requests
            </h2>

            <p className="mt-1 text-xs text-muted">
              Showing {requests.length} of {pagination.total} requests
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1100px] text-left">

            <thead className="bg-[#F9FBFA]">
              <tr className="text-xs font-semibold uppercase tracking-wide text-muted">
                <th className="px-5 py-4">Student</th>
                <th className="px-5 py-4">Request Number</th>
                <th className="px-5 py-4">Admission Level</th>
                <th className="px-5 py-4">Preferred Stream</th>
                <th className="px-5 py-4">Priority</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4">Date</th>
                <th className="px-5 py-4">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-line">

              {loading ? (
                <tr>
                  <td colSpan="8" className="px-5 py-12 text-center text-sm text-muted">
                    Loading counselling requests...
                  </td>
                </tr>
              ) : requests.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-5 py-12 text-center text-sm text-muted">
                    No counselling requests found.
                  </td>
                </tr>
              ) : (
                requests.map((request) => (
                  <tr
                    key={request._id}
                    className="transition hover:bg-surface/60"
                  >

                    <td className="px-5 py-4">
  <p className="font-semibold text-brand-dark">
    {request.student?.name || "Unknown Student"}
  </p>
</td>

                    <td className="px-5 py-4 text-sm font-medium text-brand-dark">
                      {request.requestNumber}
                    </td>

                    <td className="px-5 py-4 text-sm text-brand-dark">
                      {request.admissionLevel || "—"}
                    </td>

                    <td className="px-5 py-4 text-sm text-brand-dark">
                      {request.preferredStreams?.length
                        ? request.preferredStreams
                            .map((stream) => stream.name || "—")
                            .join(", ")
                        : "—"}
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          priorityColors[request.priority] ||
                          "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {formatLabel(request.priority)}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          statusColors[request.status] ||
                          "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {statusLabels[request.status] || request.status}
                      </span>
                    </td>

                    <td className="px-5 py-4 text-sm text-muted">
                      {formatDate(request.createdAt)}
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">

                        <button
                          type="button"
                          onClick={() => openDetails(request)}
                          title="View Details"
                          className="rounded-lg border border-line px-3 py-2 text-sm hover:bg-surface"
                        >
                          👁
                        </button>

                        <button
                          type="button"
                          onClick={() => openWorkflowModal(request)}
                          disabled={loadingWorkflow}
                          className="rounded-lg bg-indigo-600 px-3 py-2 text-xs font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
                        >
                          Workflow
                        </button>

                        {request.status !== "assigned" &&
                          !["converted", "closed", "cancelled"].includes(
                            request.status
                          ) && (
                            <button
                              type="button"
                              onClick={() => openAssignModal(request)}
                              className="rounded-lg bg-purple-600 px-3 py-2 text-xs font-semibold text-white hover:bg-purple-700"
                            >
                              Assign
                            </button>
                          )}

                        <button
                          type="button"
                          onClick={() => openStatusModal(request)}
                          title="Update Status"
                          className="rounded-lg bg-accent px-3 py-2 text-xs font-bold text-white hover:bg-[#cf4a24]"
                        >
                          Update
                        </button>

                      </div>
                    </td>
                  </tr>
                ))
              )}

            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex flex-col justify-between gap-3 border-t border-line px-5 py-4 sm:flex-row sm:items-center">

          <p className="text-sm text-muted">
            Page {pagination.page || 1} of {pagination.totalPages || 1}
          </p>

          <div className="flex items-center gap-2">

            <button
              type="button"
              disabled={page <= 1 || loading}
              onClick={() => setPage((prev) => prev - 1)}
              className="rounded-lg border border-line px-4 py-2 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-40"
            >
              Previous
            </button>

            <button
              type="button"
              disabled={page >= (pagination.totalPages || 1) || loading}
              onClick={() => setPage((prev) => prev + 1)}
              className="rounded-lg border border-line px-4 py-2 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-40"
            >
              Next
            </button>

          </div>
        </div>
      </div>

      {/* DETAILS MODAL */}
      {showDetails && selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">

          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-xl">

            <div className="sticky top-0 flex items-center justify-between border-b border-line bg-white px-6 py-4">
              <div>
                <h2 className="font-display text-xl font-bold text-brand-dark">
                  Request Details
                </h2>

                <p className="mt-1 text-xs text-muted">
                  {selectedRequest.requestNumber}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowDetails(false)}
                className="rounded-lg px-3 py-2 text-xl hover:bg-surface"
              >
                ×
              </button>
            </div>

            <div className="grid grid-cols-1 gap-5 p-6 sm:grid-cols-2">

              <Detail label="Student Name" value={selectedRequest.student?.name} />
              <Detail label="Student Email" value={selectedRequest.student?.email} />
              <Detail label="Academic Year" value={selectedRequest.academicYear} />
              <Detail label="Admission Level" value={selectedRequest.admissionLevel} />
              <Detail label="Counselling Mode" value={formatLabel(selectedRequest.counsellingMode)} />
              <Detail label="Priority" value={formatLabel(selectedRequest.priority)} />
              <Detail label="Status" value={statusLabels[selectedRequest.status]} />
              <Detail label="Source" value={formatLabel(selectedRequest.source)} />
              <Detail label="Budget Minimum" value={selectedRequest.budget?.min} />
              <Detail label="Budget Maximum" value={selectedRequest.budget?.max} />
              <Detail label="Created At" value={formatDate(selectedRequest.createdAt)} />
              <Detail label="Preferred Time" value={formatDate(selectedRequest.preferredTime?.date)} />

              <div className="sm:col-span-2">
                <p className="mb-2 text-xs font-semibold uppercase text-muted">
                  Preferred Streams
                </p>

                <p className="text-sm text-brand-dark">
                  {selectedRequest.preferredStreams?.length
                    ? selectedRequest.preferredStreams.map((item) => item.name).join(", ")
                    : "No preferred streams"}
                </p>
              </div>

              <div className="sm:col-span-2">
                <p className="mb-2 text-xs font-semibold uppercase text-muted">
                  Preferred Courses
                </p>

                <p className="text-sm text-brand-dark">
                  {selectedRequest.preferredCourses?.length
                    ? selectedRequest.preferredCourses.map((item) => item.name).join(", ")
                    : "No preferred courses"}
                </p>
              </div>

              <div className="sm:col-span-2">
                <p className="mb-2 text-xs font-semibold uppercase text-muted">
                  Preferred Locations
                </p>

                <div className="flex flex-wrap gap-2">
                  {selectedRequest.preferredLocations?.length ? (
                    selectedRequest.preferredLocations.map((location, index) => (
                      <span
                        key={index}
                        className="rounded-lg bg-surface px-3 py-2 text-sm"
                      >
                        {[
                          location.city,
                          location.state,
                          location.country,
                        ].filter(Boolean).join(", ")}
                      </span>
                    ))
                  ) : (
                    <p className="text-sm text-muted">
                      No preferred locations
                    </p>
                  )}
                </div>
              </div>

              {selectedRequest.cancellationReason && (
                <div className="sm:col-span-2">
                  <Detail
                    label="Cancellation Reason"
                    value={selectedRequest.cancellationReason}
                  />
                </div>
              )}

            </div>

            <div className="flex justify-end border-t border-line px-6 py-4">
              <button
                type="button"
                onClick={() => setShowDetails(false)}
                className="rounded-xl bg-accent px-5 py-2.5 text-sm font-bold text-white"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ASSIGN COUNSELLOR MODAL */}
      {showAssignModal && selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">

          <form
            onSubmit={handleAssignCounsellor}
            className="w-full max-w-md rounded-2xl bg-white shadow-xl"
          >

            <div className="flex items-center justify-between border-b border-line px-6 py-4">
              <div>
                <h2 className="font-display text-xl font-bold text-brand-dark">
                  Assign Counsellor
                </h2>

                <p className="mt-1 text-xs text-muted">
                  Request: {selectedRequest.requestNumber}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowAssignModal(false)}
                disabled={assigning}
                className="text-2xl text-muted"
              >
                ×
              </button>
            </div>

            <div className="space-y-4 p-6">

              <div>
                <p className="mb-2 text-sm font-semibold text-brand-dark">
                  Student
                </p>

                <p className="text-sm text-muted">
                  {selectedRequest.student?.name || "Unknown Student"}
                </p>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-brand-dark">
                  Select Counsellor *
                </label>

                <select
                  value={selectedCounsellor}
                  onChange={(e) => setSelectedCounsellor(e.target.value)}
                  required
                  disabled={loadingCounsellors || counsellors.length === 0}
                  className="w-full rounded-xl border border-line bg-white px-4 py-3 text-sm outline-none focus:border-brand disabled:bg-gray-100"
                >
                  <option value="">
                    {loadingCounsellors
                      ? "Loading counsellors..."
                      : counsellors.length === 0
                      ? "No counsellors available"
                      : "Choose a counsellor"}
                  </option>

                  {counsellors.map((counsellor) => (
                    <option key={counsellor._id} value={counsellor._id}>
                      {counsellor.name} ({counsellor.email})
                    </option>
                  ))}
                </select>
              </div>

              {!loadingCounsellors && counsellors.length === 0 && (
                <p className="rounded-lg bg-yellow-50 p-3 text-xs text-yellow-800">
                  No counsellors found. Please check whether a user with the
                  Counsellor role exists and whether you have users.view permission.
                </p>
              )}

            </div>

            <div className="flex justify-end gap-3 border-t border-line px-6 py-4">

              <button
                type="button"
                onClick={() => setShowAssignModal(false)}
                disabled={assigning}
                className="rounded-xl border border-line px-5 py-2.5 text-sm font-semibold"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={
                  assigning ||
                  loadingCounsellors ||
                  !selectedCounsellor
                }
                className="rounded-xl bg-purple-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {assigning ? "Assigning..." : "Assign Counsellor"}
              </button>

            </div>

          </form>
        </div>
      )}

      {/* WORKFLOW MODAL */}
      {showWorkflowModal && selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">

          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-xl">

            {/* Header */}
            <div className="sticky top-0 flex items-center justify-between border-b border-line bg-white px-6 py-4">
              <div>
                <h2 className="font-display text-xl font-bold text-brand-dark">
                  Counselling Workflow
                </h2>

                <p className="mt-1 text-xs text-muted">
                  Request: {selectedRequest.requestNumber}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowWorkflowModal(false)}
                disabled={savingWorkflow}
                className="text-2xl text-muted"
              >
                ×
              </button>
            </div>

            {/* Workflow Stages */}
            <div className="space-y-4 p-6">

              {workflowStages.length === 0 ? (
                <p className="py-8 text-center text-sm text-muted">
                  No workflow stages found for this request.
                </p>
              ) : (
                workflowStages.map((stage, index) => (
                  <div
                    key={stage.id}
                    className="rounded-xl border border-line p-4"
                  >

                    <div className="mb-4 flex items-center justify-between gap-3">
                      <h3 className="font-semibold text-brand-dark">
                        {index + 1}. {formatLabel(stage.id)}
                      </h3>

                      <span className="rounded-full bg-surface px-3 py-1 text-xs font-semibold">
                        {formatLabel(stage.status)}
                      </span>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">

                      <div>
                        <label className="mb-2 block text-sm font-medium text-muted">
                          Stage Status
                        </label>

                        <select
                          value={stage.status}
                          onChange={(e) => {
                            const updated = [...workflowStages];

                            updated[index] = {
                              ...updated[index],
                              status: e.target.value,
                            };

                            setWorkflowStages(updated);
                          }}
                          disabled={savingWorkflow}
                          className="w-full rounded-xl border border-line bg-white px-4 py-3 text-sm outline-none focus:border-brand"
                        >
                          <option value="pending">Pending</option>
                          <option value="in_progress">In Progress</option>
                          <option value="completed">Completed</option>
                        </select>
                      </div>

                      <div>
                        <label className="mb-2 block text-sm font-medium text-muted">
                          Remarks
                        </label>

                        <input
                          type="text"
                          value={stage.remarks || ""}
                          onChange={(e) => {
                            const updated = [...workflowStages];

                            updated[index] = {
                              ...updated[index],
                              remarks: e.target.value,
                            };

                            setWorkflowStages(updated);
                          }}
                          disabled={savingWorkflow}
                          placeholder="Add remarks..."
                          className="w-full rounded-xl border border-line px-4 py-3 text-sm outline-none focus:border-brand"
                        />
                      </div>

                    </div>
                  </div>
                ))
              )}

            </div>

            {/* Footer */}
            <div className="flex justify-end gap-3 border-t border-line px-6 py-4">

              <button
                type="button"
                onClick={() => setShowWorkflowModal(false)}
                disabled={savingWorkflow}
                className="rounded-xl border border-line px-5 py-2.5 text-sm font-semibold disabled:opacity-50"
              >
                Close
              </button>

              <button
                type="button"
                onClick={handleSaveWorkflow}
                disabled={savingWorkflow || workflowStages.length === 0}
                className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
              >
                {savingWorkflow ? "Saving..." : "Save Workflow"}
              </button>

            </div>

          </div>
        </div>
      )}

      {/* STATUS UPDATE MODAL */}
      {showStatusModal && selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">

          <form
            onSubmit={handleStatusUpdate}
            className="w-full max-w-md rounded-2xl bg-white shadow-xl"
          >

            <div className="flex items-center justify-between border-b border-line px-6 py-4">
              <h2 className="font-display text-xl font-bold text-brand-dark">
                Update Request Status
              </h2>

              <button
                type="button"
                onClick={() => setShowStatusModal(false)}
                className="text-2xl text-muted"
              >
                ×
              </button>
            </div>

            <div className="space-y-4 p-6">

              <div>
                <p className="text-xs font-semibold uppercase text-muted">
                  Request Number
                </p>

                <p className="mt-1 font-semibold text-brand-dark">
                  {selectedRequest.requestNumber}
                </p>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-brand-dark">
                  New Status *
                </label>

                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  required
                  className="w-full rounded-xl border border-line bg-white px-4 py-3 text-sm outline-none focus:border-brand"
                >
                  {statuses.map((item) => (
                    <option key={item} value={item}>
                      {statusLabels[item]}
                    </option>
                  ))}
                </select>
              </div>

              {newStatus === "cancelled" && (
                <div>
                  <label className="mb-2 block text-sm font-semibold text-brand-dark">
                    Cancellation Reason *
                  </label>

                  <textarea
                    rows="3"
                    value={cancellationReason}
                    onChange={(e) => setCancellationReason(e.target.value)}
                    required
                    placeholder="Enter cancellation reason..."
                    className="w-full rounded-xl border border-line px-4 py-3 text-sm outline-none focus:border-brand"
                  />
                </div>
              )}

              {newStatus === "assigned" && (
                <p className="rounded-lg bg-yellow-50 p-3 text-xs text-yellow-800">
                  A counsellor must be assigned before setting this status.
                </p>
              )}

            </div>

            <div className="flex justify-end gap-3 border-t border-line px-6 py-4">

              <button
                type="button"
                onClick={() => setShowStatusModal(false)}
                disabled={updating}
                className="rounded-xl border border-line px-5 py-2.5 text-sm font-semibold"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={updating || newStatus === selectedRequest.status}
                className="rounded-xl bg-accent px-5 py-2.5 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                {updating ? "Updating..." : "Save Changes"}
              </button>

            </div>

          </form>
        </div>
      )}

    </div>
  );
}

// Reusable Detail Component
function Detail({ label, value }) {
  return (
    <div>
      <p className="mb-1 text-xs font-semibold uppercase text-muted">
        {label}
      </p>

      <p className="break-words text-sm font-medium text-brand-dark">
        {value ?? "—"}
      </p>
    </div>
  );
}

export default CounsellingRequests;
