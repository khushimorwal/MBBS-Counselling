
"use client";

import { useEffect, useState } from "react";

const API_URL = "http://localhost:3000";

const emptyForm = {
  examName: "",
  examYear: "",
  rollNumber: "",
  score: "",
  air: "",
  categoryRank: "",
  status: "",
};

export default function EntranceExams() {
  const [exams, setExams] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [showForm, setShowForm] = useState(false);
  const [editIndex, setEditIndex] = useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  // Fetch entrance exams belonging to the logged-in student.
  const fetchExams = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("Please login again.");
      }

      const response = await fetch(`${API_URL}/student-profile`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to fetch entrance exams.");
      }

      setExams(data.profile?.entranceExams || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Load saved entrance exams when the component mounts.
  useEffect(() => {
    fetchExams();
  }, []);

  // Handle form input changes.
  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Save or update entrance exams in MongoDB.
  const handleSave = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      setError("");
      setMessage("");

      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("Please login again.");
      }

      const updatedExam = {
        ...form,
        examYear: Number(form.examYear),
        score: form.score === "" ? undefined : Number(form.score),
        air: form.air === "" ? undefined : Number(form.air),
        categoryRank:
          form.categoryRank === ""
            ? undefined
            : Number(form.categoryRank),
      };

      const updatedExams = [...exams];

      if (editIndex !== null) {
        updatedExams[editIndex] = {
          ...updatedExams[editIndex],
          ...updatedExam,
        };
      } else {
        updatedExams.push(updatedExam);
      }

      const response = await fetch(`${API_URL}/student-profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          entranceExams: updatedExams,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to save entrance exam.");
      }

      setExams(data.profile?.entranceExams || updatedExams);
      setForm(emptyForm);
      setEditIndex(null);
      setShowForm(false);

      setMessage(
        editIndex !== null
          ? "Entrance exam updated successfully!"
          : "Entrance exam saved successfully!"
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  // Open the selected exam in edit mode.
  const handleEdit = (index) => {
    const selectedExam = exams[index];

    setForm({
      examName: selectedExam.examName || "",
      examYear: selectedExam.examYear || "",
      rollNumber: selectedExam.rollNumber || "",
      score: selectedExam.score ?? "",
      air: selectedExam.air ?? "",
      categoryRank: selectedExam.categoryRank ?? "",
      status: selectedExam.status || "",
    });

    setEditIndex(index);
    setShowForm(true);
    setError("");
    setMessage("");
  };

  // Delete the selected exam from MongoDB.
  const handleDelete = async (index) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this entrance exam?"
    );

    if (!confirmed) return;

    try {
      setSaving(true);
      setError("");
      setMessage("");

      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("Please login again.");
      }

      const updatedExams = exams.filter((_, i) => i !== index);

      const response = await fetch(`${API_URL}/student-profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          entranceExams: updatedExams,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to delete entrance exam.");
      }

      setExams(data.profile?.entranceExams || updatedExams);
      setMessage("Entrance exam deleted successfully!");
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  // Reset the form and close it.
  const handleCancel = () => {
    setForm(emptyForm);
    setEditIndex(null);
    setShowForm(false);
    setError("");
  };

  const inputClass =
    "w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500";

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-800">
            Entrance Exams
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Add your entrance examination details.
          </p>
        </div>

        <button
          type="button"
          disabled={saving}
          onClick={() => {
            setForm(emptyForm);
            setEditIndex(null);
            setShowForm(!showForm);
            setError("");
            setMessage("");
          }}
          className="rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
        >
          + Add Exam
        </button>
      </div>

      {/* SUCCESS MESSAGE */}
      {message && (
        <p className="rounded-lg bg-green-50 p-3 text-sm font-medium text-green-700">
          {message}
        </p>
      )}

      {/* ERROR MESSAGE */}
      {error && (
        <p className="rounded-lg bg-red-50 p-3 text-sm font-medium text-red-600">
          {error}
        </p>
      )}

      {/* ADD / EDIT FORM */}
      {showForm && (
        <form
          onSubmit={handleSave}
          className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6"
        >
          <h3 className="font-semibold text-slate-800">
            {editIndex !== null ? "Edit Exam" : "Add Entrance Exam"}
          </h3>

          <div className="grid gap-4 sm:grid-cols-2">

            <div>
              <label className="mb-2 block text-sm font-medium">
                Exam Name *
              </label>

              <select
                name="examName"
                value={form.examName}
                onChange={handleChange}
                className={inputClass}
                required
              >
                <option value="">Select Exam</option>
                <option value="NEET UG">NEET UG</option>
                <option value="NEET PG">NEET PG</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Exam Year *
              </label>

              <input
                type="number"
                name="examYear"
                value={form.examYear}
                onChange={handleChange}
                placeholder="2026"
                min="1900"
                max={new Date().getFullYear() + 1}
                className={inputClass}
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Roll Number
              </label>

              <input
                name="rollNumber"
                value={form.rollNumber}
                onChange={handleChange}
                placeholder="Enter roll number"
                className={inputClass}
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Score / Marks
              </label>

              <input
                type="number"
                name="score"
                value={form.score}
                onChange={handleChange}
                placeholder="Enter score"
                className={inputClass}
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                All India Rank (AIR)
              </label>

              <input
                type="number"
                name="air"
                value={form.air}
                onChange={handleChange}
                placeholder="Enter AIR"
                className={inputClass}
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Category Rank
              </label>

              <input
                type="number"
                name="categoryRank"
                value={form.categoryRank}
                onChange={handleChange}
                placeholder="Enter category rank"
                className={inputClass}
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Exam Status
              </label>

              <select
                name="status"
                value={form.status}
                onChange={handleChange}
                className={inputClass}
              >
                <option value="">Select Status</option>
                <option value="Qualified">Qualified</option>
                <option value="Not Qualified">Not Qualified</option>
                <option value="Result Awaited">Result Awaited</option>
              </select>
            </div>

          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={saving}
              className="rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white disabled:opacity-60"
            >
              {saving
                ? "Saving..."
                : editIndex !== null
                  ? "Update Exam"
                  : "Save Exam"}
            </button>

            <button
              type="button"
              onClick={handleCancel}
              disabled={saving}
              className="rounded-xl border border-slate-300 px-6 py-3 text-sm font-semibold text-slate-600 disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* EXAM LIST */}
      {loading ? (
        <div className="rounded-2xl border border-slate-200 bg-white py-12 text-center text-slate-500">
          Loading entrance exams...
        </div>
      ) : exams.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white py-12 text-center">
          <p className="font-medium text-slate-700">
            No entrance exams added yet
          </p>

          <p className="mt-2 text-sm text-slate-500">
            Click on Add Exam to enter your exam details.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">

          {exams.map((exam, index) => (
            <div
              key={exam._id || index}
              className="rounded-2xl border border-slate-200 bg-white p-5"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-800">
                  {exam.examName}
                </h3>

                <span className="rounded-lg bg-blue-50 px-3 py-1 text-sm text-blue-700">
                  {exam.examYear}
                </span>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-4 text-sm">

                <div>
                  <p className="text-slate-500">Roll Number</p>
                  <p className="mt-1 font-medium">
                    {exam.rollNumber || "-"}
                  </p>
                </div>

                <div>
                  <p className="text-slate-500">Score</p>
                  <p className="mt-1 font-medium">
                    {exam.score ?? "-"}
                  </p>
                </div>

                <div>
                  <p className="text-slate-500">AIR</p>
                  <p className="mt-1 font-medium">
                    {exam.air ?? "-"}
                  </p>
                </div>

                <div>
                  <p className="text-slate-500">Category Rank</p>
                  <p className="mt-1 font-medium">
                    {exam.categoryRank ?? "-"}
                  </p>
                </div>

              </div>

              <div className="mt-4 flex items-center justify-between border-t pt-4">
                <span className="text-sm font-medium text-green-600">
                  {exam.status || "Status not added"}
                </span>

                <div className="flex gap-3 text-sm">
                  <button
                    type="button"
                    onClick={() => handleEdit(index)}
                    disabled={saving}
                    className="font-semibold text-blue-600 disabled:opacity-50"
                  >
                    Edit
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDelete(index)}
                    disabled={saving}
                    className="font-semibold text-red-500 disabled:opacity-50"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}

        </div>
      )}
    </div>
  );
}
