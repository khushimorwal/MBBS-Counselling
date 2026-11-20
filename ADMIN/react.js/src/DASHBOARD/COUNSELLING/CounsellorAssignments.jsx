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
  FiUserPlus,
  FiMail,
  FiUser,
  FiCheck,
} from "react-icons/fi";

const initialForm = {
  counsellingId: "",
  counsellor: "",
  assignmentType: "manual",
  reason: "",
};

const initialCounsellorForm = {
  name: "",
  email: "",
};

// Get logged-in user's role
const getLoggedInRole = () => {
  const savedRole = localStorage.getItem("role");

  if (savedRole) return savedRole;

  try {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    return user.role || "";
  } catch {
    return "";
  }
};

const CounsellorAssignments = () => {
  const role = getLoggedInRole();

  const isAdmin = ["Admin", "Super Admin"].includes(role);
  const isCounsellor = role === "Counsellor";

  const [assignments, setAssignments] = useState([]);
  const [requests, setRequests] = useState([]);
  const [counsellors, setCounsellors] = useState([]);

  const [loading, setLoading] = useState(false);
  const [loadingCounsellors, setLoadingCounsellors] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savingCounsellor, setSavingCounsellor] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [counsellorFilter, setCounsellorFilter] = useState("All");

  const [page, setPage] = useState(1);
  const limit = 5;

  const [modalType, setModalType] = useState("");
  const [selectedAssignment, setSelectedAssignment] = useState(null);

  const [form, setForm] = useState(initialForm);

  // ADD COUNSELLOR STATES

  const [showCounsellorModal, setShowCounsellorModal] = useState(false);

  const [counsellorForm, setCounsellorForm] = useState(
    initialCounsellorForm
  );

  const [counsellorError, setCounsellorError] = useState("");

  // FETCH ASSIGNMENTS

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      setError("");

      const endpoint = isAdmin
        ? "/counselling-assignment/all"
        : "/counselling-assignment/my-assignments";

      const response = await API.get(endpoint);

      if (response.data.success || response.data.status) {
        setAssignments(response.data.data || []);
      } else {
        setAssignments([]);
        setError(
          response.data.message || "Unable to fetch assignments."
        );
      }
    } catch (err) {
      console.error("Fetch Assignments Error:", err);
      console.error("API Response:", err.response?.data);

      setAssignments([]);

      setError(
        err.response?.data?.message ||
        "Unable to fetch assignments."
      );
    } finally {
      setLoading(false);
    }
  };

  // FETCH COUNSELLING REQUESTS

  const fetchRequests = async () => {
    if (!isAdmin) return;

    try {
      const response = await API.get("/counselling/all");

      if (response.data.success || response.data.status) {
        setRequests(
          response.data.data ||
          response.data.requests ||
          []
        );
      } else {
        setRequests([]);
      }
    } catch (err) {
      console.error("Requests API Error:", err);

      setError(
        err.response?.data?.message ||
        "Unable to fetch counselling requests."
      );
    }
  };

  // FETCH COUNSELLORS

  const fetchCounsellors = async () => {
    if (!isAdmin) return;

    try {
      setLoadingCounsellors(true);

      const response = await API.get("/user/counsellors");

      if (response.data.status || response.data.success) {
        setCounsellors(response.data.data || []);
      } else {
        setCounsellors([]);
      }
    } catch (err) {
      console.error("Fetch Counsellors Error:", err);
      console.error("API Response:", err.response?.data);

      setError(
        err.response?.data?.message ||
        "Unable to fetch counsellors."
      );
    } finally {
      setLoadingCounsellors(false);
    }
  };

  // INITIAL DATA

  useEffect(() => {
    fetchAssignments();

    if (isAdmin) {
      fetchRequests();
      fetchCounsellors();
    }
  }, []);

  // HELPERS

  const getStudentName = (item) => {
    return (
      item?.studentId?.name ||
      item?.student?.name ||
      item?.counsellingId?.studentId?.name ||
      item?.counsellingId?.student?.name ||
      item?.counselling?.studentId?.name ||
      item?.counselling?.student?.name ||
      item?.counsellingRequest?.studentId?.name ||
      item?.counsellingRequest?.student?.name ||
      item?.counsellingRequest?.studentName ||
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

  const getCounsellorEmail = (item) => {
    return (
      item?.counsellorId?.email ||
      item?.counsellor?.email ||
      item?.counsellorEmail ||
      ""
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

  // ADD COUNSELLOR

  const handleCreateCounsellor = async (e) => {
  e.preventDefault();

  setCounsellorError("");

  const { name, email } = counsellorForm;

  if (!name.trim() || !email.trim()) {
    setCounsellorError("Please fill all required fields.");
    return;
  }

  try {
    setSavingCounsellor(true);

    // Generate a temporary password automatically
    const temporaryPassword =
      `Counsellor@${crypto.randomUUID().slice(0, 8)}A1`;

    const payload = {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password: temporaryPassword,
      role: "Counsellor",
    };

    const response = await API.post(
      "/user/admin/create-user",
      payload
    );

    if (response.data.status || response.data.success) {
      setCounsellorForm(initialCounsellorForm);
      setShowCounsellorModal(false);

      await fetchCounsellors();

      showSuccess("Counsellor created successfully.");
    } else {
      setCounsellorError(
        response.data.message || "Unable to create counsellor."
      );
    }
  } catch (err) {
    console.error("Create Counsellor Error:", err);

    setCounsellorError(
      err.response?.data?.message ||
      "Unable to create counsellor."
    );
  } finally {
    setSavingCounsellor(false);
  }
};


  // CLOSE COUNSELLOR MODAL

  const closeCounsellorModal = () => {
    setShowCounsellorModal(false);
    setCounsellorForm(initialCounsellorForm);
    setCounsellorError("");
  };

  // FILTER ASSIGNMENTS

  const filteredAssignments = useMemo(() => {
    return assignments.filter((item) => {
      const studentName = getStudentName(item).toLowerCase();

      const counsellorName =
        getCounsellorName(item).toLowerCase();

      const matchesSearch =
        studentName.includes(search.toLowerCase()) ||
        counsellorName.includes(search.toLowerCase());

      const matchesStatus =
        statusFilter === "All" ||
        getStatus(item).toLowerCase() ===
        statusFilter.toLowerCase();

      const matchesCounsellor =
        !isAdmin ||
        counsellorFilter === "All" ||
        String(
          item?.counsellorId?._id ||
          item?.counsellor?._id ||
          item?.counsellorId ||
          item?.counsellor
        ) === counsellorFilter;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesCounsellor
      );
    });
  }, [
    assignments,
    search,
    statusFilter,
    counsellorFilter,
    isAdmin,
  ]);

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

  // SUMMARY

  const totalAssignments = assignments.length;

  const activeAssignments = assignments.filter((item) =>
    ["assigned", "active"].includes(
      getStatus(item).toLowerCase()
    )
  ).length;

  const completedAssignments = assignments.filter(
    (item) => getStatus(item).toLowerCase() === "completed"
  ).length;

  // OPEN MODALS

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
        item?.counsellingRequest?._id ||
        item?.counsellingId?._id ||
        item?.counsellingId ||
        "",
      counsellor:
        item?.counsellor?._id ||
        item?.counsellorId?._id ||
        item?.counsellorId ||
        "",
      assignmentType:
        ["manual", "automatic"].includes(
          item?.assignmentType?.toLowerCase()
        )
          ? item.assignmentType.toLowerCase()
          : "manual",
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

  // ASSIGN COUNSELLOR

  const handleAssign = async (e) => {
    e.preventDefault();

    if (!isAdmin) return;

    if (!form.counsellingId || !form.counsellor) {
      setError(
        "Please select a counselling request and counsellor."
      );
      return;
    }

    try {
      setSaving(true);
      setError("");

      const payload = {
        counsellingRequest: form.counsellingId,
        counsellor: form.counsellor,
        assignmentType: form.assignmentType,
      };

      const response = await API.post(
        "/counselling-assignment/assign",
        payload
      );

      if (response.data.status || response.data.success) {
        closeModal();

        showSuccess("Counsellor assigned successfully.");

        fetchAssignments();
        fetchRequests();
      } else {
        setError(
          response.data.message || "Assignment failed."
        );
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Unable to assign counsellor."
      );
    } finally {
      setSaving(false);
    }
  };

  // REASSIGN COUNSELLOR

  const handleReassign = async (e) => {
    e.preventDefault();

    if (!isAdmin) return;

    if (!form.counsellor) {
      setError("Please select a counsellor.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      const payload = {
        counsellor: form.counsellor,
        reason: form.reason,
        assignmentType: form.assignmentType,
      };

      const response = await API.patch(
        `/counselling-assignment/reassign/${selectedAssignment._id}`,
        payload
      );

      if (response.data.status || response.data.success) {
        closeModal();

        showSuccess(
          "Counsellor reassigned successfully."
        );

        fetchAssignments();
      } else {
        setError(
          response.data.message ||
          "Reassignment failed."
        );
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Unable to reassign counsellor."
      );
    } finally {
      setSaving(false);
    }
  };

  // COMPLETE ASSIGNMENT

  const handleComplete = async (id) => {
    if (!isAdmin) return;

    const confirmComplete = window.confirm(
      "Are you sure you want to complete this assignment?"
    );

    if (!confirmComplete) return;

    try {
      setError("");

      const response = await API.patch(
        `/counselling-assignment/complete/${id}`
      );

      if (response.data.status || response.data.success) {
        showSuccess("Assignment marked as completed.");
        fetchAssignments();
      } else {
        setError(
          response.data.message ||
          "Unable to complete assignment."
        );
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Unable to complete assignment."
      );
    }
  };

  // STATUS BADGE

  const statusBadge = (status) => {
    const value = status?.toLowerCase();

    let classes = "bg-blue-50 text-blue-700";

    if (value === "completed") {
      classes = "bg-green-50 text-green-700";
    } else if (value === "pending") {
      classes = "bg-amber-50 text-amber-700";
    } else if (
      value === "cancelled" ||
      value === "rejected"
    ) {
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

  // COUNSELLOR DROPDOWN

  const CounsellorSelect = () => (
    <div>
      <label className="mb-2 block text-sm font-semibold text-brand-dark">
        Select Counsellor <span className="text-red-500">*</span>
      </label>

      <select
        required
        value={form.counsellor}
        onChange={(e) =>
          setForm({
            ...form,
            counsellor: e.target.value,
          })
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
            {item.name}
          </option>
        ))}
      </select>

      {!loadingCounsellors &&
        counsellors.length === 0 && (
          <p className="mt-2 text-xs text-red-500">
            No counsellors found. Please add a counsellor first.
          </p>
        )}
    </div>
  );

  // UI

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
            {isAdmin
              ? "Assign counsellors to students and manage all assignments."
              : "View your assigned counselling requests."}
          </p>
        </div>

        <div className="flex flex-wrap gap-3">

          <button
            onClick={() => {
              fetchAssignments();

              if (isAdmin) {
                fetchRequests();
                fetchCounsellors();
              }
            }}
            className="flex items-center gap-2 rounded-xl border border-line bg-white px-4 py-3 text-sm font-semibold text-brand-dark hover:bg-surface"
          >
            <FiRefreshCw />
            Refresh
          </button>

          {isAdmin && (
            <>
              <button
                onClick={() => {
                  setCounsellorError("");
                  setShowCounsellorModal(true);
                }}
                className="flex items-center gap-2 rounded-xl border border-brand bg-white px-5 py-3 text-sm font-bold text-brand hover:bg-surface"
              >
                <FiUserPlus />
                Add Counsellor
              </button>

              <button
                onClick={openAssignModal}
                className="flex items-center gap-2 rounded-xl bg-accent px-5 py-3 text-sm font-bold text-white hover:bg-[#cf4a24]"
              >
                <FiPlus />
                Assign Counsellor
              </button>
            </>
          )}

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
        <div
          className={`grid grid-cols-1 gap-3 ${isAdmin ? "md:grid-cols-3" : "md:grid-cols-2"
            }`}
        >

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
            <option value="active">Active</option>
            <option value="Completed">Completed</option>
            <option value="Pending">Pending</option>
          </select>

          {isAdmin && (
            <select
              value={counsellorFilter}
              onChange={(e) =>
                setCounsellorFilter(e.target.value)
              }
              className="rounded-xl border border-line bg-white px-4 py-3 text-sm outline-none focus:border-brand"
            >
              <option value="All">All Counsellors</option>

              {counsellors.map((item) => (
                <option key={item._id} value={item._id}>
                  {item.name}
                </option>
              ))}
            </select>
          )}

        </div>
      </div>

      {/* ASSIGNMENT TABLE */}

      <div className="overflow-hidden rounded-2xl border border-line bg-white shadow-sm">

        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <div>
            <h2 className="font-bold text-brand-dark">
              Assignment List
            </h2>

            <p className="mt-1 text-xs text-muted">
              {isAdmin
                ? "Manage all counsellor assignments."
                : "Your assigned counselling requests."}
            </p>
          </div>

          <span className="rounded-full bg-surface px-3 py-1 text-xs font-semibold text-muted">
            {filteredAssignments.length} Records
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[950px] text-left">

            <thead className="bg-[#F9FBFA] text-[11px] font-bold uppercase tracking-wider text-muted">
              <tr>
                <th className="px-5 py-4">#</th>
                <th className="px-5 py-4">Student</th>

                {isAdmin && (
                  <th className="px-5 py-4">Counsellor</th>
                )}

                <th className="px-5 py-4">Assigned Date</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4 text-center">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-line">

              {loading ? (
                <tr>
                  <td
                    colSpan={isAdmin ? 6 : 5}
                    className="px-5 py-12 text-center text-sm text-muted"
                  >
                    Loading assignments...
                  </td>
                </tr>
              ) : paginatedAssignments.length === 0 ? (
                <tr>
                  <td
                    colSpan={isAdmin ? 6 : 5}
                    className="px-5 py-12 text-center text-sm text-muted"
                  >
                    No assignments found.
                  </td>
                </tr>
              ) : (
                paginatedAssignments.map((item, index) => {

                  const status = getStatus(item).toLowerCase();

                  const isAssigned = [
                    "assigned",
                    "active",
                  ].includes(status);

                  return (
                    <tr
                      key={item._id}
                      className="hover:bg-surface/60"
                    >

                      <td className="px-5 py-4 text-sm text-muted">
                        {(page - 1) * limit + index + 1}
                      </td>

                      <td className="px-5 py-4">
                        <p className="text-sm font-semibold text-brand-dark">
                          {getStudentName(item)}
                        </p>
                      </td>

                      {isAdmin && (
                        <td className="px-5 py-4">
                          <p className="text-sm font-medium text-brand-dark">
                            {getCounsellorName(item)}
                          </p>

                          <p className="mt-1 text-xs text-muted">
                            {getCounsellorEmail(item)}
                          </p>
                        </td>
                      )}

                      <td className="px-5 py-4 text-sm text-muted">
                        {formatDate(
                          item.createdAt || item.assignedAt
                        )}
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

                          {isAssigned && (
                            <span className="flex items-center gap-1 rounded-lg bg-green-50 px-3 py-2 text-xs font-semibold text-green-700">
                              <FiCheck />
                              Assigned
                            </span>
                          )}

                          {isAdmin && status !== "completed" && (
                            <>
                              <button
                                title="Reassign"
                                onClick={() =>
                                  openReassignModal(item)
                                }
                                className="rounded-lg bg-amber-50 p-2 text-amber-600 hover:bg-amber-100"
                              >
                                <FiEdit2 />
                              </button>

                              <button
                                title="Complete"
                                onClick={() =>
                                  handleComplete(item._id)
                                }
                                className="rounded-lg bg-green-50 p-2 text-green-600 hover:bg-green-100"
                              >
                                <FiCheckCircle />
                              </button>
                            </>
                          )}

                        </div>
                      </td>

                    </tr>
                  );
                })
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
            to{" "}
            {Math.min(
              page * limit,
              filteredAssignments.length
            )}{" "}
            of {filteredAssignments.length} entries
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

      {/* ADD COUNSELLOR MODAL */}

      {isAdmin && showCounsellorModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">

          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white shadow-xl">

            <div className="flex items-center justify-between border-b border-line px-6 py-5">

              <div>
                <h2 className="flex items-center gap-2 text-xl font-bold text-brand-dark">
                  <FiUserPlus className="text-brand" />
                  Add Counsellor
                </h2>

                <p className="mt-1 text-sm text-muted">
                  Create a new counsellor account.
                </p>
              </div>

              <button
                onClick={closeCounsellorModal}
                className="rounded-lg p-2 text-muted hover:bg-surface"
              >
                <FiX />
              </button>

            </div>

            <form
              onSubmit={handleCreateCounsellor}
              className="space-y-5 p-6"
            >

              {counsellorError && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {counsellorError}
                </div>
              )}

              {/* NAME */}

              <div>
                <label className="mb-2 block text-sm font-semibold text-brand-dark">
                  Counsellor Name *
                </label>

                <div className="relative">
                  <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />

                  <input
                    type="text"
                    required
                    value={counsellorForm.name || ""}
                    onChange={(e) =>
                      setCounsellorForm({
                        ...counsellorForm,
                        name: e.target.value,
                      })
                    }
                    placeholder="Enter counsellor name"
                    className="w-full rounded-xl border border-line py-3 pl-11 pr-4 text-sm outline-none focus:border-brand"
                  />
                </div>
              </div>

              {/* EMAIL */}

              <div>
                <label className="mb-2 block text-sm font-semibold text-brand-dark">
                  Email Address *
                </label>

                <div className="relative">
                  <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />

                  <input
                    type="email"
                    required
                    value={counsellorForm.email || ""}
                    onChange={(e) =>
                      setCounsellorForm({
                        ...counsellorForm,
                        email: e.target.value,
                      })
                    }
                    placeholder="Enter email address"
                    className="w-full rounded-xl border border-line py-3 pl-11 pr-4 text-sm outline-none focus:border-brand"
                  />
                </div>
              </div>

              {/* ROLE */}

              <div>
                <label className="mb-2 block text-sm font-semibold text-brand-dark">
                  Role
                </label>

                <input
                  type="text"
                  value="Counsellor"
                  disabled
                  className="w-full rounded-xl border border-line bg-surface px-4 py-3 text-sm font-medium text-brand-dark"
                />
              </div>

              {/* BUTTONS */}

              <div className="flex justify-end gap-3 border-t border-line pt-5">

                <button
                  type="button"
                  onClick={closeCounsellorModal}
                  disabled={savingCounsellor}
                  className="rounded-xl border border-line px-5 py-3 text-sm font-semibold text-brand-dark hover:bg-surface"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={savingCounsellor}
                  className="flex items-center gap-2 rounded-xl bg-accent px-6 py-3 text-sm font-bold text-white hover:bg-[#cf4a24] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {savingCounsellor ? (
                    "Creating..."
                  ) : (
                    <>
                      <FiPlus />
                      Create Counsellor
                    </>
                  )}
                </button>

              </div>

            </form>

          </div>

        </div>
      )}

      {/* ASSIGN / REASSIGN MODAL */}

      {isAdmin &&
        (modalType === "assign" || modalType === "reassign") && (
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
                  modalType === "assign"
                    ? handleAssign
                    : handleReassign
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
                      <option value="">
                        Select Student Request
                      </option>

                      {requests.map((item) => (
                        <option key={item._id} value={item._id}>
                          {item?.studentId?.name ||
                            item?.student?.name ||
                            item?.studentName ||
                            "Student"}
                        </option>
                      ))}

                    </select>
                  </div>
                )}

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
                    <option value="manual">Manual</option>
                    <option value="automatic">Automatic</option>
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
                    disabled={
                      saving ||
                      loadingCounsellors ||
                      counsellors.length === 0
                    }
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
                <p className="text-xs font-medium text-muted">
                  Student
                </p>

                <p className="mt-1 font-semibold text-brand-dark">
                  {getStudentName(selectedAssignment)}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium text-muted">
                  Counsellor
                </p>

                <p className="mt-1 font-semibold text-brand-dark">
                  {getCounsellorName(selectedAssignment)}
                </p>

                <p className="mt-1 text-sm text-muted">
                  {getCounsellorEmail(selectedAssignment)}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium text-muted">
                  Status
                </p>

                <div className="mt-2">
                  {statusBadge(getStatus(selectedAssignment))}
                </div>
              </div>

              <div>
                <p className="text-xs font-medium text-muted">
                  Assignment Type
                </p>

                <p className="mt-1 font-semibold text-brand-dark">
                  {selectedAssignment.assignmentType || "Manual"}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium text-muted">
                  Assigned Date
                </p>

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