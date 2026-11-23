import { useEffect, useState } from "react";
import {
  FiEye,
  FiEdit2,
  FiTrash2,
  FiUpload,
  FiX,
} from "react-icons/fi";
import { API } from "../api/axios.js";

const API_URL = "/stream/streams";

const initialForm = {
  name: "",
  slug: "",
  code: "",
  description: "",
  icon: "",
  image: "",
  parentStream: "",
  displayOrder: 0,
  status: "active",
};

// Shared classes (same as College page)
const inputClass =
  "w-full rounded-lg border border-[#9DBDBA] bg-white px-3 py-2.5 text-sm text-[#0B2B2A] outline-none placeholder:text-[#4B6463] focus:border-teal-700 focus:ring-2 focus:ring-teal-200";

const labelClass = "mb-1.5 block text-sm font-medium text-[#0B2B2A]";

const actionButton =
  "inline-flex h-9 w-9 items-center justify-center rounded-lg border transition";

function Field({ label, children }) {
  return (
    <div>
      <label className={labelClass}>{label}</label>
      {children}
    </div>
  );
}

function Stream() {
  const [streams, setStreams] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [showView, setShowView] = useState(false);
  const [selectedStream, setSelectedStream] = useState(null);

  const [editId, setEditId] = useState(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [bulkLoading, setBulkLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    ...initialForm,
  });

  // GET ALL STREAMS
  const getStreams = async () => {
    try {
      setLoading(true);
      setError("");

      const { data } = await API.get(API_URL);

      if (Array.isArray(data)) {
        setStreams(data);
      } else if (Array.isArray(data.streams)) {
        setStreams(data.streams);
      } else if (Array.isArray(data.data)) {
        setStreams(data.data);
      } else {
        setStreams([]);
      }
    } catch (error) {
      console.error("Get streams error:", error.response?.data || error);

      setError(
        error.response?.data?.message ||
        "Streams load nahi hui."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getStreams();
  }, []);

  // HANDLE INPUT CHANGE
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "displayOrder"
          ? Number(value)
          : value,
    }));
  };

  // OPEN ADD FORM
  const openAdd = () => {
    setEditId(null);
    setFormData({ ...initialForm });
    setError("");
    setShowForm(true);
  };

  // OPEN EDIT FORM
  const handleEdit = (item) => {
    setEditId(item._id);

    setFormData({
      name: item.name || "",
      slug: item.slug || "",
      code: item.code || "",
      description: item.description || "",
      icon: item.icon || "",
      image: item.image || "",
      parentStream: item.parentStream?._id || item.parentStream || "",
      displayOrder: item.displayOrder ?? 0,
      status: item.status || "active",
    });

    setError("");
    setShowForm(true);
  };

  // OPEN VIEW
  const handleView = (item) => {
    setSelectedStream(item);
    setShowView(true);
  };

  // CLOSE FORM
  const closeForm = () => {
    setShowForm(false);
    setEditId(null);
    setFormData({ ...initialForm });
    setError("");
  };

  // CREATE / UPDATE STREAM
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      setError("");

      const payload = {
        name: formData.name.trim(),
        slug: formData.slug.trim(),
        code: formData.code.trim() || undefined,
        description: formData.description.trim(),
        icon: formData.icon.trim() || null,
        image: formData.image.trim() || null,
        parentStream: formData.parentStream || null,
        displayOrder: Number(formData.displayOrder),
        status: formData.status,
      };

      if (editId) {
        await API.put(`${API_URL}/${editId}`, payload);
      } else {
        await API.post(API_URL, payload);
      }

      closeForm();
      await getStreams();
    } catch (error) {
      console.error(
        "Stream save error:",
        error.response?.data || error
      );

      setError(
        error.response?.data?.message ||
        "Stream save nahi hui."
      );
    } finally {
      setSaving(false);
    }
  };

  // BULK ADD STREAMS
  const handleBulkUpload = async (e) => {
    const file = e.target.files[0];

    if (!file) return;

    const uploadData = new FormData();

    uploadData.append("file", file);

    try {
      setBulkLoading(true);
      setError("");

      const response = await API.post(
        "/stream/bulk-import",
        uploadData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      alert(
        response.data.message ||
        "Streams imported successfully"
      );

      await getStreams();
    } catch (error) {
      console.error(
        "Bulk upload error:",
        error.response?.data || error
      );

      setError(
        error.response?.data?.message ||
        "Bulk upload failed."
      );
    } finally {
      setBulkLoading(false);

      // Same file dobara select karne ke liye
      e.target.value = "";
    }
  };

  // DELETE STREAM
  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this stream?"
    );

    if (!confirmDelete) return;

    try {
      setError("");

      await API.delete(`${API_URL}/${id}`);

      await getStreams();
    } catch (error) {
      console.error(
        "Stream delete error:",
        error.response?.data || error
      );

      setError(
        error.response?.data?.message ||
        "Stream delete nahi hui."
      );
    }
  };

  // STATUS TOGGLE
  const handleStatusToggle = async (item) => {
    const newStatus =
      item.status === "active"
        ? "inactive"
        : "active";

    try {
      await API.put(`${API_URL}/${item._id}`, {
        ...item,
        status: newStatus,
      });

      await getStreams();
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

  // SEARCH STREAMS
  const filtered = streams.filter((item) =>
    `${item.name || ""} ${item.slug || ""} ${item.code || ""}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <div className="min-w-0 space-y-6">

      {/* PAGE HEADER */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#0B2B2A]">
            Streams
          </h1>

          <p className="mt-1 text-sm text-[#3F5A58]">
            Manage stream information
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">

          {/* BULK ADD */}
          <label
            className={`inline-flex cursor-pointer items-center gap-2 rounded-xl border border-[#CFE5E2] bg-white px-5 py-2.5 text-sm font-semibold text-[#0B2B2A] hover:bg-teal-50 ${bulkLoading ? "pointer-events-none opacity-60" : ""
              }`}
          >
            <FiUpload size={16} />

            {bulkLoading ? "Importing..." : "Add Bulk Data"}

            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={handleBulkUpload}
              className="hidden"
              disabled={bulkLoading}
            />
          </label>

          {/* ADD STREAM */}
          <button
            type="button"
            onClick={openAdd}
            className="rounded-xl bg-teal-700 px-5 py-2.5 text-sm font-bold text-white hover:bg-teal-800"
          >
            + Add Stream
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
        placeholder="Search stream..."
        className="w-full max-w-sm rounded-xl border border-[#9DBDBA] bg-white/80 px-4 py-2.5 text-sm text-[#0B2B2A] outline-none placeholder:text-[#4B6463] focus:border-teal-700 focus:ring-2 focus:ring-teal-200"
      />

      {/* STREAMS TABLE */}
      <div className="overflow-x-auto rounded-2xl border border-white bg-white/65 text-[#0B2B2A] shadow-[0_4px_24px_rgba(15,118,110,0.08)] backdrop-blur-xl">
        <table className="w-full min-w-[750px] text-left text-sm">
          <thead className="bg-[#F1F8F7] text-[11px] font-bold uppercase tracking-wider text-[#3F5A58]">
            <tr>
              <th className="px-4 py-4">Name</th>
              <th className="px-4 py-4">Slug</th>
              <th className="px-4 py-4">Code</th>
              <th className="px-4 py-4">Status</th>
              <th className="px-4 py-4">Actions</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan="5"
                  className="px-4 py-10 text-center text-[#3F5A58]"
                >
                  Loading streams...
                </td>
              </tr>
            ) : filtered.length > 0 ? (
              filtered.map((item) => (
                <tr
                  key={item._id}
                  className="border-t border-[#CFE5E2] hover:bg-teal-50/70"
                >
                  <td className="px-4 py-4 font-medium text-[#0B2B2A]">
                    {item.name}
                  </td>

                  <td className="px-4 py-4">
                    {item.slug || "-"}
                  </td>

                  <td className="px-4 py-4">
                    {item.code || "-"}
                  </td>

                  {/* STATUS TOGGLE */}
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleStatusToggle(item)}
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

                        <span className="sr-only">
                          Toggle status
                        </span>
                      </button>

                      <span className="text-xs capitalize text-[#3F5A58]">
                        {item.status || "inactive"}
                      </span>
                    </div>
                  </td>

                  {/* ACTION ICONS */}
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleView(item)}
                        title="View Stream"
                        aria-label="View Stream"
                        className={`${actionButton} border-teal-200 bg-teal-50 text-teal-700 hover:bg-teal-700 hover:text-white`}
                      >
                        <FiEye size={17} />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleEdit(item)}
                        title="Edit Stream"
                        aria-label="Edit Stream"
                        className={`${actionButton} border-[#CFE5E2] bg-white text-[#3F5A58] hover:bg-[#0B2B2A] hover:text-white`}
                      >
                        <FiEdit2 size={17} />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDelete(item._id)}
                        title="Delete Stream"
                        aria-label="Delete Stream"
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
                  colSpan="5"
                  className="px-4 py-10 text-center text-[#3F5A58]"
                >
                  No streams found.
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
                {editId ? "Edit Stream" : "Add Stream"}
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

                <Field label="Stream Name *">
                  <input
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="e.g. Medical"
                    className={inputClass}
                  />
                </Field>

                <Field label="Slug *">
                  <input
                    name="slug"
                    value={formData.slug}
                    onChange={handleChange}
                    required
                    placeholder="e.g. medical"
                    className={inputClass}
                  />
                </Field>

                <Field label="Code">
                  <input
                    name="code"
                    value={formData.code}
                    onChange={handleChange}
                    placeholder="e.g. MED"
                    className={inputClass}
                  />
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

                <Field label="Parent Stream">
                  <select
                    name="parentStream"
                    value={formData.parentStream}
                    onChange={handleChange}
                    className={inputClass}
                  >
                    <option value="">No Parent Stream</option>

                    {streams
                      .filter((item) => item._id !== editId)
                      .map((item) => (
                        <option key={item._id} value={item._id}>
                          {item.name}
                        </option>
                      ))}
                  </select>
                </Field>

                <div className="md:col-span-2">
                  <Field label="Description">
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      rows="3"
                      placeholder="Enter description"
                      className={inputClass}
                    />
                  </Field>
                </div>

                <Field label="Icon">
                  <input
                    name="icon"
                    value={formData.icon}
                    onChange={handleChange}
                    placeholder="Enter icon name or URL"
                    className={inputClass}
                  />
                </Field>

                <Field label="Image">
                  <input
                    name="image"
                    value={formData.image}
                    onChange={handleChange}
                    placeholder="Enter image URL"
                    className={inputClass}
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
                      ? "Update Stream"
                      : "Save Stream"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW STREAM */}
      {showView && selectedStream && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setShowView(false);
          }}
        >
          <div className="max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6">

            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-xl font-bold text-[#0B2B2A]">
                Stream Details
              </h2>

              <button
                type="button"
                onClick={() => setShowView(false)}
                aria-label="Close"
                className="text-[#3F5A58]"
              >
                <FiX size={24} />
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <p>
                <b>Name:</b> {selectedStream.name || "-"}
              </p>

              <p>
                <b>Slug:</b> {selectedStream.slug || "-"}
              </p>

              <p>
                <b>Code:</b> {selectedStream.code || "-"}
              </p>

              <p className="capitalize">
                <b>Status:</b> {selectedStream.status || "-"}
              </p>

              <p>
                <b>Display Order:</b> {selectedStream.displayOrder ?? "-"}
              </p>

              <p>
                <b>Parent Stream:</b>{" "}
                {selectedStream.parentStream?.name || "-"}
              </p>

              <p className="sm:col-span-2">
                <b>Description:</b> {selectedStream.description || "-"}
              </p>

              <p>
                <b>Icon:</b> {selectedStream.icon || "-"}
              </p>

              <p className="break-all">
                <b>Image:</b> {selectedStream.image || "-"}
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

export default Stream;