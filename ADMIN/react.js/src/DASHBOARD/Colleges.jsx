import { useEffect, useRef, useState } from "react";
import { API } from "../api/axios.js";

function College() {
  const role = localStorage.getItem("role");
  const [colleges, setColleges] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [viewCollege, setViewCollege] = useState(null);
  const [editId, setEditId] = useState(null);
  const [search, setSearch] = useState("");
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef(null);

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

  // FETCH COLLEGES
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

  // BULK IMPORT COLLEGES
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

  useEffect(() => {
    fetchColleges();
  }, []);

  // INPUT HANDLE
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  // OPEN ADD FORM
  const handleAdd = () => {
    setEditId(null);

    setFormData({
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

    setShowForm(true);
  };

  // SAVE / UPDATE COLLEGE
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const data = {
        name: formData.name,
        slug: formData.slug,
        logo: formData.logo,
        university: formData.university,
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
          : [],

        isVerified: formData.isVerified,
        status: formData.status,
      };

      if (editId) {
        await API.put(`/college/update/${editId}`, data);

        alert("College updated successfully!");
      } else {
        await API.post("/college/create", data);

        alert("College added successfully!");
      }

      setShowForm(false);
      setEditId(null);

      fetchColleges();
    } catch (error) {
      console.log("Error saving college:", error);

      alert(
        error.response?.data?.message ||
        "Failed to save college."
      );
    }
  };

  // EDIT COLLEGE
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

      collegeType:
        college.collegeType || "government",

      ownership: college.ownership || "",

      establishedYear:
        college.establishedYear || "",

      address:
        college.location?.address || "",

      city:
        college.location?.city || "",

      state:
        college.location?.state || "",

      country:
        college.location?.country || "",

      pincode:
        college.location?.pincode || "",

      latitude:
        college.location?.coordinates?.latitude ?? "",

      longitude:
        college.location?.coordinates?.longitude ?? "",

      website: college.website || "",

      email:
        college.contact?.email || "",

      phone:
        college.contact?.phone || "",

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

      ratingAverage:
        college.rating?.average ?? 0,

      ratingCount:
        college.rating?.count ?? 0,

      facilities: (college.facilities || [])
        .map((facility) =>
          typeof facility === "object"
            ? facility._id
            : facility
        )
        .join(", "),

      isVerified:
        college.isVerified || false,

      status:
        college.status || "active",
    });

    setShowForm(true);
  };

  // DELETE COLLEGE
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

      fetchColleges();
    } catch (error) {
      console.log("Error deleting college:", error);

      alert(
        error.response?.data?.message ||
        "Failed to delete college."
      );
    }
  };

  // STATUS TOGGLE
  const handleStatusToggle = async (college) => {
    const newStatus =
      college.status === "active"
        ? "inactive"
        : "active";

    try {
      // Existing college data ko change nahi kar rahe,
      // sirf status update kar rahe hain
      await API.put(`/college/update/${college._id}`, {
        status: newStatus,
      });

      await fetchColleges();
    } catch (error) {
      console.log(
        "Status update error:",
        error.response?.data || error
      );

      alert(
        error.response?.data?.message ||
        "Status update nahi hua."
      );
    }
  };

  // INPUT CLASSES
  const inputClass =
    "w-full rounded-lg border border-line bg-white px-3 py-2.5 text-sm outline-none focus:border-brand";

  const labelClass =
    "mb-1.5 block text-sm font-medium text-brand-dark";

  const actionButton =
    "inline-flex h-9 w-9 items-center justify-center rounded-lg border transition";

  // SEARCH FILTER
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
          <h1 className="text-2xl font-bold text-brand-dark">
            Colleges
          </h1>

          <p className="mt-1 text-sm text-muted">
            Manage college information
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">

          {/* HIDDEN XLSX INPUT */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx"
            onChange={handleBulkImport}
            className="hidden"
          />

          {/* BULK IMPORT */}
          <button
            type="button"
            onClick={() =>
              fileInputRef.current?.click()
            }
            disabled={isImporting}
            className="rounded-lg border border-brand px-5 py-2.5 text-sm font-semibold text-brand hover:bg-brand-soft disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isImporting
              ? "Importing..."
              : "Add Bulk Data"}
          </button>

          {/* ADD COLLEGE */}
          <button
            onClick={handleAdd}
            className="rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90"
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
        onChange={(e) =>
          setSearch(e.target.value)
        }
        className="w-full max-w-sm rounded-lg border border-line bg-white px-4 py-2.5 outline-none focus:border-brand"
      />

      {/* COLLEGES TABLE */}
      <div className="overflow-x-auto rounded-xl border border-line bg-white">
        <table className="w-full min-w-[950px] text-left text-sm">

          <thead className="bg-brand-soft text-brand-dark">
            <tr>
              <th className="px-4 py-4">
                College Name
              </th>

              <th className="px-4 py-4">
                Type
              </th>

              <th className="px-4 py-4">
                Email
              </th>

              <th className="px-4 py-4">
                State
              </th>

              <th className="px-4 py-4">
                City
              </th>

              <th className="px-4 py-4">
                College Website
              </th>

              {/* NEW STATUS COLUMN */}
              <th className="px-4 py-4">
                Status
              </th>

              <th className="px-4 py-4">
                Actions
              </th>
            </tr>
          </thead>

          <tbody>
            {filteredColleges.length > 0 ? (
              filteredColleges.map((college) => (
                <tr
                  key={college._id}
                  className="border-t border-line"
                >
                  <td className="px-4 py-4 font-medium text-brand-dark">
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
                        className="text-accent underline"
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
                        onClick={() =>
                          handleStatusToggle(college)
                        }
                        className={`relative h-7 w-12 rounded-full transition ${college.status === "active"
                            ? "bg-brand"
                            : "bg-gray-300"
                          }`}
                      >
                        <span
                          className={`absolute top-1 h-5 w-5 rounded-full bg-white transition ${college.status === "active"
                              ? "left-6"
                              : "left-1"
                            }`}
                        />

                        <span className="sr-only">
                          Toggle Status
                        </span>
                      </button>

                      <span className="text-xs capitalize text-muted">
                        {college.status || "inactive"}
                      </span>
                    </div>
                  </td>

                  {/* ACTIONS */}
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">

                      {/* VIEW */}
                      <button
                        type="button"
                        title="View College"
                        aria-label="View College"
                        onClick={() =>
                          setViewCollege(college)
                        }
                        className={`${actionButton} border-brand/20 bg-brand-soft text-brand hover:bg-brand hover:text-white`}
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
                        >
                          <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
                          <circle
                            cx="12"
                            cy="12"
                            r="3"
                          />
                        </svg>
                      </button>

                      {/* EDIT */}
                      <button
                        type="button"
                        title="Edit College"
                        aria-label="Edit College"
                        onClick={() =>
                          handleEdit(college)
                        }
                        className={`${actionButton} border-orange-200 bg-orange-50 text-accent hover:bg-accent hover:text-white`}
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
                        >
                          <path d="m16 4 4 4M4 20l4-.8L19 8a2.1 2.1 0 0 0-3-3L5 16l-1 4Z" />
                        </svg>
                      </button>

                      {/* DELETE */}
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
                  colSpan="8"
                  className="px-4 py-10 text-center text-muted"
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
              <h2 className="text-2xl font-bold text-brand">
                {editId
                  ? "Edit College"
                  : "Add College"}
              </h2>

              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditId(null);
                }}
                className="text-2xl text-gray-500 hover:text-red-500"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSubmit}>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

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

                {/* SHORT NAME */}
                <div>
                  <label className={labelClass}>
                    Short Name
                  </label>

                  <input
                    type="text"
                    name="logo"
                    value={formData.logo}
                    onChange={handleChange}
                    className={inputClass}
                    placeholder="Enter short name"
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
                    <option value="government">
                      Government
                    </option>

                    <option value="private">
                      Private
                    </option>

                    <option value="deemed">
                      Deemed
                    </option>

                    <option value="autonomous">
                      Autonomous
                    </option>

                    <option value="public">
                      Public
                    </option>
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
                    University
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
                    type="url"
                    name="website"
                    value={formData.website}
                    onChange={handleChange}
                    className={inputClass}
                    placeholder="https://example.com"
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

              </div>

              <div className="mt-6 flex justify-end gap-3">

                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditId(null);
                  }}
                  className="rounded-lg border border-line px-5 py-2"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="rounded-lg bg-brand px-5 py-2 font-medium text-white hover:bg-brand-dark"
                >
                  {editId
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

              <h2 className="text-xl font-bold text-brand-dark">
                College Details
              </h2>

              <button
                onClick={() =>
                  setViewCollege(null)
                }
                className="text-2xl text-muted"
              >
                &times;
              </button>

            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

              <p>
                <b>Name:</b> {viewCollege.name || "-"}
              </p>

              <p>
                <b>Slug:</b> {viewCollege.slug || "-"}
              </p>

              <p>
                <b>Type:</b>{" "}
                {viewCollege.collegeType || "-"}
              </p>

              <p>
                <b>Ownership:</b>{" "}
                {viewCollege.ownership || "-"}
              </p>

              <p>
                <b>Established:</b>{" "}
                {viewCollege.establishedYear || "-"}
              </p>

              <p>
                <b>Email:</b>{" "}
                {viewCollege.contact?.email || "-"}
              </p>

              <p>
                <b>Phone:</b>{" "}
                {viewCollege.contact?.phone || "-"}
              </p>

              <p>
                <b>Website:</b>{" "}
                {viewCollege.website || "-"}
              </p>

              <p>
                <b>Address:</b>{" "}
                {viewCollege.location?.address || "-"}
              </p>

              <p>
                <b>City:</b>{" "}
                {viewCollege.location?.city || "-"}
              </p>

              <p>
                <b>State:</b>{" "}
                {viewCollege.location?.state || "-"}
              </p>

              <p>
                <b>Country:</b>{" "}
                {viewCollege.location?.country || "-"}
              </p>

              <p>
                <b>Pincode:</b>{" "}
                {viewCollege.location?.pincode || "-"}
              </p>

              <p>
                <b>Status:</b>{" "}
                {viewCollege.status || "-"}
              </p>

              <p>
                <b>Verified:</b>{" "}
                {viewCollege.isVerified ? "Yes" : "No"}
              </p>

              <p>
                <b>Rating:</b>{" "}
                {viewCollege.rating?.average ?? 0}
              </p>

            </div>

            <button
              onClick={() =>
                setViewCollege(null)
              }
              className="mt-6 rounded-lg bg-brand px-5 py-2.5 text-sm font-semibold text-white"
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