import { useEffect, useRef, useState } from "react";
import { API } from "../api/axios.js";

import {
  FiEye,
  FiEdit2,
  FiTrash2,
} from "react-icons/fi";

const initialForm = {
  name: "",
  slug: "",
  code: "",
  description: "",
  stream: "",
  degree: "",
  durationValue: "",
  durationUnit: "years",
  minimumPercentage: "",
  requiredQualification: "",
  requiredSubjects: "",
  status: "active",
};

// Shared classes (same as College page)
const inputClass =
  "w-full rounded-lg border border-[#9DBDBA] bg-white px-3 py-2.5 text-sm text-[#0B2B2A] outline-none placeholder:text-[#4B6463] focus:border-teal-700 focus:ring-2 focus:ring-teal-200";

const labelClass = "mb-1.5 block text-sm font-medium text-[#0B2B2A]";

const actionButton =
  "inline-flex h-9 w-9 items-center justify-center rounded-lg border transition";

function Field({ label, children, className = "" }) {
  return (
    <div className={className}>
      <label className={labelClass}>{label}</label>
      {children}
    </div>
  );
}

function Course() {
  const [courses, setCourses] = useState([]);
  const [streams, setStreams] = useState([]);
  const [degrees, setDegrees] = useState([]);

  const [editingId, setEditingId] = useState(null);

  const [showForm, setShowForm] = useState(false);
  const [showView, setShowView] = useState(false);

  const [selectedCourse, setSelectedCourse] = useState(null);

  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState(initialForm);

  const fileInputRef = useRef(null);

  // GET DATA
  const getData = async () => {
    try {
      setLoading(true);

      const [courseRes, streamRes, degreeRes] = await Promise.all([
        API.get("/course/all"),
        API.get("/stream/streams"),
        API.get("/degree/degrees"),
      ]);

      const c = courseRes.data;
      const s = streamRes.data;
      const d = degreeRes.data;

      setCourses(Array.isArray(c) ? c : c.courses || c.data || []);
      setStreams(Array.isArray(s) ? s : s.streams || s.data || []);
      setDegrees(Array.isArray(d) ? d : d.degrees || d.data || []);
    } catch (error) {
      console.error("Course data fetch error:", error);

      alert(error.response?.data?.message || "Data load nahi hua.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getData();
  }, []);

  // INPUT CHANGE
  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  // ADD COURSE
  const openAdd = () => {
    setEditingId(null);
    setForm(initialForm);
    setShowForm(true);
  };

  // EDIT COURSE
  const handleEdit = (course) => {
    setEditingId(course._id);

    setForm({
      name: course.name || "",
      slug: course.slug || "",
      code: course.code || "",
      description: course.description || "",
      stream: course.stream?._id || course.stream || "",
      degree: course.degree?._id || course.degree || "",
      durationValue: course.duration?.value ?? "",
      durationUnit: course.duration?.unit || "years",
      minimumPercentage: course.eligibility?.minimumPercentage ?? "",
      requiredQualification: course.eligibility?.requiredQualification || "",
      requiredSubjects:
        course.eligibility?.requiredSubjects?.join(", ") || "",
      status: course.status || "active",
    });

    setShowForm(true);
  };

  // CLOSE FORM
  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    setForm(initialForm);
  };

  // SAVE COURSE
  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      name: form.name.trim(),
      slug: form.slug.trim(),
      code: form.code ? form.code.trim() : undefined,
      description: form.description,
      stream: form.stream,
      degree: form.degree,

      duration: {
        value: Number(form.durationValue),
        unit: form.durationUnit,
      },

      eligibility: {
        minimumPercentage:
          form.minimumPercentage === ""
            ? undefined
            : Number(form.minimumPercentage),

        requiredQualification: form.requiredQualification,

        requiredSubjects: form.requiredSubjects
          .split(",")
          .map((subject) => subject.trim())
          .filter(Boolean),
      },

      status: form.status,
    };

    try {
      if (editingId) {
        await API.put(`/course/update/${editingId}`, payload);
      } else {
        await API.post("/course/create", payload);
      }

      closeForm();

      await getData();
    } catch (error) {
      console.error("Course save error:", error);

      alert(error.response?.data?.message || "Course save nahi hua.");
    }
  };

  // DELETE COURSE
  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this course?"
    );

    if (!confirmDelete) return;

    try {
      await API.delete(`/course/delete/${id}`);

      await getData();
    } catch (error) {
      alert(error.response?.data?.message || "Course delete nahi hua.");
    }
  };

  // VIEW COURSE
  const handleView = (course) => {
    setSelectedCourse(course);
    setShowView(true);
  };

  // STATUS TOGGLE
  const handleStatusToggle = async (course) => {
    const newStatus = course.status === "active" ? "inactive" : "active";

    try {
      await API.put(`/course/update/${course._id}`, {
        status: newStatus,
      });

      await getData();
    } catch (error) {
      console.error("Status update error:", error);

      alert(error.response?.data?.message || "Status update nahi hua.");
    }
  };

  // BULK FILE SELECT
  const handleBulkClick = () => {
    fileInputRef.current.click();
  };

  // BULK UPLOAD
  const handleBulkUpload = async (e) => {
    const file = e.target.files[0];

    if (!file) return;

    const formData = new FormData();

    formData.append("file", file);

    try {
      const response = await API.post("/course/bulk-import", formData);

      alert(response.data?.message || "Courses imported successfully");

      await getData();
    } catch (error) {
      console.log("Bulk upload error:", error.response?.data);

      alert(error.response?.data?.message || "Bulk upload failed");
    }

    // Same file dobara select karne ke liye
    e.target.value = "";
  };

  // SEARCH
  const filtered = courses.filter((course) => {
    const text = `${course.name || ""}
       ${course.slug || ""}
       ${course.code || ""}
       ${course.stream?.name || ""}
       ${course.degree?.name || ""}`.toLowerCase();

    return text.includes(search.toLowerCase());
  });

  const getStreamName = (course) =>
    course.stream?.name ||
    streams.find(
      (stream) => stream._id === (course.stream?._id || course.stream)
    )?.name ||
    "-";

  const getDegreeName = (course) =>
    course.degree?.name ||
    degrees.find(
      (degree) => degree._id === (course.degree?._id || course.degree)
    )?.name ||
    "-";

  return (
    <div className="min-w-0 space-y-6">

      {/* PAGE HEADER */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#0B2B2A]">
            Courses
          </h1>

          <p className="mt-1 text-sm text-[#3F5A58]">
            Manage course information
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls"
            onChange={handleBulkUpload}
            className="hidden"
          />

          <button
            type="button"
            onClick={handleBulkClick}
            className="rounded-xl border border-[#CFE5E2] bg-white px-5 py-2.5 text-sm font-semibold text-[#0B2B2A] hover:bg-teal-50"
          >
            Add Bulk Data
          </button>

          <button
            type="button"
            onClick={openAdd}
            className="rounded-xl bg-teal-700 px-5 py-2.5 text-sm font-bold text-white hover:bg-teal-800"
          >
            + Add Course
          </button>
        </div>
      </div>

      {/* SEARCH */}
      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search course..."
        className="w-full max-w-sm rounded-xl border border-[#9DBDBA] bg-white/80 px-4 py-2.5 text-sm text-[#0B2B2A] outline-none placeholder:text-[#4B6463] focus:border-teal-700 focus:ring-2 focus:ring-teal-200"
      />

      {/* COURSES TABLE */}
      <div className="overflow-x-auto rounded-2xl border border-white bg-white/65 text-[#0B2B2A] shadow-[0_4px_24px_rgba(15,118,110,0.08)] backdrop-blur-xl">
        <table className="w-full min-w-[850px] text-left text-sm">
          <thead className="bg-[#F1F8F7] text-[11px] font-bold uppercase tracking-wider text-[#3F5A58]">
            <tr>
              <th className="px-4 py-4">Name</th>
              <th className="px-4 py-4">Code</th>
              <th className="px-4 py-4">Stream</th>
              <th className="px-4 py-4">Degree</th>
              <th className="px-4 py-4">Duration</th>
              <th className="px-4 py-4">Status</th>
              <th className="px-4 py-4">Actions</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan="7"
                  className="px-4 py-10 text-center text-[#3F5A58]"
                >
                  Loading courses...
                </td>
              </tr>
            ) : filtered.length ? (
              filtered.map((course) => (
                <tr
                  key={course._id}
                  className="border-t border-[#CFE5E2] hover:bg-teal-50/70"
                >
                  <td className="px-4 py-4 font-medium text-[#0B2B2A]">
                    {course.name}
                  </td>

                  <td className="px-4 py-4">{course.code || "-"}</td>

                  <td className="px-4 py-4">{getStreamName(course)}</td>

                  <td className="px-4 py-4">{getDegreeName(course)}</td>

                  <td className="px-4 py-4">
                    {course.duration?.value != null
                      ? `${course.duration.value} ${course.duration.unit || ""}`
                      : "-"}
                  </td>

                  {/* STATUS TOGGLE */}
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleStatusToggle(course)}
                        aria-label={`Toggle ${course.name} status`}
                        className={`relative h-7 w-12 rounded-full transition ${course.status === "active"
                          ? "bg-teal-700"
                          : "bg-slate-400"
                          }`}
                      >
                        <span
                          className={`absolute top-1 h-5 w-5 rounded-full bg-white transition ${course.status === "active"
                            ? "left-6"
                            : "left-1"
                            }`}
                        />
                      </button>

                      <span className="text-xs capitalize text-[#3F5A58]">
                        {course.status || "inactive"}
                      </span>
                    </div>
                  </td>

                  {/* ACTIONS */}
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleView(course)}
                        title="View Course"
                        aria-label="View Course"
                        className={`${actionButton} border-teal-200 bg-teal-50 text-teal-700 hover:bg-teal-700 hover:text-white`}
                      >
                        <FiEye size={17} />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleEdit(course)}
                        title="Edit Course"
                        aria-label="Edit Course"
                        className={`${actionButton} border-[#CFE5E2] bg-white text-[#3F5A58] hover:bg-[#0B2B2A] hover:text-white`}
                      >
                        <FiEdit2 size={17} />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDelete(course._id)}
                        title="Delete Course"
                        aria-label="Delete Course"
                        className={`${actionButton} border-red-200 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white`}
                      >
                        <FiTrash2 size={17} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="7"
                  className="px-4 py-10 text-center text-[#3F5A58]"
                >
                  No courses found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ADD / EDIT FORM */}
      {showForm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) closeForm();
          }}
        >
          <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">

            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-teal-700">
                {editingId ? "Edit Course" : "Add Course"}
              </h2>

              <button
                type="button"
                onClick={closeForm}
                aria-label="Close"
                className="text-2xl text-[#3F5A58] hover:text-red-600"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

                <Field label="Course Name *">
                  <input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    required
                    className={inputClass}
                    placeholder="e.g. MBBS"
                  />
                </Field>

                <Field label="Slug *">
                  <input
                    name="slug"
                    value={form.slug}
                    onChange={handleChange}
                    required
                    className={inputClass}
                    placeholder="e.g. mbbs"
                  />
                </Field>

                <Field label="Course Code">
                  <input
                    name="code"
                    value={form.code}
                    onChange={handleChange}
                    className={inputClass}
                    placeholder="e.g. MBBS"
                  />
                </Field>

                <Field label="Stream *">
                  <select
                    name="stream"
                    value={form.stream}
                    onChange={handleChange}
                    required
                    className={inputClass}
                  >
                    <option value="">Select Stream</option>

                    {streams.map((stream) => (
                      <option key={stream._id} value={stream._id}>
                        {stream.name}
                      </option>
                    ))}
                  </select>
                </Field>

                <Field label="Degree *">
                  <select
                    name="degree"
                    value={form.degree}
                    onChange={handleChange}
                    required
                    className={inputClass}
                  >
                    <option value="">Select Degree</option>

                    {degrees.map((degree) => (
                      <option key={degree._id} value={degree._id}>
                        {degree.name}
                      </option>
                    ))}
                  </select>
                </Field>

                <Field label="Duration Value *">
                  <input
                    type="number"
                    min="0"
                    name="durationValue"
                    value={form.durationValue}
                    onChange={handleChange}
                    required
                    className={inputClass}
                    placeholder="Duration value"
                  />
                </Field>

                <Field label="Duration Unit">
                  <select
                    name="durationUnit"
                    value={form.durationUnit}
                    onChange={handleChange}
                    className={inputClass}
                  >
                    <option value="years">Years</option>
                    <option value="months">Months</option>
                  </select>
                </Field>

                <Field label="Minimum Percentage">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    name="minimumPercentage"
                    value={form.minimumPercentage}
                    onChange={handleChange}
                    className={inputClass}
                    placeholder="e.g. 50"
                  />
                </Field>

                <Field label="Required Qualification">
                  <input
                    name="requiredQualification"
                    value={form.requiredQualification}
                    onChange={handleChange}
                    className={inputClass}
                    placeholder="e.g. 12th"
                  />
                </Field>

                <Field label="Required Subjects">
                  <input
                    name="requiredSubjects"
                    value={form.requiredSubjects}
                    onChange={handleChange}
                    className={inputClass}
                    placeholder="Biology, Chemistry"
                  />
                </Field>

                <Field label="Status">
                  <select
                    name="status"
                    value={form.status}
                    onChange={handleChange}
                    className={inputClass}
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </Field>

                <Field label="Description" className="md:col-span-2">
                  <textarea
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    rows="3"
                    className={inputClass}
                    placeholder="Course description"
                  />
                </Field>
              </div>

              {/* FORM BUTTONS */}
              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={closeForm}
                  className="rounded-lg border border-[#CFE5E2] px-5 py-2"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="rounded-lg bg-teal-700 px-5 py-2 font-medium text-white hover:bg-teal-800"
                >
                  {editingId ? "Update Course" : "Save Course"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW COURSE */}
      {showView && selectedCourse && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setShowView(false);
          }}
        >
          <div className="max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6">

            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-xl font-bold text-[#0B2B2A]">
                Course Details
              </h2>

              <button
                type="button"
                onClick={() => setShowView(false)}
                aria-label="Close"
                className="text-2xl text-[#3F5A58]"
              >
                &times;
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <p>
                <b>Name:</b> {selectedCourse.name || "-"}
              </p>

              <p>
                <b>Code:</b> {selectedCourse.code || "-"}
              </p>

              <p>
                <b>Stream:</b> {getStreamName(selectedCourse)}
              </p>

              <p>
                <b>Degree:</b> {getDegreeName(selectedCourse)}
              </p>

              <p>
                <b>Duration:</b>{" "}
                {selectedCourse.duration?.value
                  ? `${selectedCourse.duration.value} ${selectedCourse.duration.unit || ""}`
                  : "-"}
              </p>

              <p className="capitalize">
                <b>Status:</b> {selectedCourse.status || "-"}
              </p>

              <p>
                <b>Minimum Percentage:</b>{" "}
                {selectedCourse.eligibility?.minimumPercentage ?? "-"}
              </p>

              <p>
                <b>Qualification:</b>{" "}
                {selectedCourse.eligibility?.requiredQualification || "-"}
              </p>

              <p className="sm:col-span-2">
                <b>Required Subjects:</b>{" "}
                {selectedCourse.eligibility?.requiredSubjects?.length
                  ? selectedCourse.eligibility.requiredSubjects.join(", ")
                  : "-"}
              </p>

              <p className="sm:col-span-2">
                <b>Description:</b> {selectedCourse.description || "-"}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowView(false)}
              className="mt-6 rounded-lg bg-teal-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-teal-800"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Course;