import React, { useEffect, useMemo, useState } from "react";
import { API } from "../../api/axios";

import {
  FiPlus,
  FiSearch,
  FiEye,
  FiEdit2,
  FiTrash2,
  FiX,
  FiFileText,
  FiLock,
  FiUsers,
  FiRefreshCw,
} from "react-icons/fi";

const emptyForm = {
  session: "",
  visibility: "internal",
  category: "general",
  content: "",
};

function CounsellingNotes() {
  const [notes, setNotes] = useState([]);
  const [sessions, setSessions] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [search, setSearch] = useState("");
  const [visibilityFilter, setVisibilityFilter] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState("create");

  const [selectedNote, setSelectedNote] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // =====================================
  // FETCH NOTES
  // =====================================

  const fetchNotes = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await API.get("/counselling-note/all");

      setNotes(response.data.notes || []);
    } catch (err) {
      console.error("Fetch Notes Error:", err);

      setError(
        err.response?.data?.message || "Failed to fetch counselling notes."
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================
  // FETCH COUNSELLING SESSIONS
  // =====================================

  const fetchSessions = async () => {
    try {
      const response = await API.get("/counselling-session/all");

      setSessions(response.data.sessions || []);
    } catch (err) {
      console.error("Fetch Sessions Error:", err);
    }
  };

  useEffect(() => {
    fetchNotes();
    fetchSessions();
  }, []);

  // =====================================
  // SUMMARY
  // =====================================

  const totalNotes = notes.length;

  const internalNotes = notes.filter(
    (note) => note.visibility === "internal"
  ).length;

  const studentVisibleNotes = notes.filter(
    (note) => note.visibility === "student_visible"
  ).length;

  // =====================================
  // SEARCH AND FILTER
  // =====================================

  const filteredNotes = useMemo(() => {
    return notes.filter((note) => {
      const studentName = note.session?.student?.name || "";
      const studentEmail = note.session?.student?.email || "";

      const counsellorName = note.session?.counsellor?.name || "";
      const counsellorEmail = note.session?.counsellor?.email || "";

      const content = note.content || "";

      const searchText = search.toLowerCase();

      const matchesSearch = [
        studentName,
        studentEmail,
        counsellorName,
        counsellorEmail,
        content,
      ].some((value) => value.toLowerCase().includes(searchText));

      const matchesVisibility =
        !visibilityFilter || note.visibility === visibilityFilter;

      return matchesSearch && matchesVisibility;
    });
  }, [notes, search, visibilityFilter]);

  // =====================================
  // FORM HANDLING
  // =====================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // =====================================
  // OPEN CREATE MODAL
  // =====================================

  const openCreateModal = () => {
    setModalType("create");
    setSelectedNote(null);
    setForm(emptyForm);
    setError("");
    setSuccess("");
    setShowModal(true);
  };

  // =====================================
  // OPEN EDIT MODAL
  // =====================================

  const openEditModal = (note) => {
    setModalType("edit");
    setSelectedNote(note);

    setForm({
      session: note.session?._id || note.session || "",
      visibility: note.visibility,
      category: note.category,
      content: note.content,
    });

    setError("");
    setSuccess("");
    setShowModal(true);
  };

  // =====================================
  // OPEN VIEW MODAL
  // =====================================

  const openViewModal = (note) => {
    setModalType("view");
    setSelectedNote(note);
    setError("");
    setShowModal(true);
  };

  // =====================================
  // CREATE NOTE
  // =====================================

  const handleCreate = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      setError("");

      await API.post("/counselling-note/create", {
        session: form.session,
        visibility: form.visibility,
        category: form.category,
        content: form.content,
      });

      setSuccess("Counselling note created successfully.");

      await fetchNotes();

      setShowModal(false);
      setForm(emptyForm);
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to create counselling note."
      );
    } finally {
      setSaving(false);
    }
  };

  // =====================================
  // UPDATE NOTE
  // =====================================

  const handleUpdate = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      setError("");

      await API.put(
        `/counselling-note/update/${selectedNote._id}`,
        {
          visibility: form.visibility,
          category: form.category,
          content: form.content,
        }
      );

      setSuccess("Counselling note updated successfully.");

      await fetchNotes();

      setShowModal(false);
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to update counselling note."
      );
    } finally {
      setSaving(false);
    }
  };

  // =====================================
  // DELETE NOTE
  // =====================================

  const handleDelete = async (note) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this counselling note?"
    );

    if (!confirmDelete) return;

    try {
      setError("");

      await API.delete(`/counselling-note/delete/${note._id}`);

      setSuccess("Counselling note deleted successfully.");

      await fetchNotes();
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to delete counselling note."
      );
    }
  };

  // =====================================
  // DATE FORMAT
  // =====================================

  const formatDate = (date) => {
    if (!date) return "—";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // =====================================
  // GET STUDENT / COUNSELLOR
  // =====================================

  const getStudent = (note) => {
    return note.session?.student?.name || "—";
  };

  const getCounsellor = (note) => {
    return note.session?.counsellor?.name || "—";
  };

  // =====================================
  // BADGES
  // =====================================

  const VisibilityBadge = ({ visibility }) => {
    const isVisible = visibility === "student_visible";

    return (
      <span
        className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${
          isVisible
            ? "bg-emerald-50 text-emerald-700"
            : "bg-amber-50 text-amber-700"
        }`}
      >
        {isVisible ? "Student Visible" : "Internal"}
      </span>
    );
  };

  // =====================================
  // INPUT STYLE
  // =====================================

  const inputClass =
    "w-full rounded-xl border border-line bg-white px-4 py-3 text-sm outline-none transition focus:border-brand";

  // =====================================
  // MAIN UI
  // =====================================

  return (
    <div className="mx-auto w-full max-w-[1500px]">

      {/* HEADING */}

      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>

          <h1 className="mt-2 font-display text-3xl font-bold text-brand-dark">
            Counselling Notes
          </h1>

          <p className="mt-2 text-sm text-muted">
            Maintain and review notes from student counselling sessions.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => {
              fetchNotes();
              fetchSessions();
            }}
            className="flex items-center gap-2 rounded-xl border border-line bg-white px-4 py-3 text-sm font-semibold text-brand-dark hover:bg-surface"
          >
            <FiRefreshCw />
            Refresh
          </button>

          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 rounded-xl bg-accent px-5 py-3 text-sm font-semibold text-white shadow-sm hover:opacity-90"
          >
            <FiPlus />
            Add Note
          </button>
        </div>
      </div>

      {/* SUCCESS / ERROR */}

      {success && (
        <div className="mb-4 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {success}
        </div>
      )}

      {error && !showModal && (
        <div className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* SUMMARY CARDS */}

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">

        {[
          {
            title: "Total Notes",
            count: totalNotes,
            icon: <FiFileText />,
            color: "bg-blue-50 text-blue-700",
          },
          {
            title: "Internal Notes",
            count: internalNotes,
            icon: <FiLock />,
            color: "bg-amber-50 text-amber-700",
          },
          {
            title: "Student Visible",
            count: studentVisibleNotes,
            icon: <FiUsers />,
            color: "bg-emerald-50 text-emerald-700",
          },
        ].map((card) => (
          <div
            key={card.title}
            className="rounded-2xl border border-line bg-white p-5"
          >
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-muted">
                {card.title}
              </p>

              <span
                className={`rounded-xl p-3 text-lg ${card.color}`}
              >
                {card.icon}
              </span>
            </div>

            <h2 className="mt-3 font-display text-3xl font-bold text-brand-dark">
              {card.count}
            </h2>

            <span
              className={`mt-3 inline-block rounded-lg px-3 py-1 text-xs font-semibold ${card.color}`}
            >
              Overview
            </span>
          </div>
        ))}
      </div>

      {/* SEARCH AND FILTER */}

      <div className="mb-5 flex flex-col gap-3 rounded-2xl border border-line bg-white p-4 sm:flex-row">

        <div className="relative min-w-0 flex-1">
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />

          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by student, counsellor or note..."
            className={`${inputClass} pl-11`}
          />
        </div>

        <select
          value={visibilityFilter}
          onChange={(e) => setVisibilityFilter(e.target.value)}
          className={`${inputClass} sm:w-52`}
        >
          <option value="">All Visibility</option>
          <option value="internal">Internal</option>
          <option value="student_visible">Student Visible</option>
        </select>
      </div>

      {/* NOTES TABLE */}

      <div className="overflow-hidden rounded-2xl border border-line bg-white">

        <div className="flex flex-col justify-between gap-2 border-b border-line p-5 sm:flex-row sm:items-center">
          <div>
            <h2 className="font-display text-lg font-bold text-brand-dark">
              Counselling Note Records
            </h2>

            <p className="mt-1 text-xs text-muted">
              Review notes recorded during counselling sessions.
            </p>
          </div>

          <span className="text-xs font-semibold text-muted">
            {filteredNotes.length} Records
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1000px] text-left">

            <thead className="bg-[#F9FBFA]">
              <tr className="text-xs font-semibold uppercase tracking-wide text-muted">
                <th className="px-5 py-4">Student</th>
                <th className="px-5 py-4">Counsellor</th>
                <th className="px-5 py-4">Session</th>
                <th className="px-5 py-4">Note</th>
                <th className="px-5 py-4">Visibility</th>
                <th className="px-5 py-4">Created Date</th>
                <th className="px-5 py-4">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-line">

              {loading ? (
                <tr>
                  <td colSpan="7" className="px-5 py-12 text-center text-sm text-muted">
                    Loading counselling notes...
                  </td>
                </tr>
              ) : filteredNotes.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-5 py-12 text-center text-sm text-muted">
                    No counselling notes found.
                  </td>
                </tr>
              ) : (
                filteredNotes.map((note) => (
                  <tr key={note._id} className="transition hover:bg-surface/50">

                    <td className="px-5 py-4">
                      <p className="font-semibold text-brand-dark">
                        {getStudent(note)}
                      </p>

                      <p className="mt-1 text-xs text-muted">
                        {note.session?.student?.email || "—"}
                      </p>
                    </td>

                    <td className="px-5 py-4">
                      <p className="font-semibold text-brand-dark">
                        {getCounsellor(note)}
                      </p>

                      <p className="mt-1 text-xs text-muted">
                        {note.session?.counsellor?.email || "—"}
                      </p>
                    </td>

                    <td className="px-5 py-4">
                      <span className="font-semibold text-brand-dark">
                        Session #{note.session?.sessionNumber || "—"}
                      </span>

                      <p className="mt-1 text-xs capitalize text-muted">
                        {note.session?.status?.replace("_", " ") || "—"}
                      </p>
                    </td>

                    <td className="max-w-[220px] px-5 py-4">
                      <p className="truncate text-sm text-brand-dark">
                        {note.content}
                      </p>

                      <p className="mt-1 text-xs capitalize text-muted">
                        {note.category?.replace("_", " ")}
                      </p>
                    </td>

                    <td className="px-5 py-4">
                      <VisibilityBadge visibility={note.visibility} />
                    </td>

                    <td className="px-5 py-4 text-sm text-muted">
                      {formatDate(note.createdAt)}
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">

                        <button
                          onClick={() => openViewModal(note)}
                          title="View Note"
                          className="rounded-lg bg-blue-50 p-2.5 text-blue-600 hover:bg-blue-100"
                        >
                          <FiEye />
                        </button>

                        <button
                          onClick={() => openEditModal(note)}
                          title="Edit Note"
                          className="rounded-lg bg-amber-50 p-2.5 text-amber-600 hover:bg-amber-100"
                        >
                          <FiEdit2 />
                        </button>

                        <button
                          onClick={() => handleDelete(note)}
                          title="Delete Note"
                          className="rounded-lg bg-red-50 p-2.5 text-red-600 hover:bg-red-100"
                        >
                          <FiTrash2 />
                        </button>

                      </div>
                    </td>
                  </tr>
                ))
              )}

            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL */}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">

          <div className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl bg-white shadow-2xl">

            {/* MODAL HEADER */}

            <div className="flex items-center justify-between border-b border-line p-5">

              <div>
                <h2 className="font-display text-xl font-bold text-brand-dark">
                  {modalType === "create"
                    ? "Add Counselling Note"
                    : modalType === "edit"
                    ? "Edit Counselling Note"
                    : "Counselling Note Details"}
                </h2>

                <p className="mt-1 text-xs text-muted">
                  Manage counselling session notes.
                </p>
              </div>

              <button
                onClick={() => setShowModal(false)}
                className="rounded-lg bg-surface p-2 text-muted hover:text-red-600"
              >
                <FiX size={18} />
              </button>

            </div>

            {/* VIEW MODAL */}

            {modalType === "view" ? (
              <div className="space-y-5 p-5">

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                  <div>
                    <p className="text-xs text-muted">Student</p>
                    <p className="mt-1 font-semibold text-brand-dark">
                      {getStudent(selectedNote)}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-muted">Counsellor</p>
                    <p className="mt-1 font-semibold text-brand-dark">
                      {getCounsellor(selectedNote)}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-muted">Session</p>
                    <p className="mt-1 font-semibold text-brand-dark">
                      #{selectedNote.session?.sessionNumber || "—"}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-muted">Category</p>
                    <p className="mt-1 font-semibold capitalize text-brand-dark">
                      {selectedNote.category?.replace("_", " ")}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-muted">Visibility</p>
                    <div className="mt-2">
                      <VisibilityBadge visibility={selectedNote.visibility} />
                    </div>
                  </div>

                  <div>
                    <p className="text-xs text-muted">Created Date</p>
                    <p className="mt-1 font-semibold text-brand-dark">
                      {formatDate(selectedNote.createdAt)}
                    </p>
                  </div>

                  {selectedNote.editedAt && (
                    <div>
                      <p className="text-xs text-muted">Last Edited</p>
                      <p className="mt-1 font-semibold text-brand-dark">
                        {formatDate(selectedNote.editedAt)}
                      </p>
                    </div>
                  )}

                </div>

                <div>
                  <p className="mb-2 text-xs font-semibold uppercase text-muted">
                    Note Content
                  </p>

                  <div className="whitespace-pre-wrap rounded-xl bg-surface p-4 text-sm leading-6 text-brand-dark">
                    {selectedNote.content}
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={() => setShowModal(false)}
                    className="rounded-xl bg-accent px-5 py-2.5 text-sm font-semibold text-white"
                  >
                    Close
                  </button>
                </div>

              </div>
            ) : (

              /* CREATE / EDIT FORM */

              <form
                onSubmit={
                  modalType === "create" ? handleCreate : handleUpdate
                }
                className="space-y-5 p-5"
              >

                {error && (
                  <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
                    {error}
                  </div>
                )}

                {/* SESSION */}

                {modalType === "create" && (
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-brand-dark">
                      Select Counselling Session *
                    </label>

                    <select
                      name="session"
                      value={form.session}
                      onChange={handleChange}
                      required
                      className={inputClass}
                    >
                      <option value="">Select Session</option>

                      {sessions.map((session) => (
                        <option key={session._id} value={session._id}>
                          {session.student?.name || "Student"} — Session #
                          {session.sessionNumber} —{" "}
                          {session.counsellor?.name || "Counsellor"}
                        </option>
                      ))}
                    </select>

                    {sessions.length === 0 && (
                      <p className="mt-2 text-xs text-amber-600">
                        No counselling sessions available.
                      </p>
                    )}
                  </div>
                )}

                {/* CATEGORY */}

                <div>
                  <label className="mb-2 block text-sm font-semibold text-brand-dark">
                    Note Category *
                  </label>

                  <select
                    name="category"
                    value={form.category}
                    onChange={handleChange}
                    className={inputClass}
                    required
                  >
                    <option value="academic">Academic</option>
                    <option value="budget">Budget</option>
                    <option value="preferences">Preferences</option>
                    <option value="follow_up">Follow Up</option>
                    <option value="general">General</option>
                  </select>
                </div>

                {/* VISIBILITY */}

                <div>
                  <label className="mb-2 block text-sm font-semibold text-brand-dark">
                    Note Visibility *
                  </label>

                  <select
                    name="visibility"
                    value={form.visibility}
                    onChange={handleChange}
                    className={inputClass}
                    required
                  >
                    <option value="internal">Internal Only</option>
                    <option value="student_visible">
                      Student Visible
                    </option>
                  </select>

                  <p className="mt-2 text-xs text-muted">
                    Internal notes are visible only to Admin and assigned
                    Counsellor. Student-visible notes can also be viewed by
                    the student.
                  </p>
                </div>

                {/* CONTENT */}

                <div>
                  <label className="mb-2 block text-sm font-semibold text-brand-dark">
                    Note Content *
                  </label>

                  <textarea
                    name="content"
                    value={form.content}
                    onChange={handleChange}
                    rows="5"
                    maxLength="10000"
                    required
                    placeholder="Write counselling note..."
                    className={`${inputClass} resize-none`}
                  />

                  <p className="mt-1 text-right text-xs text-muted">
                    {form.content.length}/10000
                  </p>
                </div>

                {/* FOOTER */}

                <div className="flex justify-end gap-3 border-t border-line pt-4">

                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="rounded-xl border border-line px-5 py-2.5 text-sm font-semibold text-brand-dark hover:bg-surface"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={saving || (modalType === "create" && sessions.length === 0)}
                    className="rounded-xl bg-accent px-6 py-2.5 text-sm font-semibold text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {saving
                      ? "Saving..."
                      : modalType === "create"
                      ? "Create Note"
                      : "Save Changes"}
                  </button>

                </div>

              </form>
            )}

          </div>
        </div>
      )}

    </div>
  );
}

export default CounsellingNotes;