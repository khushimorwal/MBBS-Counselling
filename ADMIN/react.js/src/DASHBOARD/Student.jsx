import { API } from "../api/axios.js";
import { useEffect, useRef, useState } from "react";

function Student() {
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
  });

  const [editingId, setEditingId] = useState(null);
  const [studentStatus, setStudentStatus] = useState({});
  const [viewStudent, setViewStudent] = useState(null);

  // Bulk Excel upload states
  const [isBulkUploading, setIsBulkUploading] = useState(false);
  const fileInputRef = useRef(null);

  const fetchStudents = async () => {
    try {
      const response = await API.get("/student/get-all");

      if (response.data.status) {
        setStudents(response.data.students || []);
      }
    } catch (error) {
      console.log("Students fetch error:", error);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  // Open modal for adding a student
  const handleAdd = () => {
    setForm({
      name: "",
      email: "",
      phone: "",
    });

    setEditingId(null);
    setShowForm(true);
  };

  // Open modal with selected student's data
  const handleEdit = (student) => {
    setForm({
      name: student.name || "",
      email: student.email || "",
      phone: student.phone || "",
    });

    setEditingId(student._id);
    setShowForm(true);
  };

  // Close form modal
  const handleCancel = () => {
    setForm({
      name: "",
      email: "",
      phone: "",
    });

    setEditingId(null);
    setShowForm(false);
  };

  // Delete student
  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this student?"
    );

    if (!confirmDelete) return;

    try {
      const response = await API.delete(`/student/delete/${id}`)

      if (response.data.status) {
        alert(response.data.message || "Student deleted successfully");

        setStudents((prev) =>
          prev.filter((student) => student._id !== id)
        );

        if (viewStudent?._id === id) {
          setViewStudent(null);
        }
      } else {
        alert(response.data.message || "Failed to delete student");
      }
    } catch (error) {
      console.log("Delete error:", error);
      alert(error.response?.data?.message || "Server error");
    }
  };

  // Create or update student
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      let response;

      if (editingId) {
       response = await API.put(
  `/student/update/${editingId}`,
  form
);
      } else {
        response = await API.post("/student/create", form);
      }

      const data = response.data;

      alert(data.message || "Operation completed");

      if (data.status) {
        handleCancel();
        await fetchStudents();
      }
    } catch (error) {
      console.log("Save student error:", error);
      alert(error.response?.data?.message || "Something went wrong");
    }
  };

  // Open the computer's file picker for selecting an XLSX file
  const handleBulkButtonClick = () => {
    fileInputRef.current?.click();
  };

  // Upload the selected Excel file to the backend bulk-import API
  const handleBulkFileChange = async (e) => {
    const file = e.target.files?.[0];

    // No file was selected
    if (!file) return;

    // Allow only Excel .xlsx files
    if (!file.name.toLowerCase().endsWith(".xlsx")) {
      alert("Please select an .xlsx file.");
      e.target.value = "";
      return;
    }

    // FormData sends the file as multipart/form-data
    const formData = new FormData();
    formData.append("file", file);

    try {
      setIsBulkUploading(true);

      // API instance should attach the logged-in user's Bearer token
      const response = await API.post(
        "/student/bulk-import",
        formData
      );

      const data = response.data;

      if (data.success) {
        // Refresh the table so newly imported students appear
        await fetchStudents();

        const errorMessage =
          data.errors?.length > 0
            ? `\\nRows with issues: ${data.errors.length}`
            : "";

        alert(
          `${data.message || "Bulk import completed"}\\n` +
          `Imported students: ${data.importedCount || 0}` +
          errorMessage
        );
      } else {
        alert(data.message || "Bulk import failed.");
      }
    } catch (error) {
      console.log("Bulk student import error:", error);

      alert(
        error.response?.data?.message ||
        "Unable to upload the Excel file. Please try again."
      );
    } finally {
      setIsBulkUploading(false);

      // Clear the input so the same file can be selected again
      e.target.value = "";
    }
  };

  // Search students
  const filteredStudents = students.filter((student) =>
    `${student.name} ${student.email} ${student.phone}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const inputStyle =
    "w-full rounded-xl border border-line bg-white px-4 py-3 text-sm text-brand-dark outline-none transition placeholder:text-gray-400 focus:border-brand focus:ring-2 focus:ring-brand/10";

  const actionButton =
    "inline-flex h-9 w-9 items-center justify-center rounded-lg border transition";

  return (
    <div className="mx-auto w-full max-w-[1600px]">
      {/* Page heading */}
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-accent">
            Management
          </p>

          <h1 className="font-display text-3xl font-bold text-brand-dark sm:text-4xl">
            Students
          </h1>

          <p className="mt-2 text-sm text-muted">
            Manage and organize student information.
          </p>
        </div>

        {/* Student action buttons */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Hidden file input opened by the Add Bulk Data button */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            onChange={handleBulkFileChange}
            className="hidden"
          />

          {/* Upload an Excel file containing multiple student records */}
          <button
            type="button"
            onClick={handleBulkButtonClick}
            disabled={isBulkUploading}
            className="rounded-xl border border-brand px-5 py-3 text-sm font-semibold text-brand transition hover:bg-brand-soft disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isBulkUploading ? "Uploading..." : "Add Bulk Data"}
          </button>

          {/* Open the existing single-student form */}
          <button
            type="button"
            onClick={handleAdd}
            className="rounded-xl bg-accent px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90"
          >
            + Add New Student
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="mb-6 rounded-2xl border border-line bg-white p-4 sm:p-5">
        <label className="mb-3 block text-sm font-semibold text-brand-dark">
          Search Students
        </label>

        <input
          type="text"
          placeholder="Search by name, email or phone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className={inputStyle}
        />
      </div>

      {/* Students table */}
      <div className="overflow-hidden rounded-2xl border border-line bg-white">
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <div>
            <h2 className="font-display text-lg font-bold text-brand-dark">
              All Students
            </h2>

            <p className="mt-1 text-xs text-muted">
              Student records and account actions
            </p>
          </div>

          <span className="rounded-full bg-brand-soft px-3 py-1.5 text-xs font-semibold text-brand">
            {filteredStudents.length} Students
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[750px] text-left">
            <thead className="bg-brand text-xs uppercase tracking-wider text-white">
              <tr>
                <th className="px-5 py-4">#</th>
                <th className="px-5 py-4">Name</th>
                <th className="px-5 py-4">Email</th>
                <th className="px-5 py-4">Phone</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4">Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredStudents.map((student, index) => (
                <tr
                  key={student._id}
                  className="border-b border-line last:border-b-0 hover:bg-surface/70"
                >
                  <td className="px-5 py-4 text-sm text-muted">
                    {index + 1}
                  </td>

                  <td className="px-5 py-4 text-sm font-semibold text-brand-dark">
                    {student.name}
                  </td>

                  <td className="px-5 py-4 text-sm text-muted">
                    {student.email}
                  </td>

                  <td className="px-5 py-4 text-sm text-muted">
                    {student.phone}
                  </td>

                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        aria-label="Toggle student status"
                        onClick={() =>
                          setStudentStatus((prev) => ({
                            ...prev,
                            [student._id]: !(prev[student._id] ?? true),
                          }))
                        }
                        className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
                          (studentStatus[student._id] ?? true)
                            ? "bg-brand"
                            : "bg-gray-300"
                        }`}
                      >
                        <span
                          className={`absolute top-1 h-4 w-4 rounded-full bg-white transition-transform ${
                            (studentStatus[student._id] ?? true)
                              ? "translate-x-6"
                              : "translate-x-1"
                          }`}
                        />
                      </button>

                      <span className="text-xs text-brand-dark">
                        {(studentStatus[student._id] ?? true)
                          ? "Active"
                          : "Inactive"}
                      </span>
                    </div>
                  </td>

                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      {/* View */}
                      <button
                        type="button"
                        title="View Student"
                        onClick={() => setViewStudent(student)}
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
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                      </button>

                      {/* Edit */}
                      <button
                        type="button"
                        title="Edit Student"
                        onClick={() => handleEdit(student)}
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

                      {/* Delete */}
                      <button
                        type="button"
                        title="Delete Student"
                        onClick={() => handleDelete(student._id)}
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
                    </div>
                  </td>
                </tr>
              ))}

              {filteredStudents.length === 0 && (
                <tr>
                  <td colSpan="6" className="px-5 py-12 text-center">
                    <p className="text-sm font-semibold text-brand-dark">
                      No students found
                    </p>

                    <p className="mt-1 text-xs text-muted">
                      Try another search or add a new student.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Modal */}
      {showForm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-brand-dark/60 p-4 backdrop-blur-sm"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) {
              handleCancel();
            }
          }}
        >
          <div className="my-auto w-full max-w-lg overflow-hidden rounded-2xl border border-line bg-white shadow-2xl">
            <div className="flex items-center justify-between bg-brand px-6 py-5 text-white">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-white/60">
                  Student Management
                </p>

                <h2 className="mt-1 font-display text-xl font-bold">
                  {editingId ? "Edit Student" : "Add New Student"}
                </h2>
              </div>

              <button
                type="button"
                onClick={handleCancel}
                aria-label="Close modal"
                className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 text-xl transition hover:bg-white/20"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5 p-6">
              <div>
                <label className="mb-2 block text-sm font-semibold text-brand-dark">
                  Student Name
                </label>

                <input
                  type="text"
                  placeholder="Enter student name"
                  value={form.name}
                  onChange={(e) =>
                    setForm({ ...form, name: e.target.value })
                  }
                  className={inputStyle}
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-brand-dark">
                  Email Address
                </label>

                <input
                  type="email"
                  placeholder="Enter email address"
                  value={form.email}
                  onChange={(e) =>
                    setForm({ ...form, email: e.target.value })
                  }
                  className={inputStyle}
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-brand-dark">
                  Phone Number
                </label>

                <input
                  type="tel"
                  placeholder="Enter phone number"
                  value={form.phone}
                  onChange={(e) =>
                    setForm({ ...form, phone: e.target.value })
                  }
                  className={inputStyle}
                  required
                />
              </div>

              <div className="flex justify-end gap-3 border-t border-line pt-5">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="rounded-xl border border-line px-5 py-3 text-sm font-semibold text-muted transition hover:bg-surface"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="rounded-xl bg-accent px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90"
                >
                  {editingId ? "Update Student" : "Save Student"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Details Modal */}
      {viewStudent && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-brand-dark/60 p-4 backdrop-blur-sm"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) {
              setViewStudent(null);
            }
          }}
        >
          <div className="my-auto w-full max-w-lg overflow-hidden rounded-2xl border border-line bg-white shadow-2xl">
            <div className="flex items-center justify-between bg-brand px-6 py-5 text-white">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-white/60">
                  Student Information
                </p>

                <h2 className="mt-1 font-display text-xl font-bold">
                  Student Details
                </h2>
              </div>

              <button
                type="button"
                onClick={() => setViewStudent(null)}
                aria-label="Close details"
                className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 text-xl transition hover:bg-white/20"
              >
                ×
              </button>
            </div>

            <div className="space-y-4 p-6">
              <div className="rounded-xl bg-surface p-4">
                <p className="text-xs text-muted">Student Name</p>
                <p className="mt-2 break-words text-sm font-semibold text-brand-dark">
                  {viewStudent.name}
                </p>
              </div>

              <div className="rounded-xl bg-surface p-4">
                <p className="text-xs text-muted">Email Address</p>
                <p className="mt-2 break-words text-sm font-semibold text-brand-dark">
                  {viewStudent.email}
                </p>
              </div>

              <div className="rounded-xl bg-surface p-4">
                <p className="text-xs text-muted">Phone Number</p>
                <p className="mt-2 break-words text-sm font-semibold text-brand-dark">
                  {viewStudent.phone}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setViewStudent(null)}
                className="w-full rounded-xl border border-line px-5 py-3 text-sm font-semibold text-brand-dark transition hover:bg-surface"
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

export default Student;