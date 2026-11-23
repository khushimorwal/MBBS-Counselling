import { useEffect, useRef, useState } from "react";
import { API } from "../api/axios.js";

import {
  FiEye,
  FiEdit2,
  FiTrash2,
  FiX,
} from "react-icons/fi";

const API_URL = "/specialization";

const initialForm = {
  name: "",
  slug: "",
  code: "",
  description: "",
  course: "",
  duration: {
    value: "",
    unit: "years",
  },
  eligibility: {
    minimumPercentage: "",
    requiredSubjects: "",
    requiredQualification: "",
  },
  careerOptions: "",
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

function Specialization() {
  const [specializations, setSpecializations] = useState([]);
  const [courses, setCourses] = useState([]);

  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);

  const [showView, setShowView] = useState(false);
  const [selectedSpecialization, setSelectedSpecialization] = useState(null);

  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [bulkLoading, setBulkLoading] = useState(false);

  const [error, setError] = useState("");

  const [form, setForm] = useState({
    ...initialForm,
  });

  const fileInputRef = useRef(null);

  // GET ALL SPECIALIZATIONS
  const fetchSpecializations = async () => {
    try {
      setLoading(true);

      const { data } = await API.get(`${API_URL}/all`);

      if (Array.isArray(data)) {
        setSpecializations(data);
      } else if (Array.isArray(data.data)) {
        setSpecializations(data.data);
      } else if (Array.isArray(data.specializations)) {
        setSpecializations(data.specializations);
      } else {
        setSpecializations([]);
      }
    } catch (error) {
      console.error(
        "Specialization fetch error:",
        error.response?.data || error
      );

      setError(
        error.response?.data?.message ||
        "Specializations load nahi hui."
      );
    } finally {
      setLoading(false);
    }
  };

  // GET ALL COURSES
  const fetchCourses = async () => {
    try {
      const { data } = await API.get("/course/all");

      if (Array.isArray(data)) {
        setCourses(data);
      } else if (Array.isArray(data.data)) {
        setCourses(data.data);
      } else if (Array.isArray(data.courses)) {
        setCourses(data.courses);
      } else {
        setCourses([]);
      }
    } catch (error) {
      console.error(
        "Course fetch error:",
        error.response?.data || error
      );
    }
  };

  useEffect(() => {
    fetchSpecializations();
    fetchCourses();
  }, []);

  // NORMAL INPUT CHANGE
  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // DURATION CHANGE
  const handleDurationChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      duration: {
        ...prev.duration,
        [name]: value,
      },
    }));
  };

  // ELIGIBILITY CHANGE
  const handleEligibilityChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      eligibility: {
        ...prev.eligibility,
        [name]: value,
      },
    }));
  };

  // OPEN ADD MODAL
  const openAdd = () => {
    setEditId(null);

    setForm({
      ...initialForm,
      duration: { ...initialForm.duration },
      eligibility: { ...initialForm.eligibility },
    });

    setError("");
    setShowModal(true);
  };

  // EDIT SPECIALIZATION
  const handleEdit = (item) => {
    setEditId(item._id);

    setForm({
      name: item.name || "",
      slug: item.slug || "",
      code: item.code || "",
      description: item.description || "",

      course: item.course?._id || item.course || "",

      duration: {
        value: item.duration?.value ?? "",
        unit: item.duration?.unit || "years",
      },

      eligibility: {
        minimumPercentage: item.eligibility?.minimumPercentage ?? "",

        requiredSubjects: Array.isArray(item.eligibility?.requiredSubjects)
          ? item.eligibility.requiredSubjects.join(", ")
          : "",

        requiredQualification: item.eligibility?.requiredQualification || "",
      },

      careerOptions: Array.isArray(item.careerOptions)
        ? item.careerOptions.join(", ")
        : "",

      status: item.status || "active",
    });

    setError("");
    setShowModal(true);
  };

  // VIEW SPECIALIZATION
  const handleView = (item) => {
    setSelectedSpecialization(item);
    setShowView(true);
  };

  // CLOSE MODAL
  const closeModal = () => {
    setShowModal(false);
    setEditId(null);

    setForm({
      ...initialForm,
      duration: { ...initialForm.duration },
      eligibility: { ...initialForm.eligibility },
    });

    setError("");
  };

  // CREATE / UPDATE
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      setError("");

      const payload = {
        name: form.name.trim(),
        slug: form.slug.trim(),
        code: form.code.trim() || undefined,
        description: form.description.trim(),
        course: form.course,

        duration: {
          value: Number(form.duration.value),
          unit: form.duration.unit,
        },

        eligibility: {
          minimumPercentage:
            form.eligibility.minimumPercentage === ""
              ? undefined
              : Number(form.eligibility.minimumPercentage),

          requiredSubjects: form.eligibility.requiredSubjects
            .split(",")
            .map((subject) => subject.trim())
            .filter(Boolean),

          requiredQualification:
            form.eligibility.requiredQualification.trim(),
        },

        careerOptions: form.careerOptions
          .split(",")
          .map((option) => option.trim())
          .filter(Boolean),

        status: form.status,
      };

      if (editId) {
        await API.put(`${API_URL}/update/${editId}`, payload);
      } else {
        await API.post(`${API_URL}/create`, payload);
      }

      closeModal();

      await fetchSpecializations();
    } catch (error) {
      console.error(
        "Specialization save error:",
        error.response?.data || error
      );

      setError(
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Specialization save nahi hui."
      );
    } finally {
      setSaving(false);
    }
  };

  // DELETE
  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this specialization?"
    );

    if (!confirmDelete) return;

    try {
      setError("");

      await API.delete(`${API_URL}/delete/${id}`);

      await fetchSpecializations();
    } catch (error) {
      console.error(
        "Specialization delete error:",
        error.response?.data || error
      );

      setError(
        error.response?.data?.message ||
        "Specialization delete nahi hui."
      );
    }
  };

  // STATUS TOGGLE
  const handleToggleStatus = async (item) => {
    try {
      setError("");

      const newStatus = item.status === "active" ? "inactive" : "active";

      await API.put(`${API_URL}/update/${item._id}`, {
        status: newStatus,
      });

      await fetchSpecializations();
    } catch (error) {
      console.error(
        "Status update error:",
        error.response?.data || error
      );

      setError(
        error.response?.data?.message ||
        "Status update nahi hua."
      );
    }
  };

  // BULK BUTTON CLICK
  const handleBulkButtonClick = () => {
    fileInputRef.current.click();
  };

  // BULK FILE UPLOAD
  const handleBulkUpload = async (e) => {
    const file = e.target.files[0];

    if (!file) return;

    try {
      setBulkLoading(true);
      setError("");

      const formData = new FormData();

      formData.append("file", file);

      const response = await API.post(`${API_URL}/bulk-import`, formData);

      alert(
        response.data?.message ||
        "Specializations imported successfully"
      );

      await fetchSpecializations();
    } catch (error) {
      console.error(
        "Bulk upload error:",
        error.response?.data || error
      );

      setError(
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Bulk upload nahi hua."
      );
    } finally {
      setBulkLoading(false);

      e.target.value = "";
    }
  };

  // SEARCH
  const filtered = specializations.filter((item) => {
    const text = `${item.name || ""}
      ${item.slug || ""}
      ${item.code || ""}
      ${item.course?.name || ""}`.toLowerCase();

    return text.includes(search.toLowerCase());
  });

  const getCourseName = (item) =>
    item.course?.name ||
    courses.find(
      (course) => course._id === (item.course?._id || item.course)
    )?.name ||
    "-";

  return (
    <div className="min-w-0 space-y-6">

      {/* PAGE HEADER */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#0B2B2A]">
            Specializations
          </h1>

          <p className="mt-1 text-sm text-[#3F5A58]">
            Manage specialization information
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
            onClick={handleBulkButtonClick}
            disabled={bulkLoading}
            className="rounded-xl border border-[#CFE5E2] bg-white px-5 py-2.5 text-sm font-semibold text-[#0B2B2A] hover:bg-teal-50 disabled:opacity-60"
          >
            {bulkLoading ? "Importing..." : "Add Bulk Data"}
          </button>

          <button
            type="button"
            onClick={openAdd}
            className="rounded-xl bg-teal-700 px-5 py-2.5 text-sm font-bold text-white hover:bg-teal-800"
          >
            + Add Specialization
          </button>
        </div>
      </div>

      {/* ERROR */}
      {error && !showModal && (
        <div className="flex items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <span>{error}</span>

          <button
            type="button"
            onClick={() => setError("")}
            aria-label="Close error"
            className="font-bold"
          >
            <FiX size={18} />
          </button>
        </div>
      )}

      {/* SEARCH */}
      <input
        type="text"
        placeholder="Search specialization..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full max-w-sm rounded-xl border border-[#9DBDBA] bg-white/80 px-4 py-2.5 text-sm text-[#0B2B2A] outline-none placeholder:text-[#4B6463] focus:border-teal-700 focus:ring-2 focus:ring-teal-200"
      />

      {/* SPECIALIZATIONS TABLE */}
      <div className="overflow-x-auto rounded-2xl border border-white bg-white/65 text-[#0B2B2A] shadow-[0_4px_24px_rgba(15,118,110,0.08)] backdrop-blur-xl">
        <table className="w-full min-w-[850px] text-left text-sm">
          <thead className="bg-[#F1F8F7] text-[11px] font-bold uppercase tracking-wider text-[#3F5A58]">
            <tr>
              <th className="px-4 py-4">S.No.</th>
              <th className="px-4 py-4">Name</th>
              <th className="px-4 py-4">Code</th>
              <th className="px-4 py-4">Course</th>
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
                  Loading specializations...
                </td>
              </tr>
            ) : filtered.length > 0 ? (
              filtered.map((item, index) => (
                <tr
                  key={item._id}
                  className="border-t border-[#CFE5E2] hover:bg-teal-50/70"
                >
                  <td className="px-4 py-4 text-[#3F5A58]">
                    {index + 1}
                  </td>

                  <td className="px-4 py-4 font-medium text-[#0B2B2A]">
                    {item.name}
                  </td>

                  <td className="px-4 py-4">{item.code || "-"}</td>

                  <td className="px-4 py-4">{getCourseName(item)}</td>

                  <td className="px-4 py-4">
                    {item.duration?.value != null
                      ? `${item.duration.value} ${item.duration.unit || ""}`
                      : "-"}
                  </td>

                  {/* STATUS TOGGLE */}
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleToggleStatus(item)}
                        aria-label={`Toggle ${item.name} status`}
                        className={`relative h-7 w-12 rounded-full transition ${item.status === "active"
                          ? "bg-teal-700"
                          : "bg-slate-400"
                          }`}
                      >
                        <span
                          className={`absolute top-1 h-5 w-5 rounded-full bg-white transition ${item.status === "active"
                            ? "left-6"
                            : "left-1"
                            }`}
                        />
                      </button>

                      <span className="text-xs capitalize text-[#3F5A58]">
                        {item.status || "inactive"}
                      </span>
                    </div>
                  </td>

                  {/* ACTIONS */}
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleView(item)}
                        title="View Specialization"
                        aria-label="View Specialization"
                        className={`${actionButton} border-teal-200 bg-teal-50 text-teal-700 hover:bg-teal-700 hover:text-white`}
                      >
                        <FiEye size={17} />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleEdit(item)}
                        title="Edit Specialization"
                        aria-label="Edit Specialization"
                        className={`${actionButton} border-[#CFE5E2] bg-white text-[#3F5A58] hover:bg-[#0B2B2A] hover:text-white`}
                      >
                        <FiEdit2 size={17} />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDelete(item._id)}
                        title="Delete Specialization"
                        aria-label="Delete Specialization"
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
                  No specializations found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ADD / EDIT FORM */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) closeModal();
          }}
        >
          <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">

            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-teal-700">
                {editId ? "Edit Specialization" : "Add Specialization"}
              </h2>

              <button
                type="button"
                onClick={closeModal}
                aria-label="Close"
                className="text-2xl text-[#3F5A58] hover:text-red-600"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              {error && (
                <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

                <Field label="Specialization Name *">
                  <input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    required
                    className={inputClass}
                    placeholder="e.g. Cardiology"
                  />
                </Field>

                <Field label="Slug *">
                  <input
                    name="slug"
                    value={form.slug}
                    onChange={handleChange}
                    required
                    className={inputClass}
                    placeholder="e.g. cardiology"
                  />
                </Field>

                <Field label="Code">
                  <input
                    name="code"
                    value={form.code}
                    onChange={handleChange}
                    className={inputClass}
                    placeholder="e.g. CARD"
                  />
                </Field>

                <Field label="Course *">
                  <select
                    name="course"
                    value={form.course}
                    onChange={handleChange}
                    required
                    className={inputClass}
                  >
                    <option value="">Select Course</option>

                    {courses.map((course) => (
                      <option key={course._id} value={course._id}>
                        {course.name}
                      </option>
                    ))}
                  </select>
                </Field>

                <Field label="Duration Value *">
                  <input
                    type="number"
                    min="0"
                    name="value"
                    value={form.duration.value}
                    onChange={handleDurationChange}
                    required
                    className={inputClass}
                    placeholder="Duration value"
                  />
                </Field>

                <Field label="Duration Unit">
                  <select
                    name="unit"
                    value={form.duration.unit}
                    onChange={handleDurationChange}
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
                    value={form.eligibility.minimumPercentage}
                    onChange={handleEligibilityChange}
                    className={inputClass}
                    placeholder="e.g. 50"
                  />
                </Field>

                <Field label="Required Qualification">
                  <input
                    name="requiredQualification"
                    value={form.eligibility.requiredQualification}
                    onChange={handleEligibilityChange}
                    className={inputClass}
                    placeholder="e.g. MBBS"
                  />
                </Field>

                <Field label="Required Subjects">
                  <input
                    name="requiredSubjects"
                    value={form.eligibility.requiredSubjects}
                    onChange={handleEligibilityChange}
                    className={inputClass}
                    placeholder="Biology, Chemistry"
                  />
                </Field>

                <Field label="Career Options">
                  <input
                    name="careerOptions"
                    value={form.careerOptions}
                    onChange={handleChange}
                    className={inputClass}
                    placeholder="Consultant, Specialist"
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
                    placeholder="Enter description"
                  />
                </Field>
              </div>

              {/* FORM BUTTONS */}
              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-lg border border-[#CFE5E2] px-5 py-2"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-lg bg-teal-700 px-5 py-2 font-medium text-white hover:bg-teal-800 disabled:opacity-60"
                >
                  {saving
                    ? "Saving..."
                    : editId
                      ? "Update Specialization"
                      : "Save Specialization"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW SPECIALIZATION */}
      {showView && selectedSpecialization && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setShowView(false);
          }}
        >
          <div className="max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6">

            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-xl font-bold text-[#0B2B2A]">
                Specialization Details
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
                <b>Name:</b> {selectedSpecialization.name || "-"}
              </p>

              <p>
                <b>Code:</b> {selectedSpecialization.code || "-"}
              </p>

              <p>
                <b>Course:</b> {getCourseName(selectedSpecialization)}
              </p>

              <p>
                <b>Duration:</b>{" "}
                {selectedSpecialization.duration?.value != null
                  ? `${selectedSpecialization.duration.value} ${selectedSpecialization.duration.unit || ""}`
                  : "-"}
              </p>

              <p>
                <b>Minimum Percentage:</b>{" "}
                {selectedSpecialization.eligibility?.minimumPercentage ?? "-"}
              </p>

              <p>
                <b>Qualification:</b>{" "}
                {selectedSpecialization.eligibility?.requiredQualification ||
                  "-"}
              </p>

              <p className="sm:col-span-2">
                <b>Required Subjects:</b>{" "}
                {Array.isArray(
                  selectedSpecialization.eligibility?.requiredSubjects
                ) && selectedSpecialization.eligibility.requiredSubjects.length
                  ? selectedSpecialization.eligibility.requiredSubjects.join(", ")
                  : "-"}
              </p>

              <p className="sm:col-span-2">
                <b>Career Options:</b>{" "}
                {Array.isArray(selectedSpecialization.careerOptions)
                  ? selectedSpecialization.careerOptions.join(", ") || "-"
                  : selectedSpecialization.careerOptions || "-"}
              </p>

              <p className="capitalize">
                <b>Status:</b> {selectedSpecialization.status || "-"}
              </p>

              <p className="sm:col-span-2">
                <b>Description:</b>{" "}
                {selectedSpecialization.description || "-"}
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

export default Specialization;