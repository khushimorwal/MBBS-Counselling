import { useEffect, useState } from "react";
import { API } from "../api/axios.js";
import {
  FiFileText,
  FiEye,
  FiCheckCircle,
  FiXCircle,
  FiClock,
  FiSearch,
  FiRefreshCw,
  FiX,
} from "react-icons/fi";

export default function DocumentVerification() {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [updating, setUpdating] = useState("");
  const [preview, setPreview] = useState(null);

  // FETCH ALL STUDENT DOCUMENTS
  const fetchDocuments = async () => {
    try {
      setLoading(true);

      const response = await API.get("/documents/all");

      setProfiles(response.data.profiles || []);
    } catch (error) {
      console.error("Fetch Documents Error:", error);

      alert(
        error.response?.data?.message ||
          "Unable to fetch student documents"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  // UPDATE DOCUMENT STATUS
  const updateStatus = async (userId, documentType, status) => {
    const action = status === "Verified" ? "verify" : "reject";

    if (!window.confirm(`Are you sure you want to ${action} this document?`)) {
      return;
    }

    const key = `${userId}-${documentType}`;

    try {
      setUpdating(key);

      const response = await API.put("/documents/status", {
        userId,
        documentType,
        status,
      });

      alert(response.data.message || `Document ${action} successfully`);

      await fetchDocuments();
    } catch (error) {
      console.error("Update Document Status Error:", error);

      alert(
        error.response?.data?.message ||
          "Unable to update document status"
      );
    } finally {
      setUpdating("");
    }
  };

  // FILTER DOCUMENTS
  const allDocuments = profiles.flatMap((profile) =>
    (profile.documents || []).map((document) => ({
      ...document,
      userId: profile.user?._id,
      studentName: profile.user?.name || profile.name || "Unknown Student",
      studentEmail: profile.user?.email || profile.email || "N/A",
    }))
  );

  const filteredDocuments = allDocuments.filter((document) => {
    const value = search.toLowerCase();

    return (
      document.studentName.toLowerCase().includes(value) ||
      document.studentEmail.toLowerCase().includes(value) ||
      document.documentType.toLowerCase().includes(value)
    );
  });

  const pendingCount = allDocuments.filter(
    (doc) => doc.status === "Pending"
  ).length;

  const verifiedCount = allDocuments.filter(
    (doc) => doc.status === "Verified"
  ).length;

  const rejectedCount = allDocuments.filter(
    (doc) => doc.status === "Rejected"
  ).length;

  const getStatusStyle = (status) => {
    switch (status) {
      case "Verified":
        return "bg-green-50 text-green-700";

      case "Rejected":
        return "bg-red-50 text-red-700";

      default:
        return "bg-amber-50 text-amber-700";
    }
  };

  return (
    <div className="min-h-screen space-y-6 bg-[#f8fafc] p-4 sm:p-6 lg:p-8">

      {/* HEADER */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-[#142653]">
            Document Verification
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Review and verify student admission documents.
          </p>
        </div>

        <button
          onClick={fetchDocuments}
          className="flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm border border-slate-200 hover:bg-slate-50"
        >
          <FiRefreshCw />
          Refresh
        </button>
      </div>

      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

        <SummaryCard
          title="Total Documents"
          value={allDocuments.length}
          icon={<FiFileText />}
          color="bg-blue-50 text-blue-600"
        />

        <SummaryCard
          title="Pending"
          value={pendingCount}
          icon={<FiClock />}
          color="bg-amber-50 text-amber-600"
        />

        <SummaryCard
          title="Verified"
          value={verifiedCount}
          icon={<FiCheckCircle />}
          color="bg-green-50 text-green-600"
        />

        <SummaryCard
          title="Rejected"
          value={rejectedCount}
          icon={<FiXCircle />}
          color="bg-red-50 text-red-600"
        />

      </div>

      {/* SEARCH */}
      <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3">
        <FiSearch className="text-slate-400" />

        <input
          type="text"
          placeholder="Search student, email or document..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full text-sm outline-none"
        />
      </div>

      {/* DOCUMENT TABLE */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

        <div className="border-b border-slate-100 px-5 py-5">
          <h2 className="text-lg font-bold text-[#142653]">
            Uploaded Documents
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1050px] text-left">

            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-6 py-4">Student</th>
                <th className="px-6 py-4">Document</th>
                <th className="px-6 py-4">File Name</th>
                <th className="px-6 py-4">Uploaded At</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">

              {loading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-slate-500">
                    Loading documents...
                  </td>
                </tr>
              ) : filteredDocuments.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-slate-500">
                    No documents found.
                  </td>
                </tr>
              ) : (
                filteredDocuments.map((doc, index) => {
                  const key = `${doc.userId}-${doc.documentType}`;

                  return (
                    <tr key={`${key}-${index}`} className="transition hover:bg-slate-50">

                      <td className="px-6 py-5">
                        <p className="text-sm font-semibold text-slate-800">
                          {doc.studentName}
                        </p>

                        <p className="mt-1 text-xs text-slate-400">
                          {doc.studentEmail}
                        </p>
                      </td>

                      <td className="px-6 py-5 text-sm font-medium text-slate-700">
                        {doc.documentType}
                      </td>

                      <td className="px-6 py-5 text-sm text-slate-500">
                        {doc.fileName}
                      </td>

                      <td className="px-6 py-5 text-sm text-slate-500">
                        {doc.uploadedAt
                          ? new Date(doc.uploadedAt).toLocaleDateString()
                          : "N/A"}
                      </td>

                      <td className="px-6 py-5">
                        <span
                          className={`rounded-full px-3 py-1.5 text-xs font-semibold ${getStatusStyle(doc.status)}`}
                        >
                          {doc.status}
                        </span>
                      </td>

                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">

                          <button
                            onClick={() => setPreview(doc)}
                            title="View Document"
                            className="text-blue-600 hover:text-blue-800"
                          >
                            <FiEye size={18} />
                          </button>

                          {doc.status !== "Verified" && (
                            <button
                              disabled={updating === key}
                              onClick={() =>
                                updateStatus(
                                  doc.userId,
                                  doc.documentType,
                                  "Verified"
                                )
                              }
                              title="Verify"
                              className="text-green-600 hover:text-green-800 disabled:opacity-50"
                            >
                              <FiCheckCircle size={19} />
                            </button>
                          )}

                          {doc.status !== "Rejected" && (
                            <button
                              disabled={updating === key}
                              onClick={() =>
                                updateStatus(
                                  doc.userId,
                                  doc.documentType,
                                  "Rejected"
                                )
                              }
                              title="Reject"
                              className="text-red-500 hover:text-red-700 disabled:opacity-50"
                            >
                              <FiXCircle size={19} />
                            </button>
                          )}

                        </div>
                      </td>

                    </tr>
                  );
                })
              )}

            </tbody>
          </table>
        </div>
      </div>

      {/* DOCUMENT PREVIEW MODAL */}
      {preview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">

          <div className="w-full max-w-3xl rounded-2xl bg-white p-5 shadow-xl">

            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-[#142653]">
                  Document Preview
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  {preview.documentType} - {preview.studentName}
                </p>
              </div>

              <button
                onClick={() => setPreview(null)}
                className="text-xl text-slate-500 hover:text-red-500"
              >
                <FiX />
              </button>
            </div>

            {preview.resourceType === "image" ? (
              <img
                src={preview.url}
                alt={preview.documentType}
                className="mx-auto max-h-[65vh] rounded-xl object-contain"
              />
            ) : (
              <div className="rounded-xl bg-slate-50 p-8 text-center">
                <FiFileText className="mx-auto mb-3 text-5xl text-blue-600" />

                <p className="font-semibold text-slate-700">
                  {preview.fileName}
                </p>

                <a
                  href={preview.url}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-4 inline-block rounded-lg bg-teal-600 px-5 py-2 text-sm font-semibold text-white"
                >
                  Open Document
                </a>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
}

function SummaryCard({ title, value, icon, color }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">
            {title}
          </p>

          <h3 className="mt-2 text-2xl font-bold text-[#142653]">
            {value}
          </h3>
        </div>

        <div className={`flex h-12 w-12 items-center justify-center rounded-xl text-xl ${color}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}