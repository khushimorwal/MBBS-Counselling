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
    "w-full rounded-xl border border-line bg-white px-4 py-3 text-sm text-brand-dark outline-none transition placeholder:text-gray-400 focus:border-brand focus:ring-2 focus:ring-brand/10";

  const actionButton =
    "inline-flex h-9 w-9 items-center justify-center rounded-lg border transition";

  return (
    <div className="mx-auto w-full max-w-[1600px]">

      {/* Page Heading */}
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
              className="rounded-xl border border-brand px-5 py-3 text-sm font-semibold text-brand transition hover:bg-brand-soft disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isBulkUploading
                ? "Uploading..."
                : "Add Bulk Data"}
            </button>

            <button
              type="button"
              onClick={handleAdd}
              className="rounded-xl bg-accent px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90"
            >
              + Add New Student
            </button>

          </div>
        )}
      </div>

      {/* Student Tabs */}
      <div className="mb-6 flex gap-3 border-b border-line">

        <button
          type="button"
          onClick={() => setActiveTab("managed")}
          className={`px-5 py-3 text-sm font-semibold transition ${activeTab === "managed"
              ? "border-b-2 border-brand text-brand"
              : "text-muted hover:text-brand"
            }`}
        >
          Managed Students
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("registered")}
          className={`px-5 py-3 text-sm font-semibold transition ${activeTab === "registered"
              ? "border-b-2 border-brand text-brand"
              : "text-muted hover:text-brand"
            }`}
        >
          Registered Students

          <span className="ml-2 rounded-full bg-brand-soft px-2 py-1 text-xs text-brand">
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

          {/* Students Table */}
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
                                [student._id]: !(
                                  prev[student._id] ?? true
                                ),
                              }))
                            }
                            className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${(studentStatus[student._id] ?? true)
                                ? "bg-brand"
                                : "bg-gray-300"
                              }`}
                          >
                            <span
                              className={`absolute top-1 h-4 w-4 rounded-full bg-white transition-transform ${(studentStatus[student._id] ?? true)
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
                          {role === "Super Admin" && (
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
                          )}

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

        </>
      )}

      {/* ===================================== */}
      {/* REGISTERED STUDENTS TAB */}
      {/* ===================================== */}

      {activeTab === "registered" && (
        <>

          {/* Registered Student Search */}
          <div className="mb-6 rounded-2xl border border-line bg-white p-4 sm:p-5">
            <label className="mb-3 block text-sm font-semibold text-brand-dark">
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
          <div className="overflow-hidden rounded-2xl border border-line bg-white">

            <div className="flex items-center justify-between border-b border-line px-5 py-4">
              <div>
                <h2 className="font-display text-lg font-bold text-brand-dark">
                  Registered Students
                </h2>

                <p className="mt-1 text-xs text-muted">
                  Accounts created through the student portal
                </p>
              </div>

              <span className="rounded-full bg-brand-soft px-3 py-1.5 text-xs font-semibold text-brand">
                {filteredRegisteredStudents.length} Students
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[650px] text-left">

                <thead className="bg-brand text-xs uppercase tracking-wider text-white">
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
                      className="border-b border-line last:border-b-0 hover:bg-surface/70"
                    >

                      <td className="px-5 py-4 text-sm text-muted">
                        {index + 1}
                      </td>

                      <td className="px-5 py-4 text-sm font-semibold text-brand-dark">
                        {student.name || "—"}
                      </td>

                      <td className="px-5 py-4 text-sm text-muted">
                        {student.email || "—"}
                      </td>

                      <td className="px-5 py-4 text-sm text-muted">
                        {student.createdAt
                          ? new Date(student.createdAt).toLocaleDateString()
                          : "—"}
                      </td>

                      <td className="px-5 py-4">
                        <span className="rounded-full bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700">
                          Registered
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <button
                          type="button"
                          onClick={() =>
                            handleViewRegisteredProfile(student._id)
                          }
                          className="rounded-lg bg-brand px-4 py-2 text-xs font-semibold text-white transition hover:opacity-90"
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
                        className="px-5 py-12 text-center text-sm text-muted"
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
        <div className="fixed inset-0 z-[60] flex items-center justify-center overflow-y-auto bg-brand-dark/60 p-4 backdrop-blur-sm">

          <div className="my-auto max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-2xl border border-line bg-white shadow-2xl">

            {/* Modal Header */}
            <div className="sticky top-0 z-10 flex items-center justify-between bg-brand px-6 py-5 text-white">

              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-white/60">
                  Registered Student
                </p>

                <h2 className="mt-1 font-display text-xl font-bold">
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
              <div className="p-10 text-center text-sm text-muted">
                Loading student profile...
              </div>
            ) : !registeredProfile?.profileCompleted || !profile ? (

              /* Incomplete Profile */
              <div className="p-10 text-center">
                <p className="font-semibold text-brand-dark">
                  Profile not completed yet
                </p>

                <p className="mt-2 text-sm text-muted">
                  This student has registered but has not submitted profile details.
                </p>
              </div>

            ) : (

              /* Complete Profile Details */
              <div className="space-y-6 p-6">

                {/* Personal Header */}
                <section className="flex flex-wrap items-center gap-4 rounded-xl bg-surface p-5">

                  {profile.profileImage?.url ? (
                    <img
                      src={profile.profileImage.url}
                      alt="Student profile"
                      className="h-20 w-20 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-brand-soft text-2xl text-brand">
                      {profile.name?.[0] || "S"}
                    </div>
                  )}

                  <div>
                    <h3 className="text-lg font-bold text-brand-dark">
                      {profile.name || "—"}
                    </h3>

                    <p className="text-sm text-muted">
                      {profile.email || "—"}
                    </p>

                    <p className="mt-1 text-xs text-muted">
                      {profile.gender || "Gender not added"}

                      {profile.dob
                        ? ` • ${new Date(profile.dob).toLocaleDateString()}`
                        : ""}
                    </p>
                  </div>

                </section>

                {/* Personal Details */}
                <section>
                  <h3 className="mb-3 font-bold text-brand-dark">
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
                        className="rounded-xl bg-surface p-4"
                      >
                        <p className="text-xs text-muted">
                          {label}
                        </p>

                        <p className="mt-1 text-sm font-semibold text-brand-dark">
                          {value || "—"}
                        </p>
                      </div>
                    ))}

                  </div>
                </section>

                {/* Academic Details */}
                <section>
                  <h3 className="mb-3 font-bold text-brand-dark">
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
                        className="rounded-xl border border-line p-4"
                      >
                        <h4 className="mb-2 text-sm font-bold text-brand">
                          {title}
                        </h4>

                        <p className="text-sm text-brand-dark">
                          Board/College:{" "}
                          {item?.board || item?.college || "—"}
                        </p>

                        <p className="text-sm text-brand-dark">
                          Course/Stream:{" "}
                          {item?.course || item?.stream || "—"}
                        </p>

                        <p className="text-sm text-brand-dark">
                          Passing Year: {item?.passingYear || "—"}
                        </p>

                        <p className="text-sm text-brand-dark">
                          Percentage: {item?.percentage ?? "—"}
                          {item?.percentage != null ? "%" : ""}
                        </p>
                      </div>
                    ))}

                  </div>
                </section>

                {/* Entrance Exams */}
                <section>
                  <h3 className="mb-3 font-bold text-brand-dark">
                    Entrance Exams
                  </h3>

                  <div className="space-y-2">

                    {profile.entranceExams?.length ? (
                      profile.entranceExams.map((exam) => (
                        <div
                          key={exam._id}
                          className="grid gap-2 rounded-xl bg-surface p-4 sm:grid-cols-4"
                        >
                          <p className="text-sm font-semibold text-brand-dark">
                            {exam.exam?.name || exam.examName || "—"}
                          </p>

                          <p className="text-sm text-muted">
                            Year: {exam.examYear || exam.year || "—"}
                          </p>

                          <p className="text-sm text-muted">
                            Score: {exam.score ?? "—"}
                          </p>

                          <p className="text-sm text-muted">
                            Rank: {exam.air ?? exam.rank ?? "—"}
                          </p>

                          <p className="text-sm text-muted">
                            Roll No: {exam.rollNumber || "—"}
                          </p>

                          <p className="text-sm text-muted">
                            Status: {exam.status || "—"}
                          </p>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-muted">
                        No entrance exam details added.
                      </p>
                    )}

                  </div>
                </section>

                {/* Preferred Courses */}
                <section>
                  <h3 className="mb-3 font-bold text-brand-dark">
                    Preferred Courses
                  </h3>

                  <div className="space-y-2">

                    {profile.preferredCourseDetails?.length ? (
                      profile.preferredCourseDetails.map((course) => (
                        <div
                          key={course._id}
                          className="grid gap-2 rounded-xl bg-surface p-4 sm:grid-cols-4"
                        >
                          <p className="text-sm font-semibold text-brand-dark">
                            {course.courseName || "—"}
                          </p>

                          <p className="text-sm text-muted">
                            Type: {course.courseType || "—"}
                          </p>

                          <p className="text-sm text-muted">
                            Specialization: {course.specialization || "—"}
                          </p>

                          <p className="text-sm text-muted">
                            Priority: {course.priority || "—"}
                          </p>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-muted">
                        No course preferences added.
                      </p>
                    )}

                  </div>
                </section>

                {/* Preferred Locations */}
                <section>
                  <h3 className="mb-3 font-bold text-brand-dark">
                    Preferred Locations
                  </h3>

                  <div className="space-y-2">

                    {profile.preferredLocationDetails?.length ? (
                      profile.preferredLocationDetails.map((location) => (
                        <div
                          key={location._id}
                          className="grid gap-2 rounded-xl bg-surface p-4 sm:grid-cols-4"
                        >
                          <p className="text-sm font-semibold text-brand-dark">
                            {location.city || "—"}
                          </p>

                          <p className="text-sm text-muted">
                            {location.state || "—"},{" "}
                            {location.country || "—"}
                          </p>

                          <p className="text-sm text-muted">
                            Type: {location.locationType || "—"}
                          </p>

                          <p className="text-sm text-muted">
                            Priority: {location.priority || "—"}
                          </p>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-muted">
                        No location preferences added.
                      </p>
                    )}

                  </div>
                </section>

                {/* Budget */}
                <section>
                  <h3 className="mb-3 font-bold text-brand-dark">
                    Budget
                  </h3>

                  <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">

                    {Object.entries(profile.budget || {}).map(
                      ([key, value]) => (
                        <div
                          key={key}
                          className="rounded-xl bg-surface p-3"
                        >
                          <p className="text-xs capitalize text-muted">
                            {key.replace(/([A-Z])/g, " $1")}
                          </p>

                          <p className="mt-1 text-sm font-semibold text-brand-dark">
                            {value || "—"}
                          </p>
                        </div>
                      )
                    )}

                  </div>
                </section>

                {/* Documents */}
                <section>
                  <h3 className="mb-3 font-bold text-brand-dark">
                    Documents
                  </h3>

                  <div className="space-y-2">

                    {profile.documents?.length ? (
                      profile.documents.map((doc) => (
                        <div
                          key={doc._id}
                          className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-line p-4"
                        >

                          <div>
                            <p className="text-sm font-semibold text-brand-dark">
                              {doc.documentType || doc.fileName}
                            </p>

                            <p className="text-xs text-muted">
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
                                className="text-sm font-semibold text-brand underline"
                              >
                                View
                              </a>
                            )}

                          </div>

                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-muted">
                        No documents uploaded.
                      </p>
                    )}

                  </div>
                </section>

              </div>
            )}

            {/* Modal Footer */}
            <div className="border-t border-line p-5">
              <button
                type="button"
                onClick={() => {
                  setRegisteredProfile(null);
                  setIsProfileLoading(false);
                }}
                className="w-full rounded-xl border border-line px-5 py-3 text-sm font-semibold text-brand-dark transition hover:bg-surface"
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

      {/* ===================================== */}
      {/* MANAGED STUDENT VIEW MODAL */}
      {/* ===================================== */}

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
                <p className="text-xs text-muted">
                  Student Name
                </p>

                <p className="mt-2 break-words text-sm font-semibold text-brand-dark">
                  {viewStudent.name}
                </p>
              </div>

              <div className="rounded-xl bg-surface p-4">
                <p className="text-xs text-muted">
                  Email Address
                </p>

                <p className="mt-2 break-words text-sm font-semibold text-brand-dark">
                  {viewStudent.email}
                </p>
              </div>

              <div className="rounded-xl bg-surface p-4">
                <p className="text-xs text-muted">
                  Phone Number
                </p>

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