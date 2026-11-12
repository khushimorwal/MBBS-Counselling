"use client";

import { useEffect, useState } from "react";

const API_URL = "http://localhost:3000";

const emptyForm = {
  budgetType: "",
  annualBudget: "",
  tuitionBudget: "",
  hostelBudget: "",
  livingBudget: "",
  otherBudget: "",
  scholarship: "",
  financialSupport: "",
};

// Convert MongoDB data into form-friendly values.
const prepareBudgetData = (data = {}) => ({
  budgetType: data.budgetType || "",
  annualBudget: data.annualBudget ?? "",
  tuitionBudget: data.tuitionBudget ?? "",
  hostelBudget: data.hostelBudget ?? "",
  livingBudget: data.livingBudget ?? "",
  otherBudget: data.otherBudget ?? "",
  scholarship: data.scholarship || "",
  financialSupport: data.financialSupport || "",
});

// Convert form values into MongoDB-friendly values.
const prepareSaveData = (data) => ({
  budgetType: data.budgetType || null,
  annualBudget: data.annualBudget === "" ? null : Number(data.annualBudget),
  tuitionBudget: data.tuitionBudget === "" ? null : Number(data.tuitionBudget),
  hostelBudget: data.hostelBudget === "" ? null : Number(data.hostelBudget),
  livingBudget: data.livingBudget === "" ? null : Number(data.livingBudget),
  otherBudget: data.otherBudget === "" ? null : Number(data.otherBudget),
  scholarship: data.scholarship || null,
  financialSupport: data.financialSupport || null,
});

export default function BudgetDetails() {
  const [form, setForm] = useState(emptyForm);
  const [saved, setSaved] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const inputClass =
    "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500";

  // Load saved budget details from MongoDB.
  useEffect(() => {
    const fetchBudgetDetails = async () => {
      try {
        setLoading(true);
        setError("");

        const token = localStorage.getItem("token");

        if (!token) {
          throw new Error("Please login again. Authentication token not found.");
        }

        const response = await fetch(`${API_URL}/student-profile`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.message || "Unable to load budget details.");
        }

        const budgetData = prepareBudgetData(result.profile?.budget);

        setForm(budgetData);

        const hasData = Object.values(budgetData).some(
          (value) => value !== "" && value !== null && value !== undefined
        );

        setSaved(hasData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBudgetDetails();
  }, []);

  // Handle form changes.
  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    setSaved(false);
    setMessage("");
    setError("");
  };

  // Save budget details to MongoDB.
  const handleSave = async (e) => {
    e.preventDefault();

    if (!form.budgetType) {
      setError("Please select your preferred budget type.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setMessage("");

      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("Please login again. Authentication token not found.");
      }

      const response = await fetch(`${API_URL}/student-profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          budget: prepareSaveData(form),
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Unable to save budget details.");
      }

      const savedData = prepareBudgetData(
        result.profile?.budget || prepareSaveData(form)
      );

      setForm(savedData);
      setSaved(true);
      setIsEditing(false);
      setMessage("Budget details saved successfully!");
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  // Open edit mode.
  const handleEdit = () => {
    setIsEditing(true);
    setMessage("");
    setError("");
  };

  // Reset budget details in MongoDB.
  const handleReset = async () => {
    const confirmReset = window.confirm(
      "Are you sure you want to reset your budget details?"
    );

    if (!confirmReset) return;

    try {
      setSaving(true);
      setError("");
      setMessage("");

      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("Please login again. Authentication token not found.");
      }

      const resetData = {
        budgetType: null,
        annualBudget: null,
        tuitionBudget: null,
        hostelBudget: null,
        livingBudget: null,
        otherBudget: null,
        scholarship: null,
        financialSupport: null,
      };

      const response = await fetch(`${API_URL}/student-profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          budget: resetData,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Unable to reset budget details.");
      }

      setForm(emptyForm);
      setSaved(false);
      setIsEditing(false);
      setMessage("Budget details reset successfully!");
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const budgetFields = [
    {
      name: "annualBudget",
      label: "Maximum Annual Budget",
      placeholder: "e.g. 500000",
    },
    {
      name: "tuitionBudget",
      label: "Tuition Fee Budget (Per Year)",
      placeholder: "e.g. 300000",
    },
    {
      name: "hostelBudget",
      label: "Hostel / Accommodation Budget (Per Year)",
      placeholder: "e.g. 100000",
    },
    {
      name: "livingBudget",
      label: "Food & Living Expenses (Per Year)",
      placeholder: "e.g. 50000",
    },
    {
      name: "otherBudget",
      label: "Other Expenses (Per Year)",
      placeholder: "e.g. 25000",
    },
  ];

  const formatAmount = (amount) => {
    if (amount === "" || amount === null || amount === undefined) {
      return "Not specified";
    }

    return `₹${Number(amount).toLocaleString("en-IN")}`;
  };

  if (loading) {
    return (
      <div className="py-10 text-center text-sm font-medium text-slate-500">
        Loading budget details...
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">
            Budget Details
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Share your financial preferences for medical education.
          </p>
        </div>

        {saved && !isEditing && (
          <button
            type="button"
            onClick={handleEdit}
            className="rounded-xl border border-blue-200 px-5 py-3 text-sm font-semibold text-blue-600 hover:bg-blue-50"
          >
            Edit Budget
          </button>
        )}
      </div>

      {/* ERROR AND SUCCESS MESSAGES */}
      {error && (
        <p className="rounded-lg bg-red-50 p-3 text-sm font-medium text-red-600">
          {error}
        </p>
      )}

      {message && (
        <p className="rounded-lg bg-teal-50 p-3 text-sm font-medium text-teal-700">
          {message}
        </p>
      )}

      {/* BUDGET FORM */}
      {(!saved || isEditing) && (
        <form
          onSubmit={handleSave}
          className="space-y-6 rounded-2xl border border-slate-200 bg-white p-6"
        >

          {/* BUDGET TYPE */}
          <div>
            <h3 className="mb-4 font-semibold text-slate-800">
              Financial Preferences
            </h3>

            <label className="mb-2 block text-sm font-medium text-slate-700">
              Preferred Budget Type *
            </label>

            <select
              name="budgetType"
              value={form.budgetType}
              onChange={handleChange}
              className={inputClass}
              required
            >
              <option value="">Select Budget Type</option>
              <option value="Government College Budget">
                Government College Budget
              </option>
              <option value="Private College Budget">
                Private College Budget
              </option>
              <option value="Both">Both Government & Private</option>
            </select>
          </div>

          {/* BUDGET AMOUNTS */}
          <div>
            <h3 className="mb-4 font-semibold text-slate-800">
              Annual Budget Breakdown
            </h3>

            <div className="grid gap-5 sm:grid-cols-2">
              {budgetFields.map((field) => (
                <div key={field.name}>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    {field.label} (₹)
                  </label>

                  <input
                    type="number"
                    name={field.name}
                    value={form[field.name]}
                    onChange={handleChange}
                    placeholder={field.placeholder}
                    min="0"
                    className={inputClass}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* SCHOLARSHIP */}
          <div>
            <h3 className="mb-4 font-semibold text-slate-800">
              Financial Assistance
            </h3>

            <div className="grid gap-5 sm:grid-cols-2">

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Do you require a scholarship?
                </label>

                <select
                  name="scholarship"
                  value={form.scholarship}
                  onChange={handleChange}
                  className={inputClass}
                >
                  <option value="">Select Option</option>
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                  <option value="Maybe">Maybe</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Financial Support
                </label>

                <select
                  name="financialSupport"
                  value={form.financialSupport}
                  onChange={handleChange}
                  className={inputClass}
                >
                  <option value="">Select Support</option>
                  <option value="Self Funded">Self Funded</option>
                  <option value="Parents / Family">Parents / Family</option>
                  <option value="Education Loan">Education Loan</option>
                  <option value="Scholarship">Scholarship</option>
                  <option value="Other">Other</option>
                </select>
              </div>

            </div>
          </div>

          {/* BUTTONS */}
          <div className="flex flex-wrap gap-3 border-t border-slate-100 pt-5">

            <button
              type="submit"
              disabled={saving}
              className="rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
            >
              {saving ? "Saving..." : "Save Budget Details"}
            </button>

            <button
              type="button"
              onClick={handleReset}
              disabled={saving}
              className="rounded-xl border border-slate-300 px-6 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-60"
            >
              Reset
            </button>

          </div>
        </form>
      )}

      {/* SAVED BUDGET */}
      {saved && !isEditing && (
        <div className="space-y-5">

          <div className="rounded-2xl border border-blue-100 bg-blue-50 p-6">
            <p className="text-sm font-medium text-blue-700">
              Maximum Annual Budget
            </p>

            <h3 className="mt-2 text-3xl font-bold text-slate-800">
              {formatAmount(form.annualBudget)}
            </h3>

            <p className="mt-2 text-sm text-slate-600">
              {form.budgetType}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <h3 className="mb-5 font-semibold text-slate-800">
              Annual Budget Breakdown
            </h3>

            <div className="grid gap-5 sm:grid-cols-2">
              {budgetFields.map((field) => (
                <div key={field.name}>
                  <p className="text-sm text-slate-500">
                    {field.label}
                  </p>

                  <p className="mt-1 font-semibold text-slate-800">
                    {formatAmount(form[field.name])}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <h3 className="mb-4 font-semibold text-slate-800">
              Financial Assistance
            </h3>

            <div className="grid gap-5 sm:grid-cols-2">

              <div>
                <p className="text-sm text-slate-500">
                  Scholarship Required
                </p>

                <p className="mt-1 font-semibold text-slate-800">
                  {form.scholarship || "Not specified"}
                </p>
              </div>

              <div>
                <p className="text-sm text-slate-500">
                  Financial Support
                </p>

                <p className="mt-1 font-semibold text-slate-800">
                  {form.financialSupport || "Not specified"}
                </p>
              </div>

            </div>
          </div>

        </div>
      )}

    </div>
  );
}