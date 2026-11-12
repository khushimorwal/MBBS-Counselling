
"use client";

import { useEffect, useState } from "react";

const API_URL = "http://localhost:3000";

const emptyForm = {
  courseName: "",
  courseType: "",
  specialization: "",
  priority: "",
};

const courses = [
  "MBBS",
  "BDS",
  "BAMS",
  "BHMS",
  "BUMS",
  "BSMS",
  "B.Sc Nursing",
  "BPT",
  "BOT",
  "Other",
];

export default function PreferredCourse() {
  const [preferredCourses, setPreferredCourses] = useState([]);
  const [form, setForm] = useState(emptyForm);

  const [showForm, setShowForm] = useState(false);
  const [editIndex, setEditIndex] = useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const inputClass =
    "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500";

  // Fetch saved courses for the authenticated student.
  const fetchCourses = async () => {
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
        throw new Error(data.message || "Unable to fetch preferred courses.");
      }

      setPreferredCourses(data.profile?.preferredCourseDetails || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Load saved courses when the component mounts.
  useEffect(() => {
    fetchCourses();
  }, []);

  // Handle form input changes.
  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Save or update preferred courses in MongoDB.
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

      const updatedCourse = {
        courseName: form.courseName,
        courseType: form.courseType,
        specialization: form.specialization,
        priority: form.priority,
      };

      const updatedCourses = [...preferredCourses];

      if (editIndex !== null) {
        updatedCourses[editIndex] = updatedCourse;
      } else {
        updatedCourses.push(updatedCourse);
      }

      const response = await fetch(`${API_URL}/student-profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          preferredCourseDetails: updatedCourses,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to save preferred course.");
      }

      setPreferredCourses(
        data.profile?.preferredCourseDetails || updatedCourses
      );

      setForm(emptyForm);
      setEditIndex(null);
      setShowForm(false);

      setMessage(
        editIndex !== null
          ? "Preferred course updated successfully!"
          : "Preferred course saved successfully!"
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  // Open the selected course in edit mode.
  const handleEdit = (index) => {
    const selectedCourse = preferredCourses[index];

    setForm({
      courseName: selectedCourse.courseName || "",
      courseType: selectedCourse.courseType || "",
      specialization: selectedCourse.specialization || "",
      priority: selectedCourse.priority || "",
    });

    setEditIndex(index);
    setShowForm(true);
    setError("");
    setMessage("");
  };

  // Delete the selected course from MongoDB.
  const handleDelete = async (index) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this preferred course?"
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

      const updatedCourses = preferredCourses.filter(
        (_, i) => i !== index
      );

      const response = await fetch(`${API_URL}/student-profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          preferredCourseDetails: updatedCourses,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to delete preferred course.");
      }

      setPreferredCourses(
        data.profile?.preferredCourseDetails || updatedCourses
      );

      setMessage("Preferred course deleted successfully!");
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

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">
            Preferred Courses
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Select the courses you are interested in pursuing.
          </p>
        </div>

        <button
          type="button"
          disabled={saving}
          onClick={() => {
            setForm(emptyForm);
            setEditIndex(null);
            setShowForm(true);
            setError("");
            setMessage("");
          }}
          className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
        >
          + Add Course
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
          <h3 className="text-lg font-semibold text-slate-800">
            {editIndex !== null ? "Edit Course" : "Add Preferred Course"}
          </h3>

          <div className="grid gap-5 sm:grid-cols-2">

            {/* COURSE NAME */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Course Name *
              </label>

              <select
                name="courseName"
                value={form.courseName}
                onChange={handleChange}
                className={inputClass}
                required
              >
                <option value="">Select Course</option>

                {courses.map((course) => (
                  <option key={course} value={course}>
                    {course}
                  </option>
                ))}
              </select>
            </div>

            {/* COURSE TYPE */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Course Type *
              </label>

              <select
                name="courseType"
                value={form.courseType}
                onChange={handleChange}
                className={inputClass}
                required
              >
                <option value="">Select Course Type</option>
                <option value="Medical">Medical</option>
                <option value="Dental">Dental</option>
                <option value="AYUSH">AYUSH</option>
                <option value="Nursing">Nursing</option>
                <option value="Allied Health Sciences">
                  Allied Health Sciences
                </option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* SPECIALIZATION */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Preferred Specialization
              </label>

              <input
                type="text"
                name="specialization"
                value={form.specialization}
                onChange={handleChange}
                placeholder="Enter specialization (optional)"
                className={inputClass}
              />
            </div>

            {/* PRIORITY */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Priority *
              </label>

              <select
                name="priority"
                value={form.priority}
                onChange={handleChange}
                className={inputClass}
                required
              >
                <option value="">Select Priority</option>
                <option value="1st Preference">1st Preference</option>
                <option value="2nd Preference">2nd Preference</option>
                <option value="3rd Preference">3rd Preference</option>
                <option value="4th Preference">4th Preference</option>
                <option value="5th Preference">5th Preference</option>
              </select>
            </div>

          </div>

          {/* FORM BUTTONS */}
          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={saving}
              className="rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
            >
              {saving
                ? "Saving..."
                : editIndex !== null
                  ? "Update Course"
                  : "Save Course"}
            </button>

            <button
              type="button"
              onClick={handleCancel}
              disabled={saving}
              className="rounded-xl border border-slate-300 px-6 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* SAVED COURSES */}
      {loading ? (
        <div className="rounded-2xl border border-slate-200 bg-white py-12 text-center text-slate-500">
          Loading preferred courses...
        </div>
      ) : preferredCourses.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
          <div className="mb-3 text-3xl">🎓</div>

          <h3 className="font-semibold text-slate-700">
            No preferred courses added yet
          </h3>

          <p className="mt-2 text-sm text-slate-500">
            Click on Add Course to select your preferred courses.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">

          {preferredCourses.map((course, index) => (
            <div
              key={course._id || index}
              className="rounded-2xl border border-slate-200 bg-white p-5"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-lg font-bold text-slate-800">
                    {course.courseName}
                  </h3>

                  <p className="mt-1 text-sm text-slate-500">
                    {course.courseType}
                  </p>
                </div>

                <span className="rounded-lg bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-700">
                  {course.priority}
                </span>
              </div>

              <div className="mt-5 border-t border-slate-100 pt-4">
                <p className="text-xs text-slate-500">
                  Preferred Specialization
                </p>

                <p className="mt-1 text-sm font-medium text-slate-700">
                  {course.specialization || "Not specified"}
                </p>
              </div>

              <div className="mt-4 flex justify-end gap-4 border-t border-slate-100 pt-4">
                <button
                  type="button"
                  onClick={() => handleEdit(index)}
                  disabled={saving}
                  className="text-sm font-semibold text-blue-600 hover:text-blue-700 disabled:opacity-50"
                >
                  Edit
                </button>

                <button
                  type="button"
                  onClick={() => handleDelete(index)}
                  disabled={saving}
                  className="text-sm font-semibold text-red-500 hover:text-red-600 disabled:opacity-50"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}

        </div>
      )}
    </div>
  );
}
