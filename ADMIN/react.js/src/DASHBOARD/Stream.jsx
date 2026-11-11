import { useEffect, useState } from "react";
import {
  FiEye,
  FiEdit2,
  FiTrash2,
  FiPlus,
  FiSearch,
  FiX,
  FiUpload,
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

const inputClass =
  "w-full rounded-lg border border-line bg-white px-3 py-2.5 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/10";

function Field({ label, children }) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-brand-dark">
        {label}
      </label>
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
    <div className="mx-auto w-full max-w-[1200px] space-y-5 px-3 py-4 sm:px-5">

      {/* HEADER */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-brand-dark">
            Streams
          </h1>

          <p className="mt-1 text-sm text-muted">
            Manage your streams here.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">

          {/* BULK ADD */}
          <label
            className={`flex cursor-pointer items-center gap-2 rounded-xl bg-green-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-green-700 ${
              bulkLoading
                ? "pointer-events-none opacity-60"
                : ""
            }`}
          >
            <FiUpload size={17} />

            {bulkLoading ? "Uploading..." : "Bulk Add"}

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
            className="flex items-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[#cf4a24]"
          >
            <FiPlus size={17} />
            Add Stream
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
        <div className="relative max-w-md">
          <FiSearch
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted"
          />

          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search streams..."
            className="w-full rounded-lg border border-line bg-surface py-2.5 pl-10 pr-3 text-sm outline-none focus:border-brand"
          />
        </div>
      </div>

      {/* TABLE */}
      <div className="overflow-x-auto rounded-xl border border-line bg-white">
        <table className="w-full min-w-[750px] text-left text-sm">
          <thead className="bg-surface text-xs uppercase tracking-wide text-muted">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Slug</th>
              <th className="px-4 py-3">Code</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan="5"
                  className="px-4 py-8 text-center text-muted"
                >
                  Loading streams...
                </td>
              </tr>
            ) : filtered.length > 0 ? (
              filtered.map((item) => (
                <tr
                  key={item._id}
                  className="border-t border-line hover:bg-surface/70"
                >
                  <td className="px-4 py-3 font-medium text-brand-dark">
                    {item.name}
                  </td>

                  <td className="px-4 py-3 text-muted">
                    {item.slug}
                  </td>

                  <td className="px-4 py-3 text-muted">
                    {item.code || "-"}
                  </td>

                  {/* STATUS TOGGLE */}
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => handleStatusToggle(item)}
                      className={`relative h-7 w-12 rounded-full transition ${
                        item.status === "active"
                          ? "bg-brand"
                          : "bg-gray-300"
                      }`}
                    >
                      <span
                        className={`absolute top-1 h-5 w-5 rounded-full bg-white transition ${
                          item.status === "active"
                            ? "left-6"
                            : "left-1"
                        }`}
                      />

                      <span className="sr-only">
                        Toggle status
                      </span>
                    </button>

                    <span className="ml-2 text-xs capitalize text-muted">
                      {item.status}
                    </span>
                  </td>

                  {/* ACTION ICONS */}
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">

                      {/* VIEW */}
                      <button
                        type="button"
                        onClick={() => handleView(item)}
                        title="View"
                        className="rounded-lg bg-brand px-2.5 py-2 text-white hover:bg-brand-dark"
                      >
                        <FiEye size={16} />
                      </button>

                      {/* EDIT */}
                      <button
                        type="button"
                        onClick={() => handleEdit(item)}
                        title="Edit"
                        className="rounded-lg bg-blue-600 px-2.5 py-2 text-white hover:bg-blue-700"
                      >
                        <FiEdit2 size={16} />
                      </button>

                      {/* DELETE */}
                      <button
                        type="button"
                        onClick={() => handleDelete(item._id)}
                        title="Delete"
                        className="rounded-lg bg-red-600 px-2.5 py-2 text-white hover:bg-red-700"
                      >
                        <FiTrash2 size={16} />
                      </button>

                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="5"
                  className="px-4 py-10 text-center text-muted"
                >
                  No streams found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ADD / EDIT FORM */}
      {showForm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-brand-dark/45 p-3 sm:p-5"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) closeForm();
          }}
        >
          <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white shadow-2xl">

            <div className="flex items-center justify-between border-b border-line bg-brand px-5 py-4 text-white">
              <div>
                <h2 className="font-display text-lg font-bold">
                  {editId ? "Edit Stream" : "Add Stream"}
                </h2>

                <p className="mt-0.5 text-xs text-white/75">
                  Enter stream details below
                </p>
              </div>

              <button
                type="button"
                onClick={closeForm}
                className="rounded-lg p-2 hover:bg-white/10"
              >
                <FiX size={20} />
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              className="space-y-4 p-5"
            >
              {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              <div className="grid gap-4 sm:grid-cols-2">

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
                    <option value="">
                      No Parent Stream
                    </option>

                    {streams
                      .filter((item) => item._id !== editId)
                      .map((item) => (
                        <option
                          key={item._id}
                          value={item._id}
                        >
                          {item.name}
                        </option>
                      ))}
                  </select>
                </Field>

                <div className="sm:col-span-2">
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
                      ? "Update Stream"
                      : "Save Stream"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW MODAL */}
      {showView && selectedStream && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-brand-dark/45 p-4">
          <div className="w-full max-w-xl rounded-2xl bg-white shadow-2xl">

            <div className="flex items-center justify-between bg-brand px-5 py-4 text-white">
              <h2 className="text-lg font-bold">
                Stream Details
              </h2>

              <button
                type="button"
                onClick={() => setShowView(false)}
              >
                <FiX size={20} />
              </button>
            </div>

            <div className="grid gap-4 p-5 sm:grid-cols-2">
              <p>
                <strong>Name:</strong> {selectedStream.name}
              </p>

              <p>
                <strong>Slug:</strong> {selectedStream.slug}
              </p>

              <p>
                <strong>Code:</strong>{" "}
                {selectedStream.code || "-"}
              </p>

              <p>
                <strong>Status:</strong>{" "}
                {selectedStream.status}
              </p>

              <p>
                <strong>Display Order:</strong>{" "}
                {selectedStream.displayOrder}
              </p>

              <p>
                <strong>Parent Stream:</strong>{" "}
                {selectedStream.parentStream?.name || "-"}
              </p>

              <div className="sm:col-span-2">
                <strong>Description:</strong>

                <p className="mt-1 text-muted">
                  {selectedStream.description || "-"}
                </p>
              </div>

              <div>
                <strong>Icon:</strong>

                <p className="mt-1 text-muted">
                  {selectedStream.icon || "-"}
                </p>
              </div>

              <div>
                <strong>Image:</strong>

                <p className="mt-1 break-all text-muted">
                  {selectedStream.image || "-"}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Stream;