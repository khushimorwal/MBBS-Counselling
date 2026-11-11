import { useEffect, useMemo, useState } from "react";
import { API } from "../../api/axios";

import {
  FiUsers,
  FiPlus,
  FiRefreshCw,
  FiEye,
  FiEdit2,
  FiCheckCircle,
  FiX,
  FiSearch,
  FiChevronLeft,
  FiChevronRight,
  FiClipboard,
} from "react-icons/fi";

const initialForm = {
  counsellingId: "",
  counsellor: "",
  assignmentType: "Regular",
  reason: "",
};

const CounsellorAssignments = () => {
  const [assignments, setAssignments] = useState([]);
  const [requests, setRequests] = useState([]);
  const [counsellors, setCounsellors] = useState([]);

  const [loading, setLoading] = useState(false);
  const [loadingCounsellors, setLoadingCounsellors] = useState(false);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [counsellorFilter, setCounsellorFilter] = useState("All");

  const [page, setPage] = useState(1);
  const [limit] = useState(5);

  const [modalType, setModalType] = useState("");
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [form, setForm] = useState(initialForm);

  // ---------------- FETCH ASSIGNMENTS ----------------

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await API.get("/counselling-assignment/all");

      if (response.data.status) {
        setAssignments(response.data.data || []);
      } else {
        setAssignments([]);
      }
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to fetch assignments."
      );
    } finally {
      setLoading(false);
    }
  };

  // ---------------- FETCH COUNSELLING REQUESTS ----------------

  const fetchRequests = async () => {
  try {
    const response = await API.get("/counselling/all");

    console.log("Requests API Response:", response.data);

    if (response.data.success) {
      setRequests(response.data.data || []);
    } else {
      setRequests([]);
    }
  } catch (err) {
    console.log("Requests API Error:", err);
    setError(
      err.response?.data?.message || "Unable to fetch counselling requests."
    );
  }
};
  

  // ---------------- FETCH COUNSELLORS ----------------

  const fetchCounsellors = async () => {
    try {
      setLoadingCounsellors(true);

      const response = await API.get("/user/counsellors");
      console.log("Counsellors API:", response.data);
      if (response.data.status) {
        setCounsellors(response.data.data || []);
      } else {
        setCounsellors([]);
      }
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to fetch counsellors."
      );
    } finally {
      setLoadingCounsellors(false);
    }
  };

  useEffect(() => {
    fetchAssignments();
    fetchRequests();
    fetchCounsellors();
  }, []);

  // ---------------- HELPERS ----------------

  const getStudentName = (item) => {
    return (
      item?.studentId?.name ||
      item?.student?.name ||
      item?.counsellingId?.studentId?.name ||
      item?.counselling?.studentId?.name ||
      item?.studentName ||
      "N/A"
    );
  };

  const getCounsellorName = (item) => {
    return (
      item?.counsellorId?.name ||
      item?.counsellor?.name ||
      item?.counsellorName ||
      "Not assigned"
    );
  };

  const getStatus = (item) => {
    return item?.status || "Assigned";
  };

  const formatDate = (date) => {
    if (!date) return "—";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const showSuccess = (message) => {
    setSuccess(message);
    setError("");

    setTimeout(() => {
      setSuccess("");
    }, 3000);
  };

  // ---------------- FILTER ASSIGNMENTS ----------------

  const filteredAssignments = useMemo(() => {
    return assignments.filter((item) => {
      const studentName = getStudentName(item).toLowerCase();
      const counsellorName = getCounsellorName(item).toLowerCase();

      const matchesSearch =
        studentName.includes(search.toLowerCase()) ||
        counsellorName.includes(search.toLowerCase());

      const matchesStatus =
        statusFilter === "All" ||
        getStatus(item).toLowerCase() === statusFilter.toLowerCase();

      const matchesCounsellor =
        counsellorFilter === "All" ||
        String(item?.counsellorId?._id || item?.counsellorId) ===
          counsellorFilter;

      return matchesSearch && matchesStatus && matchesCounsellor;
    });
  }, [assignments, search, statusFilter, counsellorFilter]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredAssignments.length / limit)
  );

  const paginatedAssignments = filteredAssignments.slice(
    (page - 1) * limit,
    page * limit
  );

  useEffect(() => {
    setPage(1);
  }, [search, statusFilter, counsellorFilter]);

  // ---------------- SUMMARY ----------------

  const totalAssignments = assignments.length;

  const activeAssignments = assignments.filter(
    (item) => getStatus(item).toLowerCase() === "assigned"
  ).length;

  const completedAssignments = assignments.filter(
    (item) => getStatus(item).toLowerCase() === "completed"
  ).length;

  // ---------------- OPEN MODALS ----------------

  const openAssignModal = () => {
    setSelectedAssignment(null);
    setForm(initialForm);
    setModalType("assign");
    setError("");
  };

  const openReassignModal = (item) => {
    setSelectedAssignment(item);

    setForm({
      counsellingId:
        item?.counsellingId?._id ||
        item?.counsellingId ||
        "",
      counsellor:
        item?.counsellorId?._id ||
        item?.counsellorId ||
        "",
      assignmentType: item?.assignmentType || "Regular",
      reason: "",
    });

    setModalType("reassign");
    setError("");
  };

  const openViewModal = async (item) => {
    try {
      setError("");

      const response = await API.get(
        `/counselling-assignment/${item._id}`
      );

      setSelectedAssignment(response.data.data || item);
      setModalType("view");
    } catch (err) {
      setSelectedAssignment(item);
      setModalType("view");
    }
  };

  const closeModal = () => {
    setModalType("");
    setSelectedAssignment(null);
    setForm(initialForm);
    setError("");
  };

  // ---------------- ASSIGN COUNSELLOR ----------------

  const handleAssign = async (e) => {
    e.preventDefault();

    if (!form.counsellingId || !form.counsellor) {
      setError("Please select a counselling request and counsellor.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      const payload = {
        counsellingId: form.counsellingId,
        counsellorId: form.counsellor,
        assignmentType: form.assignmentType,
      };

      const response = await API.post(
        "/counselling-assignment/assign",
        payload
      );

      if (response.data.status) {
        closeModal();
        showSuccess("Counsellor assigned successfully.");
        fetchAssignments();
      } else {
        setError(response.data.message || "Assignment failed.");
      }
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to assign counsellor."
      );
    } finally {
      setSaving(false);
    }
  };

  // ---------------- REASSIGN COUNSELLOR ----------------

  const handleReassign = async (e) => {
    e.preventDefault();

    if (!form.counsellor) {
      setError("Please select a counsellor.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      const payload = {
        counsellorId: form.counsellor,
        reason: form.reason,
        assignmentType: form.assignmentType,
      };

      const response = await API.patch(
        `/counselling-assignment/reassign/${selectedAssignment._id}`,
        payload
      );

      if (response.data.status) {
        closeModal();
        showSuccess("Counsellor reassigned successfully.");
        fetchAssignments();
      } else {
        setError(response.data.message || "Reassignment failed.");
      }
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to reassign counsellor."
      );
    } finally {
      setSaving(false);
    }
  };

  // ---------------- COMPLETE ASSIGNMENT ----------------

  const handleComplete = async (id) => {
    const confirmComplete = window.confirm(
      "Are you sure you want to complete this assignment?"
    );

    if (!confirmComplete) return;

    try {
      setError("");

      const response = await API.patch(
        `/counselling-assignment/complete/${id}`
      );

      if (response.data.status) {
        showSuccess("Assignment marked as completed.");
        fetchAssignments();
      } else {
        setError(response.data.message || "Unable to complete assignment.");
      }
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to complete assignment."
      );
    }
  };

  // ---------------- STATUS BADGE ----------------

  const statusBadge = (status) => {
    const value = status?.toLowerCase();

    let classes = "bg-blue-50 text-blue-700";

    if (value === "completed") {
      classes = "bg-green-50 text-green-700";
    } else if (value === "pending") {
      classes = "bg-amber-50 text-amber-700";
    } else if (value === "cancelled" || value === "rejected") {
      classes = "bg-red-50 text-red-700";
    }

    return (
      <span
        className={`rounded-full px-3 py-1 text-xs font-semibold ${classes}`}
      >
        {status}
      </span>
    );
  };

  // ---------------- COUNSELLOR DROPDOWN ----------------

  const CounsellorSelect = () => (
    <div>
      <label className="mb-2 block text-sm font-semibold text-brand-dark">
        Select Counsellor <span className="text-red-500">*</span>
      </label>

      <select
        required
        value={form.counsellor}
        onChange={(e) =>
          setForm({ ...form, counsellor: e.target.value })
        }
        disabled={loadingCounsellors}
        className="w-full rounded-xl border border-line bg-white px-4 py-3 text-sm outline-none focus:border-brand"
      >
        <option value="">
          {loadingCounsellors
            ? "Loading counsellors..."
            : "Select Counsellor"}
        </option>

        {counsellors.map((item) => (
          <option key={item._id} value={item._id}>
            {item.name} ({item.email})
          </option>
        ))}
      </select>

      {!loadingCounsellors && counsellors.length === 0 && (
        <p className="mt-2 text-xs text-red-500">
          No counsellors found. Please create a Counsellor user first.
        </p>
      )}
    </div>
  );

  // ---------------- UI ----------------

  return (
    <div className="space-y-6">

      {/* HEADER */}

      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="flex items-center gap-3 text-2xl font-bold text-brand-dark">
            <FiUsers className="text-brand" />
            Counsellor Assignments
          </h1>

          <p className="mt-1 text-sm text-muted">
            Assign counsellors to students and manage assignments.
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => {
              fetchAssignments();
              fetchRequests();
              fetchCounsellors();
            }}
            className="flex items-center gap-2 rounded-xl border border-line bg-white px-4 py-3 text-sm font-semibold text-brand-dark hover:bg-surface"
          >
            <FiRefreshCw />
            Refresh
          </button>

          <button
            onClick={openAssignModal}
            className="flex items-center gap-2 rounded-xl bg-accent px-5 py-3 text-sm font-bold text-white hover:bg-[#cf4a24]"
          >
            <FiPlus />
            Assign Counsellor
          </button>
        </div>
      </div>

      {/* ALERTS */}

      {error && !modalType && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {success && (
        <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          {success}
        </div>
      )}

      {/* SUMMARY CARDS */}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-line bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-muted">
              Total Assignments
            </p>
            <FiClipboard className="text-xl text-brand" />
          </div>
          <h2 className="mt-3 text-3xl font-bold text-brand-dark">
            {totalAssignments}
          </h2>
        </div>

        <div className="rounded-2xl border border-line bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-muted">
              Active Assignments
            </p>
            <FiUsers className="text-xl text-blue-600" />
          </div>
          <h2 className="mt-3 text-3xl font-bold text-brand-dark">
            {activeAssignments}
          </h2>
        </div>

        <div className="rounded-2xl border border-line bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-muted">
              Completed Assignments
            </p>
            <FiCheckCircle className="text-xl text-green-600" />
          </div>
          <h2 className="mt-3 text-3xl font-bold text-brand-dark">
            {completedAssignments}
          </h2>
        </div>
      </div>

      {/* FILTERS */}

      <div className="rounded-2xl border border-line bg-white p-4 shadow-sm">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">

          <div className="relative">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />

            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search student or counsellor..."
              className="w-full rounded-xl border border-line py-3 pl-11 pr-4 text-sm outline-none focus:border-brand"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-xl border border-line bg-white px-4 py-3 text-sm outline-none focus:border-brand"
          >
            <option value="All">All Statuses</option>
            <option value="Assigned">Assigned</option>
            <option value="Completed">Completed</option>
            <option value="Pending">Pending</option>
          </select>

          <select
            value={counsellorFilter}
            onChange={(e) => setCounsellorFilter(e.target.value)}
            className="rounded-xl border border-line bg-white px-4 py-3 text-sm outline-none focus:border-brand"
          >
            <option value="All">All Counsellors</option>

            {counsellors.map((item) => (
              <option key={item._id} value={item._id}>
                {item.name}
              </option>
            ))}
          </select>

        </div>
      </div>

      {/* ASSIGNMENTS TABLE */}

      <div className="overflow-hidden rounded-2xl border border-line bg-white shadow-sm">

        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <div>
            <h2 className="font-bold text-brand-dark">
              Assignment List
            </h2>
            <p className="mt-1 text-xs text-muted">
              Manage all counsellor assignments.
            </p>
          </div>

          <span className="rounded-full bg-surface px-3 py-1 text-xs font-semibold text-muted">
            {filteredAssignments.length} Records
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[850px] text-left">

            <thead className="bg-[#F9FBFA] text-[11px] font-bold uppercase tracking-wider text-muted">
              <tr>
                <th className="px-5 py-4">#</th>
                <th className="px-5 py-4">Student</th>
                <th className="px-5 py-4">Counsellor</th>
                <th className="px-5 py-4">Assigned Date</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4 text-center">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-line">

              {loading ? (
                <tr>
                  <td colSpan="6" className="px-5 py-12 text-center text-sm text-muted">
                    Loading assignments...
                  </td>
                </tr>
              ) : paginatedAssignments.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-5 py-12 text-center text-sm text-muted">
                    No assignments found.
                  </td>
                </tr>
              ) : (
                paginatedAssignments.map((item, index) => (
                  <tr key={item._id} className="hover:bg-surface/60">

                    <td className="px-5 py-4 text-sm text-muted">
                      {(page - 1) * limit + index + 1}
                    </td>

                    <td className="px-5 py-4">
                      <p className="text-sm font-semibold text-brand-dark">
                        {getStudentName(item)}
                      </p>
                    </td>

                    <td className="px-5 py-4">
                      <p className="text-sm font-medium text-brand-dark">
                        {getCounsellorName(item)}
                      </p>
                      <p className="mt-1 text-xs text-muted">
                        {item?.counsellorId?.email ||
                          item?.counsellor?.email ||
                          ""}
                      </p>
                    </td>

                    <td className="px-5 py-4 text-sm text-muted">
                      {formatDate(item.createdAt || item.assignedAt)}
                    </td>

                    <td className="px-5 py-4">
                      {statusBadge(getStatus(item))}
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex items-center justify-center gap-2">

                        <button
                          title="View"
                          onClick={() => openViewModal(item)}
                          className="rounded-lg bg-blue-50 p-2 text-blue-600 hover:bg-blue-100"
                        >
                          <FiEye />
                        </button>

                        {getStatus(item).toLowerCase() !== "completed" && (
                          <>
                            <button
                              title="Reassign"
                              onClick={() => openReassignModal(item)}
                              className="rounded-lg bg-amber-50 p-2 text-amber-600 hover:bg-amber-100"
                            >
                              <FiEdit2 />
                            </button>

                            <button
                              title="Complete"
                              onClick={() => handleComplete(item._id)}
                              className="rounded-lg bg-green-50 p-2 text-green-600 hover:bg-green-100"
                            >
                              <FiCheckCircle />
                            </button>
                          </>
                        )}

                      </div>
                    </td>

                  </tr>
                ))
              )}

            </tbody>
          </table>
        </div>

        {/* PAGINATION */}

        <div className="flex flex-col items-center justify-between gap-3 border-t border-line px-5 py-4 sm:flex-row">
          <p className="text-sm text-muted">
            Showing{" "}
            {filteredAssignments.length === 0
              ? 0
              : (page - 1) * limit + 1}{" "}
            to {Math.min(page * limit, filteredAssignments.length)} of{" "}
            {filteredAssignments.length} entries
          </p>

          <div className="flex items-center gap-2">

            <button
              disabled={page === 1}
              onClick={() => setPage((prev) => prev - 1)}
              className="rounded-lg border border-line p-2 text-brand-dark disabled:cursor-not-allowed disabled:opacity-40"
            >
              <FiChevronLeft />
            </button>

            <span className="px-2 text-sm font-semibold text-brand-dark">
              {page} / {totalPages}
            </span>

            <button
              disabled={page === totalPages}
              onClick={() => setPage((prev) => prev + 1)}
              className="rounded-lg border border-line p-2 text-brand-dark disabled:cursor-not-allowed disabled:opacity-40"
            >
              <FiChevronRight />
            </button>

          </div>
        </div>
      </div>

      {/* ASSIGN / REASSIGN MODAL */}

      {(modalType === "assign" || modalType === "reassign") && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">

          <div className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl bg-white shadow-xl">

            <div className="flex items-center justify-between border-b border-line px-6 py-5">
              <div>
                <h2 className="text-xl font-bold text-brand-dark">
                  {modalType === "assign"
                    ? "Assign Counsellor"
                    : "Reassign Counsellor"}
                </h2>

                <p className="mt-1 text-sm text-muted">
                  {modalType === "assign"
                    ? "Select a request and assign a counsellor."
                    : "Choose another counsellor for this assignment."}
                </p>
              </div>

              <button
                onClick={closeModal}
                className="rounded-lg p-2 text-muted hover:bg-surface"
              >
                <FiX />
              </button>
            </div>

            <form
              onSubmit={
                modalType === "assign" ? handleAssign : handleReassign
              }
              className="space-y-5 p-6"
            >

              {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              {/* COUNSELLING REQUEST */}

              {modalType === "assign" && (
                <div>
                  <label className="mb-2 block text-sm font-semibold text-brand-dark">
                    Select Counselling Request *
                  </label>

                  <select
                    required
                    value={form.counsellingId}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        counsellingId: e.target.value,
                      })
                    }
                    className="w-full rounded-xl border border-line bg-white px-4 py-3 text-sm outline-none focus:border-brand"
                  >
                    <option value="">Select Student Request</option>

                    {requests.map((item) => (
                      <option key={item._id} value={item._id}>
                        {item?.studentId?.name ||
                          item?.student?.name ||
                          item?.studentName ||
                          "Student"}{" "}
                        - {item?.status || "Pending"}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* COUNSELLOR DROPDOWN */}

              <CounsellorSelect />

              {/* ASSIGNMENT TYPE */}

              <div>
                <label className="mb-2 block text-sm font-semibold text-brand-dark">
                  Assignment Type
                </label>

                <select
                  value={form.assignmentType}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      assignmentType: e.target.value,
                    })
                  }
                  className="w-full rounded-xl border border-line bg-white px-4 py-3 text-sm outline-none focus:border-brand"
                >
                  <option value="Regular">Regular</option>
                  <option value="Priority">Priority</option>
                  <option value="Follow-up">Follow-up</option>
                </select>
              </div>

              {/* REASSIGNMENT REASON */}

              {modalType === "reassign" && (
                <div>
                  <label className="mb-2 block text-sm font-semibold text-brand-dark">
                    Reassignment Reason
                  </label>

                  <textarea
                    rows="3"
                    value={form.reason}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        reason: e.target.value,
                      })
                    }
                    placeholder="Enter reason for reassignment..."
                    className="w-full rounded-xl border border-line px-4 py-3 text-sm outline-none focus:border-brand"
                  />
                </div>
              )}

              {/* BUTTONS */}

              <div className="flex justify-end gap-3 border-t border-line pt-5">

                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-xl border border-line px-5 py-3 text-sm font-semibold text-brand-dark hover:bg-surface"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving || loadingCounsellors || counsellors.length === 0}
                  className="rounded-xl bg-accent px-6 py-3 text-sm font-bold text-white hover:bg-[#cf4a24] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {saving
                    ? "Saving..."
                    : modalType === "assign"
                    ? "Assign Counsellor"
                    : "Update Assignment"}
                </button>

              </div>

            </form>
          </div>
        </div>
      )}

      {/* VIEW MODAL */}

      {modalType === "view" && selectedAssignment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">

          <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl">

            <div className="flex items-center justify-between border-b border-line px-6 py-5">
              <h2 className="text-xl font-bold text-brand-dark">
                Assignment Details
              </h2>

              <button
                onClick={closeModal}
                className="rounded-lg p-2 text-muted hover:bg-surface"
              >
                <FiX />
              </button>
            </div>

            <div className="space-y-4 p-6">

              <div>
                <p className="text-xs font-medium text-muted">Student</p>
                <p className="mt-1 font-semibold text-brand-dark">
                  {getStudentName(selectedAssignment)}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium text-muted">Counsellor</p>
                <p className="mt-1 font-semibold text-brand-dark">
                  {getCounsellorName(selectedAssignment)}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium text-muted">Status</p>
                <div className="mt-2">
                  {statusBadge(getStatus(selectedAssignment))}
                </div>
              </div>

              <div>
                <p className="text-xs font-medium text-muted">Assignment Type</p>
                <p className="mt-1 font-semibold text-brand-dark">
                  {selectedAssignment.assignmentType || "Regular"}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium text-muted">Assigned Date</p>
                <p className="mt-1 font-semibold text-brand-dark">
                  {formatDate(
                    selectedAssignment.createdAt ||
                      selectedAssignment.assignedAt
                  )}
                </p>
              </div>

              {selectedAssignment.reason && (
                <div>
                  <p className="text-xs font-medium text-muted">
                    Reassignment Reason
                  </p>
                  <p className="mt-1 text-sm text-brand-dark">
                    {selectedAssignment.reason}
                  </p>
                </div>
              )}

            </div>

            <div className="border-t border-line px-6 py-4 text-right">
              <button
                onClick={closeModal}
                className="rounded-xl bg-accent px-5 py-2.5 text-sm font-bold text-white hover:bg-[#cf4a24]"
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

export default CounsellorAssignments;