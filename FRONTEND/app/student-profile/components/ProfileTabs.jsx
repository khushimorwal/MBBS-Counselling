"use client";

import { useEffect, useState } from "react";
import EntranceExam from "./EntranceExam";
import PreferredCourse from "./PreferredCourse";
import PreferredLocations from "./PreferredLocations";
import BudgetDetails from "./BudgetDetails";

const API_URL = "http://localhost:3000";

const tabs = [
  { id: "personal", label: "Personal Details", icon: "👤" },
  { id: "academic", label: "Academic Details", icon: "🎓" },
  { id: "exams", label: "Entrance Exams", icon: "📄" },
  { id: "courses", label: "Preferred Courses", icon: "🔖" },
  { id: "locations", label: "Preferred Locations", icon: "📍" },
  { id: "budget", label: "Budget Details", icon: "₹" },
];

const emptyAcademicData = {
  tenth: {
    board: "",
    percentage: "",
    passingYear: "",
  },
  twelfth: {
    board: "",
    percentage: "",
    passingYear: "",
    stream: "",
  },
  graduation: {
    course: "",
    college: "",
    percentage: "",
    passingYear: "",
  },
};

// Convert saved academic data into form-friendly values.
const prepareAcademicData = (data = {}) => ({
  tenth: {
    board: data.tenth?.board || "",
    percentage: data.tenth?.percentage ?? "",
    passingYear: data.tenth?.passingYear ?? "",
  },
  twelfth: {
    board: data.twelfth?.board || "",
    percentage: data.twelfth?.percentage ?? "",
    passingYear: data.twelfth?.passingYear ?? "",
    stream: data.twelfth?.stream || "",
  },
  graduation: {
    course: data.graduation?.course || "",
    college: data.graduation?.college || "",
    percentage: data.graduation?.percentage ?? "",
    passingYear: data.graduation?.passingYear ?? "",
  },
});

// Convert form values into values suitable for MongoDB.
const prepareSaveData = (data) => ({
  board: data.board || "",
  stream: data.stream || "",
  course: data.course || "",
  college: data.college || "",
  percentage:
    data.percentage === "" ? null : Number(data.percentage),
  passingYear:
    data.passingYear === "" ? null : Number(data.passingYear),
});

export default function ProfileTabs({
  profile,
  activeTab,
  setActiveTab,
}) {
  const [academicData, setAcademicData] = useState(emptyAcademicData);
  const [savedAcademic, setSavedAcademic] = useState({});
  const [editingType, setEditingType] = useState(null);

  const [saving, setSaving] = useState(false);
  const [academicError, setAcademicError] = useState("");
  const [academicMessage, setAcademicMessage] = useState("");

  // Load academic details whenever profile data is updated.
  useEffect(() => {
    const data = prepareAcademicData(profile?.academicDetails);

    setAcademicData(data);

    const saved = {};

    Object.keys(data).forEach((type) => {
      const section = profile?.academicDetails?.[type];

      if (
        section &&
        Object.values(section).some(
          (value) =>
            value !== "" && value !== null && value !== undefined
        )
      ) {
        saved[type] = { ...data[type] };
      }
    });

    setSavedAcademic(saved);
  }, [profile]);

  // Handle changes in the currently edited academic section.
  const handleAcademicChange = (e) => {
    const { name, value } = e.target;

    setAcademicData((prev) => ({
      ...prev,
      [editingType]: {
        ...prev[editingType],
        [name]: value,
      },
    }));
  };

  // Open add or edit form.
  const handleAcademicEdit = (type) => {
    setAcademicError("");
    setAcademicMessage("");

    setAcademicData((prev) => ({
      ...prev,
      [type]: savedAcademic[type]
        ? { ...savedAcademic[type] }
        : { ...emptyAcademicData[type] },
    }));

    setEditingType(type);
  };

  // Save academic details.
  const handleAcademicSave = async () => {
    if (!editingType) return;

    const currentData = academicData[editingType];

    if (
      Object.values(currentData).some(
        (value) => !String(value).trim()
      )
    ) {
      setAcademicError("Please fill all fields.");
      return;
    }

    const percentage = Number(currentData.percentage);
    const passingYear = Number(currentData.passingYear);

    if (percentage < 0 || percentage > 100) {
      setAcademicError("Percentage must be between 0 and 100.");
      return;
    }

    if (
      !Number.isInteger(passingYear) ||
      passingYear < 1900 ||
      passingYear > new Date().getFullYear()
    ) {
      setAcademicError("Please enter a valid passing year.");
      return;
    }

    try {
      setSaving(true);
      setAcademicError("");
      setAcademicMessage("");

      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error(
          "Please login again. Authentication token not found."
        );
      }

      // FIX: Use current academicData state.
      // This preserves the latest values of all three sections.
      const updatedAcademic = {
        ...academicData,
        [editingType]: {
          ...currentData,
        },
      };

      const response = await fetch(`${API_URL}/student-profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          academicDetails: {
            tenth: prepareSaveData(updatedAcademic.tenth),
            twelfth: prepareSaveData(updatedAcademic.twelfth),
            graduation: prepareSaveData(updatedAcademic.graduation),
          },
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message || "Unable to save academic details."
        );
      }

      const savedData = prepareAcademicData(
        result.profile?.academicDetails || updatedAcademic
      );

      setAcademicData(savedData);

      const updatedSaved = {};

      Object.keys(savedData).forEach((type) => {
        const section = savedData[type];

        if (
          Object.values(section).some(
            (value) =>
              value !== "" && value !== null && value !== undefined
          )
        ) {
          updatedSaved[type] = { ...section };
        }
      });

      setSavedAcademic(updatedSaved);
      setEditingType(null);
      setAcademicMessage("Academic details saved successfully!");
    } catch (error) {
      setAcademicError(error.message);
    } finally {
      setSaving(false);
    }
  };

  // Cancel editing without changing saved details.
  const handleAcademicCancel = () => {
    setAcademicData(prepareAcademicData(profile?.academicDetails));
    setEditingType(null);
    setAcademicError("");
    setAcademicMessage("");
  };

  // Delete a selected academic section.
  const handleAcademicDelete = async (type) => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete ${type} details?`
    );

    if (!confirmDelete) return;

    try {
      setSaving(true);
      setAcademicError("");
      setAcademicMessage("");

      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error(
          "Please login again. Authentication token not found."
        );
      }

      // FIX: Preserve the latest state of the other sections.
      const updatedAcademic = {
        ...academicData,
        [type]: { ...emptyAcademicData[type] },
      };

      const response = await fetch(`${API_URL}/student-profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          academicDetails: {
            tenth: prepareSaveData(updatedAcademic.tenth),
            twelfth: prepareSaveData(updatedAcademic.twelfth),
            graduation: prepareSaveData(updatedAcademic.graduation),
          },
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message || "Unable to delete academic details."
        );
      }

      setAcademicData(updatedAcademic);

      setSavedAcademic((prev) => {
        const updated = { ...prev };
        delete updated[type];
        return updated;
      });

      setAcademicMessage("Academic details deleted successfully!");
    } catch (error) {
      setAcademicError(error.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

      {/* PROFILE TABS */}
      <div className="grid grid-cols-2 border-b border-slate-200 sm:grid-cols-3">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => {
              setActiveTab(tab.id);
              setEditingType(null);
              setAcademicError("");
              setAcademicMessage("");
            }}
            className={`flex items-center justify-center gap-2 border-b-[3px] px-3 py-4 text-sm font-semibold transition sm:text-base ${
              activeTab === tab.id
                ? "border-teal-500 bg-teal-50 text-teal-700"
                : "border-transparent text-[#182b56] hover:bg-slate-50"
            }`}
          >
            <span>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* ACTIVE TAB CONTENT */}
      <div className="min-h-[280px] p-5 sm:p-6">

        <h2 className="mb-6 text-2xl font-bold text-[#142653]">
          {tabs.find((tab) => tab.id === activeTab)?.label}
        </h2>

        {/* PERSONAL DETAILS */}
        {activeTab === "personal" && (
          <div className="grid gap-5 sm:grid-cols-2">
            <Info
              label="Date of Birth"
              value={
                profile?.dob
                  ? new Date(profile.dob).toLocaleDateString("en-IN")
                  : "Not Provided"
              }
            />

            <Info label="Gender" value={profile?.gender} />
            <Info label="City" value={profile?.city} />
            <Info label="State" value={profile?.state} />
            <Info label="Country" value={profile?.country} />
          </div>
        )}

        {/* ACADEMIC DETAILS */}
        {activeTab === "academic" && (
          <div className="space-y-5">

            {academicError && (
              <p className="rounded-lg bg-red-50 p-3 text-sm font-medium text-red-600">
                {academicError}
              </p>
            )}

            {academicMessage && (
              <p className="rounded-lg bg-teal-50 p-3 text-sm font-medium text-teal-700">
                {academicMessage}
              </p>
            )}

            <div className="grid gap-6 lg:grid-cols-2">

              <AcademicCard
                title="Class 10th"
                type="tenth"
                details={savedAcademic.tenth}
                editingType={editingType}
                formData={academicData.tenth}
                saving={saving}
                onEdit={handleAcademicEdit}
                onDelete={handleAcademicDelete}
                onChange={handleAcademicChange}
                onSave={handleAcademicSave}
                onCancel={handleAcademicCancel}
              />

              <AcademicCard
                title="Class 12th"
                type="twelfth"
                details={savedAcademic.twelfth}
                editingType={editingType}
                formData={academicData.twelfth}
                saving={saving}
                onEdit={handleAcademicEdit}
                onDelete={handleAcademicDelete}
                onChange={handleAcademicChange}
                onSave={handleAcademicSave}
                onCancel={handleAcademicCancel}
              />

              <AcademicCard
                title="Graduation"
                type="graduation"
                details={savedAcademic.graduation}
                editingType={editingType}
                formData={academicData.graduation}
                saving={saving}
                onEdit={handleAcademicEdit}
                onDelete={handleAcademicDelete}
                onChange={handleAcademicChange}
                onSave={handleAcademicSave}
                onCancel={handleAcademicCancel}
              />

            </div>
          </div>
        )}

        {/* ENTRANCE EXAMS */}
        {activeTab === "exams" && <EntranceExam />}

        {/* PREFERRED COURSES */}
        {activeTab === "courses" && <PreferredCourse />}

        {/* PREFERRED LOCATIONS */}
        {activeTab === "locations" && <PreferredLocations />}

        {/* BUDGET DETAILS */}
        {activeTab === "budget" && <BudgetDetails />}

      </div>
    </div>
  );
}

// ACADEMIC CARD
function AcademicCard({
  title,
  type,
  details,
  editingType,
  formData,
  saving,
  onEdit,
  onDelete,
  onChange,
  onSave,
  onCancel,
}) {
  const isEditing = editingType === type;
  const isGraduation = type === "graduation";

  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6">

      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-xl font-bold text-[#142653]">
          {title}
        </h3>

        {!isEditing && (
          <div className="flex gap-2">
            {details ? (
              <>
                <button
                  type="button"
                  onClick={() => onEdit(type)}
                  disabled={saving}
                  className="rounded-lg border border-teal-500 px-4 py-2 text-sm font-semibold text-teal-600 hover:bg-teal-50 disabled:opacity-50"
                >
                  Edit
                </button>

                <button
                  type="button"
                  onClick={() => onDelete(type)}
                  disabled={saving}
                  className="rounded-lg border border-red-300 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50"
                >
                  Delete
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => onEdit(type)}
                disabled={saving}
                className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-700 disabled:opacity-50"
              >
                + Add Details
              </button>
            )}
          </div>
        )}
      </div>

      {isEditing ? (
        <div className="grid gap-5 sm:grid-cols-2">

          {isGraduation ? (
            <>
              <AcademicInput
                label="Course"
                name="course"
                value={formData.course}
                onChange={onChange}
              />

              <AcademicInput
                label="College"
                name="college"
                value={formData.college}
                onChange={onChange}
              />
            </>
          ) : (
            <AcademicInput
              label="Board"
              name="board"
              value={formData.board}
              onChange={onChange}
            />
          )}

          {!isGraduation && type === "twelfth" && (
            <AcademicInput
              label="Stream"
              name="stream"
              value={formData.stream}
              onChange={onChange}
            />
          )}

          <AcademicInput
            label="Percentage"
            name="percentage"
            type="number"
            value={formData.percentage}
            onChange={onChange}
          />

          <AcademicInput
            label="Passing Year"
            name="passingYear"
            type="number"
            value={formData.passingYear}
            onChange={onChange}
          />

          <div className="col-span-full flex flex-wrap justify-end gap-3 border-t border-slate-200 pt-4">

            <button
              type="button"
              onClick={onCancel}
              disabled={saving}
              className="rounded-xl border border-slate-300 px-5 py-2.5 font-semibold text-slate-600 hover:bg-white disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={onSave}
              disabled={saving}
              className="rounded-xl bg-teal-600 px-5 py-2.5 font-semibold text-white hover:bg-teal-700 disabled:opacity-60"
            >
              {saving ? "Saving..." : "Save Details"}
            </button>

          </div>
        </div>
      ) : details ? (
        <div className="grid gap-5 sm:grid-cols-2">

          {isGraduation ? (
            <>
              <Info label="Course" value={details.course} />
              <Info label="College" value={details.college} />
            </>
          ) : (
            <>
              <Info label="Board" value={details.board} />

              {type === "twelfth" && (
                <Info label="Stream" value={details.stream} />
              )}
            </>
          )}

          <Info label="Percentage" value={`${details.percentage}%`} />
          <Info label="Passing Year" value={details.passingYear} />

        </div>
      ) : (
        <p className="text-sm text-slate-500">
          No details added yet.
        </p>
      )}

    </div>
  );
}

// ACADEMIC INPUT
function AcademicInput({
  label,
  name,
  type = "text",
  value,
  onChange,
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-slate-600">
        {label}
      </label>

      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        min={type === "number" && name === "percentage" ? 0 : undefined}
        max={name === "percentage" ? 100 : undefined}
        className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
        placeholder={`Enter ${label}`}
      />
    </div>
  );
}

// INFO COMPONENT
function Info({ label, value }) {
  return (
    <div className="min-w-0">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-1 break-words font-semibold text-[#142653]">
        {value || "Not Provided"}
      </p>
    </div>
  );
}
