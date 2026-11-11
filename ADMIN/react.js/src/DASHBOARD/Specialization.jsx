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

const inputClass =
"w-full rounded-lg border border-line bg-white px-3 py-2.5 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/10";

function Field({ label, children, className = "" }) {
return ( <div className={className}> <label className="mb-1.5 block text-sm font-medium text-brand-dark">
{label} </label>


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
const [selectedSpecialization, setSelectedSpecialization] =
useState(null);

const [search, setSearch] = useState("");
const [loading, setLoading] = useState(true);
const [saving, setSaving] = useState(false);
const [bulkLoading, setBulkLoading] = useState(false);

const [error, setError] = useState("");

const [form, setForm] = useState({
...initialForm,
});

const fileInputRef = useRef(null);

// =========================
// GET ALL SPECIALIZATIONS
// =========================
const fetchSpecializations = async () => {
try {
setLoading(true);


  const { data } = await API.get(
    `${API_URL}/all`
  );

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

// =========================
// GET ALL COURSES
// =========================
const fetchCourses = async () => {
try {
const { data } = await API.get(
"/course/all"
);


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

// =========================
// NORMAL INPUT CHANGE
// =========================
const handleChange = (e) => {
const { name, value } = e.target;


setForm((prev) => ({
  ...prev,
  [name]: value,
}));


};

// =========================
// DURATION CHANGE
// =========================
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

// =========================
// ELIGIBILITY CHANGE
// =========================
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

// =========================
// OPEN ADD MODAL
// =========================
const openAdd = () => {
setEditId(null);

setForm({
  ...initialForm,

  duration: {
    ...initialForm.duration,
  },

  eligibility: {
    ...initialForm.eligibility,
  },
});

setError("");
setShowModal(true);


};

// =========================
// EDIT SPECIALIZATION
// =========================
const handleEdit = (item) => {
setEditId(item._id);


setForm({
  name: item.name || "",
  slug: item.slug || "",
  code: item.code || "",
  description: item.description || "",

  course:
    item.course?._id ||
    item.course ||
    "",

  duration: {
    value: item.duration?.value ?? "",
    unit: item.duration?.unit || "years",
  },

  eligibility: {
    minimumPercentage:
      item.eligibility?.minimumPercentage ?? "",

    requiredSubjects: Array.isArray(
      item.eligibility?.requiredSubjects
    )
      ? item.eligibility.requiredSubjects.join(", ")
      : "",

    requiredQualification:
      item.eligibility?.requiredQualification || "",
  },

  careerOptions: Array.isArray(item.careerOptions)
    ? item.careerOptions.join(", ")
    : "",

  status: item.status || "active",
});

setError("");
setShowModal(true);


};

// =========================
// VIEW SPECIALIZATION
// =========================
const handleView = (item) => {
setSelectedSpecialization(item);
setShowView(true);
};

// =========================
// CLOSE MODAL
// =========================
const closeModal = () => {
setShowModal(false);
setEditId(null);

setForm({
  ...initialForm,

  duration: {
    ...initialForm.duration,
  },

  eligibility: {
    ...initialForm.eligibility,
  },
});

setError("");


};

// =========================
// CREATE / UPDATE
// =========================
const handleSubmit = async (e) => {
e.preventDefault();


try {
  setSaving(true);
  setError("");

  const payload = {
    name: form.name.trim(),

    slug: form.slug.trim(),

    code:
      form.code.trim() || undefined,

    description:
      form.description.trim(),

    course: form.course,

    duration: {
      value: Number(
        form.duration.value
      ),
      unit: form.duration.unit,
    },

    eligibility: {
      minimumPercentage:
        form.eligibility.minimumPercentage === ""
          ? undefined
          : Number(
              form.eligibility
                .minimumPercentage
            ),

      requiredSubjects:
        form.eligibility.requiredSubjects
          .split(",")
          .map((subject) =>
            subject.trim()
          )
          .filter(Boolean),

      requiredQualification:
        form.eligibility.requiredQualification.trim(),
    },

    careerOptions:
      form.careerOptions
        .split(",")
        .map((option) =>
          option.trim()
        )
        .filter(Boolean),

    status: form.status,
  };

  if (editId) {
    await API.put(
      `${API_URL}/update/${editId}`,
      payload
    );
  } else {
    await API.post(
      `${API_URL}/create`,
      payload
    );
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

// =========================
// DELETE
// =========================
const handleDelete = async (id) => {
const confirmDelete = window.confirm(
"Are you sure you want to delete this specialization?"
);


if (!confirmDelete) return;

try {
  setError("");

  await API.delete(
    `${API_URL}/delete/${id}`
  );

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

// =========================
// STATUS TOGGLE
// =========================
const handleToggleStatus = async (item) => {
try {
setError("");


  const newStatus =
    item.status === "active"
      ? "inactive"
      : "active";

  await API.put(
    `${API_URL}/update/${item._id}`,
    {
      status: newStatus,
    }
  );

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

// =========================
// BULK BUTTON CLICK
// =========================
const handleBulkButtonClick = () => {
fileInputRef.current.click();
};

// =========================
// BULK FILE UPLOAD
// =========================
const handleBulkUpload = async (e) => {
const file = e.target.files[0];


if (!file) return;

try {
  setBulkLoading(true);
  setError("");

  const formData = new FormData();

  formData.append("file", file);

  const response = await API.post(
    `${API_URL}/bulk-import`,
    formData
  );

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

// =========================
// SEARCH
// =========================
const filtered = specializations.filter((item) => {
const text = `       ${item.name || ""}
      ${item.slug || ""}
      ${item.code || ""}
      ${item.course?.name || ""}
    `.toLowerCase();


return text.includes(
  search.toLowerCase()
);


});

return ( <div className="mx-auto w-full max-w-[1200px] space-y-5 px-3 py-4 sm:px-5">


  {/* HEADER */}
  <div className="flex flex-wrap items-center justify-between gap-3">

    <div>
      <h1 className="font-display text-2xl font-bold text-brand-dark">
        Specializations
      </h1>

      <p className="mt-1 text-sm text-muted">
        Manage course specializations.
     </p>
    </div>

    <div className="flex items-center gap-2">

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
        className="flex items-center gap-2 rounded-xl border border-line bg-white px-4 py-2.5 text-sm font-semibold text-brand-dark hover:bg-surface disabled:cursor-not-allowed disabled:opacity-60"
      >
        <FiUpload size={17} />

        {bulkLoading
          ? "Uploading..."
          : "Bulk Add"}
      </button>

      <button
        type="button"
        onClick={openAdd}
        className="flex items-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-sm font-bold text-white hover:bg-[#cf4a24]"
      >
        <FiPlus size={17} />
        Add Specialization
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
        className="font-bold"
      >
        <FiX size={18} />
      </button>

    </div>
  )}

  {/* SEARCH */}
  <div className="rounded-xl border border-line bg-white p-3">

    <input
      type="text"
      placeholder="Search specializations..."
      value={search}
      onChange={(e) =>
        setSearch(e.target.value)
      }
      className="w-full max-w-md rounded-lg border border-line bg-surface px-3 py-2.5 text-sm outline-none focus:border-brand"
    />

  </div>

  {/* TABLE */}
  <div className="overflow-x-auto rounded-xl border border-line bg-white">

    <table className="w-full min-w-[850px] text-left text-sm">

      <thead className="bg-surface text-xs uppercase tracking-wide text-muted">

        <tr>
          <th className="px-4 py-3">
            S.No.
          </th>

          <th className="px-4 py-3">
            Name
          </th>

          <th className="px-4 py-3">
            Code
          </th>

          <th className="px-4 py-3">
            Course
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
              Loading specializations...
            </td>
          </tr>

        ) : filtered.length > 0 ? (

          filtered.map((item, index) => (

            <tr
              key={item._id}
              className="border-t border-line hover:bg-surface/70"
            >

              <td className="px-4 py-3 text-muted">
                {index + 1}
              </td>

              <td className="px-4 py-3 font-medium text-brand-dark">
                {item.name}
              </td>

              <td className="px-4 py-3">
                {item.code || "-"}
              </td>

              <td className="px-4 py-3">
                {item.course?.name ||
                  courses.find(
                    (course) =>
                      course._id ===
                      (
                        item.course?._id ||
                        item.course
                      )
                  )?.name ||
                  "-"}
              </td>

              <td className="px-4 py-3">
                {item.duration?.value != null
                  ? `${item.duration.value} ${item.duration.unit || ""}`
                  : "-"}
              </td>

              {/* STATUS */}
              <td className="px-4 py-3">

                <button
                  type="button"
                  onClick={() =>
                    handleToggleStatus(item)
                  }
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
                    item.status === "active"
                      ? "bg-brand"
                      : "bg-gray-300"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                      item.status === "active"
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
                      handleView(item)
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
                      handleEdit(item)
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
                      handleDelete(item._id)
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
              No specializations found
            </td>
          </tr>

        )}

      </tbody>

    </table>

  </div>

  {/* ADD / EDIT MODAL */}
  {showModal && (

    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-brand-dark/45 p-3 sm:p-5"
      onMouseDown={(e) => {
        if (
          e.target === e.currentTarget
        ) {
          closeModal();
        }
      }}
    >

      <div className="max-h-[88vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white shadow-2xl">

        <div className="flex items-center justify-between border-b border-line bg-brand px-5 py-4 text-white">

          <div>
            <h2 className="font-display text-lg font-bold">
              {editId
                ? "Edit Specialization"
                : "Add Specialization"}
            </h2>

            <p className="mt-0.5 text-xs text-white/75">
              Specialization details and eligibility
            </p>
          </div>

          <button
            type="button"
            onClick={closeModal}
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

            {error && (
              <div className="col-span-full rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

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
                <option value="">
                  Select Course
                </option>

                {courses.map((course) => (
                  <option
                    key={course._id}
                    value={course._id}
                  >
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
                value={
                  form.eligibility.minimumPercentage
                }
                onChange={handleEligibilityChange}
                className={inputClass}
                placeholder="e.g. 50"
              />
            </Field>

            <Field label="Required Qualification">
              <input
                name="requiredQualification"
                value={
                  form.eligibility.requiredQualification
                }
                onChange={handleEligibilityChange}
                className={inputClass}
                placeholder="e.g. MBBS"
              />
            </Field>

            <Field label="Required Subjects">
              <input
                name="requiredSubjects"
                value={
                  form.eligibility.requiredSubjects
                }
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
                placeholder="Enter description"
              />
            </Field>

          </div>

          <div className="flex justify-end gap-3 border-t border-line pt-4">

            <button
              type="button"
              onClick={closeModal}
              className="rounded-xl border border-line px-4 py-2 text-sm font-semibold text-muted hover:bg-surface"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="rounded-xl bg-brand px-5 py-2 text-sm font-semibold text-white hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-60"
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

  {/* VIEW MODAL */}
  {showView && selectedSpecialization && (

    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-brand-dark/45 p-4"
      onMouseDown={(e) => {
        if (
          e.target === e.currentTarget
        ) {
          setShowView(false);
        }
      }}
    >

      <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl">

        <div className="flex items-center justify-between bg-brand px-5 py-4 text-white">

          <h2 className="text-lg font-bold">
            Specialization Details
          </h2>

          <button
            type="button"
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
              Specialization Name
            </p>

            <p className="font-semibold text-brand-dark">
              {selectedSpecialization.name}
            </p>
          </div>

          <div>
            <p className="text-xs text-muted">
              Code
            </p>

            <p className="font-semibold text-brand-dark">
              {selectedSpecialization.code || "-"}
            </p>
          </div>

          <div>
            <p className="text-xs text-muted">
              Course
            </p>

            <p className="font-semibold text-brand-dark">
              {selectedSpecialization.course?.name ||
                courses.find(
                  (course) =>
                    course._id ===
                    (
                      selectedSpecialization.course?._id ||
                      selectedSpecialization.course
                    )
                )?.name ||
                "-"}
            </p>
          </div>

          <div>
            <p className="text-xs text-muted">
              Duration
            </p>

            <p className="font-semibold text-brand-dark">
              {selectedSpecialization.duration?.value != null
                ? `${selectedSpecialization.duration.value} ${selectedSpecialization.duration.unit || ""}`
                : "-"}
            </p>
          </div>

          <div>
            <p className="text-xs text-muted">
              Minimum Percentage
            </p>

            <p className="font-semibold text-brand-dark">
              {selectedSpecialization.eligibility
                ?.minimumPercentage ?? "-"}
            </p>
          </div>

          <div>
            <p className="text-xs text-muted">
              Required Qualification
            </p>

            <p className="font-semibold text-brand-dark">
              {selectedSpecialization.eligibility
                ?.requiredQualification || "-"}
            </p>
          </div>

          <div>
            <p className="text-xs text-muted">
              Required Subjects
            </p>

            <p className="font-semibold text-brand-dark">
              {Array.isArray(
                selectedSpecialization.eligibility
                  ?.requiredSubjects
              )
                ? selectedSpecialization.eligibility.requiredSubjects.join(", ")
                : "-"}
            </p>
          </div>

          <div>
            <p className="text-xs text-muted">
              Career Options
            </p>

            <p className="font-semibold text-brand-dark">
              {Array.isArray(
                selectedSpecialization.careerOptions
              )
                ? selectedSpecialization.careerOptions.join(", ")
                : selectedSpecialization.careerOptions || "-"}
            </p>
          </div>

          <div>
            <p className="text-xs text-muted">
              Status
            </p>

            <p className="font-semibold text-brand-dark">
              {selectedSpecialization.status}
            </p>
          </div>

          <div className="sm:col-span-2">
            <p className="text-xs text-muted">
              Description
            </p>

            <p className="font-semibold text-brand-dark">
              {selectedSpecialization.description || "-"}
            </p>
          </div>

        </div>

      </div>

    </div>

  )}

</div>


);
}

export default Specialization;
