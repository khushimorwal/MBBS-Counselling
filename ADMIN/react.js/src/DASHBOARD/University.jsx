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

// Static default logo (used when a university has no logo / logo fails to load)
const DEFAULT_LOGO =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" fill="none">' +
    '<rect width="48" height="48" rx="10" fill="#F0FDFA"/>' +
    '<g stroke="#0F766E" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">' +
    '<path d="M9 20 24 11l15 9z"/>' +
    '<path d="M14 23v11M24 23v11M34 23v11M10 37h28"/>' +
    '</g></svg>'
  );

// Logo to display: logo URL saved for the university, otherwise the static default
const getLogoSrc = (logo) =>
  typeof logo === "string" && logo.trim() ? logo.trim() : DEFAULT_LOGO;

// If a logo fails to load, fall back to the static default
const handleLogoError = (e) => {
  e.currentTarget.onerror = null;
  e.currentTarget.src = DEFAULT_LOGO;
};

// Shared classes (same as College page)
const inputClass =
  "w-full rounded-lg border border-[#9DBDBA] bg-white px-3 py-2.5 text-sm text-[#0B2B2A] outline-none placeholder:text-[#4B6463] focus:border-teal-700 focus:ring-2 focus:ring-teal-200";

const labelClass = "mb-1.5 block text-sm font-medium text-[#0B2B2A]";

const actionButton =
  "inline-flex h-9 w-9 items-center justify-center rounded-lg border transition";

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

      const uploadData = new FormData();
      uploadData.append("file", file);

      const response = await API.post(
        "/university/universities/bulk-import",
        uploadData
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
    <div className="min-w-0 space-y-6">

      {/* PAGE HEADER */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#0B2B2A]">
            Universities
          </h1>

          <p className="mt-1 text-sm text-[#3F5A58]">
            Manage university information
          </p>
        </div>

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
            className="rounded-xl border border-[#CFE5E2] bg-white px-5 py-2.5 text-sm font-semibold text-[#0B2B2A] hover:bg-teal-50 disabled:opacity-60"
          >
            {isBulkUploading ? "Importing..." : "Add Bulk Data"}
          </button>

          <button
            type="button"
            onClick={handleAdd}
            className="rounded-xl bg-teal-700 px-5 py-2.5 text-sm font-bold text-white hover:bg-teal-800"
          >
            + Add University
          </button>
        </div>
      </div>

      {/* ERROR MESSAGE */}
      {error && !showModal && !viewUniversity && (
        <div className="flex items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
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

      {/* SEARCH */}
      <input
        type="text"
        placeholder="Search university..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full max-w-sm rounded-xl border border-[#9DBDBA] bg-white/80 px-4 py-2.5 text-sm text-[#0B2B2A] outline-none placeholder:text-[#4B6463] focus:border-teal-700 focus:ring-2 focus:ring-teal-200"
      />

      {/* UNIVERSITIES TABLE */}
      <div className="overflow-x-auto rounded-2xl border border-white bg-white/65 text-[#0B2B2A] shadow-[0_4px_24px_rgba(15,118,110,0.08)] backdrop-blur-xl">
        <table className="w-full min-w-[950px] text-left text-sm">
          <thead className="bg-[#F1F8F7] text-[11px] font-bold uppercase tracking-wider text-[#3F5A58]">
            <tr>
              <th className="px-4 py-4">Logo</th>
              <th className="px-4 py-4">University Name</th>
              <th className="px-4 py-4">Short Name</th>
              <th className="px-4 py-4">Type</th>
              <th className="px-4 py-4">State</th>
              <th className="px-4 py-4">City</th>
              <th className="px-4 py-4">Website</th>
              <th className="px-4 py-4">Status</th>
              <th className="px-4 py-4">Actions</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan="9"
                  className="px-4 py-10 text-center text-[#3F5A58]"
                >
                  Loading universities...
                </td>
              </tr>
            ) : filteredUniversities.length > 0 ? (
              filteredUniversities.map((university) => {
                const status =
                  universityStatuses[university._id] ??
                  (university.status === "inactive" ? "inactive" : "active");

                const isActive = status === "active";

                return (
                  <tr
                    key={university._id}
                    className="border-t border-[#CFE5E2] hover:bg-teal-50/70"
                  >
                    <td className="px-4 py-4">
                      <img
                        key={university.logo}
                        src={getLogoSrc(university.logo)}
                        alt={university.name}
                        onError={handleLogoError}
                        referrerPolicy="no-referrer"
                        className="h-11 w-11 rounded-lg border border-[#CFE5E2] bg-white object-contain"
                      />
                    </td>

                    <td className="px-4 py-4">
                      <p className="font-medium text-[#0B2B2A]">
                        {university.name || "-"}
                      </p>

                      <p className="mt-0.5 text-xs text-[#3F5A58]">
                        {university.establishedYear
                          ? `Established ${university.establishedYear}`
                          : "Year not provided"}
                      </p>
                    </td>

                    <td className="px-4 py-4">
                      {university.shortName || "-"}
                    </td>

                    <td className="px-4 py-4 capitalize">
                      {university.type || "-"}
                    </td>

                    <td className="px-4 py-4">
                      {university.location?.state || "-"}
                    </td>

                    <td className="px-4 py-4">
                      {university.location?.city || "-"}
                    </td>

                    <td className="px-4 py-4">
                      {university.website ? (
                        <a
                          href={
                            university.website.startsWith("http")
                              ? university.website
                              : `https://${university.website}`
                          }
                          target="_blank"
                          rel="noreferrer"
                          className="text-teal-700 underline"
                        >
                          Visit Website
                        </a>
                      ) : (
                        "-"
                      )}
                    </td>

                    {/* STATUS TOGGLE */}
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          role="switch"
                          aria-checked={isActive}
                          aria-label={`Toggle ${university.name} status`}
                          title="UI only — not saved to database yet"
                          onClick={() => handleStatusToggle(university)}
                          className={`relative h-7 w-12 rounded-full transition ${isActive ? "bg-teal-700" : "bg-slate-400"
                            }`}
                        >
                          <span
                            className={`absolute top-1 h-5 w-5 rounded-full bg-white transition ${isActive ? "left-6" : "left-1"
                              }`}
                          />
                        </button>

                        <span className="text-xs capitalize text-[#3F5A58]">
                          {status}
                        </span>
                      </div>
                    </td>

                    {/* VIEW / EDIT / DELETE */}
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          title="View University"
                          aria-label="View University"
                          onClick={() => handleView(university._id)}
                          className={`${actionButton} border-teal-200 bg-teal-50 text-teal-700 hover:bg-teal-700 hover:text-white`}
                        >
                          <svg
                            width="17"
                            height="17"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            aria-hidden="true"
                          >
                            <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
                            <circle cx="12" cy="12" r="3" />
                          </svg>
                        </button>

                        <button
                          type="button"
                          title="Edit University"
                          aria-label="Edit University"
                          onClick={() => handleEdit(university)}
                          className={`${actionButton} border-[#CFE5E2] bg-white text-[#3F5A58] hover:bg-[#0B2B2A] hover:text-white`}
                        >
                          <svg
                            width="17"
                            height="17"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            aria-hidden="true"
                          >
                            <path d="m16 4 4 4M4 20l4-.8L19 8a2.1 2.1 0 0 0-3-3L5 16l-1 4Z" />
                          </svg>
                        </button>

                        {role === "Super Admin" && (
                          <button
                            type="button"
                            title="Delete University"
                            aria-label="Delete University"
                            onClick={() => handleDelete(university._id)}
                            className={`${actionButton} border-red-200 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white`}
                          >
                            <svg
                              width="17"
                              height="17"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="1.8"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              aria-hidden="true"
                            >
                              <path d="M3 6h18M8 6V4h8v2m3 0-1 14H6L5 6m4 4v6m6-6v6" />
                            </svg>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td
                  colSpan="9"
                  className="px-4 py-10 text-center text-[#3F5A58]"
                >
                  No universities found.
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
                {editId ? "Edit University" : "Add University"}
              </h2>

              <button
                type="button"
                onClick={closeModal}
                className="text-2xl text-[#3F5A58] hover:text-red-600"
                aria-label="Close"
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

                {/* LOGO PREVIEW + URL */}
                <div className="md:col-span-2">
                  <label className={labelClass}>University Logo</label>

                  <div className="flex flex-wrap items-center gap-4 rounded-xl border border-[#CFE5E2] p-4">
                    <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-xl border border-[#CFE5E2] bg-[#F1F8F7]">
                      <img
                        key={formData.logo}
                        src={getLogoSrc(formData.logo)}
                        alt="University Logo Preview"
                        onError={handleLogoError}
                        referrerPolicy="no-referrer"
                        className="h-full w-full object-contain"
                      />
                    </div>

                    <div className="min-w-[220px] flex-1">
                      <input
                        type="url"
                        name="logo"
                        value={formData.logo}
                        onChange={handleChange}
                        placeholder="Enter logo image URL"
                        className={inputClass}
                      />

                      <p className="mt-2 text-xs text-[#3F5A58]">
                        Paste a direct image link. Default logo is shown if empty.
                      </p>
                    </div>
                  </div>
                </div>

                {/* UNIVERSITY NAME */}
                <div>
                  <label className={labelClass}>University Name *</label>
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter university name"
                    className={inputClass}
                  />
                </div>

                {/* SHORT NAME */}
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

                {/* TYPE */}
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

                {/* ESTABLISHED YEAR */}
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

                {/* WEBSITE */}
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

                {/* COUNTRY */}
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

                {/* STATE */}
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

                {/* CITY */}
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
                      ? "Update University"
                      : "Save University"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW UNIVERSITY */}
      {viewUniversity && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setViewUniversity(null);
          }}
        >
          <div className="max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6">

            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-xl font-bold text-[#0B2B2A]">
                University Details
              </h2>

              <button
                type="button"
                onClick={() => setViewUniversity(null)}
                className="text-2xl text-[#3F5A58]"
                aria-label="Close"
              >
                &times;
              </button>
            </div>

            <div className="mb-5">
              <img
                src={getLogoSrc(viewUniversity.logo)}
                alt={viewUniversity.name}
                onError={handleLogoError}
                        referrerPolicy="no-referrer"
                className="h-24 w-24 rounded-xl border border-[#CFE5E2] bg-white object-contain"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <p>
                <b>Name:</b> {viewUniversity.name || "-"}
              </p>

              <p>
                <b>Short Name:</b> {viewUniversity.shortName || "-"}
              </p>

              <p className="capitalize">
                <b>Type:</b> {viewUniversity.type || "-"}
              </p>

              <p>
                <b>Established:</b> {viewUniversity.establishedYear || "-"}
              </p>

              <p>
                <b>City:</b> {viewUniversity.location?.city || "-"}
              </p>

              <p>
                <b>State:</b> {viewUniversity.location?.state || "-"}
              </p>

              <p>
                <b>Country:</b> {viewUniversity.location?.country || "-"}
              </p>

              <p className="capitalize">
                <b>Status:</b>{" "}
                {universityStatuses[viewUniversity._id] ??
                  (viewUniversity.status === "inactive"
                    ? "inactive"
                    : "active")}
              </p>

              <p className="break-all sm:col-span-2">
                <b>Website:</b>{" "}
                {viewUniversity.website ? (
                  <a
                    href={
                      viewUniversity.website.startsWith("http")
                        ? viewUniversity.website
                        : `https://${viewUniversity.website}`
                    }
                    target="_blank"
                    rel="noreferrer"
                    className="text-teal-700 underline"
                  >
                    {viewUniversity.website}
                  </a>
                ) : (
                  "-"
                )}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setViewUniversity(null)}
              className="mt-6 rounded-lg bg-teal-700 px-5 py-2.5 text-sm font-semibold text-white"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default University;