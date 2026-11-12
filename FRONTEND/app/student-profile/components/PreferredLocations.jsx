
"use client";

import { useEffect, useState } from "react";

const API_URL = "http://localhost:3000";

const emptyForm = {
  country: "India",
  state: "",
  city: "",
  locationType: "",
  priority: "",
};

const indianStates = [
  "Andhra Pradesh",
  "Assam",
  "Bihar",
  "Chandigarh",
  "Chhattisgarh",
  "Delhi",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
];

export default function PreferredLocations() {
  const [locations, setLocations] = useState([]);
  const [form, setForm] = useState(emptyForm);

  const [showForm, setShowForm] = useState(false);
  const [editIndex, setEditIndex] = useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const inputClass =
    "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500";

  // Fetch saved locations for the logged-in student.
  const fetchLocations = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("Please login again.");
      }

      const response = await fetch(`${API_URL}/student-profile`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to fetch preferred locations.");
      }

      setLocations(data.profile?.preferredLocationDetails || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Load saved locations when the component mounts.
  useEffect(() => {
    fetchLocations();
  }, []);

  // Handle form input changes.
  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Save or update locations in MongoDB.
  const handleSave = async (e) => {
    e.preventDefault();

    // Prevent assigning the same priority to multiple locations.
    const duplicatePriority = locations.some(
      (location, index) =>
        location.priority === form.priority && index !== editIndex
    );

    if (duplicatePriority) {
      setError("This priority is already assigned to another location.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setMessage("");

      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("Please login again.");
      }

      const updatedLocation = {
        country: form.country,
        state: form.state,
        city: form.city,
        locationType: form.locationType,
        priority: form.priority,
      };

      const updatedLocations = [...locations];

      if (editIndex !== null) {
        updatedLocations[editIndex] = updatedLocation;
      } else {
        updatedLocations.push(updatedLocation);
      }

      const response = await fetch(`${API_URL}/student-profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          preferredLocationDetails: updatedLocations,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to save preferred location.");
      }

      setLocations(
        data.profile?.preferredLocationDetails || updatedLocations
      );

      setForm(emptyForm);
      setEditIndex(null);
      setShowForm(false);

      setMessage(
        editIndex !== null
          ? "Preferred location updated successfully!"
          : "Preferred location saved successfully!"
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  // Open the selected location in edit mode.
  const handleEdit = (index) => {
    const selectedLocation = locations[index];

    setForm({
      country: selectedLocation.country || "India",
      state: selectedLocation.state || "",
      city: selectedLocation.city || "",
      locationType: selectedLocation.locationType || "",
      priority: selectedLocation.priority || "",
    });

    setEditIndex(index);
    setShowForm(true);
    setError("");
    setMessage("");
  };

  // Delete the selected location from MongoDB.
  const handleDelete = async (index) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this preferred location?"
    );

    if (!confirmed) return;

    try {
      setSaving(true);
      setError("");
      setMessage("");

      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("Please login again.");
      }

      const updatedLocations = locations.filter(
        (_, i) => i !== index
      );

      const response = await fetch(`${API_URL}/student-profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          preferredLocationDetails: updatedLocations,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to delete preferred location.");
      }

      setLocations(
        data.profile?.preferredLocationDetails || updatedLocations
      );

      setMessage("Preferred location deleted successfully!");
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  // Reset the form and close it.
  const handleCancel = () => {
    setForm(emptyForm);
    setEditIndex(null);
    setShowForm(false);
    setError("");
  };

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">
            Preferred Locations
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Select your preferred states and counselling locations.
          </p>
        </div>

        <button
          type="button"
          disabled={saving}
          onClick={() => {
            setForm(emptyForm);
            setEditIndex(null);
            setShowForm(true);
            setError("");
            setMessage("");
          }}
          className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
        >
          + Add Location
        </button>
      </div>

      {/* SUCCESS MESSAGE */}
      {message && (
        <p className="rounded-lg bg-green-50 p-3 text-sm font-medium text-green-700">
          {message}
        </p>
      )}

      {/* ERROR MESSAGE */}
      {error && (
        <p className="rounded-lg bg-red-50 p-3 text-sm font-medium text-red-600">
          {error}
        </p>
      )}

      {/* ADD / EDIT FORM */}
      {showForm && (
        <form
          onSubmit={handleSave}
          className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6"
        >
          <h3 className="text-lg font-semibold text-slate-800">
            {editIndex !== null ? "Edit Location" : "Add Preferred Location"}
          </h3>

          <div className="grid gap-5 sm:grid-cols-2">

            {/* COUNTRY */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Country *
              </label>

              <select
                name="country"
                value={form.country}
                onChange={handleChange}
                className={inputClass}
                required
              >
                <option value="India">India</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* STATE */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                State *
              </label>

              <select
                name="state"
                value={form.state}
                onChange={handleChange}
                className={inputClass}
                required
              >
                <option value="">Select State</option>

                {indianStates.map((state) => (
                  <option key={state} value={state}>
                    {state}
                  </option>
                ))}

                <option value="Other">Other</option>
              </select>
            </div>

            {/* CITY */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                City
              </label>

              <input
                type="text"
                name="city"
                value={form.city}
                onChange={handleChange}
                placeholder="Enter city"
                className={inputClass}
              />
            </div>

            {/* LOCATION TYPE */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Preferred College Type *
              </label>

              <select
                name="locationType"
                value={form.locationType}
                onChange={handleChange}
                className={inputClass}
                required
              >
                <option value="">Select College Type</option>
                <option value="Government">Government</option>
                <option value="Private">Private</option>
                <option value="Both">Both</option>
              </select>
            </div>

            {/* PRIORITY */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Priority *
              </label>

              <select
                name="priority"
                value={form.priority}
                onChange={handleChange}
                className={inputClass}
                required
              >
                <option value="">Select Priority</option>
                <option value="1st Preference">1st Preference</option>
                <option value="2nd Preference">2nd Preference</option>
                <option value="3rd Preference">3rd Preference</option>
                <option value="4th Preference">4th Preference</option>
                <option value="5th Preference">5th Preference</option>
              </select>
            </div>

          </div>

          {/* FORM BUTTONS */}
          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={saving}
              className="rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
            >
              {saving
                ? "Saving..."
                : editIndex !== null
                  ? "Update Location"
                  : "Save Location"}
            </button>

            <button
              type="button"
              onClick={handleCancel}
              disabled={saving}
              className="rounded-xl border border-slate-300 px-6 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* SAVED LOCATIONS */}
      {loading ? (
        <div className="rounded-2xl border border-slate-200 bg-white py-12 text-center text-slate-500">
          Loading preferred locations...
        </div>
      ) : locations.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
          <div className="mb-3 text-3xl">📍</div>

          <h3 className="font-semibold text-slate-700">
            No preferred locations added yet
          </h3>

          <p className="mt-2 text-sm text-slate-500">
            Click on Add Location to select your preferred counselling locations.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">

          {locations.map((location, index) => (
            <div
              key={location._id || index}
              className="rounded-2xl border border-slate-200 bg-white p-5"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-lg font-bold text-slate-800">
                    {location.state}
                  </h3>

                  <p className="mt-1 text-sm text-slate-500">
                    {location.city
                      ? `${location.city}, ${location.country}`
                      : location.country}
                  </p>
                </div>

                <span className="rounded-lg bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-700">
                  {location.priority}
                </span>
              </div>

              <div className="mt-5 border-t border-slate-100 pt-4">
                <p className="text-xs text-slate-500">
                  Preferred College Type
                </p>

                <p className="mt-1 text-sm font-medium text-slate-700">
                  {location.locationType}
                </p>
              </div>

              <div className="mt-4 flex justify-end gap-4 border-t border-slate-100 pt-4">
                <button
                  type="button"
                  onClick={() => handleEdit(index)}
                  disabled={saving}
                  className="text-sm font-semibold text-blue-600 hover:text-blue-700 disabled:opacity-50"
                >
                  Edit
                </button>

                <button
                  type="button"
                  onClick={() => handleDelete(index)}
                  disabled={saving}
                  className="text-sm font-semibold text-red-500 hover:text-red-600 disabled:opacity-50"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}

        </div>
      )}
    </div>
  );
}
