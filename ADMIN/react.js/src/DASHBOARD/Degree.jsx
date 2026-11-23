import { useEffect, useRef, useState } from "react";
import { API } from "../api/axios.js";

const API_URL = "/degree/degrees";
const BULK_URL = "/degree/degrees/bulk-import";

const initialForm = {
  name: "",
  shortName: "",
  slug: "",
  code: "",
  level: "undergraduate",
  degreeType: "academic",
  durationValue: "",
  durationUnit: "years",
  description: "",
  streams: [],
  status: "active",
  displayOrder: 0,
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

function IconButton({ title, onClick, children, className = "" }) {
  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      onClick={onClick}
      className={`${actionButton} ${className}`}
    >
      {children}
    </button>
  );
}

const iconProps = {
  width: 17,
  height: 17,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": true,
};

function EyeIcon() {
  return (
    <svg {...iconProps}>
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EditIcon() {
  return (
    <svg {...iconProps}>
      <path d="m16 4 4 4M4 20l4-.8L19 8a2.1 2.1 0 0 0-3-3L5 16l-1 4Z" />
    </svg>
  );
}

function DeleteIcon() {
  return (
    <svg {...iconProps}>
      <path d="M3 6h18M8 6V4h8v2m3 0-1 14H6L5 6m4 4v6m6-6v6" />
    </svg>
  );
}

function Degree() {
  const [degrees, setDegrees] = useState([]);
  const [streams, setStreams] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [showView, setShowView] = useState(false);
  const [selectedDegree, setSelectedDegree] = useState(null);
  const [editId, setEditId] = useState(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [togglingId, setTogglingId] = useState(null);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({ ...initialForm });

  const fileInputRef = useRef(null);

  // GET DEGREES
  const getDegrees = async () => {
    try {
      setLoading(true);
      setError("");

      const { data } = await API.get(API_URL);

      if (Array.isArray(data)) {
        setDegrees(data);
      } else if (Array.isArray(data.degrees)) {
        setDegrees(data.degrees);
      } else if (Array.isArray(data.data)) {
        setDegrees(data.data);
      } else {
        setDegrees([]);
      }
    } catch (err) {
      console.error("Degree fetch error:", err.response?.data || err);
      setError(
        err.response?.data?.message || "Degrees load nahi ho rahi."
      );
    } finally {
      setLoading(false);
    }
  };

  // GET STREAMS
  const getStreams = async () => {
    try {
      const { data } = await API.get("/stream/streams");

      if (Array.isArray(data)) {
        setStreams(data);
      } else if (Array.isArray(data.streams)) {
        setStreams(data.streams);
      } else if (Array.isArray(data.data)) {
        setStreams(data.data);
      } else {
        setStreams([]);
      }
    } catch (err) {
      console.error("Stream fetch error:", err.response?.data || err);
    }
  };

  useEffect(() => {
    getDegrees();
    getStreams();
  }, []);

  // INPUT CHANGE
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: name === "displayOrder" ? Number(value) : value,
    }));
  };

  // MULTIPLE STREAMS
  const handleStreamChange = (e) => {
    const selectedStreams = Array.from(
      e.target.selectedOptions,
      (option) => option.value
    );

    setFormData((prev) => ({
      ...prev,
      streams: selectedStreams,
    }));
  };

  // ADD DEGREE
  const openAdd = () => {
    setEditId(null);
    setFormData({ ...initialForm, streams: [] });
    setError("");
    setShowForm(true);
  };

  // VIEW DEGREE
  const handleView = (degree) => {
    setSelectedDegree(degree);
    setShowView(true);
  };

  // EDIT DEGREE
  const handleEdit = (degree) => {
    setEditId(degree._id);

    setFormData({
      name: degree.name || "",
      shortName: degree.shortName || "",
      slug: degree.slug || "",
      code: degree.code || "",
      level: degree.level || "undergraduate",
      degreeType: degree.degreeType || "academic",
      durationValue: degree.defaultDuration?.value ?? "",
      durationUnit: degree.defaultDuration?.unit || "years",
      description: degree.description || "",
      streams: Array.isArray(degree.streams)
        ? degree.streams.map((stream) =>
          typeof stream === "object" ? stream._id : stream
        )
        : [],
      status: degree.status || "active",
      displayOrder: degree.displayOrder ?? 0,
    });

    setError("");
    setShowForm(true);
  };

  // CLOSE FORM
  const closeForm = () => {
    setShowForm(false);
    setEditId(null);
    setFormData({ ...initialForm, streams: [] });
    setError("");
  };

  // CREATE / UPDATE DEGREE
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      setError("");

      const payload = {
        name: formData.name.trim(),
        shortName: formData.shortName.trim(),
        slug: formData.slug.trim(),
        code: formData.code.trim() || undefined,
        level: formData.level,
        degreeType: formData.degreeType,
        defaultDuration: {
          value:
            formData.durationValue === ""
              ? undefined
              : Number(formData.durationValue),
          unit: formData.durationUnit,
        },
        description: formData.description.trim(),
        streams: formData.streams,
        status: formData.status,
        displayOrder: Number(formData.displayOrder),
      };

      if (editId) {
        await API.put(`${API_URL}/${editId}`, payload);
      } else {
        await API.post(API_URL, payload);
      }

      closeForm();
      await getDegrees();
    } catch (err) {
      console.error("Degree save error:", err.response?.data || err);

      setError(
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Degree save nahi hui."
      );
    } finally {
      setSaving(false);
    }
  };

  // DELETE DEGREE
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this degree?")) {
      return;
    }

    try {
      setError("");
      await API.delete(`${API_URL}/${id}`);
      await getDegrees();
    } catch (err) {
      console.error("Degree delete error:", err.response?.data || err);

      setError(
        err.response?.data?.message || "Degree delete nahi hui."
      );
    }
  };

  // ACTIVE / INACTIVE TOGGLE
  const handleToggleStatus = async (degree) => {
    const currentStatus = degree.status || "active";
    const newStatus =
      currentStatus === "active" ? "inactive" : "active";

    try {
      setTogglingId(degree._id);
      setError("");

      const payload = {
        name: degree.name,
        shortName: degree.shortName || "",
        slug: degree.slug,
        code: degree.code || undefined,
        level: degree.level || "undergraduate",
        degreeType: degree.degreeType || "academic",
        defaultDuration: degree.defaultDuration || {
          unit: "years",
        },
        description: degree.description || "",
        streams: Array.isArray(degree.streams)
          ? degree.streams.map((stream) =>
            typeof stream === "object" ? stream._id : stream
          )
          : [],
        status: newStatus,
        displayOrder: degree.displayOrder ?? 0,
      };

      await API.put(`${API_URL}/${degree._id}`, payload);

      setDegrees((prev) =>
        prev.map((item) =>
          item._id === degree._id
            ? { ...item, status: newStatus }
            : item
        )
      );
    } catch (err) {
      console.error("Status toggle error:", err.response?.data || err);

      setError(
        err.response?.data?.message ||
        "Status update nahi hua. Backend status field check karein."
      );
    } finally {
      setTogglingId(null);
    }
  };

  // BULK IMPORT EXCEL
  const handleBulkImport = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!/\.(xlsx|xls|csv)$/i.test(file.name)) {
      setError("Please select an Excel (.xlsx, .xls) or CSV file.");
      e.target.value = "";
      return;
    }

    const form = new FormData();
    form.append("file", file);

    try {
      setUploading(true);
      setError("");

      await API.post(BULK_URL, form, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      await getDegrees();
    } catch (err) {
      console.error("Bulk import error:", err.response?.data || err);

      setError(
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Bulk import failed. Excel file aur permissions check karein."
      );
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  // SEARCH
  const filtered = degrees.filter((degree) =>
    `${degree.name || ""} ${degree.shortName || ""} ${degree.code || ""}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const getStreamNames = (degree) =>
    degree.streams?.length
      ? degree.streams
        .map((stream) => {
          if (typeof stream === "object") {
            return stream.name || "Stream";
          }

          return (
            streams.find((item) => item._id === stream)?.name || "Stream"
          );
        })
        .join(", ")
      : "-";

  return (
    <div className="min-w-0 space-y-6">

      {/* PAGE HEADER */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#0B2B2A]">
            Degrees
          </h1>

          <p className="mt-1 text-sm text-[#3F5A58]">
            Manage degree information
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls,.csv"
            onChange={handleBulkImport}
            className="hidden"
          />

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="rounded-xl border border-[#CFE5E2] bg-white px-5 py-2.5 text-sm font-semibold text-[#0B2B2A] hover:bg-teal-50 disabled:opacity-60"
          >
            {uploading ? "Importing..." : "Add Bulk Data"}
          </button>

          <button
            type="button"
            onClick={openAdd}
            className="rounded-xl bg-teal-700 px-5 py-2.5 text-sm font-bold text-white hover:bg-teal-800"
          >
            + Add Degree
          </button>
        </div>
      </div>

      {/* ERROR */}
      {error && !showForm && (
        <div className="flex items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <span>{error}</span>
          <button
            type="button"
            onClick={() => setError("")}
            className="font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* SEARCH */}
      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search degree..."
        className="w-full max-w-sm rounded-xl border border-[#9DBDBA] bg-white/80 px-4 py-2.5 text-sm text-[#0B2B2A] outline-none placeholder:text-[#4B6463] focus:border-teal-700 focus:ring-2 focus:ring-teal-200"
      />

      {/* DEGREES TABLE */}
      <div className="overflow-x-auto rounded-2xl border border-white bg-white/65 text-[#0B2B2A] shadow-[0_4px_24px_rgba(15,118,110,0.08)] backdrop-blur-xl">
        <table className="w-full min-w-[1000px] text-left text-sm">
          <thead className="bg-[#F1F8F7] text-[11px] font-bold uppercase tracking-wider text-[#3F5A58]">
            <tr>
              <th className="px-4 py-4">Name</th>
              <th className="px-4 py-4">Short Name</th>
              <th className="px-4 py-4">Level</th>
              <th className="px-4 py-4">Duration</th>
              <th className="px-4 py-4">Streams</th>
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
                  Loading degrees...
                </td>
              </tr>
            ) : filtered.length > 0 ? (
              filtered.map((degree) => {
                const isActive = (degree.status || "active") === "active";

                return (
                  <tr
                    key={degree._id}
                    className="border-t border-[#CFE5E2] hover:bg-teal-50/70"
                  >
                    <td className="px-4 py-4 font-medium text-[#0B2B2A]">
                      {degree.name}
                    </td>

                    <td className="px-4 py-4">
                      {degree.shortName || "-"}
                    </td>

                    <td className="px-4 py-4 capitalize">
                      {degree.level || "-"}
                    </td>

                    <td className="px-4 py-4">
                      {degree.defaultDuration?.value != null
                        ? `${degree.defaultDuration.value} ${degree.defaultDuration.unit || ""}`
                        : "-"}
                    </td>

                    <td className="px-4 py-4">
                      {getStreamNames(degree)}
                    </td>

                    {/* STATUS TOGGLE */}
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          role="switch"
                          aria-checked={isActive}
                          aria-label={`Set ${degree.name} ${isActive ? "inactive" : "active"}`}
                          disabled={togglingId === degree._id}
                          onClick={() => handleToggleStatus(degree)}
                          className={`relative h-7 w-12 rounded-full transition disabled:cursor-wait disabled:opacity-50 ${isActive ? "bg-teal-700" : "bg-slate-400"
                            }`}
                        >
                          <span
                            className={`absolute top-1 h-5 w-5 rounded-full bg-white transition ${isActive ? "left-6" : "left-1"
                              }`}
                          />
                        </button>

                        <span className="text-xs capitalize text-[#3F5A58]">
                          {togglingId === degree._id
                            ? "Updating..."
                            : isActive
                              ? "Active"
                              : "Inactive"}
                        </span>
                      </div>
                    </td>

                    {/* ACTIONS */}
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <IconButton
                          title="View Degree"
                          onClick={() => handleView(degree)}
                          className="border-teal-200 bg-teal-50 text-teal-700 hover:bg-teal-700 hover:text-white"
                        >
                          <EyeIcon />
                        </IconButton>

                        <IconButton
                          title="Edit Degree"
                          onClick={() => handleEdit(degree)}
                          className="border-[#CFE5E2] bg-white text-[#3F5A58] hover:bg-[#0B2B2A] hover:text-white"
                        >
                          <EditIcon />
                        </IconButton>

                        <IconButton
                          title="Delete Degree"
                          onClick={() => handleDelete(degree._id)}
                          className="border-red-200 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td
                  colSpan="7"
                  className="px-4 py-10 text-center text-[#3F5A58]"
                >
                  No degrees found.
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
                {editId ? "Edit Degree" : "Add Degree"}
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
              {error && (
                <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Field label="Degree Name *">
                  <input
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="Bachelor of Medicine"
                    className={inputClass}
                  />
                </Field>

                <Field label="Short Name *">
                  <input
                    name="shortName"
                    value={formData.shortName}
                    onChange={handleChange}
                    required
                    placeholder="MBBS"
                    className={inputClass}
                  />
                </Field>

                <Field label="Slug *">
                  <input
                    name="slug"
                    value={formData.slug}
                    onChange={handleChange}
                    required
                    placeholder="mbbs"
                    className={inputClass}
                  />
                </Field>

                <Field label="Code">
                  <input
                    name="code"
                    value={formData.code}
                    onChange={handleChange}
                    placeholder="MBBS"
                    className={inputClass}
                  />
                </Field>

                <Field label="Level *">
                  <select
                    name="level"
                    value={formData.level}
                    onChange={handleChange}
                    className={inputClass}
                    required
                  >
                    {[
                      "certificate",
                      "diploma",
                      "undergraduate",
                      "postgraduate",
                      "doctoral",
                      "postdoctoral",
                      "other",
                    ].map((level) => (
                      <option key={level} value={level}>
                        {level.charAt(0).toUpperCase() + level.slice(1)}
                      </option>
                    ))}
                  </select>
                </Field>

                <Field label="Degree Type">
                  <select
                    name="degreeType"
                    value={formData.degreeType}
                    onChange={handleChange}
                    className={inputClass}
                  >
                    {[
                      "academic",
                      "professional",
                      "vocational",
                      "research",
                      "other",
                    ].map((type) => (
                      <option key={type} value={type}>
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </option>
                    ))}
                  </select>
                </Field>

                <Field label="Duration Value">
                  <input
                    type="number"
                    min="0"
                    name="durationValue"
                    value={formData.durationValue}
                    onChange={handleChange}
                    placeholder="5.5"
                    className={inputClass}
                  />
                </Field>

                <Field label="Duration Unit">
                  <select
                    name="durationUnit"
                    value={formData.durationUnit}
                    onChange={handleChange}
                    className={inputClass}
                  >
                    <option value="years">Years</option>
                    <option value="months">Months</option>
                  </select>
                </Field>

                <Field label="Status">
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className={inputClass}
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </Field>

                <Field label="Display Order">
                  <input
                    type="number"
                    name="displayOrder"
                    value={formData.displayOrder}
                    onChange={handleChange}
                    className={inputClass}
                  />
                </Field>

                <Field label="Streams" className="md:col-span-2">
                  <select
                    multiple
                    value={formData.streams}
                    onChange={handleStreamChange}
                    className={`${inputClass} min-h-24`}
                  >
                    {streams.map((stream) => (
                      <option key={stream._id} value={stream._id}>
                        {stream.name}
                      </option>
                    ))}
                  </select>

                  <span className="mt-1 block text-xs text-[#3F5A58]">
                    Multiple select ke liye Ctrl/Cmd dabayein.
                  </span>
                </Field>

                <Field label="Description" className="md:col-span-2">
                  <textarea
                    name="description"
                    value={formData.description}
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
                  onClick={closeForm}
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
                      ? "Update Degree"
                      : "Save Degree"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW DEGREE */}
      {showView && selectedDegree && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setShowView(false);
          }}
        >
          <div className="max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6">

            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-xl font-bold text-[#0B2B2A]">
                Degree Details
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
              <DetailRow label="Name" value={selectedDegree.name} />
              <DetailRow label="Short Name" value={selectedDegree.shortName} />
              <DetailRow label="Slug" value={selectedDegree.slug} />
              <DetailRow label="Code" value={selectedDegree.code} />
              <DetailRow label="Level" value={selectedDegree.level} capitalize />
              <DetailRow
                label="Degree Type"
                value={selectedDegree.degreeType}
                capitalize
              />
              <DetailRow
                label="Duration"
                value={
                  selectedDegree.defaultDuration?.value != null
                    ? `${selectedDegree.defaultDuration.value} ${selectedDegree.defaultDuration.unit || ""}`
                    : "-"
                }
              />
              <DetailRow
                label="Status"
                value={selectedDegree.status || "active"}
                capitalize
              />
              <DetailRow
                label="Display Order"
                value={selectedDegree.displayOrder ?? 0}
              />
              <DetailRow
                label="Streams"
                value={getStreamNames(selectedDegree)}
              />
              <DetailRow
                label="Description"
                value={selectedDegree.description || "-"}
                className="sm:col-span-2"
              />
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

function DetailRow({ label, value, capitalize = false, className = "" }) {
  return (
    <p className={`break-words ${capitalize ? "capitalize" : ""} ${className}`}>
      <b>{label}:</b> {value || value === 0 ? value : "-"}
    </p>
  );
}

export default Degree;
