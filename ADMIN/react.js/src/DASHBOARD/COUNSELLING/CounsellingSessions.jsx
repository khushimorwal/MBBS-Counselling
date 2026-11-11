import React, { useEffect, useMemo, useState } from "react";
import { API } from "../../api/axios";

import {
  FiSearch,
  FiEye,
  FiEdit2,
  FiCheckCircle,
  FiXCircle,
  FiRefreshCw,
  FiX,
  FiCalendar,
  FiUser,
  FiPhone,
  FiClock,
} from "react-icons/fi";

const emptyForm = {
  type: "initial",
  mode: "phone",
  outcome: "",
  studentQuestions: "",
  nextAction: "",
  nextFollowUpAt: "",
};

const outcomeOptions = [
  {
    value: "counselling_completed",
    label: "Counselling Completed",
  },
  {
    value: "follow_up_required",
    label: "Follow-up Required",
  },
  {
    value: "recommendations_needed",
    label: "Recommendations Needed",
  },
  {
    value: "student_unreachable",
    label: "Student Unreachable",
  },
  {
    value: "student_not_interested",
    label: "Student Not Interested",
  },
];

const statusStyles = {
  in_progress: "bg-blue-50 text-blue-700",
  completed: "bg-emerald-50 text-emerald-700",
  cancelled: "bg-rose-50 text-rose-700",
};

const formatLabel = (value = "") => {
  return value
    .replaceAll("_", " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

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

const toDateTimeLocal = (date) => {
  if (!date) return "";

  const localDate = new Date(date);

  if (Number.isNaN(localDate.getTime())) return "";

  const offset = localDate.getTimezoneOffset() * 60000;

  return new Date(localDate.getTime() - offset)
    .toISOString()
    .slice(0, 16);
};

function CounsellingSessions() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const [selectedSession, setSelectedSession] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);

  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [actionError, setActionError] = useState("");

  // ==========================================
  // FETCH ALL COUNSELLING SESSIONS
  // ==========================================

  const fetchSessions = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await API.get("/counselling-session/all");

      if (response.data.success) {
        setSessions(response.data.sessions || []);
      } else {
        setError(
          response.data.message || "Unable to fetch counselling sessions."
        );
      }
    } catch (err) {
      console.error("Fetch Sessions Error:", err);

      setError(
        err.response?.data?.message ||
          "Failed to load counselling sessions."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  // ==========================================
  // SUMMARY CARDS
  // ==========================================

  const summary = useMemo(() => {
    return {
      total: sessions.length,
      inProgress: sessions.filter(
        (session) => session.status === "in_progress"
      ).length,
      completed: sessions.filter(
        (session) => session.status === "completed"
      ).length,
      cancelled: sessions.filter(
        (session) => session.status === "cancelled"
      ).length,
    };
  }, [sessions]);

  // ==========================================
  // SEARCH AND FILTER
  // ==========================================

  const filteredSessions = useMemo(() => {
    return sessions.filter((session) => {
      const studentName = session.student?.name || "";
      const studentEmail = session.student?.email || "";

      const counsellorName = session.counsellor?.name || "";
      const counsellorEmail = session.counsellor?.email || "";

      const requestNumber =
        session.counsellingRequest?.requestNumber || "";

      const searchText = search.toLowerCase();

      const matchesSearch = [
        studentName,
        studentEmail,
        counsellorName,
        counsellorEmail,
        requestNumber,
      ].some((value) => value.toLowerCase().includes(searchText));

      const matchesStatus =
        !statusFilter || session.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [sessions, search, statusFilter]);

  // ==========================================
  // VIEW SESSION
  // ==========================================

  const handleView = (session) => {
    setSelectedSession(session);
    setShowDetails(true);
  };

  // ==========================================
  // OPEN EDIT MODAL
  // ==========================================

  const handleEdit = (session) => {
    setSelectedSession(session);

    setForm({
      type: session.type || "initial",
      mode: session.mode || "phone",
      outcome: session.outcome || "",
      studentQuestions: (session.studentQuestions || []).join("\n"),
      nextAction: session.nextAction || "",
      nextFollowUpAt: toDateTimeLocal(session.nextFollowUpAt),
    });

    setActionError("");
    setShowEditModal(true);
  };

  // ==========================================
  // UPDATE SESSION
  // ==========================================

  const handleUpdate = async (e) => {
    e.preventDefault();

    if (!selectedSession) return;

    try {
      setSubmitting(true);
      setActionError("");

      const payload = {
        type: form.type,
        mode: form.mode,
        studentQuestions: form.studentQuestions
          .split("\n")
          .map((question) => question.trim())
          .filter(Boolean),
        nextAction: form.nextAction,
        nextFollowUpAt: form.nextFollowUpAt
          ? new Date(form.nextFollowUpAt).toISOString()
          : null,
      };

      if (form.outcome) {
        payload.outcome = form.outcome;
      }

      await API.put(
        `/counselling-session/update/${selectedSession._id}`,
        payload
      );

      setShowEditModal(false);
      setSelectedSession(null);

      await fetchSessions();
    } catch (err) {
      console.error("Update Session Error:", err);

      setActionError(
        err.response?.data?.message || "Failed to update session."
      );
    } finally {
      setSubmitting(false);
    }
  };

  // ==========================================
  // OPEN COMPLETE MODAL
  // ==========================================

  const handleOpenComplete = (session) => {
    setSelectedSession(session);

    setForm({
      ...emptyForm,
      outcome: session.outcome || "",
      nextAction: session.nextAction || "",
      nextFollowUpAt: toDateTimeLocal(session.nextFollowUpAt),
    });

    setActionError("");
    setShowCompleteModal(true);
  };

  // ==========================================
  // COMPLETE SESSION
  // ==========================================

  const handleComplete = async (e) => {
    e.preventDefault();

    if (!selectedSession) return;

    if (!form.outcome) {
      setActionError("Please select a session outcome.");
      return;
    }

    if (
      form.nextFollowUpAt &&
      new Date(form.nextFollowUpAt) <= new Date()
    ) {
      setActionError("Follow-up date must be in the future.");
      return;
    }

    try {
      setSubmitting(true);
      setActionError("");

      const payload = {
        outcome: form.outcome,
        nextAction: form.nextAction,
      };

      if (form.nextFollowUpAt) {
        payload.nextFollowUpAt = new Date(
          form.nextFollowUpAt
        ).toISOString();
      }

      const response = await API.patch(
        `/counselling-session/complete/${selectedSession._id}`,
        payload
      );

      alert(
        response.data.followUpCreated
          ? "Session completed and follow-up created successfully!"
          : "Counselling session completed successfully!"
      );

      setShowCompleteModal(false);
      setSelectedSession(null);

      await fetchSessions();
    } catch (err) {
      console.error("Complete Session Error:", err);

      setActionError(
        err.response?.data?.message || "Failed to complete session."
      );
    } finally {
      setSubmitting(false);
    }
  };

  // ==========================================
  // CANCEL SESSION
  // ==========================================

  const handleCancel = async (session) => {
    const confirmed = window.confirm(
      "Are you sure you want to cancel this counselling session?"
    );

    if (!confirmed) return;

    try {
      await API.patch(
        `/counselling-session/cancel/${session._id}`
      );

      alert("Counselling session cancelled successfully.");

      await fetchSessions();
    } catch (err) {
      console.error("Cancel Session Error:", err);

      alert(
        err.response?.data?.message || "Failed to cancel session."
      );
    }
  };

  // ==========================================
  // INPUT HANDLER
  // ==========================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ==========================================
  // REUSABLE STATUS BADGE
  // ==========================================

  const StatusBadge = ({ status }) => (
    <span
      className={`inline-flex rounded-lg px-3 py-1.5 text-xs font-semibold ${
        statusStyles[status] || "bg-gray-100 text-gray-700"
      }`}
    >
      {formatLabel(status)}
    </span>
  );

  // ==========================================
  // PAGE UI
  // ==========================================

  return (
    <div className="mx-auto w-full max-w-[1500px]">

      {/* Heading */}
      <div className="mb-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-accent">
            COUNSELLING MANAGEMENT
          </p>

          <h1 className="mt-2 font-display text-3xl font-bold text-brand-dark">
            Counselling Sessions
          </h1>

          <p className="mt-2 text-sm text-muted">
            Track student counselling sessions and their outcomes.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchSessions}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-line bg-white px-4 py-3 text-sm font-semibold text-brand-dark transition hover:bg-surface disabled:opacity-60"
        >
          <FiRefreshCw className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {/* Summary Cards */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

        {[
          ["Total Sessions", summary.total, "bg-blue-50 text-blue-700"],
          [
            "In Progress",
            summary.inProgress,
            "bg-amber-50 text-amber-700",
          ],
          [
            "Completed",
            summary.completed,
            "bg-emerald-50 text-emerald-700",
          ],
          [
            "Cancelled",
            summary.cancelled,
            "bg-rose-50 text-rose-700",
          ],
        ].map(([title, count, color]) => (
          <div
            key={title}
            className="rounded-2xl border border-line bg-white p-5"
          >
            <p className="text-sm font-medium text-muted">{title}</p>

            <h2 className="mt-3 font-display text-3xl font-bold text-brand-dark">
              {loading ? "—" : count}
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
            placeholder="Search student or counsellor..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-line py-3 pl-11 pr-4 text-sm outline-none focus:border-brand"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-xl border border-line bg-white px-4 py-3 text-sm outline-none focus:border-brand"
        >
          <option value="">All Status</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-5 flex items-center justify-between rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
          <span>{error}</span>

          <button
            type="button"
            onClick={fetchSessions}
            className="font-semibold underline"
          >
            Retry
          </button>
        </div>
      )}

      {/* Sessions Table */}
      <div className="overflow-hidden rounded-2xl border border-line bg-white">

        <div className="border-b border-line p-5">
          <h2 className="font-display text-lg font-bold text-brand-dark">
            Session Records
          </h2>

          <p className="mt-1 text-xs text-muted">
            View student sessions and counselling outcomes.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1100px] text-left">

            <thead className="bg-surface">
              <tr className="text-xs font-semibold uppercase tracking-wide text-muted">
                <th className="px-5 py-4">Student</th>
                <th className="px-5 py-4">Counsellor</th>
                <th className="px-5 py-4">Session Type</th>
                <th className="px-5 py-4">Appointment</th>
                <th className="px-5 py-4">Outcome</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-line">

              {loading ? (
                <tr>
                  <td
                    colSpan="7"
                    className="px-5 py-12 text-center text-sm text-muted"
                  >
                    Loading counselling sessions...
                  </td>
                </tr>
              ) : filteredSessions.length === 0 ? (
                <tr>
                  <td
                    colSpan="7"
                    className="px-5 py-12 text-center text-sm text-muted"
                  >
                    No counselling sessions found.
                  </td>
                </tr>
              ) : (
                filteredSessions.map((session) => (
                  <tr
                    key={session._id}
                    className="transition hover:bg-surface/60"
                  >

                    {/* Student */}
                    <td className="px-5 py-4">
                      <p className="text-sm font-semibold text-brand-dark">
                        {session.student?.name || "—"}
                      </p>

                      <p className="mt-1 text-xs text-muted">
                        {session.student?.email || "—"}
                      </p>
                    </td>

                    {/* Counsellor */}
                    <td className="px-5 py-4">
                      <p className="text-sm font-semibold text-brand-dark">
                        {session.counsellor?.name || "—"}
                      </p>

                      <p className="mt-1 text-xs text-muted">
                        {session.counsellor?.email || "—"}
                      </p>
                    </td>

                    {/* Session Type */}
                    <td className="px-5 py-4">
                      <p className="text-sm font-medium text-brand-dark">
                        {formatLabel(session.type)}
                      </p>

                      <p className="mt-1 text-xs text-muted">
                        Session #{session.sessionNumber}
                      </p>
                    </td>

                    {/* Appointment */}
                    <td className="px-5 py-4">
                      <p className="text-sm font-medium text-brand-dark">
                        {formatLabel(session.mode)}
                      </p>

                      <p className="mt-1 text-xs text-muted">
                        {session.appointment
                          ? formatDate(session.appointment.scheduledStart)
                          : "No appointment"}
                      </p>
                    </td>

                    {/* Outcome */}
                    <td className="px-5 py-4">
                      <span className="text-sm text-brand-dark">
                        {session.outcome
                          ? formatLabel(session.outcome)
                          : "—"}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="px-5 py-4">
                      <StatusBadge status={session.status} />
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">

                        <button
                          type="button"
                          title="View"
                          onClick={() => handleView(session)}
                          className="rounded-lg bg-blue-50 p-2 text-blue-700 transition hover:bg-blue-100"
                        >
                          <FiEye size={16} />
                        </button>

                        {session.status === "in_progress" && (
                          <>
                            <button
                              type="button"
                              title="Edit"
                              onClick={() => handleEdit(session)}
                              className="rounded-lg bg-amber-50 p-2 text-amber-700 transition hover:bg-amber-100"
                            >
                              <FiEdit2 size={16} />
                            </button>

                            <button
                              type="button"
                              title="Complete"
                              onClick={() => handleOpenComplete(session)}
                              className="rounded-lg bg-emerald-50 p-2 text-emerald-700 transition hover:bg-emerald-100"
                            >
                              <FiCheckCircle size={16} />
                            </button>

                            <button
                              type="button"
                              title="Cancel"
                              onClick={() => handleCancel(session)}
                              className="rounded-lg bg-rose-50 p-2 text-rose-700 transition hover:bg-rose-100"
                            >
                              <FiXCircle size={16} />
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
      </div>

      {/* ======================================
          VIEW DETAILS MODAL
      ====================================== */}

      {showDetails && selectedSession && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-xl">

            <div className="sticky top-0 flex items-center justify-between border-b border-line bg-white p-5">
              <div>
                <h2 className="text-xl font-bold text-brand-dark">
                  Session Details
                </h2>

                <p className="mt-1 text-xs text-muted">
                  Session #{selectedSession.sessionNumber}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowDetails(false)}
                className="rounded-lg p-2 text-muted hover:bg-surface"
              >
                <FiX size={20} />
              </button>
            </div>

            <div className="grid grid-cols-1 gap-5 p-5 sm:grid-cols-2">

              <DetailItem
                label="Student"
                value={selectedSession.student?.name}
              />

              <DetailItem
                label="Student Email"
                value={selectedSession.student?.email}
              />

              <DetailItem
                label="Counsellor"
                value={selectedSession.counsellor?.name}
              />

              <DetailItem
                label="Counsellor Email"
                value={selectedSession.counsellor?.email}
              />

              <DetailItem
                label="Request Number"
                value={selectedSession.counsellingRequest?.requestNumber}
              />

              <DetailItem
                label="Session Type"
                value={formatLabel(selectedSession.type)}
              />

              <DetailItem
                label="Mode"
                value={formatLabel(selectedSession.mode)}
              />

              <DetailItem
                label="Status"
                value={formatLabel(selectedSession.status)}
              />

              <DetailItem
                label="Started At"
                value={formatDate(selectedSession.startedAt)}
              />

              <DetailItem
                label="Ended At"
                value={formatDate(selectedSession.endedAt)}
              />

              <DetailItem
                label="Duration"
                value={
                  selectedSession.durationMinutes !== undefined
                    ? `${selectedSession.durationMinutes} minutes`
                    : "—"
                }
              />

              <DetailItem
                label="Outcome"
                value={
                  selectedSession.outcome
                    ? formatLabel(selectedSession.outcome)
                    : "—"
                }
              />

              <div className="sm:col-span-2">
                <p className="mb-2 text-xs font-semibold uppercase text-muted">
                  Student Questions
                </p>

                {selectedSession.studentQuestions?.length ? (
                  <ul className="list-inside list-disc space-y-1 text-sm text-brand-dark">
                    {selectedSession.studentQuestions.map((question, index) => (
                      <li key={index}>{question}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted">No questions added.</p>
                )}
              </div>

              <div className="sm:col-span-2">
                <DetailItem
                  label="Next Action"
                  value={selectedSession.nextAction}
                />
              </div>

              <div className="sm:col-span-2">
                <DetailItem
                  label="Next Follow-up"
                  value={formatDate(selectedSession.nextFollowUpAt)}
                />
              </div>

            </div>

            <div className="border-t border-line p-5 text-right">
              <button
                type="button"
                onClick={() => setShowDetails(false)}
                className="rounded-xl bg-brand px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ======================================
          EDIT SESSION MODAL
      ====================================== */}

      {showEditModal && selectedSession && (
        <Modal
          title="Update Counselling Session"
          onClose={() => setShowEditModal(false)}
        >
          <form onSubmit={handleUpdate} className="space-y-4">

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

              <FormField label="Session Type">
                <select
                  name="type"
                  value={form.type}
                  onChange={handleChange}
                  className="input-style"
                >
                  <option value="initial">Initial</option>
                  <option value="follow_up">Follow Up</option>
                  <option value="admission_guidance">
                    Admission Guidance
                  </option>
                  <option value="other">Other</option>
                </select>
              </FormField>

              <FormField label="Mode">
                <select
                  name="mode"
                  value={form.mode}
                  onChange={handleChange}
                  className="input-style"
                >
                  <option value="phone">Phone</option>
                  <option value="video">Video</option>
                  <option value="in_person">In Person</option>
                  <option value="chat">Chat</option>
                </select>
              </FormField>

            </div>

            <FormField label="Outcome">
              <select
                name="outcome"
                value={form.outcome}
                onChange={handleChange}
                className="input-style"
              >
                <option value="">Select Outcome</option>

                {outcomeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </FormField>

            <FormField label="Student Questions">
              <textarea
                name="studentQuestions"
                value={form.studentQuestions}
                onChange={handleChange}
                rows="3"
                placeholder="Write each question on a new line..."
                className="input-style"
              />
            </FormField>

            <FormField label="Next Action">
              <textarea
                name="nextAction"
                value={form.nextAction}
                onChange={handleChange}
                rows="2"
                placeholder="Enter next action..."
                className="input-style"
              />
            </FormField>

            <FormField label="Next Follow-up Date">
              <input
                type="datetime-local"
                name="nextFollowUpAt"
                value={form.nextFollowUpAt}
                onChange={handleChange}
                className="input-style"
              />
            </FormField>

            {actionError && <ErrorMessage message={actionError} />}

            <ModalActions
              onCancel={() => setShowEditModal(false)}
              submitting={submitting}
              submitText="Save Changes"
            />

          </form>
        </Modal>
      )}

      {/* ======================================
          COMPLETE SESSION MODAL
      ====================================== */}

      {showCompleteModal && selectedSession && (
        <Modal
          title="Complete Counselling Session"
          onClose={() => setShowCompleteModal(false)}
        >
          <form onSubmit={handleComplete} className="space-y-4">

            <FormField label="Session Outcome">
              <select
                name="outcome"
                value={form.outcome}
                onChange={handleChange}
                required
                className="input-style"
              >
                <option value="">Select Outcome</option>

                {outcomeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </FormField>

            <FormField label="Next Action">
              <textarea
                name="nextAction"
                value={form.nextAction}
                onChange={handleChange}
                rows="3"
                placeholder="Enter next action..."
                className="input-style"
              />
            </FormField>

            <FormField label="Next Follow-up Date (Optional)">
              <input
                type="datetime-local"
                name="nextFollowUpAt"
                value={form.nextFollowUpAt}
                onChange={handleChange}
                min={toDateTimeLocal(new Date())}
                className="input-style"
              />
            </FormField>

            <p className="rounded-xl bg-blue-50 p-3 text-xs text-blue-700">
              If you select a future follow-up date, a follow-up task will
              automatically be created.
            </p>

            {actionError && <ErrorMessage message={actionError} />}

            <ModalActions
              onCancel={() => setShowCompleteModal(false)}
              submitting={submitting}
              submitText="Complete Session"
            />

          </form>
        </Modal>
      )}

    </div>
  );
}

// ==========================================
// REUSABLE DETAIL ITEM
// ==========================================

function DetailItem({ label, value }) {
  return (
    <div>
      <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted">
        {label}
      </p>

      <p className="break-words text-sm font-medium text-brand-dark">
        {value || "—"}
      </p>
    </div>
  );
}

// ==========================================
// REUSABLE MODAL
// ==========================================

function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl bg-white p-5 shadow-xl">

        <div className="mb-5 flex items-center justify-between border-b border-line pb-4">
          <h2 className="text-xl font-bold text-brand-dark">
            {title}
          </h2>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-muted hover:bg-surface"
          >
            <FiX size={20} />
          </button>
        </div>

        {children}

      </div>
    </div>
  );
}

// ==========================================
// REUSABLE FORM FIELD
// ==========================================

function FormField({ label, children }) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-brand-dark">
        {label}
      </label>

      {children}
    </div>
  );
}

// ==========================================
// REUSABLE ERROR MESSAGE
// ==========================================

function ErrorMessage({ message }) {
  return (
    <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
      {message}
    </div>
  );
}

// ==========================================
// REUSABLE MODAL ACTIONS
// ==========================================

function ModalActions({
  onCancel,
  submitting,
  submitText,
}) {
  return (
    <div className="flex justify-end gap-3 border-t border-line pt-4">

      <button
        type="button"
        onClick={onCancel}
        disabled={submitting}
        className="rounded-xl border border-line px-5 py-2.5 text-sm font-semibold text-muted hover:bg-surface"
      >
        Cancel
      </button>

      <button
        type="submit"
        disabled={submitting}
        className="rounded-xl bg-brand px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
      >
        {submitting ? "Please wait..." : submitText}
      </button>

    </div>
  );
}

export default CounsellingSessions;