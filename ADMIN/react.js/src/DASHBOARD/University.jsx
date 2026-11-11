
import { useEffect, useState, useRef } from "react";
import { API } from "../api/axios.js";

const API_URL = "/university/universities";

const emptyForm = {
  name: "",
  shortName: "",
  type: "",
  establishedYear: "",
  city: "",
  state: "",
  country: "",
  website: "",
  logo: "",
};

const inputClass =
  "w-full rounded-xl border border-line bg-white px-4 py-3 text-sm text-brand-dark outline-none transition placeholder:text-gray-400 focus:border-brand focus:ring-2 focus:ring-brand/10";

const labelClass = "mb-2 block text-sm font-semibold text-brand-dark";

const buttonClass =
  "rounded-xl px-5 py-2.5 text-sm font-semibold transition";

function University() {

  const role = localStorage.getItem("role");

  const [universities, setUniversities] = useState([]);
  const [search, setSearch] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [viewUniversity, setViewUniversity] = useState(null);

  const [formData, setFormData] = useState(emptyForm);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // BULK IMPORT
  const fileInputRef = useRef(null);
  const [isBulkUploading, setIsBulkUploading] = useState(false);

  // STATUS TOGGLE (UI ONLY)
  const [universityStatuses, setUniversityStatuses] = useState({});

  // GET ALL UNIVERSITIES
  const getUniversities = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await API.get(API_URL);
      const data = response.data;

      let list = [];

      if (Array.isArray(data)) {
        list = data;
      } else if (Array.isArray(data.universities)) {
        list = data.universities;
      } else if (Array.isArray(data.data)) {
        list = data.data;
      }

      setUniversities(list);

      // Initialize UI status from backend status, if available
      setUniversityStatuses((prev) => {
        const next = { ...prev };

        list.forEach((university) => {
          if (next[university._id] === undefined) {
            next[university._id] =
              university.status === "inactive" ? "inactive" : "active";
          }
        });

        return next;
      });
    } catch (err) {
      console.error("Error fetching universities:", err);
      setError(
        err.response?.data?.message ||
        "Universities load nahi ho paayi."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getUniversities();
  }, []);

  // HANDLE INPUT CHANGE
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // OPEN ADD MODAL
  const handleAdd = () => {
    setEditId(null);
    setFormData({ ...emptyForm });
    setError("");
    setShowModal(true);
  };

  // CREATE / UPDATE UNIVERSITY
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      setError("");

      const payload = {
        name: formData.name.trim(),
        shortName: formData.shortName.trim(),
        type: formData.type,
        establishedYear: formData.establishedYear
          ? Number(formData.establishedYear)
          : undefined,
        location: {
          city: formData.city.trim(),
          state: formData.state.trim(),
          country: formData.country.trim(),
        },
        website: formData.website.trim(),
        logo: formData.logo.trim(),
      };

      if (editId) {
        await API.put(`${API_URL}/${editId}`, payload);
      } else {
        await API.post(API_URL, payload);
      }

      setShowModal(false);
      setEditId(null);
      setFormData({ ...emptyForm });

      await getUniversities();
    } catch (err) {
      console.error("Error saving university:", err);

      setError(
        err.response?.data?.message ||
        err.response?.data?.error ||
        "University save nahi ho paayi."
      );
    } finally {
      setSaving(false);
    }
  };

  // EDIT UNIVERSITY
  const handleEdit = (university) => {
    setEditId(university._id);

    setFormData({
      name: university.name || "",
      shortName: university.shortName || "",
      type: university.type || "",
      establishedYear: university.establishedYear || "",
      city: university.location?.city || "",
      state: university.location?.state || "",
      country: university.location?.country || "",
      website: university.website || "",
      logo: university.logo || "",
    });

    setError("");
    setShowModal(true);
  };

  // DELETE UNIVERSITY
  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this university?"
    );

    if (!confirmDelete) return;

    try {
      setError("");

      await API.delete(`${API_URL}/${id}`);

      await getUniversities();
    } catch (err) {
      console.error("Error deleting university:", err);

      setError(
        err.response?.data?.message ||
        "University delete nahi ho paayi."
      );
    }
  };

  // VIEW UNIVERSITY
  const handleView = async (id) => {
    try {
      setError("");

      const response = await API.get(`${API_URL}/${id}`);
      const data = response.data;

      setViewUniversity(data.university || data.data || data);
    } catch (err) {
      console.error("Error fetching university:", err);

      setError(
        err.response?.data?.message ||
        "University details load nahi ho paayi."
      );
    }
  };

  // BULK IMPORT UNIVERSITIES
  const handleBulkImport = async (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (!file.name.toLowerCase().endsWith(".xlsx")) {
      alert("Please select an Excel (.xlsx) file.");
      e.target.value = "";
      return;
    }

    try {
      setIsBulkUploading(true);
      setError("");

      const formData = new FormData();
      formData.append("file", file);

      const response = await API.post(
        "/university/universities/bulk-import",
        formData
      );

      alert(
        `${response.data.message || "Import completed"}\nImported: ${response.data.importedCount ?? "—"
        }`
      );

      await getUniversities();
    } catch (err) {
      console.error("University bulk import error:", err);

      alert(
        err.response?.data?.message ||
        err.response?.data?.error ||
        "University bulk import failed."
      );
    } finally {
      setIsBulkUploading(false);
      e.target.value = "";
    }
  };

  // TOGGLE STATUS (UI ONLY)
  const handleStatusToggle = (university) => {
    const currentStatus =
      universityStatuses[university._id] ??
      (university.status === "inactive" ? "inactive" : "active");

    const newStatus =
      currentStatus === "active" ? "inactive" : "active";

    setUniversityStatuses((prev) => ({
      ...prev,
      [university._id]: newStatus,
    }));
  };

  // SEARCH
  const filteredUniversities = universities.filter((university) => {
    const searchText = search.toLowerCase();

    return (
      university.name?.toLowerCase().includes(searchText) ||
      university.shortName?.toLowerCase().includes(searchText) ||
      university.type?.toLowerCase().includes(searchText) ||
      university.location?.city?.toLowerCase().includes(searchText) ||
      university.location?.state?.toLowerCase().includes(searchText)
    );
  });

  // CLOSE ADD / EDIT MODAL
  const closeModal = () => {
    setShowModal(false);
    setEditId(null);
    setFormData({ ...emptyForm });
    setError("");
  };

  return (
    <div className="min-h-full bg-surface p-4 sm:p-6 lg:p-8">
      {/* PAGE HEADER */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="mb-1 text-sm font-semibold uppercase tracking-wider text-accent">
            Management
          </p>

          <h1 className="font-display text-2xl font-bold text-brand-dark sm:text-3xl">
            Universities
          </h1>

          <p className="mt-2 text-sm text-muted">
            Manage university details and information.
          </p>
        </div>

        {/* BULK IMPORT AND ADD BUTTONS */}
        <div className="flex flex-wrap items-center gap-3">
          <input
            type="file"
            ref={fileInputRef}
            accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            onChange={handleBulkImport}
            className="hidden"
          />

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isBulkUploading}
            className={`${buttonClass} border border-brand bg-white text-brand hover:bg-brand-soft disabled:cursor-not-allowed disabled:opacity-60`}
          >
            {isBulkUploading ? "Uploading..." : "Bulk Import"}
          </button>

          <button
            type="button"
            onClick={handleAdd}
            className={`${buttonClass} flex items-center justify-center gap-2 bg-brand text-white shadow-sm hover:bg-brand-dark`}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M12 5v14" />
              <path d="M5 12h14" />
            </svg>
            Add University
          </button>
        </div>
      </div>

      {/* ERROR MESSAGE */}
      {error && !showModal && !viewUniversity && (
        <div className="mb-4 flex items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <span>{error}</span>

          <button
            type="button"
            onClick={() => setError("")}
            className="font-bold"
            title="Close error"
          >
            ✕
          </button>
        </div>
      )}

      {/* TABLE CARD */}
      <div className="overflow-hidden rounded-2xl border border-line bg-white shadow-sm">
        {/* SEARCH SECTION */}
        <div className="flex flex-col gap-4 border-b border-line p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
          <div>
            <h2 className="font-display text-lg font-bold text-brand-dark">
              University List
            </h2>

            <p className="mt-1 text-sm text-muted">
              {filteredUniversities.length} universities found
            </p>
          </div>

          <div className="relative w-full sm:max-w-xs">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted"
              aria-hidden="true"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>

            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search university..."
              className={`${inputClass} pl-10`}
            />
          </div>
        </div>

        {/* TABLE */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left">
            <thead className="bg-brand text-white">
              <tr>
                <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider">
                  #
                </th>
                <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider">
                  University
                </th>
                <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider">
                  Short Name
                </th>
                <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider">
                  Type
                </th>
                <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider">
                  Location
                </th>
                <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider">
                  Status
                </th>
                <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-line">
              {loading ? (
                <tr>
                  <td
                    colSpan="7"
                    className="px-5 py-12 text-center text-sm text-muted"
                  >
                    Loading universities...
                  </td>
                </tr>
              ) : filteredUniversities.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-5 py-12 text-center">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-brand-soft text-brand">
                      <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.7"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <path d="M3 21h18" />
                        <path d="M5 21V7l8-4v18" />
                        <path d="M19 21V11l-6-4" />
                        <path d="M9 9v.01M9 12v.01M9 15v.01M9 18v.01" />
                      </svg>
                    </div>

                    <p className="mt-3 font-semibold text-brand-dark">
                      No universities found
                    </p>

                    <p className="mt-1 text-sm text-muted">
                      Add a university or try a different search.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredUniversities.map((university, index) => {
                  const status =
                    universityStatuses[university._id] ??
                    (university.status === "inactive" ? "inactive" : "active");

                  const isActive = status === "active";

                  return (
                    <tr
                      key={university._id}
                      className="transition hover:bg-brand-soft/30"
                    >
                      <td className="px-5 py-4 text-sm text-muted">
                        {index + 1}
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-soft font-display font-bold text-brand">
                            {university.shortName
                              ? university.shortName.slice(0, 2).toUpperCase()
                              : university.name?.slice(0, 1).toUpperCase() || "U"}
                          </div>

                          <div>
                            <p className="font-semibold text-brand-dark">
                              {university.name || "—"}
                            </p>

                            <p className="mt-1 text-xs text-muted">
                              {university.establishedYear
                                ? `Established ${university.establishedYear}`
                                : "Year not provided"}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4 text-sm text-muted">
                        {university.shortName || "—"}
                      </td>

                      <td className="px-5 py-4">
                        <span className="inline-flex rounded-full bg-brand-soft px-3 py-1 text-xs font-semibold text-brand">
                          {university.type || "—"}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-sm text-muted">
                        {[
                          university.location?.city,
                          university.location?.state,
                        ]
                          .filter(Boolean)
                          .join(", ") || "—"}
                      </td>

                      {/* STATUS TOGGLE */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            role="switch"
                            aria-checked={isActive}
                            aria-label={`Toggle ${university.name} status`}
                            title="UI only — not saved to database yet"
                            onClick={() => handleStatusToggle(university)}
                            className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${isActive ? "bg-emerald-500" : "bg-gray-300"
                              }`}
                          >
                            <span
                              className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${isActive ? "translate-x-6" : "translate-x-1"
                                }`}
                            />
                          </button>

                          <span
                            className={`text-xs font-semibold ${isActive
                                ? "text-emerald-700"
                                : "text-gray-500"
                              }`}
                          >
                            {isActive ? "Active" : "Inactive"}
                          </span>
                        </div>
                      </td>

                      {/* VIEW / EDIT / DELETE ICONS */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          {/* VIEW */}
                          <button
                            type="button"
                            onClick={() => handleView(university._id)}
                            title="View"
                            aria-label="View university"
                            className="flex h-9 w-9 items-center justify-center rounded-lg border border-brand/20 bg-brand-soft text-brand transition hover:bg-brand hover:text-white"
                          >
                            <svg
                              width="18"
                              height="18"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              aria-hidden="true"
                            >
                              <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
                              <circle cx="12" cy="12" r="3" />
                            </svg>
                          </button>

                          {/* EDIT */}
                          <button
                            type="button"
                            onClick={() => handleEdit(university)}
                            title="Edit"
                            aria-label="Edit university"
                            className="flex h-9 w-9 items-center justify-center rounded-lg border border-orange-200 bg-orange-50 text-accent transition hover:bg-accent hover:text-white"
                          >
                            <svg
                              width="18"
                              height="18"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              aria-hidden="true"
                            >
                              <path d="M12 20h9" />
                              <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4Z" />
                            </svg>
                          </button>

                          {/* DELETE */}
                          {role === "Super Admin" && (
                            <button
                              type="button"
                              onClick={() => handleDelete(university._id)}
                              title="Delete"
                              aria-label="Delete university"
                              className="flex h-9 w-9 items-center justify-center rounded-lg border border-red-200 bg-red-50 text-red-600 transition hover:bg-red-600 hover:text-white"
                            >
                              <svg
                                width="18"
                                height="18"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                aria-hidden="true"
                              >
                                <path d="M3 6h18" />
                                <path d="M8 6V4h8v2" />
                                <path d="m19 6-1 14H6L5 6" />
                                <path d="M10 11v5" />
                                <path d="M14 11v5" />
                              </svg>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ADD / EDIT MODAL */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-brand-dark/60 p-4 backdrop-blur-sm"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) closeModal();
          }}
        >
          <div className="my-auto w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between bg-brand px-6 py-5 text-white">
              <div>
                <h2 className="font-display text-xl font-bold">
                  {editId ? "Edit University" : "Add University"}
                </h2>

                <p className="mt-1 text-sm text-white/70">
                  Enter university details below.
                </p>
              </div>

              <button
                type="button"
                onClick={closeModal}
                title="Close"
                aria-label="Close modal"
                className="flex h-9 w-9 items-center justify-center rounded-lg text-white transition hover:bg-white/15"
              >
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  aria-hidden="true"
                >
                  <path d="m18 6-12 12" />
                  <path d="m6 6 12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 gap-5 p-6 sm:grid-cols-2">
                {error && (
                  <div className="col-span-full rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {error}
                  </div>
                )}

                <div>
                  <label className={labelClass}>University Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter university name"
                    className={inputClass}
                    required
                  />
                </div>

                <div>
                  <label className={labelClass}>Short Name</label>
                  <input
                    type="text"
                    name="shortName"
                    value={formData.shortName}
                    onChange={handleChange}
                    placeholder="e.g. RTU"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>University Type</label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    className={inputClass}
                  >
                    <option value="">Select type</option>
                    <option value="central">Central</option>
                    <option value="state">State</option>
                    <option value="private">Private</option>
                    <option value="deemed">Deemed</option>
                    <option value="international">International</option>
                  </select>
                </div>

                <div>
                  <label className={labelClass}>Established Year</label>
                  <input
                    type="number"
                    name="establishedYear"
                    value={formData.establishedYear}
                    onChange={handleChange}
                    placeholder="e.g. 2006"
                    min="1800"
                    max={new Date().getFullYear()}
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>City</label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    placeholder="Enter city"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>State</label>
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    placeholder="Enter state"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>Country</label>
                  <input
                    type="text"
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                    placeholder="Enter country"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>Website</label>
                  <input
                    type="url"
                    name="website"
                    value={formData.website}
                    onChange={handleChange}
                    placeholder="https://example.com"
                    className={inputClass}
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className={labelClass}>Logo URL</label>
                  <input
                    type="url"
                    name="logo"
                    value={formData.logo}
                    onChange={handleChange}
                    placeholder="Enter logo image URL"
                    className={inputClass}
                  />
                </div>
              </div>

              <div className="flex flex-col-reverse gap-3 border-t border-line bg-surface px-6 py-4 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeModal}
                  className={`${buttonClass} border border-line bg-white text-muted hover:bg-gray-50`}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className={`${buttonClass} bg-brand text-white hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-60`}
                >
                  {saving
                    ? "Saving..."
                    : editId
                      ? "Update University"
                      : "Save University"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW MODAL */}
      {viewUniversity && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-brand-dark/60 p-4 backdrop-blur-sm"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) {
              setViewUniversity(null);
            }
          }}
        >
          <div className="my-auto w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between bg-brand px-6 py-5 text-white">
              <div>
                <h2 className="font-display text-xl font-bold">
                  University Details
                </h2>

                <p className="mt-1 text-sm text-white/70">
                  Complete university information
                </p>
              </div>

              <button
                type="button"
                onClick={() => setViewUniversity(null)}
                title="Close"
                aria-label="Close details"
                className="flex h-9 w-9 items-center justify-center rounded-lg transition hover:bg-white/15"
              >
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  aria-hidden="true"
                >
                  <path d="m18 6-12 12" />
                  <path d="m6 6 12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6">
              <div className="mb-6 flex items-center gap-4">
                {viewUniversity.logo ? (
                  <img
                    src={viewUniversity.logo}
                    alt="University logo"
                    className="h-16 w-16 rounded-xl border border-line object-contain p-2"
                  />
                ) : (
                  <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-brand-soft font-display text-xl font-bold text-brand">
                    {viewUniversity.shortName
                      ? viewUniversity.shortName.slice(0, 2).toUpperCase()
                      : viewUniversity.name?.slice(0, 1).toUpperCase() || "U"}
                  </div>
                )}

                <div>
                  <h3 className="font-display text-lg font-bold text-brand-dark">
                    {viewUniversity.name || "—"}
                  </h3>

                  <p className="mt-1 text-sm text-muted">
                    {viewUniversity.shortName || "No short name"}
                  </p>
                </div>
              </div>

              <div className="divide-y divide-line rounded-xl border border-line">
                <DetailRow
                  label="University Type"
                  value={viewUniversity.type}
                />
                <DetailRow
                  label="Established Year"
                  value={viewUniversity.establishedYear}
                />
                <DetailRow
                  label="City"
                  value={viewUniversity.location?.city}
                />
                <DetailRow
                  label="State"
                  value={viewUniversity.location?.state}
                />
                <DetailRow
                  label="Country"
                  value={viewUniversity.location?.country}
                />
                <DetailRow
                  label="Website"
                  value={viewUniversity.website}
                />
                <DetailRow
                  label="Status"
                  value={
                    universityStatuses[viewUniversity._id] ??
                    (viewUniversity.status === "inactive"
                      ? "inactive"
                      : "active")
                  }
                />
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  type="button"
                  onClick={() => setViewUniversity(null)}
                  className={`${buttonClass} bg-brand text-white hover:bg-brand-dark`}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// REUSABLE DETAIL ROW
function DetailRow({ label, value }) {
  return (
    <div className="flex flex-col gap-1 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
      <span className="text-sm font-medium text-muted">{label}</span>

      {label === "Website" && value ? (
        <a
          href={value}
          target="_blank"
          rel="noreferrer"
          className="break-all text-sm font-semibold text-brand hover:underline"
        >
          {value}
        </a>
      ) : (
        <span className="break-words text-sm font-semibold capitalize text-brand-dark sm:text-right">
          {value || "—"}
        </span>
      )}
    </div>
  );
}

export default University;
