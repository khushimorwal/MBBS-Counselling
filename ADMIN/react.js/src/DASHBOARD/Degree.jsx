
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

function IconButton({ title, onClick, children, className = "" }) {
  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      onClick={onClick}
      className={`inline-flex h-9 w-9 items-center justify-center rounded-lg border border-line transition hover:bg-surface ${className}`}
    >
      {children}
    </button>
  );
}

function EyeIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="h-4 w-4"
    >
      <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EditIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="h-4 w-4"
    >
      <path d="m14 5 5 5M4 20l4.2-.9L20 7.3 16.7 4 4.9 15.8 4 20Z" />
    </svg>
  );
}

function DeleteIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="h-4 w-4"
    >
      <path d="M4 7h16M10 11v6m4-6v6M5.5 7l1 14h11l1-14M9 7V4h6v3" />
    </svg>
  );
}

function UploadIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="mr-2 h-4 w-4"
    >
      <path d="M12 16V4m-4 4 4-4 4 4M4 15v5h16v-5" />
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

  return (
    <div className="mx-auto w-full max-w-[1200px] space-y-5 px-3 py-4 sm:px-5">
      {/* HEADER */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-brand-dark">
            Degrees
          </h1>
          <p className="mt-1 text-sm text-muted">
            Manage your degrees here.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
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
            className="inline-flex items-center rounded-xl border border-line bg-white px-4 py-2.5 text-sm font-semibold text-brand-dark hover:bg-surface disabled:opacity-60"
          >
            <UploadIcon />
            {uploading ? "Importing..." : "Bulk Import"}
          </button>

          <button
            type="button"
            onClick={openAdd}
            className="rounded-xl bg-brand px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-dark"
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
      <div className="rounded-xl border border-line bg-white p-3">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search degrees..."
          className="w-full max-w-md rounded-lg border border-line bg-surface px-3 py-2.5 text-sm outline-none focus:border-brand"
        />
      </div>

      {/* TABLE */}
      <div className="overflow-x-auto rounded-xl border border-line bg-white">
        <table className="w-full min-w-[1000px] text-left text-sm">
          <thead className="bg-surface text-xs uppercase tracking-wide text-muted">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Short Name</th>
              <th className="px-4 py-3">Level</th>
              <th className="px-4 py-3">Duration</th>
              <th className="px-4 py-3">Streams</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan="7" className="px-4 py-8 text-center text-muted">
                  Loading degrees...
                </td>
              </tr>
            ) : filtered.length > 0 ? (
              filtered.map((degree) => {
                const isActive = (degree.status || "active") === "active";

                return (
                  <tr
                    key={degree._id}
                    className="border-t border-line hover:bg-surface/70"
                  >
                    <td className="px-4 py-3 font-medium text-brand-dark">
                      {degree.name}
                    </td>

                    <td className="px-4 py-3">
                      {degree.shortName || "-"}
                    </td>

                    <td className="px-4 py-3 capitalize">
                      {degree.level || "-"}
                    </td>

                    <td className="px-4 py-3">
                      {degree.defaultDuration?.value != null
                        ? `${degree.defaultDuration.value} ${degree.defaultDuration.unit || ""}`
                        : "-"}
                    </td>

                    <td className="px-4 py-3">
                      {degree.streams?.length
                        ? degree.streams
                            .map((stream) => {
                              if (typeof stream === "object") {
                                return stream.name || "Stream";
                              }

                              return (
                                streams.find((item) => item._id === stream)
                                  ?.name || "Stream"
                              );
                            })
                            .join(", ")
                        : "-"}
                    </td>

                    {/* STATUS TOGGLE */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          role="switch"
                          aria-checked={isActive}
                          aria-label={`Set ${degree.name} ${isActive ? "inactive" : "active"}`}
                          disabled={togglingId === degree._id}
                          onClick={() => handleToggleStatus(degree)}
                          className={`relative h-6 w-11 shrink-0 rounded-full transition-colors disabled:cursor-wait disabled:opacity-50 ${
                            isActive ? "bg-green-500" : "bg-gray-300"
                          }`}
                        >
                          <span
                            className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                              isActive ? "translate-x-5" : "translate-x-0.5"
                            }`}
                          />
                        </button>

                        <span
                          className={`text-xs font-semibold ${
                            isActive ? "text-green-700" : "text-gray-500"
                          }`}
                        >
                          {togglingId === degree._id
                            ? "Updating..."
                            : isActive
                              ? "Active"
                              : "Inactive"}
                        </span>
                      </div>
                    </td>

                    {/* CRUD ICONS */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <IconButton
                          title="View degree"
                          onClick={() => handleView(degree)}
                          className="text-blue-600 hover:border-blue-200 hover:bg-blue-50"
                        >
                          <EyeIcon />
                        </IconButton>

                        <IconButton
                          title="Edit degree"
                          onClick={() => handleEdit(degree)}
                          className="text-brand hover:border-brand/30 hover:bg-brand-soft"
                        >
                          <EditIcon />
                        </IconButton>

                        <IconButton
                          title="Delete degree"
                          onClick={() => handleDelete(degree._id)}
                          className="text-red-600 hover:border-red-200 hover:bg-red-50"
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
                <td colSpan="7" className="px-4 py-10 text-center text-muted">
                  No degrees found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ADD / EDIT MODAL */}
      {showForm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-brand-dark/45 p-3 sm:p-5"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) closeForm();
          }}
        >
          <div className="max-h-[88vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-line bg-brand px-5 py-4 text-white">
              <div>
                <h2 className="font-display text-lg font-bold">
                  {editId ? "Edit Degree" : "Add Degree"}
                </h2>
                <p className="mt-0.5 text-xs text-white/75">
                  Enter degree details below
                </p>
              </div>

              <button
                type="button"
                onClick={closeForm}
                className="rounded-lg px-2 py-1 text-2xl leading-none hover:bg-white/10"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 p-5">
              {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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

                <Field label="Streams">
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
                  <span className="mt-1 block text-xs text-muted">
                    Multiple select ke liye Ctrl/Cmd dabayein.
                  </span>
                </Field>

                <Field label="Description" className="lg:col-span-2">
                  <textarea
                    name="description"
                    value={formData.description}
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
                  onClick={closeForm}
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
                      ? "Update Degree"
                      : "Save Degree"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW MODAL */}
      {showView && selectedDegree && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-brand-dark/45 p-3 sm:p-5"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setShowView(false);
          }}
        >
          <div className="max-h-[85vh] w-full max-w-xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between bg-brand px-5 py-4 text-white">
              <h2 className="font-display text-lg font-bold">
                Degree Details
              </h2>
              <button
                type="button"
                onClick={() => setShowView(false)}
                className="rounded-lg px-2 py-1 text-2xl leading-none hover:bg-white/10"
              >
                &times;
              </button>
            </div>

            <div className="grid gap-4 p-5 sm:grid-cols-2">
              <DetailRow label="Name" value={selectedDegree.name} />
              <DetailRow label="Short Name" value={selectedDegree.shortName} />
              <DetailRow label="Slug" value={selectedDegree.slug} />
              <DetailRow label="Code" value={selectedDegree.code} />
              <DetailRow label="Level" value={selectedDegree.level} />
              <DetailRow label="Degree Type" value={selectedDegree.degreeType} />
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
              />
              <DetailRow
                label="Display Order"
                value={selectedDegree.displayOrder ?? 0}
              />
              <DetailRow
                label="Streams"
                value={
                  selectedDegree.streams?.length
                    ? selectedDegree.streams
                        .map((stream) =>
                          typeof stream === "object"
                            ? stream.name || "Stream"
                            : streams.find((item) => item._id === stream)?.name || "Stream"
                        )
                        .join(", ")
                    : "-"
                }
              />
              <div className="sm:col-span-2">
                <DetailRow
                  label="Description"
                  value={selectedDegree.description || "-"}
                />
              </div>
            </div>

            <div className="flex justify-end border-t border-line p-4">
              <button
                type="button"
                onClick={() => setShowView(false)}
                className="rounded-xl bg-brand px-5 py-2 text-sm font-semibold text-white hover:bg-brand-dark"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function DetailRow({ label, value }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-muted">
        {label}
      </p>
      <p className="mt-1 break-words text-sm font-medium text-brand-dark">
        {value ?? "-"}
      </p>
    </div>
  );
}

export default Degree;
