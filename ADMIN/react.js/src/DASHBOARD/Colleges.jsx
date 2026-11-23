import { useEffect, useRef, useState } from "react";
import { API } from "../api/axios.js";

const API_BASE_URL = (
  API.defaults.baseURL || "http://localhost:3000"
).replace(/\/api\/?$/, "").replace(/\/$/, "");

// Static default logo (used when a college has no uploaded logo)
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

function College() {
  const role = localStorage.getItem("role");

  const [colleges, setColleges] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [viewCollege, setViewCollege] = useState(null);
  const [editId, setEditId] = useState(null);
  const [search, setSearch] = useState("");

  const [isImporting, setIsImporting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const fileInputRef = useRef(null);
  const logoInputRef = useRef(null);

  const [selectedLogo, setSelectedLogo] = useState(null);
  const [logoPreview, setLogoPreview] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    logo: "",
    university: "",
    collegeType: "government",
    ownership: "",
    establishedYear: "",
    address: "",
    city: "",
    state: "",
    country: "",
    pincode: "",
    latitude: "",
    longitude: "",
    website: "",
    email: "",
    phone: "",
    accreditation: "[]",
    ranking: "[]",
    ratingAverage: 0,
    ratingCount: 0,
    facilities: "",
    isVerified: false,
    status: "pending",
  });

  // Get complete logo URL
  // Check whether logo is an actual image path
  const isValidLogo = (logo) => {
    if (!logo || typeof logo !== "string") return false;

    const imagePattern =
      /\.(jpg|jpeg|png|webp|gif|svg)(\?.*)?$/i;

    if (logo.startsWith("http")) {
      return imagePattern.test(logo);
    }

    return (
      logo.startsWith("/uploads/") &&
      imagePattern.test(logo)
    );
  };

  // Get complete logo URL
  const getLogoUrl = (logo) => {
    if (!isValidLogo(logo)) return "";

    if (logo.startsWith("http")) {
      return logo;
    }

    return `${API_BASE_URL}${logo}`;
  };


  // Logo to display: uploaded logo, otherwise the static default
  const getLogoSrc = (logo) => getLogoUrl(logo) || DEFAULT_LOGO;

  // If an uploaded logo fails to load, fall back to the static default
  const handleLogoError = (e) => {
    e.currentTarget.onerror = null;
    e.currentTarget.src = DEFAULT_LOGO;
  };

  // Fetch Colleges = async () => {
    // Fetch Colleges
const fetchColleges = async () => {
  try {
    const response = await API.get("/college/get-college");

    setColleges(
      Array.isArray(response.data)
        ? response.data
        : response.data.colleges || []
    );
  } catch (error) {
    console.log("Error fetching colleges:", error);
  }
};


  useEffect(() => {
    fetchColleges();
  }, []);

  // Default Form Data
  const getEmptyForm = () => ({
    name: "",
    slug: "",
    logo: "",
    university: "",
    collegeType: "government",
    ownership: "",
    establishedYear: "",
    address: "",
    city: "",
    state: "",
    country: "",
    pincode: "",
    latitude: "",
    longitude: "",
    website: "",
    email: "",
    phone: "",
    accreditation: "[]",
    ranking: "[]",
    ratingAverage: 0,
    ratingCount: 0,
    facilities: "",
    isVerified: false,
    status: "active",
  });

  // Handle Input Change
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Select College Logo
  const handleLogoChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (!allowedTypes.includes(file.type)) {
      alert("Please select JPG, PNG or WEBP image.");
      e.target.value = "";
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      alert("Logo size should not exceed 2 MB.");
      e.target.value = "";
      return;
    }

    setSelectedLogo(file);
    setLogoPreview(URL.createObjectURL(file));
  };

  // Clear Logo Preview
  const clearLogo = () => {
    if (logoPreview.startsWith("blob:")) {
      URL.revokeObjectURL(logoPreview);
    }

    setSelectedLogo(null);
    setLogoPreview("");

    if (logoInputRef.current) {
      logoInputRef.current.value = "";
    }
  };

  // Bulk Import Colleges
  const handleBulkImport = async (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (!file.name.toLowerCase().endsWith(".xlsx")) {
      alert("Please select an XLSX file.");
      e.target.value = "";
      return;
    }

    const uploadData = new FormData();
    uploadData.append("file", file);

    try {
      setIsImporting(true);

      const response = await API.post(
        "/college/bulk-import",
        uploadData
      );

      const result = response.data;

      let message = `${result.importedCount || 0
        } colleges imported successfully.`;

      if (result.errors?.length > 0) {
        message +=
          "\n\nSome rows were skipped:\n" +
          result.errors
            .map((error) =>
              typeof error === "string"
                ? error
                : `Row ${error.row || ""}: ${error.message ||
                error.error ||
                "Invalid data"
                }`
            )
            .join("\n");
      }

      alert(message);

      await fetchColleges();
    } catch (error) {
      console.log("Error importing colleges:", error);

      alert(
        error.response?.data?.message ||
        "Failed to import colleges."
      );
    } finally {
      setIsImporting(false);
      e.target.value = "";
    }
  };

  // Open Add Form
  const handleAdd = () => {
    setEditId(null);
    setFormData(getEmptyForm());

    clearLogo();

    setShowForm(true);
  };

  // Prepare College Data
  const prepareCollegeData = () => {
    return {
      name: formData.name,
      slug: formData.slug,
      logo: formData.logo,
      university: formData.university || undefined,
      collegeType: formData.collegeType,
      ownership: formData.ownership,

      establishedYear: formData.establishedYear
        ? Number(formData.establishedYear)
        : undefined,

      location: {
        address: formData.address,
        city: formData.city,
        state: formData.state,
        country: formData.country,
        pincode: formData.pincode,

        coordinates: {
          latitude: formData.latitude
            ? Number(formData.latitude)
            : undefined,

          longitude: formData.longitude
            ? Number(formData.longitude)
            : undefined,
        },
      },

      website: formData.website,

      contact: {
        email: formData.email,
        phone: formData.phone,
      },

      accreditation: formData.accreditation
        ? JSON.parse(formData.accreditation)
        : [],

      ranking: formData.ranking
        ? JSON.parse(formData.ranking)
        : [],

      rating: {
        average: Number(formData.ratingAverage) || 0,
        count: Number(formData.ratingCount) || 0,
      },

      facilities: formData.facilities
        ? formData.facilities
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean)
        : [],

      isVerified: formData.isVerified,
      status: formData.status,
    };
  };

  // Save / Update College
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setIsSaving(true);

      const collegeData = prepareCollegeData();

      const uploadData = new FormData();

      // College information
      uploadData.append(
        "collegeData",
        JSON.stringify(collegeData)
      );

      // Selected logo image
      if (selectedLogo) {
        uploadData.append("logo", selectedLogo);
      }

      if (editId) {
        await API.put(
          `/college/update/${editId}`,
          uploadData
        );

        alert("College updated successfully!");
      } else {
        await API.post(
          "/college/create",
          uploadData
        );

        alert("College added successfully!");
      }

      setShowForm(false);
      setEditId(null);

      clearLogo();

      await fetchColleges();
    } catch (error) {
      console.log("Error saving college:", error);

      alert(
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Failed to save college."
      );
    } finally {
      setIsSaving(false);
    }
  };

  // Edit College
  const handleEdit = (college) => {
    setEditId(college._id);

    setFormData({
      name: college.name || "",
      slug: college.slug || "",
      logo: college.logo || "",

      university:
        college.university?._id ||
        college.university ||
        "",

      collegeType: college.collegeType || "government",
      ownership: college.ownership || "",

      establishedYear: college.establishedYear || "",

      address: college.location?.address || "",
      city: college.location?.city || "",
      state: college.location?.state || "",
      country: college.location?.country || "",
      pincode: college.location?.pincode || "",

      latitude:
        college.location?.coordinates?.latitude ?? "",

      longitude:
        college.location?.coordinates?.longitude ?? "",

      website: college.website || "",

      email: college.contact?.email || "",
      phone: college.contact?.phone || "",

      accreditation: JSON.stringify(
        college.accreditation || [],
        null,
        2
      ),

      ranking: JSON.stringify(
        college.ranking || [],
        null,
        2
      ),

      ratingAverage: college.rating?.average ?? 0,
      ratingCount: college.rating?.count ?? 0,

      facilities: (college.facilities || [])
        .map((facility) =>
          typeof facility === "object"
            ? facility._id
            : facility
        )
        .join(", "),

      isVerified: college.isVerified || false,
      status: college.status || "active",
    });

    clearLogo();

    setLogoPreview(
      isValidLogo(college.logo)
        ? getLogoUrl(college.logo)
        : ""
    );

    setShowForm(true);
  };

  // Delete College
  const handleDelete = async (id) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this college?"
      )
    ) {
      return;
    }

    try {
      await API.delete(`/college/delete/${id}`);

      alert("College deleted successfully!");

      await fetchColleges();
    } catch (error) {
      console.log("Error deleting college:", error);

      alert(
        error.response?.data?.message ||
        "Failed to delete college."
      );
    }
  };

  // Status Toggle
  const handleStatusToggle = async (college) => {
    const newStatus =
      college.status === "active"
        ? "inactive"
        : "active";

    try {
      const uploadData = new FormData();

      uploadData.append(
        "collegeData",
        JSON.stringify({
          status: newStatus,
        })
      );

      await API.put(
        `/college/update/${college._id}`,
        uploadData
      );

      await fetchColleges();
    } catch (error) {
      console.log("Status update error:", error);

      alert(
        error.response?.data?.message ||
        "Status update failed."
      );
    }
  };

  // Close Form
  const closeForm = () => {
    setShowForm(false);
    setEditId(null);
    clearLogo();
  };

  // Input Classes
  const inputClass =
    "w-full rounded-lg border border-[#9DBDBA] bg-white px-3 py-2.5 text-sm text-[#0B2B2A] outline-none placeholder:text-[#4B6463] focus:border-teal-700 focus:ring-2 focus:ring-teal-200";

  const labelClass =
    "mb-1.5 block text-sm font-medium text-[#0B2B2A]";

  const actionButton =
    "inline-flex h-9 w-9 items-center justify-center rounded-lg border transition";

  // Search Filter
  const filteredColleges = colleges.filter((college) =>
    [
      college.name,
      college.collegeType,
      college.contact?.email,
      college.location?.state,
      college.location?.city,
      college.website,
    ]
      .join(" ")
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <div className="min-w-0 space-y-6">

      {/* PAGE HEADER */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#0B2B2A]">
            Colleges
          </h1>

          <p className="mt-1 text-sm text-[#3F5A58]">
            Manage college information
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx"
            onChange={handleBulkImport}
            className="hidden"
          />

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isImporting}
            className="rounded-xl border border-[#CFE5E2] bg-white px-5 py-2.5 text-sm font-semibold text-[#0B2B2A] hover:bg-teal-50 disabled:opacity-60"
          >
            {isImporting ? "Importing..." : "Add Bulk Data"}
          </button>

          <button
            onClick={handleAdd}
            className="rounded-xl bg-teal-700 px-5 py-2.5 text-sm font-bold text-white hover:bg-teal-800"
          >
            + Add College
          </button>
        </div>
      </div>

      {/* SEARCH */}
      <input
        type="text"
        placeholder="Search college..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full max-w-sm rounded-xl border border-[#9DBDBA] bg-white/80 px-4 py-2.5 text-sm text-[#0B2B2A] outline-none placeholder:text-[#4B6463] focus:border-teal-700 focus:ring-2 focus:ring-teal-200"
      />

      {/* COLLEGES TABLE */}
      <div className="overflow-x-auto rounded-2xl border border-white bg-white/65 shadow-[0_4px_24px_rgba(15,118,110,0.08)] backdrop-blur-xl text-[#0B2B2A]">
        <table className="w-full min-w-[950px] text-left text-sm">
          <thead className="bg-[#F1F8F7] text-[11px] font-bold uppercase tracking-wider text-[#3F5A58]">
            <tr>
              <th className="px-4 py-4">Logo</th>
              <th className="px-4 py-4">College Name</th>
              <th className="px-4 py-4">Type</th>
              <th className="px-4 py-4">Email</th>
              <th className="px-4 py-4">State</th>
              <th className="px-4 py-4">City</th>
              <th className="px-4 py-4">Website</th>
              <th className="px-4 py-4">Status</th>
              <th className="px-4 py-4">Actions</th>
            </tr>
          </thead>

          <tbody>
            {filteredColleges.length > 0 ? (
              filteredColleges.map((college) => (
                <tr
                  key={college._id}
                  className="border-t border-[#CFE5E2] hover:bg-teal-50/70"
                >
                  <td className="px-4 py-4">
                    <img
                      src={getLogoSrc(college.logo)}
                      alt={college.name}
                      onError={handleLogoError}
                      className="h-11 w-11 rounded-lg border border-[#CFE5E2] bg-white object-contain"
                    />
                  </td>

                  <td className="px-4 py-4 font-medium text-[#0B2B2A]">
                    {college.name}
                  </td>

                  <td className="px-4 py-4 capitalize">
                    {college.collegeType || "-"}
                  </td>

                  <td className="px-4 py-4">
                    {college.contact?.email || "-"}
                  </td>

                  <td className="px-4 py-4">
                    {college.location?.state || "-"}
                  </td>

                  <td className="px-4 py-4">
                    {college.location?.city || "-"}
                  </td>

                  <td className="px-4 py-4">
                    {college.website ? (
                      <a
                        href={
                          college.website.startsWith("http")
                            ? college.website
                            : `https://${college.website}`
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

                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleStatusToggle(college)}
                        className={`relative h-7 w-12 rounded-full transition ${college.status === "active"
                            ? "bg-teal-700"
                            : "bg-slate-400"
                          }`}
                      >
                        <span
                          className={`absolute top-1 h-5 w-5 rounded-full bg-white transition ${college.status === "active"
                              ? "left-6"
                              : "left-1"
                            }`}
                        />
                      </button>

                      <span className="text-xs capitalize text-[#3F5A58]">
                        {college.status || "inactive"}
                      </span>
                    </div>
                  </td>

                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        title="View College"
                        aria-label="View College"
                        onClick={() => setViewCollege(college)}
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
                        title="Edit College"
                        aria-label="Edit College"
                        onClick={() => handleEdit(college)}
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
                          title="Delete College"
                        aria-label="Delete College"
                          onClick={() => handleDelete(college._id)}
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
              ))
            ) : (
              <tr>
                <td
                  colSpan="9"
                  className="px-4 py-10 text-center text-[#3F5A58]"
                >
                  No colleges found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ADD / EDIT FORM */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">

            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-teal-700">
                {editId ? "Edit College" : "Add College"}
              </h2>

              <button
                type="button"
                onClick={closeForm}
                className="text-2xl text-[#3F5A58] hover:text-red-600"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

                {/* COLLEGE LOGO */}
                <div className="md:col-span-2">
                  <label className={labelClass}>
                    College Logo
                  </label>

                  <div className="flex flex-wrap items-center gap-4 rounded-xl border border-[#CFE5E2] p-4">
                    <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-xl border border-[#CFE5E2] bg-[#F1F8F7]">
                      {logoPreview ? (
                        <img
                          src={logoPreview}
                          alt="College Logo Preview"
                          className="h-full w-full object-contain"
                        />
                      ) : (
                        <span className="text-xs text-[#3F5A58]">
                          Logo Preview
                        </span>
                      )}
                    </div>

                    <div className="flex-1">
                      <input
                        ref={logoInputRef}
                        type="file"
                        accept="image/png,image/jpeg,image/webp"
                        onChange={handleLogoChange}
                        className="hidden"
                      />

                      <button
                        type="button"
                        onClick={() =>
                          logoInputRef.current?.click()
                        }
                        className="rounded-lg border border-[#CFE5E2] bg-white px-4 py-2.5 text-sm font-semibold text-[#0B2B2A] hover:bg-teal-50"
                      >
                        Choose College Logo
                      </button>

                      <p className="mt-2 text-xs text-[#3F5A58]">
                        Select JPG, PNG or WEBP image. Maximum size 2 MB.
                      </p>

                      {selectedLogo && (
                        <p className="mt-1 text-xs text-teal-700">
                          {selectedLogo.name}
                        </p>
                      )}

                      {logoPreview && (
                        <button
                          type="button"
                          onClick={clearLogo}
                          className="mt-2 text-xs font-medium text-red-600"
                        >
                          Remove Selected Logo
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* COLLEGE NAME */}
                <div>
                  <label className={labelClass}>
                    College Name *
                  </label>

                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className={inputClass}
                    placeholder="Enter college name"
                  />
                </div>

                {/* SLUG */}
                <div>
                  <label className={labelClass}>
                    Slug
                  </label>

                  <input
                    type="text"
                    name="slug"
                    value={formData.slug}
                    onChange={handleChange}
                    className={inputClass}
                    placeholder="college-name"
                  />
                </div>

                {/* COLLEGE TYPE */}
                <div>
                  <label className={labelClass}>
                    College Type *
                  </label>

                  <select
                    name="collegeType"
                    required
                    value={formData.collegeType}
                    onChange={handleChange}
                    className={inputClass}
                  >
                    <option value="government">Government</option>
                    <option value="private">Private</option>
                    <option value="deemed">Deemed</option>
                    <option value="autonomous">Autonomous</option>
                    <option value="public">Public</option>
                  </select>
                </div>

                {/* OWNERSHIP */}
                <div>
                  <label className={labelClass}>
                    Ownership
                  </label>

                  <input
                    type="text"
                    name="ownership"
                    value={formData.ownership}
                    onChange={handleChange}
                    className={inputClass}
                    placeholder="Enter ownership"
                  />
                </div>

                {/* UNIVERSITY */}
                <div>
                  <label className={labelClass}>
                    University ID
                  </label>

                  <input
                    type="text"
                    name="university"
                    value={formData.university}
                    onChange={handleChange}
                    className={inputClass}
                    placeholder="Enter university ID"
                  />
                </div>

                {/* ESTABLISHED YEAR */}
                <div>
                  <label className={labelClass}>
                    Established Year
                  </label>

                  <input
                    type="number"
                    name="establishedYear"
                    value={formData.establishedYear}
                    onChange={handleChange}
                    className={inputClass}
                    placeholder="Enter established year"
                  />
                </div>

                {/* EMAIL */}
                <div>
                  <label className={labelClass}>
                    Email
                  </label>

                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={inputClass}
                    placeholder="Enter email"
                  />
                </div>

                {/* PHONE */}
                <div>
                  <label className={labelClass}>
                    Phone
                  </label>

                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className={inputClass}
                    placeholder="Enter phone number"
                  />
                </div>

                {/* WEBSITE */}
                <div>
                  <label className={labelClass}>
                    Website
                  </label>

                  <input
                    type="text"
                    name="website"
                    value={formData.website}
                    onChange={handleChange}
                    className={inputClass}
                    placeholder="https://example.com"
                  />
                </div>

                {/* ADDRESS */}
                <div>
                  <label className={labelClass}>
                    Address
                  </label>

                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    className={inputClass}
                    placeholder="Enter address"
                  />
                </div>

                {/* STATE */}
                <div>
                  <label className={labelClass}>
                    State
                  </label>

                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    className={inputClass}
                    placeholder="Enter state"
                  />
                </div>

                {/* CITY */}
                <div>
                  <label className={labelClass}>
                    City
                  </label>

                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    className={inputClass}
                    placeholder="Enter city"
                  />
                </div>

                {/* COUNTRY */}
                <div>
                  <label className={labelClass}>
                    Country
                  </label>

                  <input
                    type="text"
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                    className={inputClass}
                    placeholder="Enter country"
                  />
                </div>

                {/* PINCODE */}
                <div>
                  <label className={labelClass}>
                    Pincode
                  </label>

                  <input
                    type="text"
                    name="pincode"
                    value={formData.pincode}
                    onChange={handleChange}
                    className={inputClass}
                    placeholder="Enter pincode"
                  />
                </div>

                {/* LATITUDE */}
                <div>
                  <label className={labelClass}>
                    Latitude
                  </label>

                  <input
                    type="number"
                    step="any"
                    name="latitude"
                    value={formData.latitude}
                    onChange={handleChange}
                    className={inputClass}
                    placeholder="Enter latitude"
                  />
                </div>

                {/* LONGITUDE */}
                <div>
                  <label className={labelClass}>
                    Longitude
                  </label>

                  <input
                    type="number"
                    step="any"
                    name="longitude"
                    value={formData.longitude}
                    onChange={handleChange}
                    className={inputClass}
                    placeholder="Enter longitude"
                  />
                </div>

                {/* FACILITIES */}
                <div>
                  <label className={labelClass}>
                    Facilities
                  </label>

                  <input
                    type="text"
                    name="facilities"
                    value={formData.facilities}
                    onChange={handleChange}
                    className={inputClass}
                    placeholder="Hostel, Library, Hospital"
                  />
                </div>

                {/* STATUS */}
                <div>
                  <label className={labelClass}>
                    Status
                  </label>

                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className={inputClass}
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="pending">Pending</option>
                  </select>
                </div>

                {/* VERIFIED */}
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="isVerified"
                    checked={formData.isVerified}
                    onChange={handleChange}
                    className="h-4 w-4"
                  />

                  <label className="text-sm font-medium text-[#0B2B2A]">
                    Verified College
                  </label>
                </div>
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
                  disabled={isSaving}
                  className="rounded-lg bg-teal-700 px-5 py-2 font-medium text-white hover:bg-teal-800 disabled:opacity-60"
                >
                  {isSaving
                    ? "Saving..."
                    : editId
                      ? "Update College"
                      : "Save College"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW COLLEGE */}
      {viewCollege && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6">

            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-xl font-bold text-[#0B2B2A]">
                College Details
              </h2>

              <button
                onClick={() => setViewCollege(null)}
                className="text-2xl text-[#3F5A58]"
              >
                &times;
              </button>
            </div>

            <div className="mb-5">
              <img
                src={getLogoSrc(viewCollege.logo)}
                alt={viewCollege.name}
                onError={handleLogoError}
                className="h-24 w-24 rounded-xl border border-[#CFE5E2] bg-white object-contain"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <p>
                <b>Name:</b> {viewCollege.name || "-"}
              </p>

              <p>
                <b>Slug:</b> {viewCollege.slug || "-"}
              </p>

              <p>
                <b>Type:</b> {viewCollege.collegeType || "-"}
              </p>

              <p>
                <b>Ownership:</b> {viewCollege.ownership || "-"}
              </p>

              <p>
                <b>Established:</b> {viewCollege.establishedYear || "-"}
              </p>

              <p>
                <b>Email:</b> {viewCollege.contact?.email || "-"}
              </p>

              <p>
                <b>Phone:</b> {viewCollege.contact?.phone || "-"}
              </p>

              <p>
                <b>Website:</b> {viewCollege.website || "-"}
              </p>

              <p>
                <b>Address:</b> {viewCollege.location?.address || "-"}
              </p>

              <p>
                <b>City:</b> {viewCollege.location?.city || "-"}
              </p>

              <p>
                <b>State:</b> {viewCollege.location?.state || "-"}
              </p>

              <p>
                <b>Country:</b> {viewCollege.location?.country || "-"}
              </p>

              <p>
                <b>Pincode:</b> {viewCollege.location?.pincode || "-"}
              </p>

              <p>
                <b>Status:</b> {viewCollege.status || "-"}
              </p>

              <p>
                <b>Verified:</b>{" "}
                {viewCollege.isVerified ? "Yes" : "No"}
              </p>

              <p>
                <b>Rating:</b> {viewCollege.rating?.average ?? 0}
              </p>
            </div>

            <button
              onClick={() => setViewCollege(null)}
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

export default College;