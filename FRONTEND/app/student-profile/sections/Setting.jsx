"use client";

import { useState } from "react";
import {
  FiUser,
  FiMail,
  FiPhone,
  FiLock,
  FiBell,
  FiShield,
  FiSave,
  FiEye,
  FiEyeOff,
} from "react-icons/fi";

export default function Setting() {
  const [profile, setProfile] = useState({
    name: "Khushi Morwal",
    email: "khushi02.tech@gmail.com",
    phone: "",
    category: "ST",
  });

  const [preferences, setPreferences] = useState({
    notifications: true,
    applicationUpdates: true,
    counsellingAlerts: true,
    emailAlerts: false,
  });

  const [password, setPassword] = useState({
    current: "",
    new: "",
    confirm: "",
  });

  const [showPassword, setShowPassword] = useState(false);

  const handleProfileChange = (e) => {
    setProfile({
      ...profile,
      [e.target.name]: e.target.value,
    });
  };

  const handlePreferenceChange = (key) => {
    setPreferences((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleProfileSave = (e) => {
    e.preventDefault();
    alert("Profile changes saved successfully!");
  };

  const handlePasswordChange = (e) => {
    e.preventDefault();

    if (password.new !== password.confirm) {
      alert("New password and confirm password do not match.");
      return;
    }

    if (!password.current || !password.new) {
      alert("Please fill all password fields.");
      return;
    }

    alert("Password change request saved in UI!");
    setPassword({ current: "", new: "", confirm: "" });
  };

  const inputClass =
    "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100";

  return (
    <div className="min-h-screen space-y-7 bg-[#f8fafc] p-4 sm:p-6 lg:p-8">

      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-bold text-[#142653]">
          Settings
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Manage your account and preferences.
        </p>
      </div>

      {/* ACCOUNT SETTINGS */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">

        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-xl text-blue-600">
            <FiUser />
          </div>

          <div>
            <h2 className="text-lg font-bold text-[#142653]">
              Account Settings
            </h2>
            <p className="text-sm text-slate-500">
              Update your personal information.
            </p>
          </div>
        </div>

        <form onSubmit={handleProfileSave}>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

            <InputField
              label="Full Name"
              name="name"
              value={profile.name}
              onChange={handleProfileChange}
              icon={<FiUser />}
              inputClass={inputClass}
            />

            <InputField
              label="Email Address"
              name="email"
              type="email"
              value={profile.email}
              onChange={handleProfileChange}
              icon={<FiMail />}
              inputClass={inputClass}
            />

            <InputField
              label="Phone Number"
              name="phone"
              value={profile.phone}
              onChange={handleProfileChange}
              icon={<FiPhone />}
              inputClass={inputClass}
            />

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Category
              </label>

              <input
                value={profile.category}
                disabled
                className={`${inputClass} cursor-not-allowed bg-slate-50`}
              />
            </div>

          </div>

          <div className="mt-6 flex justify-end">
            <button
              type="submit"
              className="flex items-center gap-2 rounded-xl bg-teal-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-teal-700"
            >
              <FiSave />
              Save Changes
            </button>
          </div>
        </form>
      </section>

      {/* NOTIFICATION PREFERENCES */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">

        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-50 text-xl text-purple-600">
            <FiBell />
          </div>

          <div>
            <h2 className="text-lg font-bold text-[#142653]">
              Notification Preferences
            </h2>
            <p className="text-sm text-slate-500">
              Choose which updates you want to receive.
            </p>
          </div>
        </div>

        <div className="divide-y divide-slate-100">

          <ToggleRow
            title="All Notifications"
            description="Receive important account notifications."
            checked={preferences.notifications}
            onChange={() => handlePreferenceChange("notifications")}
          />

          <ToggleRow
            title="Application Updates"
            description="Get updates about your submitted applications."
            checked={preferences.applicationUpdates}
            onChange={() => handlePreferenceChange("applicationUpdates")}
          />

          <ToggleRow
            title="Counselling Alerts"
            description="Stay informed about counselling rounds and schedules."
            checked={preferences.counsellingAlerts}
            onChange={() => handlePreferenceChange("counsellingAlerts")}
          />

          <ToggleRow
            title="Email Notifications"
            description="Receive updates directly through email."
            checked={preferences.emailAlerts}
            onChange={() => handlePreferenceChange("emailAlerts")}
          />

        </div>
      </section>

      {/* PASSWORD SETTINGS */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">

        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-xl text-amber-600">
            <FiShield />
          </div>

          <div>
            <h2 className="text-lg font-bold text-[#142653]">
              Security Settings
            </h2>
            <p className="text-sm text-slate-500">
              Manage your account password.
            </p>
          </div>
        </div>

        <form onSubmit={handlePasswordChange}>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

            {[
              { name: "current", label: "Current Password" },
              { name: "new", label: "New Password" },
              { name: "confirm", label: "Confirm New Password" },
            ].map((item) => (
              <div key={item.name}>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  {item.label}
                </label>

                <div className="relative">
                  <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />

                  <input
                    type={showPassword ? "text" : "password"}
                    value={password[item.name]}
                    onChange={(e) =>
                      setPassword({
                        ...password,
                        [item.name]: e.target.value,
                      })
                    }
                    className={`${inputClass} pl-11 pr-12`}
                    placeholder={`Enter ${item.label.toLowerCase()}`}
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
                  >
                    {showPassword ? <FiEyeOff /> : <FiEye />}
                  </button>
                </div>
              </div>
            ))}

          </div>

          <div className="mt-6 flex justify-end">
            <button
              type="submit"
              className="flex items-center gap-2 rounded-xl bg-teal-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-teal-700"
            >
              <FiLock />
              Update Password
            </button>
          </div>
        </form>
      </section>

    </div>
  );
}

function InputField({
  label,
  name,
  type = "text",
  value,
  onChange,
  icon,
  inputClass,
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-slate-700">
        {label}
      </label>

      <div className="relative">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
          {icon}
        </span>

        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          className={`${inputClass} pl-11`}
        />
      </div>
    </div>
  );
}

function ToggleRow({ title, description, checked, onChange }) {
  return (
    <div className="flex items-center justify-between gap-4 py-5">
      <div>
        <h3 className="text-sm font-semibold text-slate-800">
          {title}
        </h3>
        <p className="mt-1 text-xs text-slate-500">
          {description}
        </p>
      </div>

      <button
        type="button"
        onClick={onChange}
        className={`relative h-6 w-11 shrink-0 rounded-full transition ${
          checked ? "bg-teal-600" : "bg-slate-300"
        }`}
      >
        <span
          className={`absolute top-1 h-4 w-4 rounded-full bg-white transition ${
            checked ? "left-6" : "left-1"
          }`}
        />
      </button>
    </div>
  );
}