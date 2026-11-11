import { useState, useEffect } from "react";
import { API } from "../api/axios";

const emptyForm = {
  portalName: "",
  portalDescription: "",
  supportEmail: "",
  supportPhone: "",
  address: "",
  websiteUrl: "",
  academicSession: "",
  maintenanceMode: false,
};

function Settings() {
  const [formData, setFormData] = useState({ ...emptyForm });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Fetch previously saved settings
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await API.get("/setting");

        const savedSettings = response.data.data;

        if (response.data.success && savedSettings) {
          setFormData({
            ...emptyForm,
            ...savedSettings,
          });
        }
      } catch (error) {
        console.log("Fetch Settings Error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle maintenance toggle
  const handleToggle = () => {
    setFormData((prev) => ({
      ...prev,
      maintenanceMode: !prev.maintenanceMode,
    }));
  };

  // Save settings
  const handleSave = async () => {
    try {
      setSaving(true);

      const response = await API.put("/setting", formData);

      if (response.data.success) {
        // Clear all inputs immediately after successful save
        setFormData({ ...emptyForm });

        alert("Settings saved successfully!");
      } else {
        alert(response.data.message || "Failed to save settings");
      }
    } catch (error) {
      console.log("Save Settings Error:", error);

      alert(
        error.response?.data?.message || "Failed to save settings"
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <p className="text-gray-500">Loading settings...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Page Heading */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          Settings
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          Manage your portal and system settings
        </p>
      </div>

      {/* Portal Information */}
      <div className="mb-6 rounded-xl bg-white p-6 shadow-sm">
        <h2 className="mb-5 text-lg font-semibold text-gray-800">
          Portal Information
        </h2>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium">
              Portal Name
            </label>

            <input
              type="text"
              name="portalName"
              value={formData.portalName}
              onChange={handleChange}
              placeholder="Enter portal name"
              className="w-full rounded-lg border border-gray-300 px-4 py-2 outline-none focus:border-green-600"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Academic Session
            </label>

            <input
              type="text"
              name="academicSession"
              value={formData.academicSession}
              onChange={handleChange}
              placeholder="2026-27"
              className="w-full rounded-lg border border-gray-300 px-4 py-2 outline-none focus:border-green-600"
            />
          </div>

          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-medium">
              Portal Description
            </label>

            <textarea
              name="portalDescription"
              value={formData.portalDescription}
              onChange={handleChange}
              placeholder="Enter portal description"
              rows="3"
              className="w-full rounded-lg border border-gray-300 px-4 py-2 outline-none focus:border-green-600"
            />
          </div>
        </div>
      </div>

      {/* Contact Information */}
      <div className="mb-6 rounded-xl bg-white p-6 shadow-sm">
        <h2 className="mb-5 text-lg font-semibold text-gray-800">
          Contact Information
        </h2>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium">
              Support Email
            </label>

            <input
              type="email"
              name="supportEmail"
              value={formData.supportEmail}
              onChange={handleChange}
              placeholder="Enter support email"
              className="w-full rounded-lg border border-gray-300 px-4 py-2 outline-none focus:border-green-600"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Support Phone
            </label>

            <input
              type="text"
              name="supportPhone"
              value={formData.supportPhone}
              onChange={handleChange}
              placeholder="Enter support phone"
              className="w-full rounded-lg border border-gray-300 px-4 py-2 outline-none focus:border-green-600"
            />
          </div>

          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-medium">
              Address
            </label>

            <textarea
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="Enter address"
              rows="3"
              className="w-full rounded-lg border border-gray-300 px-4 py-2 outline-none focus:border-green-600"
            />
          </div>
        </div>
      </div>

      {/* Other Settings */}
      <div className="rounded-xl bg-white p-6 shadow-sm">
        <h2 className="mb-5 text-lg font-semibold text-gray-800">
          Other Settings
        </h2>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium">
              Website URL
            </label>

            <input
              type="text"
              name="websiteUrl"
              value={formData.websiteUrl}
              onChange={handleChange}
              placeholder="https://example.com"
              className="w-full rounded-lg border border-gray-300 px-4 py-2 outline-none focus:border-green-600"
            />
          </div>

          <div className="flex items-center justify-between rounded-lg border border-gray-200 px-4 py-3">
            <div>
              <p className="font-medium text-gray-800">
                Maintenance Mode
              </p>

              <p className="text-sm text-gray-500">
                Enable maintenance mode for the portal
              </p>
            </div>

            <button
              type="button"
              onClick={handleToggle}
              className={`relative h-7 w-12 rounded-full transition ${
                formData.maintenanceMode
                  ? "bg-green-600"
                  : "bg-gray-300"
              }`}
            >
              <span
                className={`absolute top-1 h-5 w-5 rounded-full bg-white transition ${
                  formData.maintenanceMode
                    ? "left-6"
                    : "left-1"
                }`}
              />
            </button>
          </div>
        </div>

        {/* Save Button */}
        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="rounded-lg bg-green-600 px-6 py-2.5 font-medium text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default Settings;