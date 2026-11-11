import React, { useEffect, useMemo, useState } from "react";
import { API } from "../../api/axios";

const appointmentStatuses = [
  "scheduled",
  "confirmed",
  "completed",
  "cancelled",
  "rescheduled",
  "no_show",
];

const initialForm = {
  counsellingRequest: "",
  scheduledStart: "",
  scheduledEnd: "",
  mode: "video",
  meetingLink: "",
  location: "",
  timezone: "Asia/Kolkata",
};

const statusStyles = {
  scheduled: "bg-blue-50 text-blue-700",
  confirmed: "bg-emerald-50 text-emerald-700",
  completed: "bg-purple-50 text-purple-700",
  cancelled: "bg-rose-50 text-rose-700",
  rescheduled: "bg-amber-50 text-amber-700",
  no_show: "bg-gray-100 text-gray-700",
};

const formatStatus = (status = "") =>
  status.replaceAll("_", " ").replace(/\b\w/g, (char) => char.toUpperCase());

const formatDate = (date) => {
  if (!date) return "—";

  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatTime = (date) => {
  if (!date) return "—";

  return new Date(date).toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getDuration = (start, end) => {
  if (!start || !end) return "—";

  const minutes = Math.round(
    (new Date(end).getTime() - new Date(start).getTime()) / 60000
  );

  if (minutes <= 0) return "—";

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (hours && remainingMinutes) {
    return `${hours} hr ${remainingMinutes} min`;
  }

  if (hours) return `${hours} hr`;

  return `${remainingMinutes} min`;
};

const toDateTimeLocal = (date) => {
  if (!date) return "";

  const value = new Date(date);
  const offset = value.getTimezoneOffset() * 60000;

  return new Date(value.getTime() - offset).toISOString().slice(0, 16);
};

function Appointments() {
  const [appointments, setAppointments] = useState([]);
  const [counsellingRequests, setCounsellingRequests] = useState([]);

  const [loading, setLoading] = useState(true);
  const [loadingRequests, setLoadingRequests] = useState(false);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState(null);

  const [form, setForm] = useState(initialForm);

  // Fetch appointments
  const fetchAppointments = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await API.get("/appointment/all", {
        params: {
          limit: 100,
          page: 1,
        },
      });

      if (response.data.success) {
        setAppointments(response.data.appointments || []);
      } else {
        setAppointments([]);
        setError(
          response.data.message || "Unable to fetch appointments."
        );
      }
    } catch (err) {
      console.error("Fetch Appointments Error:", err);

      setAppointments([]);
      setError(
        err.response?.data?.message ||
          "Failed to load appointments."
      );
    } finally {
      setLoading(false);
    }
  };

  // Fetch assigned counselling requests
  const fetchCounsellingRequests = async () => {
    try {
      setLoadingRequests(true);

      const response = await API.get("/counselling/all", {
        params: {
          status: "assigned",
          page: 1,
          limit: 100,
        },
      });

      if (response.data.success) {
        setCounsellingRequests(response.data.data || []);
      } else {
        setCounsellingRequests([]);
      }
    } catch (err) {
      console.error("Fetch Counselling Requests Error:", err);
      setCounsellingRequests([]);
    } finally {
      setLoadingRequests(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
    fetchCounsellingRequests();
  }, []);

  // Search and status filter
  const filteredAppointments = useMemo(() => {
    return appointments.filter((appointment) => {
      const studentName = appointment.student?.name || "";
      const counsellorName = appointment.counsellor?.name || "";

      const searchText = search.trim().toLowerCase();

      const matchesSearch =
        !searchText ||
        studentName.toLowerCase().includes(searchText) ||
        counsellorName.toLowerCase().includes(searchText) ||
        (appointment.student?.email || "")
          .toLowerCase()
          .includes(searchText) ||
        (appointment.counsellor?.email || "")
          .toLowerCase()
          .includes(searchText);

      const matchesStatus =
        !statusFilter || appointment.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [appointments, search, statusFilter]);

  // Summary cards
  const summary = useMemo(() => {
    const now = new Date();

    return {
      total: appointments.length,

      upcoming: appointments.filter(
        (item) =>
          ["scheduled", "confirmed"].includes(item.status) &&
          new Date(item.scheduledStart) >= now
      ).length,

      completed: appointments.filter(
        (item) => item.status === "completed"
      ).length,

      cancelled: appointments.filter(
        (item) => item.status === "cancelled"
      ).length,
    };
  }, [appointments]);

  const updateForm = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const openScheduleModal = () => {
    setEditingAppointment(null);
    setForm(initialForm);
    setError("");
    setShowModal(true);
    fetchCounsellingRequests();
  };

  const openRescheduleModal = (appointment) => {
    setEditingAppointment(appointment);

    setForm({
      counsellingRequest:
        appointment.counsellingRequest?._id || "",
      scheduledStart: toDateTimeLocal(appointment.scheduledStart),
      scheduledEnd: toDateTimeLocal(appointment.scheduledEnd),
      mode: appointment.mode || "video",
      meetingLink: appointment.meetingLink || "",
      location: appointment.location || "",
      timezone: appointment.timezone || "Asia/Kolkata",
    });

    setError("");
    setShowModal(true);
  };

  const closeModal = () => {
    if (saving) return;

    setShowModal(false);
    setEditingAppointment(null);
    setForm(initialForm);
    setError("");
  };

  // Schedule or reschedule
  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      if (!editingAppointment && !form.counsellingRequest) {
        setError("Please select a counselling request.");
        return;
      }

      if (!form.scheduledStart || !form.scheduledEnd) {
        setError("Please select appointment start and end time.");
        return;
      }

      const start = new Date(form.scheduledStart);
      const end = new Date(form.scheduledEnd);

      if (start <= new Date()) {
        setError("Appointment must be scheduled in the future.");
        return;
      }

      if (end <= start) {
        setError("End time must be later than start time.");
        return;
      }

      const payload = {
        scheduledStart: start.toISOString(),
        scheduledEnd: end.toISOString(),
        mode: form.mode,
        meetingLink: form.meetingLink.trim(),
        location: form.location.trim(),
        timezone: form.timezone,
      };

      let response;

      if (editingAppointment) {
        response = await API.patch(
          `/appointment/reschedule/${editingAppointment._id}`,
          payload
        );
      } else {
        response = await API.post("/appointment/schedule", {
          ...payload,
          counsellingRequest: form.counsellingRequest,
        });
      }

      if (response.data.success) {
        setSuccess(
          editingAppointment
            ? "Appointment rescheduled successfully."
            : "Appointment scheduled successfully."
        );

        closeModal();
        fetchAppointments();
        fetchCounsellingRequests();
      } else {
        setError(
          response.data.message || "Unable to save appointment."
        );
      }
    } catch (err) {
      console.error("Save Appointment Error:", err);

      setError(
        err.response?.data?.message ||
          "Failed to save appointment."
      );
    } finally {
      setSaving(false);
    }
  };

  // Confirm appointment
  const handleConfirm = async (id) => {
    if (!window.confirm("Are you sure you want to confirm this appointment?")) {
      return;
    }

    try {
      setError("");
      setSuccess("");

      const response = await API.patch(
        `/appointment/confirm/${id}`
      );

      if (response.data.success) {
        setSuccess("Appointment confirmed successfully.");
        fetchAppointments();
      } else {
        setError(response.data.message || "Unable to confirm appointment.");
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to confirm appointment."
      );
    }
  };

  // Cancel appointment
  const handleCancel = async (id) => {
    const cancellationReason = window.prompt(
      "Please enter cancellation reason:"
    );

    if (cancellationReason === null) return;

    if (!cancellationReason.trim()) {
      setError("Cancellation reason is required.");
      return;
    }

    try {
      setError("");
      setSuccess("");

      const response = await API.patch(
        `/appointment/cancel/${id}`,
        { cancellationReason }
      );

      if (response.data.success) {
        setSuccess("Appointment cancelled successfully.");
        fetchAppointments();
      } else {
        setError(response.data.message || "Unable to cancel appointment.");
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to cancel appointment."
      );
    }
  };

  // Complete appointment
  const handleComplete = async (id) => {
    if (!window.confirm("Mark this appointment as completed?")) {
      return;
    }

    try {
      setError("");
      setSuccess("");

      const response = await API.patch(
        `/appointment/complete/${id}`
      );

      if (response.data.success) {
        setSuccess("Appointment marked as completed.");
        fetchAppointments();
      } else {
        setError(response.data.message || "Unable to complete appointment.");
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to complete appointment."
      );
    }
  };

  return (
    <div className="mx-auto w-full max-w-[1500px]">
      {/* Heading */}
      <div className="mb-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>

          <h1 className="mt-2 font-display text-3xl font-bold text-brand-dark">
            Appointments
          </h1>

          <p className="mt-2 text-sm text-muted">
            Schedule and manage student counselling appointments.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchAppointments}
          className="rounded-xl border border-line bg-white px-4 py-3 text-sm font-semibold text-brand-dark hover:bg-surface"
        >
          Refresh
        </button>
      </div>

      {/* Messages */}
      {error && !showModal && (
        <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {success}
        </div>
      )}

      {/* Summary Cards */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          [
            "Total Appointments",
            summary.total,
            "bg-blue-50 text-blue-700",
          ],
          [
            "Upcoming",
            summary.upcoming,
            "bg-emerald-50 text-emerald-700",
          ],
          [
            "Completed",
            summary.completed,
            "bg-purple-50 text-purple-700",
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
        <input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search student or counsellor..."
          className="min-w-0 flex-1 rounded-xl border border-line px-4 py-3 text-sm outline-none focus:border-brand"
        />

        <select
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
          className="rounded-xl border border-line bg-white px-4 py-3 text-sm outline-none focus:border-brand"
        >
          <option value="">All Status</option>

          {appointmentStatuses.map((status) => (
            <option key={status} value={status}>
              {formatStatus(status)}
            </option>
          ))}
        </select>

        <button
          type="button"
          onClick={openScheduleModal}
          className="rounded-xl bg-accent px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90"
        >
          + Schedule Appointment
        </button>
      </div>

      {/* Appointments Table */}
      <div className="overflow-hidden rounded-2xl border border-line bg-white">
        <div className="border-b border-line p-5">
          <h2 className="font-display text-lg font-bold text-brand-dark">
            Appointment Records
          </h2>

          <p className="mt-1 text-xs text-muted">
            View scheduled and completed appointments.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1100px] text-left">
            <thead className="bg-[#F9FBFA]">
              <tr className="text-xs font-semibold uppercase tracking-wide text-muted">
                <th className="px-5 py-4">Student</th>
                <th className="px-5 py-4">Counsellor</th>
                <th className="px-5 py-4">Date & Time</th>
                <th className="px-5 py-4">Duration</th>
                <th className="px-5 py-4">Mode</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4">Action</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan="7"
                    className="px-5 py-12 text-center text-sm text-muted"
                  >
                    Loading appointments...
                  </td>
                </tr>
              ) : filteredAppointments.length === 0 ? (
                <tr>
                  <td
                    colSpan="7"
                    className="px-5 py-12 text-center text-sm text-muted"
                  >
                    No appointments found.
                  </td>
                </tr>
              ) : (
                filteredAppointments.map((appointment) => (
                  <tr
                    key={appointment._id}
                    className="border-t border-line text-sm"
                  >
                    <td className="px-5 py-4">
                      <p className="font-semibold text-brand-dark">
                        {appointment.student?.name || "—"}
                      </p>
                      <p className="mt-1 text-xs text-muted">
                        {appointment.student?.email || ""}
                      </p>
                    </td>

                    <td className="px-5 py-4">
                      <p className="font-medium text-brand-dark">
                        {appointment.counsellor?.name || "—"}
                      </p>
                      <p className="mt-1 text-xs text-muted">
                        {appointment.counsellor?.email || ""}
                      </p>
                    </td>

                    <td className="px-5 py-4">
                      <p className="font-medium text-brand-dark">
                        {formatDate(appointment.scheduledStart)}
                      </p>
                      <p className="mt-1 text-xs text-muted">
                        {formatTime(appointment.scheduledStart)} –{" "}
                        {formatTime(appointment.scheduledEnd)}
                      </p>
                    </td>

                    <td className="px-5 py-4 text-brand-dark">
                      {getDuration(
                        appointment.scheduledStart,
                        appointment.scheduledEnd
                      )}
                    </td>

                    <td className="px-5 py-4">
                      <span className="capitalize text-brand-dark">
                        {appointment.mode?.replaceAll("_", " ") || "—"}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`inline-block rounded-lg px-3 py-1 text-xs font-semibold ${
                          statusStyles[appointment.status] ||
                          "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {formatStatus(appointment.status)}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex flex-wrap gap-2">
                        {appointment.status === "scheduled" && (
                          <button
                            type="button"
                            onClick={() => handleConfirm(appointment._id)}
                            className="rounded-lg bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700 hover:bg-emerald-100"
                          >
                            Confirm
                          </button>
                        )}

                        {["scheduled", "confirmed"].includes(
                          appointment.status
                        ) && (
                          <>
                            <button
                              type="button"
                              onClick={() =>
                                openRescheduleModal(appointment)
                              }
                              className="rounded-lg bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-700 hover:bg-amber-100"
                            >
                              Reschedule
                            </button>

                            <button
                              type="button"
                              onClick={() => handleComplete(appointment._id)}
                              className="rounded-lg bg-purple-50 px-3 py-2 text-xs font-semibold text-purple-700 hover:bg-purple-100"
                            >
                              Complete
                            </button>

                            <button
                              type="button"
                              onClick={() => handleCancel(appointment._id)}
                              className="rounded-lg bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-100"
                            >
                              Cancel
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

      {/* Schedule / Reschedule Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-4">
          <div className="my-6 w-full max-w-2xl rounded-2xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-line p-5">
              <div>
                <h2 className="font-display text-xl font-bold text-brand-dark">
                  {editingAppointment
                    ? "Reschedule Appointment"
                    : "Schedule Appointment"}
                </h2>

                <p className="mt-1 text-xs text-muted">
                  Enter appointment details below.
                </p>
              </div>

              <button
                type="button"
                onClick={closeModal}
                disabled={saving}
                className="rounded-lg px-3 py-2 text-xl text-muted hover:bg-surface"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5 p-5">
              {error && (
                <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                  {error}
                </div>
              )}

              {/* Counselling Request */}
              {!editingAppointment && (
                <div>
                  <label className="mb-2 block text-sm font-semibold text-brand-dark">
                    Counselling Request *
                  </label>

                  <select
                    name="counsellingRequest"
                    value={form.counsellingRequest}
                    onChange={updateForm}
                    required
                    className="w-full rounded-xl border border-line bg-white px-4 py-3 text-sm outline-none focus:border-brand"
                  >
                    <option value="">
                      {loadingRequests
                        ? "Loading requests..."
                        : "Select assigned counselling request"}
                    </option>

                    {counsellingRequests.map((request) => (
                      <option key={request._id} value={request._id}>
                        {request.requestNumber || request._id} —{" "}
                        {request.student?.name || "Student"}
                      </option>
                    ))}
                  </select>

                  {!loadingRequests && counsellingRequests.length === 0 && (
                    <p className="mt-2 text-xs text-rose-600">
                      No assigned counselling requests available.
                    </p>
                  )}
                </div>
              )}

              {/* Start and End */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-brand-dark">
                    Start Date & Time *
                  </label>

                  <input
                    type="datetime-local"
                    name="scheduledStart"
                    value={form.scheduledStart}
                    onChange={updateForm}
                    required
                    className="w-full rounded-xl border border-line px-4 py-3 text-sm outline-none focus:border-brand"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-brand-dark">
                    End Date & Time *
                  </label>

                  <input
                    type="datetime-local"
                    name="scheduledEnd"
                    value={form.scheduledEnd}
                    onChange={updateForm}
                    required
                    className="w-full rounded-xl border border-line px-4 py-3 text-sm outline-none focus:border-brand"
                  />
                </div>
              </div>

              {/* Mode */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-brand-dark">
                  Appointment Mode *
                </label>

                <select
                  name="mode"
                  value={form.mode}
                  onChange={updateForm}
                  required
                  className="w-full rounded-xl border border-line bg-white px-4 py-3 text-sm outline-none focus:border-brand"
                >
                  <option value="phone">Phone</option>
                  <option value="video">Video</option>
                  <option value="in_person">In Person</option>
                  <option value="chat">Chat</option>
                </select>
              </div>

              {/* Video Meeting Link */}
              {form.mode === "video" && (
                <div>
                  <label className="mb-2 block text-sm font-semibold text-brand-dark">
                    Meeting Link *
                  </label>

                  <input
                    type="url"
                    name="meetingLink"
                    value={form.meetingLink}
                    onChange={updateForm}
                    required
                    placeholder="https://meet.google.com/..."
                    className="w-full rounded-xl border border-line px-4 py-3 text-sm outline-none focus:border-brand"
                  />
                </div>
              )}

              {/* In Person Location */}
              {form.mode === "in_person" && (
                <div>
                  <label className="mb-2 block text-sm font-semibold text-brand-dark">
                    Appointment Location *
                  </label>

                  <input
                    type="text"
                    name="location"
                    value={form.location}
                    onChange={updateForm}
                    required
                    placeholder="Enter counselling centre address"
                    className="w-full rounded-xl border border-line px-4 py-3 text-sm outline-none focus:border-brand"
                  />
                </div>
              )}

              <div className="flex flex-col-reverse gap-3 border-t border-line pt-5 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={saving}
                  className="rounded-xl border border-line px-5 py-3 text-sm font-semibold text-brand-dark hover:bg-surface disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving || (!editingAppointment && loadingRequests)}
                  className="rounded-xl bg-accent px-6 py-3 text-sm font-semibold text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {saving
                    ? "Saving..."
                    : editingAppointment
                    ? "Reschedule Appointment"
                    : "Schedule Appointment"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Appointments;