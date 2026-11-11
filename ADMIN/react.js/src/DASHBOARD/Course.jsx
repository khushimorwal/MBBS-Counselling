import { useEffect, useRef, useState } from "react";
import { API } from "../api/axios.js";

import {
  FiEye,
  FiEdit2,
  FiTrash2,
  FiUpload,
  FiPlus,
  FiX,
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

const inputClass =
  "w-full rounded-lg border border-line bg-white px-3 py-2.5 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/10";

function Field({ label, children, className = "" }) {
  return (
    <div className={className}>
      <label className="mb-1.5 block text-sm font-medium text-brand-dark">
        {label}
      </label>

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

  // =========================
  // GET DATA
  // =========================

  const getData = async () => {
    try {
      setLoading(true);

      const [courseRes, streamRes, degreeRes] =
        await Promise.all([
          API.get("/course/all"),
          API.get("/stream/streams"),
          API.get("/degree/degrees"),
        ]);

      const c = courseRes.data;
      const s = streamRes.data;
      const d = degreeRes.data;

      setCourses(
        Array.isArray(c)
          ? c
          : c.courses || c.data || []
      );

      setStreams(
        Array.isArray(s)
          ? s
          : s.streams || s.data || []
      );

      setDegrees(
        Array.isArray(d)
          ? d
          : d.degrees || d.data || []
      );
    } catch (error) {
      console.error("Course data fetch error:", error);

      alert(
        error.response?.data?.message ||
          "Data load nahi hua."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getData();
  }, []);

  // =========================
  // INPUT CHANGE
  // =========================

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  // =========================
  // ADD COURSE
  // =========================

  const openAdd = () => {
    setEditingId(null);
    setForm(initialForm);
    setShowForm(true);
  };

  // =========================
  // EDIT COURSE
  // =========================

  const handleEdit = (course) => {
    setEditingId(course._id);

    setForm({
      name: course.name || "",
      slug: course.slug || "",
      code: course.code || "",
      description: course.description || "",

      stream:
        course.stream?._id ||
        course.stream ||
        "",

      degree:
        course.degree?._id ||
        course.degree ||
        "",

      durationValue:
        course.duration?.value ?? "",

      durationUnit:
        course.duration?.unit ||
        "years",

      minimumPercentage:
        course.eligibility?.minimumPercentage ?? "",

      requiredQualification:
        course.eligibility?.requiredQualification ||
        "",

      requiredSubjects:
        course.eligibility?.requiredSubjects?.join(", ") ||
        "",

      status:
        course.status || "active",
    });

    setShowForm(true);
  };

  // =========================
  // CLOSE FORM
  // =========================

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    setForm(initialForm);
  };

  // =========================
  // SAVE COURSE
  // =========================

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      name: form.name.trim(),

      slug: form.slug.trim(),

      code: form.code
        ? form.code.trim()
        : undefined,

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

        requiredQualification:
          form.requiredQualification,

        requiredSubjects:
          form.requiredSubjects
            .split(",")
            .map((subject) => subject.trim())
            .filter(Boolean),
      },

      status: form.status,
    };

    try {
      if (editingId) {
        await API.put(
          `/course/update/${editingId}`,
          payload
        );
      } else {
        await API.post(
          "/course/create",
          payload
        );
      }

      closeForm();

      await getData();
    } catch (error) {
      console.error(
        "Course save error:",
        error
      );

      alert(
        error.response?.data?.message ||
          "Course save nahi hua."
      );
    }
  };

  // =========================
  // DELETE COURSE
  // =========================

  const handleDelete = async (id) => {
    const confirmDelete =
      window.confirm(
        "Are you sure you want to delete this course?"
      );

    if (!confirmDelete) return;

    try {
      await API.delete(
        `/course/delete/${id}`
      );

      await getData();
    } catch (error) {
      alert(
        error.response?.data?.message ||
          "Course delete nahi hua."
      );
    }
  };

  // =========================
  // VIEW COURSE
  // =========================

  const handleView = (course) => {
    setSelectedCourse(course);
    setShowView(true);
  };

  // =========================
  // STATUS TOGGLE
  // =========================

  const handleStatusToggle = async (course) => {
    const newStatus =
      course.status === "active"
        ? "inactive"
        : "active";

    try {
      await API.put(
        `/course/update/${course._id}`,
        {
          status: newStatus,
        }
      );

      await getData();
    } catch (error) {
      console.error(
        "Status update error:",
        error
      );

      alert(
        error.response?.data?.message ||
          "Status update nahi hua."
      );
    }
  };

  // =========================
  // BULK FILE SELECT
  // =========================

  const handleBulkClick = () => {
    fileInputRef.current.click();
  };

  // =========================
  // BULK UPLOAD
  // =========================

  const handleBulkUpload = async (e) => {
    const file = e.target.files[0];

    if (!file) return;

    const formData = new FormData();

    formData.append("file", file);

    try {
      const response = await API.post(
        "/course/bulk-import",
        formData
      );

      alert(
        response.data?.message ||
          "Courses imported successfully"
      );

      await getData();
    } catch (error) {
  console.log("Bulk upload error:", error.response?.data);

  alert(
    error.response?.data?.message || "Bulk upload failed"
  );
}


    // Same file dobara select karne ke liye
    e.target.value = "";
  };

  // =========================
  // SEARCH
  // =========================

  const filtered = courses.filter((course) => {
    const text =
      `${course.name || ""} 
       ${course.slug || ""} 
       ${course.code || ""}
       ${course.stream?.name || ""}
       ${course.degree?.name || ""}`
        .toLowerCase();

    return text.includes(
      search.toLowerCase()
    );
  });

  return (
    <div className="mx-auto w-full max-w-[1200px] space-y-5 px-3 py-4 sm:px-5">

      {/* ================= HEADER ================= */}

      <div className="flex flex-wrap items-center justify-between gap-3">

        <div>
          <h1 className="font-display text-2xl font-bold text-brand-dark">
            Courses
          </h1>

          <p className="mt-1 text-sm text-muted">
            Manage courses and eligibility details.
          </p>
        </div>

        <div className="flex items-center gap-2">

          {/* Hidden File Input */}

          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls"
            onChange={handleBulkUpload}
            className="hidden"
          />

          {/* BULK ADD */}

          <button
            type="button"
            onClick={handleBulkClick}
            className="flex items-center gap-2 rounded-xl border border-line bg-white px-4 py-2.5 text-sm font-semibold text-brand-dark hover:bg-surface"
          >
            <FiUpload size={17} />
            Bulk Add
          </button>

          {/* ADD COURSE */}

          <button
            onClick={openAdd}
            className="flex items-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-sm font-bold text-white hover:bg-[#cf4a24]"
          >
            <FiPlus size={17} />
            Add Course
          </button>

        </div>
      </div>

      {/* ================= SEARCH ================= */}

      <div className="rounded-xl border border-line bg-white p-3">

        <input
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
          placeholder="Search courses..."
          className="w-full max-w-md rounded-lg border border-line bg-surface px-3 py-2.5 text-sm outline-none focus:border-brand"
        />

      </div>

      {/* ================= TABLE ================= */}

      <div className="overflow-x-auto rounded-xl border border-line bg-white">

        <table className="w-full min-w-[850px] text-left text-sm">

          <thead className="bg-surface text-xs uppercase tracking-wide text-muted">

            <tr>
              <th className="px-4 py-3">
                Name
              </th>

              <th className="px-4 py-3">
                Code
              </th>

              <th className="px-4 py-3">
                Stream
              </th>

              <th className="px-4 py-3">
                Degree
              </th>

              <th className="px-4 py-3">
                Duration
              </th>

              <th className="px-4 py-3">
                Status
              </th>

              <th className="px-4 py-3">
                Actions
              </th>
            </tr>

          </thead>

          <tbody>

            {loading ? (

              <tr>
                <td
                  colSpan="7"
                  className="px-4 py-8 text-center text-muted"
                >
                  Loading courses...
                </td>
              </tr>

            ) : filtered.length ? (

              filtered.map((course) => (

                <tr
                  key={course._id}
                  className="border-t border-line hover:bg-surface/70"
                >

                  {/* NAME */}

                  <td className="px-4 py-3 font-medium text-brand-dark">
                    {course.name}
                  </td>

                  {/* CODE */}

                  <td className="px-4 py-3">
                    {course.code || "-"}
                  </td>

                  {/* STREAM */}

                  <td className="px-4 py-3">

                    {course.stream?.name ||

                      streams.find(
                        (stream) =>
                          stream._id ===
                          (
                            course.stream?._id ||
                            course.stream
                          )
                      )?.name ||

                      "-"
                    }

                  </td>

                  {/* DEGREE */}

                  <td className="px-4 py-3">

                    {course.degree?.name ||

                      degrees.find(
                        (degree) =>
                          degree._id ===
                          (
                            course.degree?._id ||
                            course.degree
                          )
                      )?.name ||

                      "-"
                    }

                  </td>

                  {/* DURATION */}

                  <td className="px-4 py-3">

                    {course.duration?.value != null
                      ? `${course.duration.value} ${course.duration.unit}`
                      : "-"
                    }

                  </td>

                  {/* STATUS TOGGLE */}

                  <td className="px-4 py-3">

                    <button
                      type="button"
                      onClick={() =>
                        handleStatusToggle(course)
                      }
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
                        course.status === "active"
                          ? "bg-brand"
                          : "bg-gray-300"
                      }`}
                    >

                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                          course.status === "active"
                            ? "translate-x-6"
                            : "translate-x-1"
                        }`}
                      />

                    </button>

                  </td>

                  {/* ACTIONS */}

                  <td className="px-4 py-3">

                    <div className="flex items-center gap-2">

                      {/* VIEW */}

                      <button
                        type="button"
                        onClick={() =>
                          handleView(course)
                        }
                        title="View"
                        className="rounded-lg border border-line p-2 text-brand hover:bg-brand-soft"
                      >
                        <FiEye size={17} />
                      </button>

                      {/* EDIT */}

                      <button
                        type="button"
                        onClick={() =>
                          handleEdit(course)
                        }
                        title="Edit"
                        className="rounded-lg border border-line p-2 text-brand hover:bg-brand-soft"
                      >
                        <FiEdit2 size={17} />
                      </button>

                      {/* DELETE */}

                      <button
                        type="button"
                        onClick={() =>
                          handleDelete(course._id)
                        }
                        title="Delete"
                        className="rounded-lg border border-orange-200 p-2 text-accent hover:bg-orange-50"
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
                  className="px-4 py-10 text-center text-muted"
                >
                  No courses found
                </td>

              </tr>

            )}

          </tbody>

        </table>

      </div>


      {/* ================= ADD / EDIT MODAL ================= */}

      {showForm && (

        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-brand-dark/45 p-3 sm:p-5"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) {
              closeForm();
            }
          }}
        >

          <div className="max-h-[88vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white shadow-2xl">

            <div className="flex items-center justify-between border-b border-line bg-brand px-5 py-4 text-white">

              <div>

                <h2 className="font-display text-lg font-bold">

                  {editingId
                    ? "Edit Course"
                    : "Add Course"
                  }

                </h2>

                <p className="mt-0.5 text-xs text-white/75">
                  Course details and eligibility
                </p>

              </div>

              <button
                type="button"
                onClick={closeForm}
                className="rounded-lg p-1 hover:bg-white/10"
              >
                <FiX size={22} />
              </button>

            </div>


            <form
              onSubmit={handleSubmit}
              className="space-y-4 p-5"
            >

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

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

                    <option value="">
                      Select Stream
                    </option>

                    {streams.map((stream) => (

                      <option
                        key={stream._id}
                        value={stream._id}
                      >
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

                    <option value="">
                      Select Degree
                    </option>

                    {degrees.map((degree) => (

                      <option
                        key={degree._id}
                        value={degree._id}
                      >
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
                  />

                </Field>


                <Field label="Duration Unit">

                  <select
                    name="durationUnit"
                    value={form.durationUnit}
                    onChange={handleChange}
                    className={inputClass}
                  >
                    <option value="years">
                      Years
                    </option>

                    <option value="months">
                      Months
                    </option>
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
                    <option value="active">
                      Active
                    </option>

                    <option value="inactive">
                      Inactive
                    </option>
                  </select>

                </Field>


                <Field
                  label="Description"
                  className="lg:col-span-2"
                >

                  <textarea
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    rows="2"
                    className={inputClass}
                    placeholder="Course description"
                  />

                </Field>

              </div>


              <div className="flex justify-end gap-3 border-t border-line pt-4">

                <button
                  type="button"
                  onClick={closeForm}
                  className="rounded-xl border border-line px-4 py-2 text-sm font-semibold text-muted hover:bg-surface"
                >
                  Cancel
                </button>


                <button
                  type="submit"
                  className="rounded-xl bg-brand px-5 py-2 text-sm font-semibold text-white hover:bg-brand-dark"
                >

                  {editingId
                    ? "Update Course"
                    : "Save Course"
                  }

                </button>

              </div>

            </form>

          </div>

        </div>

      )}


      {/* ================= VIEW MODAL ================= */}

      {showView && selectedCourse && (

        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-brand-dark/45 p-4"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) {
              setShowView(false);
            }
          }}
        >

          <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl">

            <div className="flex items-center justify-between bg-brand px-5 py-4 text-white">

              <h2 className="text-lg font-bold">
                Course Details
              </h2>

              <button
                onClick={() =>
                  setShowView(false)
                }
                className="p-1"
              >
                <FiX size={22} />
              </button>

            </div>


            <div className="grid gap-4 p-5 sm:grid-cols-2">

              <div>
                <p className="text-xs text-muted">
                  Course Name
                </p>

                <p className="font-semibold text-brand-dark">
                  {selectedCourse.name}
                </p>
              </div>


              <div>
                <p className="text-xs text-muted">
                  Code
                </p>

                <p className="font-semibold text-brand-dark">
                  {selectedCourse.code || "-"}
                </p>
              </div>


              <div>
                <p className="text-xs text-muted">
                  Stream
                </p>

                <p className="font-semibold text-brand-dark">
                  {selectedCourse.stream?.name || "-"}
                </p>
              </div>


              <div>
                <p className="text-xs text-muted">
                  Degree
                </p>

                <p className="font-semibold text-brand-dark">
                  {selectedCourse.degree?.name || "-"}
                </p>
              </div>


              <div>
                <p className="text-xs text-muted">
                  Duration
                </p>

                <p className="font-semibold text-brand-dark">

                  {selectedCourse.duration?.value
                    ? `${selectedCourse.duration.value} ${selectedCourse.duration.unit}`
                    : "-"
                  }

                </p>
              </div>


              <div>
                <p className="text-xs text-muted">
                  Status
                </p>

                <p className="font-semibold text-brand-dark">
                  {selectedCourse.status}
                </p>
              </div>


              <div className="sm:col-span-2">

                <p className="text-xs text-muted">
                  Description
                </p>

                <p className="font-semibold text-brand-dark">
                  {selectedCourse.description || "-"}
                </p>

              </div>

            </div>

          </div>

        </div>

      )}

    </div>
  );
}

export default Course;