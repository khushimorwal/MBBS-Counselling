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

// Shared classes (same as College page)
const inputClass =
  "w-full rounded-lg border border-[#9DBDBA] bg-white px-3 py-2.5 text-sm text-[#0B2B2A] outline-none placeholder:text-[#4B6463] focus:border-teal-700 focus:ring-2 focus:ring-teal-200";

const labelClass = "mb-1.5 block text-sm font-medium text-[#0B2B2A]";

const glassCard =
  "rounded-2xl border border-white bg-white/65 p-6 text-[#0B2B2A] shadow-[0_4px_24px_rgba(15,118,110,0.08)] backdrop-blur-xl";

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
        // Keep the saved settings in the form instead of clearing them to blank
        if (response.data.data) {
          setFormData(response.data.data);
        }

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
        <p className="text-[#3F5A58]">Loading settings...</p>
      </div>
    );
  }

  return (
    <div className="min-w-0 space-y-6">

      {/* PAGE HEADER */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#0B2B2A]">
            Settings
          </h1>

          <p className="mt-1 text-sm text-[#3F5A58]">
            Manage your portal and system settings
          </p>
        </div>

        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="rounded-xl bg-teal-700 px-5 py-2.5 text-sm font-bold text-white hover:bg-teal-800 disabled:opacity-60"
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>

      {/* PORTAL INFORMATION */}
      <div className={glassCard}>
        <h2 className="mb-5 text-lg font-bold text-[#0B2B2A]">
          Portal Information
        </h2>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className={labelClass}>Portal Name</label>

            <input
              type="text"
              name="portalName"
              value={formData.portalName}
              onChange={handleChange}
              placeholder="Enter portal name"
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>Academic Session</label>

            <input
              type="text"
              name="academicSession"
              value={formData.academicSession}
              onChange={handleChange}
              placeholder="2026-27"
              className={inputClass}
            />
          </div>

          <div className="md:col-span-2">
            <label className={labelClass}>Portal Description</label>

            <textarea
              name="portalDescription"
              value={formData.portalDescription}
              onChange={handleChange}
              placeholder="Enter portal description"
              rows="3"
              className={inputClass}
            />
          </div>
        </div>
      </div>

      {/* CONTACT INFORMATION */}
      <div className={glassCard}>
        <h2 className="mb-5 text-lg font-bold text-[#0B2B2A]">
          Contact Information
        </h2>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className={labelClass}>Support Email</label>

            <input
              type="email"
              name="supportEmail"
              value={formData.supportEmail}
              onChange={handleChange}
              placeholder="Enter support email"
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>Support Phone</label>

            <input
              type="text"
              name="supportPhone"
              value={formData.supportPhone}
              onChange={handleChange}
              placeholder="Enter support phone"
              className={inputClass}
            />
          </div>

          <div className="md:col-span-2">
            <label className={labelClass}>Address</label>

            <textarea
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="Enter address"
              rows="3"
              className={inputClass}
            />
          </div>
        </div>
      </div>

      {/* OTHER SETTINGS */}
      <div className={glassCard}>
        <h2 className="mb-5 text-lg font-bold text-[#0B2B2A]">
          Other Settings
        </h2>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className={labelClass}>Website URL</label>

            <input
              type="text"
              name="websiteUrl"
              value={formData.websiteUrl}
              onChange={handleChange}
              placeholder="https://example.com"
              className={inputClass}
            />
          </div>

          <div className="flex items-center justify-between gap-4 rounded-xl border border-[#CFE5E2] bg-white px-4 py-3">
            <div>
              <p className="text-sm font-medium text-[#0B2B2A]">
                Maintenance Mode
              </p>

              <p className="text-xs text-[#3F5A58]">
                Enable maintenance mode for the portal
              </p>
            </div>

            <button
              type="button"
              role="switch"
              aria-checked={formData.maintenanceMode}
              aria-label="Toggle maintenance mode"
              onClick={handleToggle}
              className={`relative h-7 w-12 shrink-0 rounded-full transition ${formData.maintenanceMode ? "bg-teal-700" : "bg-slate-400"
                }`}
            >
              <span
                className={`absolute top-1 h-5 w-5 rounded-full bg-white transition ${formData.maintenanceMode ? "left-6" : "left-1"
                  }`}
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Settings;