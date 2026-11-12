
import { useEffect, useMemo, useState } from "react";
import { API } from "../api/axios.js";
import { toast } from "react-toastify";

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

  const inputClass =
    "w-full rounded-lg border border-line bg-white px-3 py-2.5 text-sm outline-none focus:border-brand";

  const labelClass =
    "mb-1.5 block text-sm font-medium text-brand-dark";

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

  // OPEN ADD FORM
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
          <h1 className="text-2xl font-bold text-brand-dark">
            Packages
          </h1>

          <p className="mt-1 text-sm text-muted">
            Manage counselling packages, pricing and features.
          </p>
        </div>

        <button
          type="button"
          onClick={handleAdd}
          className="rounded-xl bg-accent px-5 py-2.5 text-sm font-bold text-white transition hover:bg-[#cf4a24]"
        >
          + Add Package
        </button>
      </div>

      {/* SUMMARY */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-line bg-white p-5">
          <p className="text-sm text-muted">Total Packages</p>
          <h2 className="mt-2 text-2xl font-bold text-brand-dark">
            {packages.length}
          </h2>
        </div>

        <div className="rounded-xl border border-line bg-white p-5">
          <p className="text-sm text-muted">Active Packages</p>
          <h2 className="mt-2 text-2xl font-bold text-green-600">
            {activeCount}
          </h2>
        </div>
      </div>

      {/* SEARCH */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <input
          type="text"
          placeholder="Search package by name, price or feature..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-md rounded-xl border border-line bg-white px-4 py-2.5 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/15"
        />

        <button
          type="button"
          onClick={fetchPackages}
          disabled={loading}
          className="rounded-lg border border-line bg-white px-4 py-2.5 text-sm font-medium hover:bg-surface disabled:opacity-50"
        >
          {loading ? "Refreshing..." : "↻ Refresh"}
        </button>
      </div>

      {/* PACKAGES TABLE */}
      <div className="overflow-x-auto rounded-2xl border border-line bg-white">
        <table className="w-full min-w-[850px] text-left text-sm">
          <thead className="bg-[#F9FBFA] text-[11px] font-bold uppercase tracking-wider text-muted">
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
                <td colSpan="6" className="px-4 py-10 text-center text-muted">
                  Loading packages...
                </td>
              </tr>
            ) : filteredPackages.length > 0 ? (
              filteredPackages.map((item) => (
                <tr
                  key={item._id}
                  className="border-t border-line hover:bg-surface/70"
                >
                  <td className="px-4 py-4 font-semibold text-brand-dark">
                    {item.name}
                  </td>

                  <td className="px-4 py-4 font-semibold">
                    ₹{formatPrice(item.price)}
                  </td>

                  <td className="px-4 py-4">
                    {item.duration} {item.durationType}
                  </td>

                  <td className="px-4 py-4">
                    {item.features?.length || 0} Features
                  </td>

                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        disabled={processingId === item._id}
                        onClick={() => handleStatusToggle(item)}
                        aria-label={`Change ${item.name} status`}
                        className={`relative h-7 w-12 rounded-full transition disabled:opacity-50 ${
                          item.status === "Active"
                            ? "bg-brand"
                            : "bg-gray-300"
                        }`}
                      >
                        <span
                          className={`absolute top-1 h-5 w-5 rounded-full bg-white transition ${
                            item.status === "Active"
                              ? "left-6"
                              : "left-1"
                          }`}
                        />
                      </button>

                      <span className="text-xs text-muted">
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
                        className={`${actionButton} border-brand/20 bg-brand-soft text-brand hover:bg-brand hover:text-white`}
                      >
                        👁
                      </button>

                      <button
                        type="button"
                        title="Edit Package"
                        onClick={() => handleEdit(item)}
                        className={`${actionButton} border-orange-200 bg-orange-50 text-accent hover:bg-accent hover:text-white`}
                      >
                        ✎
                      </button>

                      {role === "Super Admin" && (
                        <button
                          type="button"
                          title="Delete Package"
                          disabled={processingId === item._id}
                          onClick={() => handleDelete(item._id)}
                          className={`${actionButton} border-red-200 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white disabled:opacity-50`}
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="px-4 py-10 text-center text-muted">
                  No packages found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ADD / EDIT MODAL */}
      {showForm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget && !saving) {
              resetForm();
            }
          }}
        >
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">

            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-brand">
                  {editId ? "Edit Package" : "Add Package"}
                </h2>

                <p className="mt-1 text-sm text-muted">
                  Enter package details below.
                </p>
              </div>

              <button
                type="button"
                disabled={saving}
                onClick={resetForm}
                className="text-2xl text-gray-500 hover:text-red-500 disabled:opacity-50"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

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
                    className={inputClass}
                    placeholder="Enter package description"
                  />
                </div>

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
                    className={inputClass}
                    placeholder={"Enter one feature per line\nCollege Information\nCounselling Guidance\nBasic Support"}
                  />

                  <p className="mt-1 text-xs text-muted">
                    Enter each feature on a separate line.
                  </p>
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  disabled={saving}
                  onClick={resetForm}
                  className="rounded-lg border border-line px-5 py-2 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-lg bg-brand px-5 py-2 font-medium text-white hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-60"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[85vh] w-full max-w-xl overflow-y-auto rounded-2xl bg-white p-6">

            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-xl font-bold text-brand-dark">
                Package Details
              </h2>

              <button
                type="button"
                onClick={() => setViewPackage(null)}
                className="text-2xl text-muted"
              >
                &times;
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-xs text-muted">Package Name</p>
                <p className="font-semibold text-brand-dark">
                  {viewPackage.name}
                </p>
              </div>

              <div>
                <p className="text-xs text-muted">Price</p>
                <p className="font-semibold">
                  ₹{formatPrice(viewPackage.price)}
                </p>
              </div>

              <div>
                <p className="text-xs text-muted">Duration</p>
                <p>
                  {viewPackage.duration} {viewPackage.durationType}
                </p>
              </div>

              <div>
                <p className="text-xs text-muted">Status</p>
                <p>{viewPackage.status}</p>
              </div>

              <div>
                <p className="text-xs text-muted">Description</p>
                <p>{viewPackage.description || "-"}</p>
              </div>

              <div>
                <p className="mb-2 text-xs text-muted">
                  Package Features
                </p>

                <ul className="space-y-2">
                  {viewPackage.features?.length > 0 ? (
                    viewPackage.features.map((feature, index) => (
                      <li
                        key={index}
                        className="flex items-start gap-2 text-sm"
                      >
                        <span className="text-brand">✓</span>
                        {feature}
                      </li>
                    ))
                  ) : (
                    <li className="text-sm text-muted">
                      No features added.
                    </li>
                  )}
                </ul>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setViewPackage(null)}
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

export default Packages;
