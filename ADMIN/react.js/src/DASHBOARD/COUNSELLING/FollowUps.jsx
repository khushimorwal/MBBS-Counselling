import React, { useEffect, useMemo, useState } from "react";
import { API } from "../../api/axios";
import {
  FiPlus,
  FiSearch,
  FiRefreshCw,
  FiEdit2,
  FiCheck,
  FiX,
  FiPhone,
  FiMail,
  FiFileText,
  FiCalendar,
  FiMoreVertical,
} from "react-icons/fi";

const FOLLOW_UP_API = "/follow-up";

// Change this if your counselling request GET endpoint is different.
const REQUESTS_API = "/counselling/all";

const initialForm = {
  counsellingRequest: "",
  assignedTo: "",
  title: "",
  description: "",
  dueAt: "",
  type: "call",
};

const typeOptions = [
  "call",
  "email",
  "document",
  "appointment",
  "other",
];

function FollowUps() {
  const [followUps, setFollowUps] = useState([]);
  const [requests, setRequests] = useState([]);
  const [counsellors, setCounsellors] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(initialForm);

  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [selectedFollowUp, setSelectedFollowUp] = useState(null);
  const [outcome, setOutcome] = useState("");

  const [message, setMessage] = useState({
    type: "",
    text: "",
  });

  // ==================================================
  // FETCH FOLLOW-UPS
  // ==================================================

  const fetchFollowUps = async () => {
    try {
      setLoading(true);

      // First update pending records whose due date has passed.
      await API.patch(`${FOLLOW_UP_API}/update-overdue`);

      const response = await API.get(`${FOLLOW_UP_API}/all`);

      setFollowUps(response.data.followUps || []);
    } catch (error) {
      console.error("Fetch Follow-ups Error:", error);

      setMessage({
        type: "error",
        text:
          error.response?.data?.message ||
          "Failed to fetch follow-ups.",
      });
    } finally {
      setLoading(false);
    }
  };

  // ==================================================
  // FETCH REQUESTS AND COUNSELLORS
  // ==================================================

  const fetchFormData = async () => {
    try {
      const [requestResponse, counsellorResponse] = await Promise.all([
        API.get(REQUESTS_API),
        API.get("/user/counsellors"),
      ]);

      const requestData =
        requestResponse.data.requests ||
        requestResponse.data.counsellingRequests ||
        requestResponse.data.data ||
        [];

      const counsellorData =
        counsellorResponse.data.counsellors ||
        counsellorResponse.data.users ||
        counsellorResponse.data.data ||
        [];

      setRequests(Array.isArray(requestData) ? requestData : []);
      setCounsellors(
        Array.isArray(counsellorData) ? counsellorData : []
      );
    } catch (error) {
      console.error("Follow-up Form Data Error:", error);
    }
  };

  useEffect(() => {
    fetchFollowUps();
    fetchFormData();
  }, []);

  // ==================================================
  // SUMMARY
  // ==================================================

  const summary = useMemo(() => {
    return {
      total: followUps.length,
      pending: followUps.filter((item) => item.status === "pending").length,
      completed: followUps.filter((item) => item.status === "completed").length,
      overdue: followUps.filter((item) => item.status === "overdue").length,
    };
  }, [followUps]);

  // ==================================================
  // SEARCH AND FILTER
  // ==================================================

  const filteredFollowUps = useMemo(() => {
    return followUps.filter((item) => {
      const studentName = item.student?.name || "";
      const counsellorName = item.assignedTo?.name || "";
      const title = item.title || "";

      const searchText =
        `${studentName} ${counsellorName} ${title}`.toLowerCase();

      const matchesSearch = searchText.includes(search.toLowerCase());

      const matchesStatus =
        !statusFilter || item.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [followUps, search, statusFilter]);

  // ==================================================
  // FORM HANDLERS
  // ==================================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const openCreateModal = () => {
    setEditingId(null);
    setForm(initialForm);
    setShowModal(true);
  };

  const openEditModal = (item) => {
    setEditingId(item._id);

    setForm({
      counsellingRequest: item.counsellingRequest?._id || "",
      assignedTo: item.assignedTo?._id || "",
      title: item.title || "",
      description: item.description || "",
      dueAt: item.dueAt
        ? new Date(item.dueAt).toISOString().slice(0, 16)
        : "",
      type: item.type || "call",
    });

    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingId(null);
    setForm(initialForm);
  };

  // ==================================================
  // CREATE / UPDATE
  // ==================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.title.trim() || !form.dueAt) {
      setMessage({
        type: "error",
        text: "Title and due date are required.",
      });
      return;
    }

    try {
      setSaving(true);

      if (editingId) {
        const payload = {
          title: form.title,
          description: form.description,
          dueAt: new Date(form.dueAt).toISOString(),
          type: form.type,
        };

        await API.put(
          `${FOLLOW_UP_API}/update/${editingId}`,
          payload
        );

        setMessage({
          type: "success",
          text: "Follow-up updated successfully.",
        });
      } else {
        if (!form.counsellingRequest || !form.assignedTo) {
          setMessage({
            type: "error",
            text: "Please select a counselling request and counsellor.",
          });
          return;
        }

        const payload = {
          counsellingRequest: form.counsellingRequest,
          assignedTo: form.assignedTo,
          title: form.title,
          description: form.description,
          dueAt: new Date(form.dueAt).toISOString(),
          type: form.type,
        };

        await API.post(`${FOLLOW_UP_API}/create`, payload);

        setMessage({
          type: "success",
          text: "Follow-up created successfully.",
        });
      }

      closeModal();
      fetchFollowUps();
    } catch (error) {
      setMessage({
        type: "error",
        text:
          error.response?.data?.message ||
          "Something went wrong.",
      });
    } finally {
      setSaving(false);
    }
  };

  // ==================================================
  // COMPLETE FOLLOW-UP
  // ==================================================

  const openCompleteModal = (item) => {
    setSelectedFollowUp(item);
    setOutcome("");
    setShowCompleteModal(true);
  };

  const handleComplete = async () => {
    if (!selectedFollowUp) return;

    try {
      setSaving(true);

      await API.patch(
        `${FOLLOW_UP_API}/complete/${selectedFollowUp._id}`,
        { outcome }
      );

      setShowCompleteModal(false);
      setSelectedFollowUp(null);

      setMessage({
        type: "success",
        text: "Follow-up completed successfully.",
      });

      fetchFollowUps();
    } catch (error) {
      setMessage({
        type: "error",
        text:
          error.response?.data?.message ||
          "Unable to complete follow-up.",
      });
    } finally {
      setSaving(false);
    }
  };

  // ==================================================
  // CANCEL FOLLOW-UP
  // ==================================================

  const handleCancel = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to cancel this follow-up?"
    );

    if (!confirmed) return;

    try {
      await API.patch(`${FOLLOW_UP_API}/cancel/${id}`);

      setMessage({
        type: "success",
        text: "Follow-up cancelled successfully.",
      });

      fetchFollowUps();
    } catch (error) {
      setMessage({
        type: "error",
        text:
          error.response?.data?.message ||
          "Unable to cancel follow-up.",
      });
    }
  };

  // ==================================================
  // HELPERS
  // ==================================================

  const formatDate = (date) => {
    if (!date) return "—";

    return new Date(date).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusClass = (status) => {
    const classes = {
      pending: "bg-amber-50 text-amber-700",
      completed: "bg-emerald-50 text-emerald-700",
      overdue: "bg-rose-50 text-rose-700",
      cancelled: "bg-slate-100 text-slate-600",
    };

    return classes[status] || "bg-slate-100 text-slate-600";
  };

  const getTypeIcon = (type) => {
    if (type === "call") return <FiPhone />;
    if (type === "email") return <FiMail />;
    if (type === "document") return <FiFileText />;

    return <FiCalendar />;
  };

  // ==================================================
  // UI
  // ==================================================

  return (
    <div className="mx-auto w-full max-w-[1500px]">
      {/* Heading */}
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>

          <h1 className="mt-2 font-display text-3xl font-bold text-brand-dark">
            Follow-ups
          </h1>

          <p className="mt-2 text-sm text-muted">
            Track and manage student follow-up activities.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={fetchFollowUps}
            className="flex items-center gap-2 rounded-xl border border-line bg-white px-4 py-3 text-sm font-semibold text-brand-dark hover:bg-surface"
          >
            <FiRefreshCw />
            Refresh
          </button>

          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 rounded-xl bg-accent px-4 py-3 text-sm font-bold text-white hover:bg-[#cf4a24]"
          >
            <FiPlus />
            Add Follow-up
          </button>
        </div>
      </div>

      {/* Message */}
      {message.text && (
        <div
          className={`mb-5 flex items-center justify-between rounded-xl border p-4 text-sm ${
            message.type === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
              : "border-rose-200 bg-rose-50 text-rose-700"
          }`}
        >
          {message.text}

          <button onClick={() => setMessage({ type: "", text: "" })}>
            <FiX />
          </button>
        </div>
      )}

      {/* Summary Cards */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          ["Total Follow-ups", summary.total, "bg-blue-50 text-blue-700"],
          ["Pending", summary.pending, "bg-amber-50 text-amber-700"],
          ["Completed", summary.completed, "bg-emerald-50 text-emerald-700"],
          ["Overdue", summary.overdue, "bg-rose-50 text-rose-700"],
        ].map(([title, count, color]) => (
          <div
            key={title}
            className="rounded-2xl border border-line bg-white p-5"
          >
            <p className="text-sm font-medium text-muted">{title}</p>

            <h2 className="mt-3 font-display text-3xl font-bold text-brand-dark">
              {count}
            </h2>

            <span
              className={`mt-3 inline-block rounded-lg px-3 py-1 text-xs font-semibold ${color}`}
            >
              Overview
            </span>
          </div>
        ))}
      </div>

      {/* Search and Filters */}
      <div className="mb-5 flex flex-col gap-3 rounded-2xl border border-line bg-white p-4 sm:flex-row">
        <div className="relative min-w-0 flex-1">
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />

          <input
            type="search"
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
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="completed">Completed</option>
          <option value="overdue">Overdue</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {/* Follow-up Table */}
      <div className="overflow-hidden rounded-2xl border border-line bg-white">
        <div className="border-b border-line p-5">
          <h2 className="font-display text-lg font-bold text-brand-dark">
            Follow-up Records
          </h2>

          <p className="mt-1 text-xs text-muted">
            Monitor upcoming and overdue student follow-ups.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[950px] text-left">
            <thead className="bg-[#F9FBFA]">
              <tr className="text-xs font-semibold uppercase tracking-wide text-muted">
                <th className="px-5 py-4">Student</th>
                <th className="px-5 py-4">Counsellor</th>
                <th className="px-5 py-4">Purpose</th>
                <th className="px-5 py-4">Follow-up Date</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-line">
              {loading ? (
                <tr>
                  <td
                    colSpan="6"
                    className="px-5 py-12 text-center text-sm text-muted"
                  >
                    Loading follow-ups...
                  </td>
                </tr>
              ) : filteredFollowUps.length === 0 ? (
                <tr>
                  <td
                    colSpan="6"
                    className="px-5 py-12 text-center text-sm text-muted"
                  >
                    No follow-up records found.
                  </td>
                </tr>
              ) : (
                filteredFollowUps.map((item) => (
                  <tr key={item._id} className="hover:bg-surface/60">
                    <td className="px-5 py-4">
                      <p className="font-semibold text-brand-dark">
                        {item.student?.name || "—"}
                      </p>

                      <p className="mt-1 text-xs text-muted">
                        {item.student?.email || ""}
                      </p>
                    </td>

                    <td className="px-5 py-4">
                      <p className="font-medium text-brand-dark">
                        {item.assignedTo?.name || "—"}
                      </p>

                      <p className="mt-1 text-xs text-muted">
                        {item.assignedTo?.email || ""}
                      </p>
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <span className="text-brand">
                          {getTypeIcon(item.type)}
                        </span>

                        <div>
                          <p className="font-medium text-brand-dark">
                            {item.title}
                          </p>

                          <p className="mt-1 text-xs capitalize text-muted">
                            {item.type}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-4 text-sm text-brand-dark">
                      {formatDate(item.dueAt)}
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`rounded-lg px-3 py-1.5 text-xs font-semibold capitalize ${getStatusClass(
                          item.status
                        )}`}
                      >
                        {item.status}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        {["pending", "overdue"].includes(item.status) && (
                          <>
                            <button
                              title="Edit"
                              onClick={() => openEditModal(item)}
                              className="rounded-lg border border-line p-2 text-blue-600 hover:bg-blue-50"
                            >
                              <FiEdit2 />
                            </button>

                            <button
                              title="Complete"
                              onClick={() => openCompleteModal(item)}
                              className="rounded-lg border border-line p-2 text-emerald-600 hover:bg-emerald-50"
                            >
                              <FiCheck />
                            </button>
                          </>
                        )}

                        {!["completed", "cancelled"].includes(item.status) && (
                          <button
                            title="Cancel"
                            onClick={() => handleCancel(item._id)}
                            className="rounded-lg border border-line p-2 text-rose-600 hover:bg-rose-50"
                          >
                            <FiX />
                          </button>
                        )}

                        {["completed", "cancelled"].includes(item.status) && (
                          <span className="text-xs text-muted">No actions</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE / EDIT MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="font-display text-xl font-bold text-brand-dark">
                  {editingId ? "Edit Follow-up" : "Create Follow-up"}
                </h2>

                <p className="mt-1 text-sm text-muted">
                  Add follow-up details below.
                </p>
              </div>

              <button
                onClick={closeModal}
                className="rounded-lg p-2 text-muted hover:bg-surface"
              >
                <FiX size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {!editingId && (
                <>
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-brand-dark">
                      Counselling Request *
                    </label>

                    <select
                      name="counsellingRequest"
                      value={form.counsellingRequest}
                      onChange={handleChange}
                      required
                      className="w-full rounded-xl border border-line bg-white px-4 py-3 text-sm outline-none focus:border-brand"
                    >
                      <option value="">Select counselling request</option>

                      {requests.map((request) => (
                        <option key={request._id} value={request._id}>
                          {request.requestNumber || request._id} —{" "}
                          {request.student?.name || "Student"}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-brand-dark">
                      Assigned Counsellor *
                    </label>

                    <select
                      name="assignedTo"
                      value={form.assignedTo}
                      onChange={handleChange}
                      required
                      className="w-full rounded-xl border border-line bg-white px-4 py-3 text-sm outline-none focus:border-brand"
                    >
                      <option value="">Select counsellor</option>

                      {counsellors.map((counsellor) => (
                        <option
                          key={counsellor._id}
                          value={counsellor._id}
                        >
                          {counsellor.name} ({counsellor.email})
                        </option>
                      ))}
                    </select>
                  </div>
                </>
              )}

              <div>
                <label className="mb-2 block text-sm font-semibold text-brand-dark">
                  Title *
                </label>

                <input
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  maxLength="200"
                  required
                  placeholder="Enter follow-up title"
                  className="w-full rounded-xl border border-line px-4 py-3 text-sm outline-none focus:border-brand"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-brand-dark">
                  Description
                </label>

                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  maxLength="5000"
                  rows="3"
                  placeholder="Enter description..."
                  className="w-full resize-none rounded-xl border border-line px-4 py-3 text-sm outline-none focus:border-brand"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-brand-dark">
                    Follow-up Date *
                  </label>

                  <input
                    type="datetime-local"
                    name="dueAt"
                    value={form.dueAt}
                    onChange={handleChange}
                    required
                    className="w-full rounded-xl border border-line px-4 py-3 text-sm outline-none focus:border-brand"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-brand-dark">
                    Type
                  </label>

                  <select
                    name="type"
                    value={form.type}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-line bg-white px-4 py-3 text-sm outline-none focus:border-brand"
                  >
                    {typeOptions.map((type) => (
                      <option key={type} value={type}>
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 border-t border-line pt-5">
                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-xl border border-line px-5 py-3 text-sm font-semibold text-muted hover:bg-surface"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-xl bg-accent px-6 py-3 text-sm font-bold text-white hover:bg-[#cf4a24] disabled:opacity-60"
                >
                  {saving
                    ? "Saving..."
                    : editingId
                    ? "Update Follow-up"
                    : "Create Follow-up"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* COMPLETE MODAL */}
      {showCompleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="font-display text-xl font-bold text-brand-dark">
                Complete Follow-up
              </h2>

              <button
                onClick={() => setShowCompleteModal(false)}
                className="rounded-lg p-2 text-muted hover:bg-surface"
              >
                <FiX size={20} />
              </button>
            </div>

            <p className="mb-4 text-sm text-muted">
              Add the outcome of this follow-up.
            </p>

            <textarea
              value={outcome}
              onChange={(e) => setOutcome(e.target.value)}
              maxLength="5000"
              rows="4"
              placeholder="Enter follow-up outcome..."
              className="w-full resize-none rounded-xl border border-line px-4 py-3 text-sm outline-none focus:border-brand"
            />

            <div className="mt-5 flex justify-end gap-3">
              <button
                onClick={() => setShowCompleteModal(false)}
                className="rounded-xl border border-line px-5 py-3 text-sm font-semibold text-muted"
              >
                Cancel
              </button>

              <button
                onClick={handleComplete}
                disabled={saving}
                className="rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
              >
                {saving ? "Saving..." : "Mark Completed"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default FollowUps;