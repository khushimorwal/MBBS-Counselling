import { API } from "../api/axios.js";
import { useEffect, useRef, useState } from "react";

function Student() {
  const role = localStorage.getItem("role");

  // Managed Students states
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState("");

  // Registered Students states
  const [activeTab, setActiveTab] = useState("managed");
  const [registeredStudents, setRegisteredStudents] = useState([]);
  const [registeredSearch, setRegisteredSearch] = useState("");
  const [registeredProfile, setRegisteredProfile] = useState(null);
  const [isProfileLoading, setIsProfileLoading] = useState(false);

  // Add/Edit states
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

  // Fetch Managed Students
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

  // Fetch Registered Students
  const fetchRegisteredStudents = async () => {
    try {
      const response = await API.get("/student/registered");

      if (response.data.status) {
        setRegisteredStudents(response.data.students || []);
      }
    } catch (error) {
      console.log("Registered Students fetch error:", error);
    }
  };

  // Fetch both types of students when page loads
  useEffect(() => {
    fetchStudents();
    fetchRegisteredStudents();
  }, []);

  // View complete Registered Student Profile
  const handleViewRegisteredProfile = async (userId) => {
    try {
      setIsProfileLoading(true);
      setRegisteredProfile(null);

      const response = await API.get(
        `/student/registered/${userId}/profile`
      );

      if (response.data.status) {
        setRegisteredProfile(response.data);
      }
    } catch (error) {
      console.log("Registered student profile error:", error);

      alert(
        error.response?.data?.message ||
        "Unable to fetch student profile"
      );
    } finally {
      setIsProfileLoading(false);
    }
  };

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

  // Delete Managed Student
  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this student?"
    );

    if (!confirmDelete) return;

    try {
      const response = await API.delete(
        `/student/delete/${id}`
      );

      if (response.data.status) {
        alert(
          response.data.message ||
          "Student deleted successfully"
        );

        setStudents((prev) =>
          prev.filter((student) => student._id !== id)
        );

        if (viewStudent?._id === id) {
          setViewStudent(null);
        }
      } else {
        alert(
          response.data.message ||
          "Failed to delete student"
        );
      }
    } catch (error) {
      console.log("Delete error:", error);

      alert(
        error.response?.data?.message ||
        "Server error"
      );
    }
  };

  // Create or Update Managed Student
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
        response = await API.post(
          "/student/create",
          form
        );
      }

      const data = response.data;

      alert(data.message || "Operation completed");

      if (data.status) {
        handleCancel();
        await fetchStudents();
      }
    } catch (error) {
      console.log("Save student error:", error);

      alert(
        error.response?.data?.message ||
        "Something went wrong"
      );
    }
  };

  // Open file picker for Excel upload
  const handleBulkButtonClick = () => {
    fileInputRef.current?.click();
  };

  // Upload Excel file
  const handleBulkFileChange = async (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (!file.name.toLowerCase().endsWith(".xlsx")) {
      alert("Please select an .xlsx file.");
      e.target.value = "";
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      setIsBulkUploading(true);

      const response = await API.post(
        "/student/bulk-import",
        formData
      );

      const data = response.data;

      if (data.success) {
        await fetchStudents();

        const errorMessage =
          data.errors?.length > 0
            ? `\nRows with issues: ${data.errors.length}`
            : "";

        alert(
          `${data.message || "Bulk import completed"}\n` +
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
      e.target.value = "";
    }
  };

  // Search Managed Students
  const filteredStudents = students.filter((student) =>
    `${student.name} ${student.email} ${student.phone}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  // Search Registered Students
  const filteredRegisteredStudents = registeredStudents.filter(
    (student) =>
      `${student.name || ""} ${student.email || ""}`
        .toLowerCase()
        .includes(registeredSearch.toLowerCase())
  );

  const profile = registeredProfile?.profile;

  const inputStyle =
    "w-full rounded-xl border border-[#9DBDBA] bg-white/80 px-4 py-3 text-sm text-[#0B2B2A] outline-none transition placeholder:text-[#4B6463] focus:border-teal-700 focus:ring-2 focus:ring-teal-200";

  const actionButton =
    "inline-flex h-9 w-9 items-center justify-center rounded-lg border transition";

  return (
    <div className="mx-auto w-full max-w-[1600px]">

      {/* Page Heading */}
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#0B2B2A] sm:text-4xl">
            Students
          </h1>

          <p className="mt-2 text-sm text-[#3F5A58]">
            Manage and organize student information.
          </p>
        </div>

        {/* Managed Student Actions */}
        {activeTab === "managed" && (
          <div className="flex flex-wrap items-center gap-3">

            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
              onChange={handleBulkFileChange}
              className="hidden"
            />

            <button
              type="button"
              onClick={handleBulkButtonClick}
              disabled={isBulkUploading}
              className="rounded-xl border border-[#CFE5E2] bg-white px-5 py-3 text-sm font-semibold text-[#0B2B2A] transition hover:bg-teal-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isBulkUploading
                ? "Uploading..."
                : "Add Bulk Data"}
            </button>

            <button
              type="button"
              onClick={handleAdd}
              className="rounded-xl bg-teal-700 px-5 py-3 text-sm font-bold text-white transition hover:bg-teal-800"
            >
              + Add New Student
            </button>

          </div>
        )}
      </div>

      {/* Student Tabs */}
      <div className="mb-6 flex gap-3 border-b border-[#CFE5E2]">

        <button
          type="button"
          onClick={() => setActiveTab("managed")}
          className={`px-5 py-3 text-sm font-semibold transition ${activeTab === "managed"
              ? "border-b-2 border-teal-700 text-teal-700"
              : "text-[#3F5A58] hover:text-teal-700"
            }`}
        >
          Managed Students
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("registered")}
          className={`px-5 py-3 text-sm font-semibold transition ${activeTab === "registered"
              ? "border-b-2 border-teal-700 text-teal-700"
              : "text-[#3F5A58] hover:text-teal-700"
            }`}
        >
          Registered Students

          <span className="ml-2 rounded-full bg-teal-50 px-2 py-1 text-xs text-teal-700">
            {registeredStudents.length}
          </span>
        </button>

      </div>

      {/* ===================================== */}
      {/* MANAGED STUDENTS TAB */}
      {/* ===================================== */}

      {activeTab === "managed" && (
        <>

          {/* Search */}
          <div className="mb-5">
            <input
              type="text"
              aria-label="Search students"
              placeholder="Search by name, email or phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={`${inputStyle} sm:max-w-md`}
            />
          </div>

          {/* Students Table */}
          <div className="overflow-hidden rounded-2xl border border-white bg-white/65 shadow-[0_4px_24px_rgba(15,118,110,0.08)] backdrop-blur-xl">

            <div className="flex items-center justify-between border-b border-[#CFE5E2] px-5 py-4">
              <div>
                <h2 className="text-lg font-bold text-[#0B2B2A]">
                  All Students
                </h2>

                <p className="mt-1 text-xs text-[#3F5A58]">
                  Student records and account actions
                </p>
              </div>

              <span className="rounded-full bg-teal-50 px-3 py-1.5 text-xs font-semibold text-teal-700">
                {filteredStudents.length} Students
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[750px] text-left">

                <thead className="bg-[#F1F8F7] text-[11px] font-bold uppercase tracking-wider text-[#3F5A58]">
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
                      className="border-b border-[#CFE5E2] last:border-b-0 hover:bg-teal-50/70"
                    >

                      <td className="px-5 py-4 text-sm text-[#3F5A58]">
                        {index + 1}
                      </td>

                      <td className="px-5 py-4 text-sm font-semibold text-[#0B2B2A]">
                        <div className="flex items-center gap-3">
                          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-teal-50 text-xs font-bold text-teal-700">
                            {(student.name || "?")
                              .split(" ")
                              .map((part) => part[0])
                              .join("")
                              .slice(0, 2)
                              .toUpperCase()}
                          </span>
                          {student.name}
                        </div>
                      </td>

                      <td className="px-5 py-4 text-sm text-[#3F5A58]">
                        {student.email}
                      </td>

                      <td className="px-5 py-4 text-sm text-[#3F5A58]">
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
                                [student._id]: !(
                                  prev[student._id] ?? true
                                ),
                              }))
                            }
                            className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${(studentStatus[student._id] ?? true)
                                ? "bg-teal-700"
                                : "bg-slate-400"
                              }`}
                          >
                            <span
                              className={`absolute left-0 top-1 h-4 w-4 rounded-full bg-white transition-transform ${(studentStatus[student._id] ?? true)
                                  ? "translate-x-6"
                                  : "translate-x-1"
                                }`}
                            />
                          </button>

                          <span className="text-xs text-[#0B2B2A]">
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
                            aria-label="View Student"
                            onClick={() => setViewStudent(student)}
                            className={`${actionButton} border-teal-200 bg-teal-50 text-teal-700 hover:bg-teal-700 hover:text-white`}
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
                            aria-label="Edit Student"
                            onClick={() => handleEdit(student)}
                            className={`${actionButton} border-[#CFE5E2] bg-white text-[#3F5A58] hover:bg-[#0B2B2A] hover:text-white`}
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
                          {role === "Super Admin" && (
                            <button
                              type="button"
                              title="Delete Student"
                            aria-label="Delete Student"
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
                          )}

                        </div>
                      </td>

                    </tr>
                  ))}

                  {filteredStudents.length === 0 && (
                    <tr>
                      <td colSpan="6" className="px-5 py-12 text-center">
                        <p className="text-sm font-semibold text-[#0B2B2A]">
                          No students found
                        </p>

                        <p className="mt-1 text-xs text-[#3F5A58]">
                          Try another search or add a new student.
                        </p>
                      </td>
                    </tr>
                  )}

                </tbody>
              </table>
            </div>
          </div>

        </>
      )}

      {/* ===================================== */}
      {/* REGISTERED STUDENTS TAB */}
      {/* ===================================== */}

      {activeTab === "registered" && (
        <>

          {/* Registered Student Search */}
          <div className="mb-6 rounded-2xl border border-white bg-white/65 shadow-[0_4px_24px_rgba(15,118,110,0.08)] backdrop-blur-xl p-4 sm:p-5">
            <label className="mb-3 block text-sm font-semibold text-[#0B2B2A]">
              Search Registered Students
            </label>

            <input
              type="text"
              placeholder="Search by name or email..."
              value={registeredSearch}
              onChange={(e) => setRegisteredSearch(e.target.value)}
              className={inputStyle}
            />
          </div>

          {/* Registered Students Table */}
          <div className="overflow-hidden rounded-2xl border border-white bg-white/65 shadow-[0_4px_24px_rgba(15,118,110,0.08)] backdrop-blur-xl">

            <div className="flex items-center justify-between border-b border-[#CFE5E2] px-5 py-4">
              <div>
                <h2 className="text-lg font-bold text-[#0B2B2A]">
                  Registered Students
                </h2>

                <p className="mt-1 text-xs text-[#3F5A58]">
                  Accounts created through the student portal
                </p>
              </div>

              <span className="rounded-full bg-teal-50 px-3 py-1.5 text-xs font-semibold text-teal-700">
                {filteredRegisteredStudents.length} Students
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[650px] text-left">

                <thead className="bg-[#F1F8F7] text-[11px] font-bold uppercase tracking-wider text-[#3F5A58]">
                  <tr>
                    <th className="px-5 py-4">#</th>
                    <th className="px-5 py-4">Name</th>
                    <th className="px-5 py-4">Email</th>
                    <th className="px-5 py-4">Registered On</th>
                    <th className="px-5 py-4">Profile</th>
                    <th className="px-5 py-4">Action</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredRegisteredStudents.map((student, index) => (
                    <tr
                      key={student._id}
                      className="border-b border-[#CFE5E2] last:border-b-0 hover:bg-teal-50/70"
                    >

                      <td className="px-5 py-4 text-sm text-[#3F5A58]">
                        {index + 1}
                      </td>

                      <td className="px-5 py-4 text-sm font-semibold text-[#0B2B2A]">
                        {student.name || "—"}
                      </td>

                      <td className="px-5 py-4 text-sm text-[#3F5A58]">
                        {student.email || "—"}
                      </td>

                      <td className="px-5 py-4 text-sm text-[#3F5A58]">
                        {student.createdAt
                          ? new Date(student.createdAt).toLocaleDateString()
                          : "—"}
                      </td>

                      <td className="px-5 py-4">
                        <span className="rounded-full bg-teal-50 px-3 py-1.5 text-xs font-semibold text-teal-800">
                          Registered
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <button
                          type="button"
                          onClick={() =>
                            handleViewRegisteredProfile(student._id)
                          }
                          className="rounded-lg bg-teal-700 px-4 py-2 text-xs font-semibold text-white transition hover:opacity-90"
                        >
                          View Profile
                        </button>
                      </td>

                    </tr>
                  ))}

                  {filteredRegisteredStudents.length === 0 && (
                    <tr>
                      <td
                        colSpan="6"
                        className="px-5 py-12 text-center text-sm text-[#3F5A58]"
                      >
                        No registered students found.
                      </td>
                    </tr>
                  )}

                </tbody>
              </table>
            </div>
          </div>

        </>
      )}

      {/* ===================================== */}
      {/* REGISTERED STUDENT PROFILE MODAL */}
      {/* ===================================== */}

      {(isProfileLoading || registeredProfile) && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center overflow-y-auto bg-[#0B2B2A]/60 p-4 backdrop-blur-sm">

          <div className="my-auto max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-2xl border border-[#CFE5E2] bg-white shadow-2xl">

            {/* Modal Header */}
            <div className="sticky top-0 z-10 flex items-center justify-between bg-teal-700 px-6 py-5 text-white">

              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-teal-100">
                  Registered Student
                </p>

                <h2 className="mt-1 text-xl font-bold">
                  Complete Profile
                </h2>
              </div>

              <button
                type="button"
                onClick={() => {
                  setRegisteredProfile(null);
                  setIsProfileLoading(false);
                }}
                className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 text-xl hover:bg-white/20"
                aria-label="Close profile"
              >
                ×
              </button>

            </div>

            {/* Loading */}
            {isProfileLoading ? (
              <div className="p-10 text-center text-sm text-[#3F5A58]">
                Loading student profile...
              </div>
            ) : !registeredProfile?.profileCompleted || !profile ? (

              /* Incomplete Profile */
              <div className="p-10 text-center">
                <p className="font-semibold text-[#0B2B2A]">
                  Profile not completed yet
                </p>

                <p className="mt-2 text-sm text-[#3F5A58]">
                  This student has registered but has not submitted profile details.
                </p>
              </div>

            ) : (

              /* Complete Profile Details */
              <div className="space-y-6 p-6">

                {/* Personal Header */}
                <section className="flex flex-wrap items-center gap-4 rounded-xl bg-[#F1F8F7] p-5">

                  {profile.profileImage?.url ? (
                    <img
                      src={profile.profileImage.url}
                      alt="Student profile"
                      className="h-20 w-20 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-teal-50 text-2xl text-teal-700">
                      {profile.name?.[0] || "S"}
                    </div>
                  )}

                  <div>
                    <h3 className="text-lg font-bold text-[#0B2B2A]">
                      {profile.name || "—"}
                    </h3>

                    <p className="text-sm text-[#3F5A58]">
                      {profile.email || "—"}
                    </p>

                    <p className="mt-1 text-xs text-[#3F5A58]">
                      {profile.gender || "Gender not added"}

                      {profile.dob
                        ? ` • ${new Date(profile.dob).toLocaleDateString()}`
                        : ""}
                    </p>
                  </div>

                </section>

                {/* Personal Details */}
                <section>
                  <h3 className="mb-3 font-bold text-[#0B2B2A]">
                    Personal Details
                  </h3>

                  <div className="grid gap-3 sm:grid-cols-3">

                    {[
                      ["City", profile.city],
                      ["State", profile.state],
                      ["Country", profile.country],
                    ].map(([label, value]) => (
                      <div
                        key={label}
                        className="rounded-xl bg-[#F1F8F7] p-4"
                      >
                        <p className="text-xs text-[#3F5A58]">
                          {label}
                        </p>

                        <p className="mt-1 text-sm font-semibold text-[#0B2B2A]">
                          {value || "—"}
                        </p>
                      </div>
                    ))}

                  </div>
                </section>

                {/* Academic Details */}
                <section>
                  <h3 className="mb-3 font-bold text-[#0B2B2A]">
                    Academic Details
                  </h3>

                  <div className="grid gap-3 md:grid-cols-3">

                    {[
                      ["10th", profile.academicDetails?.tenth],
                      ["12th", profile.academicDetails?.twelfth],
                      ["Graduation", profile.academicDetails?.graduation],
                    ].map(([title, item]) => (
                      <div
                        key={title}
                        className="rounded-xl border border-[#CFE5E2] p-4"
                      >
                        <h4 className="mb-2 text-sm font-bold text-teal-700">
                          {title}
                        </h4>

                        <p className="text-sm text-[#0B2B2A]">
                          Board/College:{" "}
                          {item?.board || item?.college || "—"}
                        </p>

                        <p className="text-sm text-[#0B2B2A]">
                          Course/Stream:{" "}
                          {item?.course || item?.stream || "—"}
                        </p>

                        <p className="text-sm text-[#0B2B2A]">
                          Passing Year: {item?.passingYear || "—"}
                        </p>

                        <p className="text-sm text-[#0B2B2A]">
                          Percentage: {item?.percentage ?? "—"}
                          {item?.percentage != null ? "%" : ""}
                        </p>
                      </div>
                    ))}

                  </div>
                </section>

                {/* Entrance Exams */}
                <section>
                  <h3 className="mb-3 font-bold text-[#0B2B2A]">
                    Entrance Exams
                  </h3>

                  <div className="space-y-2">

                    {profile.entranceExams?.length ? (
                      profile.entranceExams.map((exam) => (
                        <div
                          key={exam._id}
                          className="grid gap-2 rounded-xl bg-[#F1F8F7] p-4 sm:grid-cols-4"
                        >
                          <p className="text-sm font-semibold text-[#0B2B2A]">
                            {exam.exam?.name || exam.examName || "—"}
                          </p>

                          <p className="text-sm text-[#3F5A58]">
                            Year: {exam.examYear || exam.year || "—"}
                          </p>

                          <p className="text-sm text-[#3F5A58]">
                            Score: {exam.score ?? "—"}
                          </p>

                          <p className="text-sm text-[#3F5A58]">
                            Rank: {exam.air ?? exam.rank ?? "—"}
                          </p>

                          <p className="text-sm text-[#3F5A58]">
                            Roll No: {exam.rollNumber || "—"}
                          </p>

                          <p className="text-sm text-[#3F5A58]">
                            Status: {exam.status || "—"}
                          </p>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-[#3F5A58]">
                        No entrance exam details added.
                      </p>
                    )}

                  </div>
                </section>

                {/* Preferred Courses */}
                <section>
                  <h3 className="mb-3 font-bold text-[#0B2B2A]">
                    Preferred Courses
                  </h3>

                  <div className="space-y-2">

                    {profile.preferredCourseDetails?.length ? (
                      profile.preferredCourseDetails.map((course) => (
                        <div
                          key={course._id}
                          className="grid gap-2 rounded-xl bg-[#F1F8F7] p-4 sm:grid-cols-4"
                        >
                          <p className="text-sm font-semibold text-[#0B2B2A]">
                            {course.courseName || "—"}
                          </p>

                          <p className="text-sm text-[#3F5A58]">
                            Type: {course.courseType || "—"}
                          </p>

                          <p className="text-sm text-[#3F5A58]">
                            Specialization: {course.specialization || "—"}
                          </p>

                          <p className="text-sm text-[#3F5A58]">
                            Priority: {course.priority || "—"}
                          </p>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-[#3F5A58]">
                        No course preferences added.
                      </p>
                    )}

                  </div>
                </section>

                {/* Preferred Locations */}
                <section>
                  <h3 className="mb-3 font-bold text-[#0B2B2A]">
                    Preferred Locations
                  </h3>

                  <div className="space-y-2">

                    {profile.preferredLocationDetails?.length ? (
                      profile.preferredLocationDetails.map((location) => (
                        <div
                          key={location._id}
                          className="grid gap-2 rounded-xl bg-[#F1F8F7] p-4 sm:grid-cols-4"
                        >
                          <p className="text-sm font-semibold text-[#0B2B2A]">
                            {location.city || "—"}
                          </p>

                          <p className="text-sm text-[#3F5A58]">
                            {location.state || "—"},{" "}
                            {location.country || "—"}
                          </p>

                          <p className="text-sm text-[#3F5A58]">
                            Type: {location.locationType || "—"}
                          </p>

                          <p className="text-sm text-[#3F5A58]">
                            Priority: {location.priority || "—"}
                          </p>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-[#3F5A58]">
                        No location preferences added.
                      </p>
                    )}

                  </div>
                </section>

                {/* Budget */}
                <section>
                  <h3 className="mb-3 font-bold text-[#0B2B2A]">
                    Budget
                  </h3>

                  <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">

                    {Object.entries(profile.budget || {}).map(
                      ([key, value]) => (
                        <div
                          key={key}
                          className="rounded-xl bg-[#F1F8F7] p-3"
                        >
                          <p className="text-xs capitalize text-[#3F5A58]">
                            {key.replace(/([A-Z])/g, " $1")}
                          </p>

                          <p className="mt-1 text-sm font-semibold text-[#0B2B2A]">
                            {value || "—"}
                          </p>
                        </div>
                      )
                    )}

                  </div>
                </section>

                {/* Documents */}
                <section>
                  <h3 className="mb-3 font-bold text-[#0B2B2A]">
                    Documents
                  </h3>

                  <div className="space-y-2">

                    {profile.documents?.length ? (
                      profile.documents.map((doc) => (
                        <div
                          key={doc._id}
                          className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#CFE5E2] p-4"
                        >

                          <div>
                            <p className="text-sm font-semibold text-[#0B2B2A]">
                              {doc.documentType || doc.fileName}
                            </p>

                            <p className="text-xs text-[#3F5A58]">
                              {doc.fileName}
                            </p>
                          </div>

                          <div className="flex items-center gap-3">

                            <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
                              {doc.status || "Pending"}
                            </span>

                            {doc.url && (
                              <a
                                href={doc.url}
                                target="_blank"
                                rel="noreferrer"
                                className="text-sm font-semibold text-teal-700 underline"
                              >
                                View
                              </a>
                            )}

                          </div>

                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-[#3F5A58]">
                        No documents uploaded.
                      </p>
                    )}

                  </div>
                </section>

              </div>
            )}

            {/* Modal Footer */}
            <div className="border-t border-[#CFE5E2] p-5">
              <button
                type="button"
                onClick={() => {
                  setRegisteredProfile(null);
                  setIsProfileLoading(false);
                }}
                className="w-full rounded-xl border border-[#CFE5E2] px-5 py-3 text-sm font-semibold text-[#0B2B2A] transition hover:bg-teal-50"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ===================================== */}
      {/* ADD / EDIT STUDENT MODAL */}
      {/* ===================================== */}

      {showForm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-[#0B2B2A]/60 p-4 backdrop-blur-sm"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) {
              handleCancel();
            }
          }}
        >

          <div className="my-auto w-full max-w-lg overflow-hidden rounded-2xl border border-[#CFE5E2] bg-white shadow-2xl">

            <div className="flex items-center justify-between bg-teal-700 px-6 py-5 text-white">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-teal-100">
                  Student Management
                </p>

                <h2 className="mt-1 text-xl font-bold">
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
                <label className="mb-2 block text-sm font-semibold text-[#0B2B2A]">
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
                <label className="mb-2 block text-sm font-semibold text-[#0B2B2A]">
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
                <label className="mb-2 block text-sm font-semibold text-[#0B2B2A]">
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

              <div className="flex justify-end gap-3 border-t border-[#CFE5E2] pt-5">

                <button
                  type="button"
                  onClick={handleCancel}
                  className="rounded-xl border border-[#CFE5E2] px-5 py-3 text-sm font-semibold text-[#3F5A58] transition hover:bg-teal-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="rounded-xl bg-teal-700 px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90"
                >
                  {editingId ? "Update Student" : "Save Student"}
                </button>

              </div>
            </form>

          </div>
        </div>
      )}

      {/* ===================================== */}
      {/* MANAGED STUDENT VIEW MODAL */}
      {/* ===================================== */}

      {viewStudent && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-[#0B2B2A]/60 p-4 backdrop-blur-sm"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) {
              setViewStudent(null);
            }
          }}
        >

          <div className="my-auto w-full max-w-lg overflow-hidden rounded-2xl border border-[#CFE5E2] bg-white shadow-2xl">

            <div className="flex items-center justify-between bg-teal-700 px-6 py-5 text-white">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-teal-100">
                  Student Information
                </p>

                <h2 className="mt-1 text-xl font-bold">
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

              <div className="rounded-xl bg-[#F1F8F7] p-4">
                <p className="text-xs text-[#3F5A58]">
                  Student Name
                </p>

                <p className="mt-2 break-words text-sm font-semibold text-[#0B2B2A]">
                  {viewStudent.name}
                </p>
              </div>

              <div className="rounded-xl bg-[#F1F8F7] p-4">
                <p className="text-xs text-[#3F5A58]">
                  Email Address
                </p>

                <p className="mt-2 break-words text-sm font-semibold text-[#0B2B2A]">
                  {viewStudent.email}
                </p>
              </div>

              <div className="rounded-xl bg-[#F1F8F7] p-4">
                <p className="text-xs text-[#3F5A58]">
                  Phone Number
                </p>

                <p className="mt-2 break-words text-sm font-semibold text-[#0B2B2A]">
                  {viewStudent.phone}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setViewStudent(null)}
                className="w-full rounded-xl border border-[#CFE5E2] px-5 py-3 text-sm font-semibold text-[#0B2B2A] transition hover:bg-teal-50"
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
