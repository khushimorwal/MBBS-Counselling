
import { useEffect, useMemo, useState } from "react";
import { API } from "../api/axios.js";
import { toast } from "react-toastify";
import { Eye, Pencil, Trash2, RefreshCw, Package, CheckCircle } from "lucide-react";

function Packages() {
  const role = localStorage.getItem("role");

  const [packages, setPackages] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [viewPackage, setViewPackage] = useState(null);
  const [editId, setEditId] = useState(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [processingId, setProcessingId] = useState(null);

  const initialFormData = {
    name: "",
    price: "",
    duration: "",
    durationType: "Months",
    features: "",
    description: "",
    status: "Active",
  };

  const [formData, setFormData] = useState(initialFormData);

  // THEME CLASSES
  const inputClass =
    "w-full rounded-lg border border-[#9DBDBA] bg-white px-3 py-2.5 text-sm text-[#0B2B2A] outline-none placeholder:text-[#4B6463] focus:border-teal-700 focus:ring-2 focus:ring-teal-200";

  const labelClass =
    "mb-1.5 block text-sm font-medium text-[#0B2B2A]";

  const actionButton =
    "inline-flex h-9 w-9 items-center justify-center rounded-lg border transition";

  // FETCH PACKAGES
  const fetchPackages = async () => {
    try {
      setLoading(true);

      const response = await API.get("/packages/all");

      const packageList =
        response.data?.packages ||
        response.data?.data ||
        [];

      setPackages(Array.isArray(packageList) ? packageList : []);
    } catch (error) {
      console.error("Fetch packages error:", error);

      toast.error(
        error.response?.data?.message ||
        "Failed to fetch packages."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPackages();
  }, []);

  // HANDLE INPUT
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // RESET FORM
  const resetForm = () => {
    setFormData({ ...initialFormData });
    setEditId(null);
    setShowForm(false);
  };

  // ADD PACKAGE
  const handleAdd = () => {
    setEditId(null);
    setFormData({ ...initialFormData });
    setShowForm(true);
  };

  // SAVE / UPDATE PACKAGE
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (saving) return;

    const price = Number(formData.price);
    const duration = Number(formData.duration);

    if (!formData.name.trim()) {
      toast.error("Package name is required.");
      return;
    }

    if (!Number.isFinite(price) || price < 0) {
      toast.error("Please enter a valid package price.");
      return;
    }

    if (!Number.isInteger(duration) || duration < 1) {
      toast.error("Duration must be at least 1.");
      return;
    }

    const features = formData.features
      .split("\n")
      .map((item) => item.trim())
      .filter(Boolean);

    if (features.length === 0) {
      toast.error("Please add at least one package feature.");
      return;
    }

    const data = {
      name: formData.name.trim(),
      price,
      duration,
      durationType: formData.durationType,
      features,
      description: formData.description.trim(),
      status: formData.status,
    };

    try {
      setSaving(true);

      if (editId) {
        await API.put(`/packages/update/${editId}`, data);
        toast.success("Package updated successfully!");
      } else {
        await API.post("/packages/create", data);
        toast.success("Package created successfully!");
      }

      resetForm();
      await fetchPackages();
    } catch (error) {
      console.error("Save package error:", error);

      toast.error(
        error.response?.data?.message ||
        "Failed to save package."
      );
    } finally {
      setSaving(false);
    }
  };

  // EDIT PACKAGE
  const handleEdit = (item) => {
    setEditId(item._id);

    setFormData({
      name: item.name || "",
      price: item.price ?? "",
      duration: item.duration ?? "",
      durationType: item.durationType || "Months",
      features: Array.isArray(item.features)
        ? item.features.join("\n")
        : "",
      description: item.description || "",
      status: item.status || "Active",
    });

    setShowForm(true);
  };

  // DELETE PACKAGE
  const handleDelete = async (id) => {
    if (role !== "Super Admin") {
      toast.error("Only Super Admin can delete packages.");
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to delete this package?"
    );

    if (!confirmed) return;

    try {
      setProcessingId(id);

      await API.delete(`/packages/delete/${id}`);

      toast.success("Package deleted successfully!");

      await fetchPackages();
    } catch (error) {
      console.error("Delete package error:", error);

      toast.error(
        error.response?.data?.message ||
        "Failed to delete package."
      );
    } finally {
      setProcessingId(null);
    }
  };

  // TOGGLE STATUS
  const handleStatusToggle = async (item) => {
    if (processingId) return;

    const newStatus =
      item.status === "Active" ? "Inactive" : "Active";

    try {
      setProcessingId(item._id);

      await API.put(`/packages/update/${item._id}`, {
        status: newStatus,
      });

      setPackages((prev) =>
        prev.map((pkg) =>
          pkg._id === item._id
            ? { ...pkg, status: newStatus }
            : pkg
        )
      );

      toast.success(
        `Package ${newStatus.toLowerCase()} successfully!`
      );
    } catch (error) {
      console.error("Status update error:", error);

      toast.error(
        error.response?.data?.message ||
        "Failed to update package status."
      );
    } finally {
      setProcessingId(null);
    }
  };

  // SEARCH FILTER
  const filteredPackages = useMemo(() => {
    const value = search.trim().toLowerCase();

    if (!value) return packages;

    return packages.filter((item) => {
      const searchableData = [
        item.name,
        item.description,
        item.status,
        item.durationType,
        item.price,
        ...(item.features || []),
      ]
        .join(" ")
        .toLowerCase();

      return searchableData.includes(value);
    });
  }, [packages, search]);

  const activeCount = packages.filter(
    (item) => item.status === "Active"
  ).length;

  const formatPrice = (price) =>
    Number(price || 0).toLocaleString("en-IN");

  return (
    <div className="min-w-0 space-y-6">

      {/* PAGE HEADER */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#0B2B2A]">
            Packages
          </h1>

          <p className="mt-1 text-sm text-[#3F5A58]">
            Manage counselling packages, pricing and features.
          </p>
        </div>

        <button
          type="button"
          onClick={handleAdd}
          className="rounded-xl bg-teal-700 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-teal-800"
        >
          + Add Package
        </button>
      </div>

      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

        <div className="rounded-2xl border border-white bg-white/70 p-5 shadow-[0_4px_24px_rgba(15,118,110,0.08)] backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-[#3F5A58]">
                Total Packages
              </p>

              <h2 className="mt-2 text-3xl font-bold text-[#0B2B2A]">
                {packages.length}
              </h2>
            </div>

            <div className="rounded-xl bg-[#E2F2EF] p-3 text-teal-700">
              <Package size={25} />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-white bg-white/70 p-5 shadow-[0_4px_24px_rgba(15,118,110,0.08)] backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-[#3F5A58]">
                Active Packages
              </p>

              <h2 className="mt-2 text-3xl font-bold text-teal-700">
                {activeCount}
              </h2>
            </div>

            <div className="rounded-xl bg-[#E2F2EF] p-3 text-teal-700">
              <CheckCircle size={25} />
            </div>
          </div>
        </div>

      </div>

      {/* SEARCH AND REFRESH */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <input
          type="text"
          placeholder="Search package by name, price or feature..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-md rounded-xl border border-[#9DBDBA] bg-white/80 px-4 py-2.5 text-sm text-[#0B2B2A] outline-none placeholder:text-[#4B6463] focus:border-teal-700 focus:ring-2 focus:ring-teal-200"
        />

        <button
          type="button"
          onClick={fetchPackages}
          disabled={loading}
          className="flex items-center gap-2 rounded-xl border border-[#CFE5E2] bg-white px-4 py-2.5 text-sm font-medium text-[#0B2B2A] transition hover:bg-[#F1F8F7] disabled:opacity-50"
        >
          <RefreshCw size={16} />
          {loading ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {/* PACKAGES TABLE */}
      <div className="overflow-x-auto rounded-2xl border border-white bg-white/65 text-[#0B2B2A] shadow-[0_4px_24px_rgba(15,118,110,0.08)] backdrop-blur-xl">

        <table className="w-full min-w-[850px] text-left text-sm">

          <thead className="bg-[#F1F8F7] text-[11px] font-bold uppercase tracking-wider text-[#3F5A58]">
            <tr>
              <th className="px-4 py-4">Package Name</th>
              <th className="px-4 py-4">Price</th>
              <th className="px-4 py-4">Duration</th>
              <th className="px-4 py-4">Features</th>
              <th className="px-4 py-4">Status</th>
              <th className="px-4 py-4">Actions</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan="6"
                  className="px-4 py-10 text-center text-[#3F5A58]"
                >
                  Loading packages...
                </td>
              </tr>
            ) : filteredPackages.length > 0 ? (
              filteredPackages.map((item) => (
                <tr
                  key={item._id}
                  className="border-t border-[#CFE5E2] transition hover:bg-teal-50/70"
                >
                  <td className="px-4 py-4 font-semibold text-[#0B2B2A]">
                    {item.name}
                  </td>

                  <td className="px-4 py-4 font-semibold">
                    ₹{formatPrice(item.price)}
                  </td>

                  <td className="px-4 py-4">
                    {item.duration} {item.durationType}
                  </td>

                  <td className="px-4 py-4">
                    <span className="rounded-lg bg-[#E2F2EF] px-3 py-1.5 text-xs font-semibold text-teal-800">
                      {item.features?.length || 0} Features
                    </span>
                  </td>

                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">

                      <button
                        type="button"
                        disabled={processingId === item._id}
                        onClick={() => handleStatusToggle(item)}
                        aria-label={`Change ${item.name} status`}
                        className={`relative h-6 w-11 rounded-full transition disabled:opacity-50 ${
                          item.status === "Active"
                            ? "bg-teal-700"
                            : "bg-gray-300"
                        }`}
                      >
                        <span
                          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${
                            item.status === "Active"
                              ? "left-[22px]"
                              : "left-0.5"
                          }`}
                        />
                      </button>

                      <span
                        className={`text-xs font-medium ${
                          item.status === "Active"
                            ? "text-teal-700"
                            : "text-gray-500"
                        }`}
                      >
                        {item.status}
                      </span>

                    </div>
                  </td>

                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">

                      <button
                        type="button"
                        title="View Package"
                        onClick={() => setViewPackage(item)}
                        className={`${actionButton} border-teal-200 bg-teal-50 text-teal-700 hover:bg-teal-700 hover:text-white`}
                      >
                        <Eye size={17} />
                      </button>

                      <button
                        type="button"
                        title="Edit Package"
                        onClick={() => handleEdit(item)}
                        className={`${actionButton} border-[#CFE5E2] bg-white text-[#3F5A58] hover:bg-[#0B2B2A] hover:text-white`}
                      >
                        <Pencil size={17} />
                      </button>

                      {role === "Super Admin" && (
                        <button
                          type="button"
                          title="Delete Package"
                          disabled={processingId === item._id}
                          onClick={() => handleDelete(item._id)}
                          className={`${actionButton} border-red-200 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white disabled:opacity-50`}
                        >
                          <Trash2 size={17} />
                        </button>
                      )}

                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="6"
                  className="px-4 py-10 text-center text-[#3F5A58]"
                >
                  {search
                    ? "No matching packages found."
                    : "No packages found. Click Add Package to create one."}
                </td>
              </tr>
            )}
          </tbody>

        </table>
      </div>

      {/* ADD / EDIT MODAL */}
      {showForm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget && !saving) {
              resetForm();
            }
          }}
        >
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-[#CFE5E2] bg-white p-6 shadow-2xl">

            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-[#0B2B2A]">
                  {editId ? "Edit Package" : "Add Package"}
                </h2>

                <p className="mt-1 text-sm text-[#3F5A58]">
                  Enter package details below.
                </p>
              </div>

              <button
                type="button"
                disabled={saving}
                onClick={resetForm}
                className="text-2xl text-[#3F5A58] transition hover:text-red-600 disabled:opacity-50"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSubmit}>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

                {/* PACKAGE NAME */}
                <div>
                  <label className={labelClass}>
                    Package Name *
                  </label>

                  <input
                    type="text"
                    name="name"
                    required
                    maxLength={100}
                    value={formData.name}
                    onChange={handleChange}
                    className={inputClass}
                    placeholder="e.g. Basic Counselling"
                  />
                </div>

                {/* PRICE */}
                <div>
                  <label className={labelClass}>
                    Price (₹) *
                  </label>

                  <input
                    type="number"
                    name="price"
                    min="0"
                    step="0.01"
                    required
                    value={formData.price}
                    onChange={handleChange}
                    className={inputClass}
                    placeholder="Enter price"
                  />
                </div>

                {/* DURATION */}
                <div>
                  <label className={labelClass}>
                    Duration *
                  </label>

                  <input
                    type="number"
                    name="duration"
                    min="1"
                    step="1"
                    required
                    value={formData.duration}
                    onChange={handleChange}
                    className={inputClass}
                    placeholder="Enter duration"
                  />
                </div>

                {/* DURATION TYPE */}
                <div>
                  <label className={labelClass}>
                    Duration Type *
                  </label>

                  <select
                    name="durationType"
                    value={formData.durationType}
                    onChange={handleChange}
                    className={inputClass}
                  >
                    <option value="Days">Days</option>
                    <option value="Months">Months</option>
                    <option value="Years">Years</option>
                  </select>
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
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>

                {/* DESCRIPTION */}
                <div className="md:col-span-2">
                  <label className={labelClass}>
                    Description
                  </label>

                  <textarea
                    name="description"
                    rows="3"
                    maxLength={1000}
                    value={formData.description}
                    onChange={handleChange}
                    className={`${inputClass} resize-y`}
                    placeholder="Enter package description"
                  />
                </div>

                {/* FEATURES */}
                <div className="md:col-span-2">
                  <label className={labelClass}>
                    Package Features *
                  </label>

                  <textarea
                    name="features"
                    rows="5"
                    required
                    value={formData.features}
                    onChange={handleChange}
                    className={`${inputClass} resize-y`}
                    placeholder={"Enter one feature per line\nCollege Information\nCounselling Guidance\nBasic Support"}
                  />

                  <p className="mt-1 text-xs text-[#3F5A58]">
                    Enter each feature on a separate line.
                  </p>
                </div>

              </div>

              {/* FORM BUTTONS */}
              <div className="mt-6 flex justify-end gap-3 border-t border-[#CFE5E2] pt-5">

                <button
                  type="button"
                  disabled={saving}
                  onClick={resetForm}
                  className="rounded-lg border border-[#CFE5E2] px-5 py-2.5 text-sm font-medium text-[#3F5A58] transition hover:bg-[#F1F8F7] disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-lg bg-teal-700 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving
                    ? "Saving..."
                    : editId
                    ? "Update Package"
                    : "Save Package"}
                </button>

              </div>

            </form>
          </div>
        </div>
      )}

      {/* VIEW PACKAGE MODAL */}
      {viewPackage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setViewPackage(null);
            }
          }}
        >
          <div className="max-h-[85vh] w-full max-w-xl overflow-y-auto rounded-2xl border border-[#CFE5E2] bg-white p-6 shadow-2xl">

            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-[#0B2B2A]">
                  Package Details
                </h2>

                <p className="mt-1 text-sm text-[#3F5A58]">
                  View complete package information.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setViewPackage(null)}
                className="text-2xl text-[#3F5A58] transition hover:text-red-600"
              >
                &times;
              </button>
            </div>

            <div className="space-y-4">

              <div className="rounded-xl bg-[#F1F8F7] p-4">
                <p className="text-xs font-medium text-[#3F5A58]">
                  Package Name
                </p>

                <p className="mt-1 text-lg font-bold text-[#0B2B2A]">
                  {viewPackage.name}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">

                <div className="rounded-xl border border-[#CFE5E2] p-4">
                  <p className="text-xs text-[#3F5A58]">
                    Price
                  </p>

                  <p className="mt-1 text-lg font-bold text-teal-700">
                    ₹{formatPrice(viewPackage.price)}
                  </p>
                </div>

                <div className="rounded-xl border border-[#CFE5E2] p-4">
                  <p className="text-xs text-[#3F5A58]">
                    Duration
                  </p>

                  <p className="mt-1 font-semibold text-[#0B2B2A]">
                    {viewPackage.duration} {viewPackage.durationType}
                  </p>
                </div>

              </div>

              <div>
                <p className="mb-1 text-xs font-medium text-[#3F5A58]">
                  Status
                </p>

                <span
                  className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${
                    viewPackage.status === "Active"
                      ? "bg-teal-100 text-teal-800"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {viewPackage.status}
                </span>
              </div>

              <div>
                <p className="mb-1 text-xs font-medium text-[#3F5A58]">
                  Description
                </p>

                <p className="text-sm text-[#0B2B2A]">
                  {viewPackage.description || "-"}
                </p>
              </div>

              <div>
                <p className="mb-3 text-xs font-medium text-[#3F5A58]">
                  Package Features
                </p>

                <ul className="space-y-2">
                  {viewPackage.features?.length > 0 ? (
                    viewPackage.features.map((feature, index) => (
                      <li
                        key={index}
                        className="flex items-start gap-2 rounded-lg bg-[#F1F8F7] p-3 text-sm text-[#0B2B2A]"
                      >
                        <CheckCircle
                          size={17}
                          className="mt-0.5 shrink-0 text-teal-700"
                        />

                        {feature}
                      </li>
                    ))
                  ) : (
                    <li className="text-sm text-[#3F5A58]">
                      No features added.
                    </li>
                  )}
                </ul>
              </div>

            </div>

            <div className="mt-6 flex justify-end border-t border-[#CFE5E2] pt-5">
              <button
                type="button"
                onClick={() => setViewPackage(null)}
                className="rounded-lg bg-teal-700 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-teal-800"
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

export default Packages;
