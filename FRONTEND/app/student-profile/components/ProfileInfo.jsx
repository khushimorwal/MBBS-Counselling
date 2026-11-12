"use client";

import { useEffect, useRef, useState } from "react";

const API_URL = "http://localhost:3000";

const emptyForm = {
dob: "",
gender: "",
city: "",
state: "",
country: "",
};

export default function ProfileInfo({ onProfileUpdate }) {
const [profile, setProfile] = useState(null);
const [userName, setUserName] = useState("");
const [userEmail, setUserEmail] = useState("");

const [formData, setFormData] = useState(emptyForm);

const [editMode, setEditMode] = useState(false);
const [loading, setLoading] = useState(true);
const [saving, setSaving] = useState(false);
const [uploadingImage, setUploadingImage] = useState(false);

const [message, setMessage] = useState("");
const [error, setError] = useState("");

const fileInputRef = useRef(null);

// GET STUDENT PROFILE
const fetchProfile = async () => {
try {
setLoading(true);
setError("");


  const token = localStorage.getItem("token");

  const response = await fetch(`${API_URL}/student-profile`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Unable to fetch profile");
  }

  setProfile(data.profile);
  onProfileUpdate(data.profile);

  if (data.profile) {
    setUserName(data.profile.user?.name || "");
    setUserEmail(data.profile.user?.email || "");

    setFormData({
      dob: data.profile.dob
        ? new Date(data.profile.dob).toISOString().split("T")[0]
        : "",
      gender: data.profile.gender || "",
      city: data.profile.city || "",
      state: data.profile.state || "",
      country: data.profile.country || "",
    });
  } else {
    const user = JSON.parse(localStorage.getItem("user") || "{}");

    setUserName(user.name || "");
    setUserEmail(user.email || "");
  }
} catch (err) {
  setError(err.message);
} finally {
  setLoading(false);
}


};

useEffect(() => {
fetchProfile();
}, []);

// HANDLE INPUT CHANGE
const handleChange = (e) => {
const { name, value } = e.target;


setFormData((prev) => ({
  ...prev,
  [name]: value,
}));


};

// SAVE PROFILE
const handleSave = async () => {
try {
setSaving(true);
setMessage("");
setError("");


  const token = localStorage.getItem("token");

  const response = await fetch(`${API_URL}/student-profile`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(formData),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Unable to save profile");
  }

  setProfile(data.profile);
  onProfileUpdate(data.profile);
  setUserName(data.profile?.user?.name || userName);
  setUserEmail(data.profile?.user?.email || userEmail);

  setEditMode(false);
  setMessage("Profile details saved successfully!");
} catch (err) {
  setError(err.message);
} finally {
  setSaving(false);
}

};

// CANCEL EDIT
const handleCancel = () => {
setFormData({
dob: profile?.dob
? new Date(profile.dob).toISOString().split("T")[0]
: "",
gender: profile?.gender || "",
city: profile?.city || "",
state: profile?.state || "",
country: profile?.country || "",
});


setEditMode(false);
setMessage("");
setError("");


};

// PROFILE IMAGE UPLOAD
const handleImageUpload = async (e) => {
const file = e.target.files?.[0];


if (!file) return;

if (!file.type.startsWith("image/")) {
  setError("Please select a valid image.");
  e.target.value = "";
  return;
}

if (file.size > 5 * 1024 * 1024) {
  setError("Image size should not exceed 5 MB.");
  e.target.value = "";
  return;
}

try {
  setUploadingImage(true);
  setError("");
  setMessage("");

  const token = localStorage.getItem("token");

  const formData = new FormData();
  formData.append("profileImage", file);

  const response = await fetch(
    `${API_URL}/student-profile/profile-image`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Image upload failed");
  }

  setProfile((prev) => ({
    ...prev,
    profileImage: data.profileImage,
  }));

  setMessage("Profile image updated successfully!");
} catch (err) {
  setError(err.message);
} finally {
  setUploadingImage(false);
  e.target.value = "";
}


};

if (loading) {
return ( <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center">
Loading profile... </div>
);
}

return ( <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">


  <div className="flex flex-wrap items-center justify-between gap-4">
    <h2 className="flex items-center gap-3 text-xl font-bold sm:text-2xl">
      <span className="text-2xl text-teal-600">👤</span>
      Profile Information
    </h2>

    {!editMode && (
      <button
        type="button"
        onClick={() => {
          setMessage("");
          setError("");
          setEditMode(true);
        }}
        className="rounded-xl border border-teal-500 px-5 py-2.5 font-semibold text-teal-600 transition hover:bg-teal-50"
      >
        ✎ Edit Profile
      </button>
    )}
  </div>

  <div className="mt-6 grid gap-6 border-t border-slate-100 pt-6 md:grid-cols-[190px_1fr]">

    {/* PROFILE IMAGE */}
    <div className="flex justify-center md:justify-start">
      <div className="relative h-60 w-48 overflow-hidden rounded-xl border border-slate-200 bg-gradient-to-br from-teal-100 to-cyan-100">

        {profile?.profileImage?.url ? (
          <img
            src={profile.profileImage.url}
            alt="Student Profile"
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-7xl">
            👤
          </div>
        )}

        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          onChange={handleImageUpload}
          className="hidden"
        />

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploadingImage}
          title="Change Profile Photo"
          className="absolute bottom-3 right-3 flex h-11 w-11 items-center justify-center rounded-full border-4 border-white bg-teal-600 text-white shadow-lg transition hover:bg-teal-700 disabled:opacity-60"
        >
          {uploadingImage ? "..." : "✎"}
        </button>

      </div>
    </div>

    {/* BASIC DETAILS */}
    <div className="grid content-start gap-5 sm:grid-cols-2">

      <Info label="Full Name" value={userName} />
      <Info label="Email" value={userEmail} />

      {editMode ? (
        <>
          <Input
            label="Date of Birth"
            name="dob"
            type="date"
            value={formData.dob}
            onChange={handleChange}
          />

          <Select
            label="Gender"
            name="gender"
            value={formData.gender}
            onChange={handleChange}
            options={[
              { value: "male", label: "Male" },
              { value: "female", label: "Female" },
              { value: "other", label: "Other" },
            ]}
          />

          <Input
            label="City"
            name="city"
            value={formData.city}
            onChange={handleChange}
          />

          <Input
            label="State"
            name="state"
            value={formData.state}
            onChange={handleChange}
          />

          <Input
            label="Country"
            name="country"
            value={formData.country}
            onChange={handleChange}
          />
        </>
      ) : (
        <>
          <Info
            label="Date of Birth"
            value={
              profile?.dob
                ? new Date(profile.dob).toLocaleDateString("en-IN")
                : "Not Provided"
            }
          />

          <Info
            label="Gender"
            value={profile?.gender || "Not Provided"}
          />

          <Info
            label="City"
            value={profile?.city || "Not Provided"}
          />

          <Info
            label="State"
            value={profile?.state || "Not Provided"}
          />

          <Info
            label="Country"
            value={profile?.country || "Not Provided"}
          />
        </>
      )}

    </div>
  </div>

  {/* SAVE AND CANCEL */}
  {editMode && (
    <div className="mt-6 flex flex-wrap justify-end gap-3 border-t border-slate-100 pt-5">

      <button
        type="button"
        onClick={handleCancel}
        disabled={saving}
        className="rounded-xl border border-slate-300 px-6 py-2.5 font-semibold text-slate-600 hover:bg-slate-50"
      >
        Cancel
      </button>

      <button
        type="button"
        onClick={handleSave}
        disabled={saving}
        className="rounded-xl bg-teal-600 px-6 py-2.5 font-semibold text-white transition hover:bg-teal-700 disabled:opacity-60"
      >
        {saving ? "Saving..." : "Save Details"}
      </button>

    </div>
  )}

  {message && (
    <p className="mt-4 rounded-lg bg-teal-50 p-3 text-sm font-medium text-teal-700">
      {message}
    </p>
  )}

  {error && (
    <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm font-medium text-red-600">
      {error}
    </p>
  )}

</div>


);
}

// INFO COMPONENT
function Info({ label, value }) {
return ( <div className="min-w-0"> <p className="text-sm text-slate-500">{label}</p> <p className="mt-1 break-words font-semibold text-[#142653]">
{value || "Not Provided"} </p> </div>
);
}

// INPUT COMPONENT
function Input({ label, name, type = "text", value, onChange }) {
return ( <div> <label className="mb-2 block text-sm font-medium text-slate-500">
{label} </label>


  <input
    type={type}
    name={name}
    value={value}
    onChange={onChange}
    className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
  />
</div>


);
}

// SELECT COMPONENT
function Select({ label, name, value, onChange, options }) {
return ( <div> <label className="mb-2 block text-sm font-medium text-slate-500">
{label} </label>


  <select
    name={name}
    value={value}
    onChange={onChange}
    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
  >
    <option value="">Select {label}</option>

    {options.map((option) => (
      <option key={option.value} value={option.value}>
        {option.label}
      </option>
    ))}
  </select>
</div>


);
}
