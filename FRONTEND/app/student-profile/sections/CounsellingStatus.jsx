"use client";

import { useEffect, useMemo, useState } from "react";

import {
  FiPlus,
  FiRefreshCw,
  FiCalendar,
  FiUser,
  FiClock,
  FiCheckCircle,
  FiFileText,
  FiMessageSquare,
  FiX,
  FiAlertCircle,
  FiGrid,
  FiList,
  FiVideo,
  FiPhone,
  FiMapPin,
  FiChevronRight,
  FiEye,
  FiActivity,
  FiArrowRight,
  FiBookOpen,
  FiLock,
  FiClipboard,
  FiAward,
  FiBell,
  FiMail,
} from "react-icons/fi";

const API_URL = "http://localhost:3000";

const tabs = [
  { id: "overview", label: "Overview", icon: FiGrid },
  { id: "requests", label: "My Requests", icon: FiList },
  { id: "appointments", label: "Appointments", icon: FiCalendar },
  { id: "sessions", label: "Sessions", icon: FiVideo },
  { id: "notes", label: "Counsellor Notes", icon: FiFileText },
  { id: "followups", label: "Follow-ups", icon: FiMessageSquare },
];

const statusLabels = {
  new: "New Request",
  assigned: "Counsellor Assigned",
  contact_pending: "Contact Pending",
  in_progress: "In Progress",
  recommendations_shared: "Recommendations Shared",
  converted: "Converted",
  closed: "Closed",
  cancelled: "Cancelled",
};

const statusColors = {
  new: "bg-blue-50 text-blue-700",
  assigned: "bg-purple-50 text-purple-700",
  contact_pending: "bg-amber-50 text-amber-700",
  in_progress: "bg-indigo-50 text-indigo-700",
  recommendations_shared: "bg-cyan-50 text-cyan-700",
  converted: "bg-emerald-50 text-emerald-700",
  closed: "bg-slate-100 text-slate-600",
  cancelled: "bg-red-50 text-red-700",
};

const workflowStages = [
  {
    id: "registration",
    title: "Registration",
    description: "Student registration",
    icon: FiUser,
  },
  {
    id: "choice_filling",
    title: "Choice Filling",
    description: "Select preferred colleges",
    icon: FiBookOpen,
  },
  {
    id: "choice_locking",
    title: "Choice Locking",
    description: "Lock your preferences",
    icon: FiLock,
  },
  {
    id: "seat_allotment",
    title: "Seat Allotment",
    description: "Allotment result",
    icon: FiAward,
  },
  {
    id: "document_verification",
    title: "Document Verification",
    description: "Verify documents",
    icon: FiClipboard,
  },
  {
    id: "admission_confirmation",
    title: "Admission Confirmation",
    description: "Complete admission",
    icon: FiCheckCircle,
  },
];

const initialForm = {
  academicYear: "",
  admissionLevel: "",
  counsellingMode: "",
  budgetMin: "",
  budgetMax: "",
};

export default function CounsellingStatus() {
  const [counselling, setCounselling] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [activeTab, setActiveTab] = useState("overview");
  const [showForm, setShowForm] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);

  const [form, setForm] = useState(initialForm);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchCounsellingStatus = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("Please login to view your counselling status.");
      }

      const response = await fetch(
        `${API_URL}/student-counselling/my-status`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to fetch counselling status"
        );
      }

      setCounselling(
        Array.isArray(data.counselling) ? data.counselling : []
      );
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCounsellingStatus();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSubmitting(true);
      setError("");
      setSuccess("");

      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("Please login again.");
      }

      if (
        form.budgetMin &&
        form.budgetMax &&
        Number(form.budgetMin) > Number(form.budgetMax)
      ) {
        throw new Error("Minimum budget cannot exceed maximum budget.");
      }

      const payload = {
        academicYear: form.academicYear,
        admissionLevel: form.admissionLevel,
        counsellingMode: form.counsellingMode,
      };

      if (form.budgetMin || form.budgetMax) {
        payload.budget = {
          min: form.budgetMin ? Number(form.budgetMin) : 0,
          max: form.budgetMax ? Number(form.budgetMax) : 0,
          currency: "INR",
        };
      }

      const response = await fetch(`${API_URL}/counselling/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to create request");
      }

      setSuccess("Your counselling request has been submitted successfully.");
      setForm(initialForm);
      setShowForm(false);

      await fetchCounsellingStatus();
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (date) => {
    if (!date) return "Not available";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) return "Not available";

    return parsedDate.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatDateTime = (date) => {
    if (!date) return "Not scheduled";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) return "Not scheduled";

    return parsedDate.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const appointments = useMemo(
    () =>
      counselling.flatMap((item) =>
        (item.appointments || []).map((appointment) => ({
          ...appointment,
          requestNumber: item.request?.requestNumber,
        }))
      ),
    [counselling]
  );

  const sessions = useMemo(
    () =>
      counselling.flatMap((item) =>
        (item.sessions || []).map((session) => ({
          ...session,
          requestNumber: item.request?.requestNumber,
        }))
      ),
    [counselling]
  );

  const notes = useMemo(
    () =>
      counselling.flatMap((item) =>
        (item.notes || []).map((note) => ({
          ...note,
          requestNumber: item.request?.requestNumber,
        }))
      ),
    [counselling]
  );

  const followUps = useMemo(
    () =>
      counselling.flatMap((item) =>
        (item.followUps || []).map((followUp) => ({
          ...followUp,
          requestNumber: item.request?.requestNumber,
        }))
      ),
    [counselling]
  );

  const activeRequests = counselling.filter((item) =>
    [
      "new",
      "assigned",
      "contact_pending",
      "in_progress",
      "recommendations_shared",
    ].includes(item.status)
  ).length;

  const completedSessions = sessions.filter(
    (session) => session.status === "completed"
  ).length;

  const upcomingAppointments = counselling
    .map((item) => ({
      appointment: item.nextAppointment,
      requestNumber: item.request?.requestNumber,
    }))
    .filter(
      (item) =>
        item.appointment?.scheduledStart &&
        new Date(item.appointment.scheduledStart) >= new Date()
    )
    .sort(
      (a, b) =>
        new Date(a.appointment.scheduledStart) -
        new Date(b.appointment.scheduledStart)
    );

  const nextAppointment = upcomingAppointments[0];

  const latestRequest = counselling[0] || null;

  const counsellor = counselling.find((item) => item.counsellor)?.counsellor;

  const latestRequestData = latestRequest?.request || {};

  // Workflow data received from backend
  const workflowData = latestRequest?.workflowStages || [];

  const completedWorkflowIds = workflowData
    .filter((stage) => stage.status === "completed")
    .map((stage) => stage.id);

  const currentWorkflowStage = workflowData.find(
    (stage) => stage.status === "in_progress"
  );

  const activityItems = [
    ...counselling.map((item) => ({
      type: "request",
      title: "Counselling request submitted",
      description: item.request?.requestNumber || "New request",
      date: item.request?.createdAt,
      icon: FiFileText,
    })),

    ...appointments.map((item) => ({
      type: "appointment",
      title: "Counselling appointment",
      description: formatDateTime(item.scheduledStart),
      date: item.createdAt || item.scheduledStart,
      icon: FiCalendar,
    })),

    ...sessions.map((item) => ({
      type: "session",
      title: "Counselling session",
      description: item.summary || item.status || "Session update",
      date: item.createdAt || item.scheduledStart,
      icon: FiVideo,
    })),

    ...notes.map((item) => ({
      type: "note",
      title: "Counsellor note added",
      description:
        item.content || item.note || item.description || "New note",
      date: item.createdAt,
      icon: FiMessageSquare,
    })),
  ]
    .filter((item) => item.date)
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5);

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-violet-100 border-t-violet-600" />
          <p className="mt-4 text-sm font-medium text-slate-500">
            Loading counselling details...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen space-y-6 bg-[#f7f7fc] p-3 pb-10 sm:p-5 lg:p-6">
      {/* PAGE HEADER */}

      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-violet-600">
            <span className="h-2 w-2 rounded-full bg-violet-500" />
            Student Portal
          </div>

          <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-800 sm:text-3xl">
            Counselling Status
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Track your counselling journey and admission progress.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={fetchCounsellingStatus}
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 shadow-sm transition hover:bg-slate-50"
          >
            <FiRefreshCw />
            Refresh
          </button>

          <button
            onClick={() => {
              setError("");
              setSuccess("");
              setShowForm(true);
            }}
            className="flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-violet-200 transition hover:bg-violet-700"
          >
            <FiPlus />
            New Request
          </button>
        </div>
      </div>

      {/* ALERTS */}

      {error && (
        <Alert
          type="error"
          message={error}
          onClose={() => setError("")}
        />
      )}

      {success && (
        <Alert
          type="success"
          message={success}
          onClose={() => setSuccess("")}
        />
      )}

      {/* SUMMARY CARDS */}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          title="Total Requests"
          value={counselling.length}
          subtitle="All counselling requests"
          icon={FiFileText}
          color="violet"
        />

        <SummaryCard
          title="Active Requests"
          value={activeRequests}
          subtitle="Currently in progress"
          icon={FiActivity}
          color="blue"
        />

        <SummaryCard
          title="Completed Sessions"
          value={completedSessions}
          subtitle="Sessions completed"
          icon={FiCheckCircle}
          color="green"
        />

        <SummaryCard
          title="Upcoming Appointment"
          value={nextAppointment ? "Scheduled" : "None"}
          subtitle={
            nextAppointment
              ? formatDate(nextAppointment.appointment.scheduledStart)
              : "No upcoming appointment"
          }
          icon={FiCalendar}
          color="orange"
        />
      </div>

      {/* COUNSELLING WORKFLOW */}

      <SectionCard
        title="Counselling Progress"
        subtitle="Follow your admission journey step by step"
        action={
          <span className="rounded-full bg-violet-50 px-3 py-1.5 text-xs font-semibold text-violet-700">
            6 Stages
          </span>
        }
      >
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-6">
          {workflowStages.map((stage, index) => {
            const Icon = stage.icon;

            // Find actual stage data from backend
            const stageData = workflowData.find(
              (item) => item.id === stage.id
            );

            const stageStatus = stageData?.status || "pending";

            const completed = stageStatus === "completed";

            const current = stageStatus === "in_progress";

            return (
              <div key={stage.id} className="relative">
                <div
                  className={`flex min-h-[155px] flex-col items-center rounded-2xl border p-4 text-center transition ${
                    completed
                      ? "border-emerald-200 bg-emerald-50"
                      : current
                      ? "border-violet-300 bg-violet-50 shadow-sm"
                      : "border-slate-100 bg-white"
                  }`}
                >
                  <div
                    className={`flex h-11 w-11 items-center justify-center rounded-xl ${
                      completed
                        ? "bg-emerald-100 text-emerald-600"
                        : current
                        ? "bg-violet-100 text-violet-600"
                        : "bg-slate-100 text-slate-400"
                    }`}
                  >
                    {completed ? (
                      <FiCheckCircle size={21} />
                    ) : (
                      <Icon size={21} />
                    )}
                  </div>

                  <span className="mt-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Step {String(index + 1).padStart(2, "0")}
                  </span>

                  <h3 className="mt-1 text-sm font-bold text-slate-800">
                    {stage.title}
                  </h3>

                  <p className="mt-1 text-xs leading-5 text-slate-400">
                    {stage.description}
                  </p>

                  <span
                    className={`mt-3 rounded-full px-2.5 py-1 text-[10px] font-bold ${
                      completed
                        ? "bg-emerald-100 text-emerald-700"
                        : current
                        ? "bg-violet-100 text-violet-700"
                        : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {completed
                      ? "Completed"
                      : current
                      ? "In Progress"
                      : "Pending"}
                  </span>

                  {stageData?.completedAt && completed && (
                    <p className="mt-2 text-[10px] text-emerald-700">
                      {formatDate(stageData.completedAt)}
                    </p>
                  )}

                  {stageData?.remarks && (
                    <p className="mt-2 text-xs leading-5 text-slate-500">
                      {stageData.remarks}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {workflowData.length === 0 && (
          <p className="mt-4 rounded-xl bg-amber-50 px-4 py-3 text-xs leading-5 text-amber-700">
            Workflow stages will update automatically once the backend provides
            their individual statuses. No stage is marked completed without
            actual workflow data.
          </p>
        )}
      </SectionCard>

      {/* TABS */}

      <div className="overflow-x-auto rounded-2xl border border-slate-100 bg-white p-2 shadow-sm">
        <div className="flex min-w-max gap-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition ${
                  activeTab === tab.id
                    ? "bg-violet-600 text-white shadow-sm"
                    : "text-slate-500 hover:bg-violet-50 hover:text-violet-700"
                }`}
              >
                <Icon size={17} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* OVERVIEW */}

      {activeTab === "overview" && (
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          <div className="space-y-6 xl:col-span-2">
            {/* LATEST REQUEST */}

            <SectionCard
              title="Latest Counselling Request"
              subtitle="Your most recent counselling application"
              action={
                <button
                  onClick={() => setActiveTab("requests")}
                  className="flex items-center gap-1 text-sm font-semibold text-violet-600 hover:text-violet-800"
                >
                  View All <FiArrowRight />
                </button>
              }
            >
              {latestRequest ? (
                <div className="rounded-2xl border border-violet-100 bg-gradient-to-br from-violet-50 to-white p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-violet-500">
                        Request Number
                      </p>

                      <h3 className="mt-1 text-xl font-bold text-slate-800">
                        {latestRequestData.requestNumber || "Counselling Request"}
                      </h3>

                      <p className="mt-1 text-xs text-slate-400">
                        Submitted on {formatDate(latestRequestData.createdAt)}
                      </p>
                    </div>

                    <StatusBadge status={latestRequest.status} />
                  </div>

                  <div className="mt-6 grid grid-cols-2 gap-5 sm:grid-cols-3">
                    <SmallDetail
                      label="Academic Year"
                      value={latestRequestData.academicYear}
                    />

                    <SmallDetail
                      label="Admission Level"
                      value={latestRequestData.admissionLevel}
                    />

                    <SmallDetail
                      label="Counselling Mode"
                      value={latestRequestData.counsellingMode}
                    />

                    <SmallDetail
                      label="Minimum Budget"
                      value={
                        latestRequestData.budget?.min
                          ? `₹${latestRequestData.budget.min}`
                          : "Not specified"
                      }
                    />

                    <SmallDetail
                      label="Maximum Budget"
                      value={
                        latestRequestData.budget?.max
                          ? `₹${latestRequestData.budget.max}`
                          : "Not specified"
                      }
                    />
                  </div>

                  <button
                    onClick={() => setSelectedRequest(latestRequest)}
                    className="mt-6 flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-700"
                  >
                    <FiEye />
                    View Request Details
                  </button>
                </div>
              ) : (
                <EmptyState
                  title="No counselling request yet"
                  description="Submit your first counselling request to get started."
                />
              )}
            </SectionCard>

            {/* RECENT ACTIVITY */}

            <SectionCard
              title="Recent Activity"
              subtitle="Latest updates from your counselling journey"
            >
              {activityItems.length === 0 ? (
                <EmptyState
                  title="No recent activity"
                  description="Your counselling activity will appear here."
                />
              ) : (
                <div className="space-y-5">
                  {activityItems.map((activity, index) => {
                    const Icon = activity.icon;

                    return (
                      <div
                        key={`${activity.type}-${index}`}
                        className="flex gap-4"
                      >
                        <div className="relative flex flex-col items-center">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                            <Icon size={18} />
                          </div>

                          {index !== activityItems.length - 1 && (
                            <div className="mt-2 h-full min-h-[25px] w-px bg-violet-100" />
                          )}
                        </div>

                        <div className="min-w-0 flex-1 pb-2">
                          <h3 className="text-sm font-semibold text-slate-800">
                            {activity.title}
                          </h3>

                          <p className="mt-1 break-words text-sm text-slate-500">
                            {activity.description}
                          </p>

                          <p className="mt-2 text-xs text-slate-400">
                            {formatDateTime(activity.date)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </SectionCard>
          </div>

          {/* RIGHT COLUMN */}

          <div className="space-y-6">
            {/* COUNSELLOR */}

            <SectionCard
              title="Assigned Counsellor"
              subtitle="Your counselling expert"
            >
              {counsellor ? (
                <div>
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-100 text-violet-600">
                    <FiUser size={30} />
                  </div>

                  <h3 className="mt-4 text-lg font-bold text-slate-800">
                    {counsellor.name || "Counsellor"}
                  </h3>

                  <p className="mt-1 break-all text-sm text-slate-500">
                    {counsellor.email || "Email not available"}
                  </p>

                  {counsellor.phone && (
                    <p className="mt-2 text-sm text-slate-500">
                      <FiPhone className="mr-2 inline" />
                      {counsellor.phone}
                    </p>
                  )}

                  <div className="mt-5 flex items-center gap-2 rounded-xl bg-emerald-50 px-3 py-3 text-xs font-semibold text-emerald-700">
                    <FiCheckCircle />
                    Counsellor Assigned
                  </div>
                </div>
              ) : (
                <EmptyState
                  title="Not assigned yet"
                  description="Your counsellor details will appear once assigned."
                />
              )}
            </SectionCard>

            {/* UPCOMING APPOINTMENT */}

            <SectionCard
              title="Upcoming Appointment"
              subtitle="Your next counselling meeting"
              action={
                <button
                  onClick={() => setActiveTab("appointments")}
                  className="text-xs font-semibold text-violet-600"
                >
                  View All
                </button>
              }
            >
              {nextAppointment ? (
                <div className="rounded-2xl bg-violet-50 p-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white text-violet-600 shadow-sm">
                    <FiCalendar size={22} />
                  </div>

                  <h3 className="mt-4 font-bold text-slate-800">
                    Counselling Appointment
                  </h3>

                  <p className="mt-2 text-sm text-violet-700">
                    <FiClock className="mr-2 inline" />
                    {formatDateTime(
                      nextAppointment.appointment.scheduledStart
                    )}
                  </p>

                  <p className="mt-2 text-xs text-slate-500">
                    Request: {nextAppointment.requestNumber || "Not available"}
                  </p>

                  <div className="mt-4">
                    <StatusBadge status={nextAppointment.appointment.status} />
                  </div>
                </div>
              ) : (
                <EmptyState
                  title="No upcoming appointment"
                  description="Your scheduled appointments will appear here."
                />
              )}
            </SectionCard>

            {/* FOLLOW-UP REMINDER */}

            <SectionCard
              title="Follow-up Reminders"
              subtitle="Your pending follow-up tasks"
              action={
                <button
                  onClick={() => setActiveTab("followups")}
                  className="text-xs font-semibold text-violet-600"
                >
                  View All
                </button>
              }
            >
              {followUps.length === 0 ? (
                <EmptyState
                  title="No reminders"
                  description="Your follow-up reminders will appear here."
                />
              ) : (
                <div className="space-y-3">
                  {followUps.slice(0, 3).map((item, index) => (
                    <div
                      key={item._id || index}
                      className="rounded-xl border border-slate-100 p-3"
                    >
                      <h4 className="text-sm font-semibold text-slate-800">
                        {item.title || "Follow-up"}
                      </h4>

                      <p className="mt-1 text-xs text-slate-500">
                        Due: {formatDate(item.dueAt)}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </SectionCard>
          </div>
        </div>
      )}

      {/* REQUESTS TAB */}

      {activeTab === "requests" && (
        <SectionCard
          title="My Counselling Requests"
          subtitle="Complete history of your counselling applications"
        >
          {counselling.length === 0 ? (
            <EmptyState
              title="No requests found"
              description="You haven't submitted any counselling requests."
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[750px] text-left">
                <thead>
                  <tr className="border-b border-slate-100 text-xs uppercase text-slate-400">
                    <th className="px-4 py-4">Request</th>
                    <th className="px-4 py-4">Academic Year</th>
                    <th className="px-4 py-4">Level</th>
                    <th className="px-4 py-4">Mode</th>
                    <th className="px-4 py-4">Budget</th>
                    <th className="px-4 py-4">Status</th>
                    <th className="px-4 py-4">Action</th>
                  </tr>
                </thead>

                <tbody>
                  {counselling.map((item, index) => {
                    const request = item.request || {};
                    const budget = request.budget || {};

                    return (
                      <tr
                        key={item._id || index}
                        className="border-b border-slate-50 text-sm last:border-0 hover:bg-violet-50/40"
                      >
                        <td className="px-4 py-4 font-semibold text-slate-700">
                          {request.requestNumber || "Request"}
                        </td>

                        <td className="px-4 py-4 text-slate-600">
                          {request.academicYear || "-"}
                        </td>

                        <td className="px-4 py-4 text-slate-600">
                          {request.admissionLevel || "-"}
                        </td>

                        <td className="px-4 py-4 text-slate-600">
                          {request.counsellingMode || "-"}
                        </td>

                        <td className="px-4 py-4 text-slate-600">
                          {budget.min || budget.max
                            ? `₹${budget.min || 0} - ₹${budget.max || 0}`
                            : "-"}
                        </td>

                        <td className="px-4 py-4">
                          <StatusBadge status={item.status} />
                        </td>

                        <td className="px-4 py-4">
                          <button
                            onClick={() => setSelectedRequest(item)}
                            className="flex items-center gap-1 font-semibold text-violet-600"
                          >
                            <FiEye />
                            View
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </SectionCard>
      )}

      {/* APPOINTMENTS TAB */}

      {activeTab === "appointments" && (
        <SectionCard
          title="My Appointments"
          subtitle="View all your scheduled counselling appointments"
        >
          {appointments.length === 0 ? (
            <EmptyState
              title="No appointments yet"
              description="Your appointments will appear here once scheduled."
            />
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {appointments.map((appointment, index) => (
                <div
                  key={appointment._id || index}
                  className="rounded-2xl border border-slate-100 bg-white p-5"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                      <FiCalendar size={21} />
                    </div>

                    <StatusBadge status={appointment.status} />
                  </div>

                  <h3 className="mt-4 font-bold text-slate-800">
                    Counselling Appointment
                  </h3>

                  <p className="mt-2 text-sm text-slate-500">
                    <FiClock className="mr-2 inline" />
                    {formatDateTime(appointment.scheduledStart)}
                  </p>

                  <p className="mt-2 text-sm text-slate-500">
                    Request: {appointment.requestNumber || "Not available"}
                  </p>
                </div>
              ))}
            </div>
          )}
        </SectionCard>
      )}

      {/* SESSIONS TAB */}

      {activeTab === "sessions" && (
        <SectionCard
          title="Counselling Sessions"
          subtitle="Your completed and scheduled counselling sessions"
        >
          {sessions.length === 0 ? (
            <EmptyState
              title="No sessions available"
              description="Your counselling session records will appear here."
            />
          ) : (
            <div className="space-y-4">
              {sessions.map((session, index) => (
                <SessionRow
                  key={session._id || index}
                  session={session}
                  formatDateTime={formatDateTime}
                  requestNumber={session.requestNumber}
                />
              ))}
            </div>
          )}
        </SectionCard>
      )}

      {/* NOTES TAB */}

      {activeTab === "notes" && (
        <SectionCard
          title="Counsellor Notes"
          subtitle="Notes and updates shared by your counsellor"
        >
          {notes.length === 0 ? (
            <EmptyState
              title="No notes available"
              description="Your counsellor's notes will appear here."
            />
          ) : (
            <div className="space-y-4">
              {notes.map((note, index) => (
                <div
                  key={note._id || index}
                  className="rounded-2xl border border-slate-100 p-5"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                      <FiFileText size={20} />
                    </div>

                    <div>
                      <p className="font-semibold text-slate-800">
                        Counsellor Update
                      </p>

                      <p className="mt-1 text-xs text-slate-400">
                        {formatDate(note.createdAt)}
                      </p>
                    </div>
                  </div>

                  <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-slate-600">
                    {note.content ||
                      note.note ||
                      note.description ||
                      "No note content available."}
                  </p>
                </div>
              ))}
            </div>
          )}
        </SectionCard>
      )}

      {/* FOLLOW-UPS TAB */}

      {activeTab === "followups" && (
        <SectionCard
          title="My Follow-ups"
          subtitle="Tasks and reminders related to your counselling"
        >
          {followUps.length === 0 ? (
            <EmptyState
              title="No follow-ups"
              description="Your follow-up tasks will appear here."
            />
          ) : (
            <div className="space-y-4">
              {followUps.map((followUp, index) => (
                <div
                  key={followUp._id || index}
                  className="flex flex-col justify-between gap-4 rounded-xl border border-slate-100 p-5 sm:flex-row sm:items-center"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-orange-600">
                      <FiClock size={20} />
                    </div>

                    <div>
                      <h3 className="font-semibold text-slate-800">
                        {followUp.title || "Follow-up"}
                      </h3>

                      <p className="mt-1 text-sm text-slate-500">
                        {followUp.description || "No description available"}
                      </p>

                      <p className="mt-2 text-xs text-slate-400">
                        Due: {formatDate(followUp.dueAt)}
                      </p>
                    </div>
                  </div>

                  <StatusBadge status={followUp.status} />
                </div>
              ))}
            </div>
          )}
        </SectionCard>
      )}

      {/* NEW REQUEST MODAL */}

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-900/50 p-4">
          <div className="my-6 w-full max-w-2xl rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
              <div>
                <h2 className="text-xl font-bold text-slate-800">
                  New Counselling Request
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Enter your counselling preferences.
                </p>
              </div>

              <button
                onClick={() => setShowForm(false)}
                className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100"
              >
                <FiX size={21} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5 p-6">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Academic Year *
                </label>

                <input
                  type="text"
                  name="academicYear"
                  value={form.academicYear}
                  onChange={handleChange}
                  placeholder="Example: 2026-27"
                  required
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
                />
              </div>

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Admission Level *
                  </label>

                  <select
                    name="admissionLevel"
                    value={form.admissionLevel}
                    onChange={handleChange}
                    required
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-violet-500"
                  >
                    <option value="">Select Level</option>
                    <option value="UG">UG</option>
                    <option value="PG">PG</option>
                    <option value="Diploma">Diploma</option>
                    <option value="Doctorate">Doctorate</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Counselling Mode *
                  </label>

                  <select
                    name="counsellingMode"
                    value={form.counsellingMode}
                    onChange={handleChange}
                    required
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-violet-500"
                  >
                    <option value="">Select Mode</option>
                    <option value="phone">Phone</option>
                    <option value="video">Video Call</option>
                    <option value="in_person">In Person</option>
                    <option value="chat">Chat</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Budget Range (Optional)
                </label>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <input
                    type="number"
                    name="budgetMin"
                    value={form.budgetMin}
                    onChange={handleChange}
                    min="0"
                    placeholder="Minimum Budget (₹)"
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-violet-500"
                  />

                  <input
                    type="number"
                    name="budgetMax"
                    value={form.budgetMax}
                    onChange={handleChange}
                    min="0"
                    placeholder="Maximum Budget (₹)"
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-violet-500"
                  />
                </div>
              </div>

              <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {submitting ? "Submitting..." : "Submit Request"}
                  {!submitting && <FiPlus />}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* REQUEST DETAILS MODAL */}

      {selectedRequest && (
        <RequestDetailsModal
          item={selectedRequest}
          onClose={() => setSelectedRequest(null)}
          formatDate={formatDate}
        />
      )}
    </div>
  );
}

/* SUMMARY CARD */

function SummaryCard({ title, value, subtitle, icon: Icon, color }) {
  const colors = {
    violet: "bg-violet-50 text-violet-600",
    blue: "bg-blue-50 text-blue-600",
    green: "bg-emerald-50 text-emerald-600",
    orange: "bg-orange-50 text-orange-600",
  };

  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>

          <h2 className="mt-2 text-2xl font-bold text-slate-800">
            {value}
          </h2>
        </div>

        <div
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${colors[color]}`}
        >
          <Icon size={23} />
        </div>
      </div>

      <p className="mt-3 text-xs text-slate-400">{subtitle}</p>
    </div>
  );
}

/* SECTION CARD */

function SectionCard({ title, subtitle, action, children }) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm sm:p-6">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-bold text-slate-800">{title}</h2>

          {subtitle && (
            <p className="mt-1 text-sm text-slate-400">{subtitle}</p>
          )}
        </div>

        {action}
      </div>

      {children}
    </div>
  );
}

/* ALERT */

function Alert({ type, message, onClose }) {
  const isError = type === "error";

  return (
    <div
      className={`flex items-start gap-3 rounded-xl border p-4 text-sm ${
        isError
          ? "border-red-200 bg-red-50 text-red-700"
          : "border-emerald-200 bg-emerald-50 text-emerald-700"
      }`}
    >
      {isError ? <FiAlertCircle /> : <FiCheckCircle />}

      <span className="flex-1">{message}</span>

      <button onClick={onClose}>
        <FiX />
      </button>
    </div>
  );
}

/* STATUS BADGE */

function StatusBadge({ status }) {
  const label = statusLabels[status] || status || "Not available";

  const color =
    statusColors[status] || "bg-slate-100 text-slate-600";

  return (
    <span
      className={`inline-flex rounded-full px-3 py-1.5 text-xs font-semibold ${color}`}
    >
      {label}
    </span>
  );
}

/* SMALL DETAIL */

function SmallDetail({ label, value }) {
  return (
    <div>
      <p className="text-xs text-slate-400">{label}</p>

      <p className="mt-1 break-words text-sm font-semibold text-slate-700">
        {value || "Not available"}
      </p>
    </div>
  );
}

/* EMPTY STATE */

function EmptyState({ title, description }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 px-5 py-10 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-violet-50 text-violet-400">
        <FiFileText size={22} />
      </div>

      <h3 className="mt-3 font-semibold text-slate-700">{title}</h3>

      <p className="mt-1 max-w-sm text-sm text-slate-400">
        {description}
      </p>
    </div>
  );
}

/* SESSION ROW */

function SessionRow({ session, formatDateTime, requestNumber }) {
  return (
    <div className="flex flex-col justify-between gap-4 rounded-xl border border-slate-100 p-4 sm:flex-row sm:items-center">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
          <FiVideo size={19} />
        </div>

        <div>
          <h3 className="font-semibold text-slate-800">
            Counselling Session
          </h3>

          <p className="mt-1 text-sm text-slate-500">
            {formatDateTime(session.scheduledStart || session.createdAt)}
          </p>

          {requestNumber && (
            <p className="mt-1 text-xs text-slate-400">
              Request: {requestNumber}
            </p>
          )}

          {session.summary && (
            <p className="mt-2 text-sm leading-6 text-slate-500">
              {session.summary}
            </p>
          )}
        </div>
      </div>

      <StatusBadge status={session.status} />
    </div>
  );
}

/* REQUEST DETAILS MODAL */

function RequestDetailsModal({ item, onClose, formatDate }) {
  const request = item.request || {};
  const budget = request.budget || {};

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center overflow-y-auto bg-slate-900/50 p-4">
      <div className="my-6 w-full max-w-xl rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
          <div>
            <h2 className="text-lg font-bold text-slate-800">
              Request Details
            </h2>

            <p className="mt-1 text-sm text-slate-400">
              {request.requestNumber || "Counselling Request"}
            </p>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"
          >
            <FiX size={21} />
          </button>
        </div>

        <div className="space-y-5 p-6">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-semibold text-slate-600">
              Current Status
            </p>

            <StatusBadge status={item.status} />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <SmallDetail
              label="Academic Year"
              value={request.academicYear}
            />

            <SmallDetail
              label="Admission Level"
              value={request.admissionLevel}
            />

            <SmallDetail
              label="Counselling Mode"
              value={request.counsellingMode}
            />

            <SmallDetail
              label="Submitted On"
              value={formatDate(request.createdAt)}
            />

            <SmallDetail
              label="Minimum Budget"
              value={budget.min ? `₹${budget.min}` : "Not specified"}
            />

            <SmallDetail
              label="Maximum Budget"
              value={budget.max ? `₹${budget.max}` : "Not specified"}
            />
          </div>

          <div className="rounded-xl bg-violet-50 p-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
              <FiUser className="text-violet-600" />
              Assigned Counsellor
            </div>

            <p className="mt-3 text-sm font-semibold text-slate-800">
              {item.counsellor?.name || "Not assigned yet"}
            </p>

            <p className="mt-1 break-all text-sm text-slate-500">
              {item.counsellor?.email || ""}
            </p>
          </div>

          <button
            onClick={onClose}
            className="w-full rounded-xl bg-violet-600 py-3 text-sm font-semibold text-white transition hover:bg-violet-700"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}