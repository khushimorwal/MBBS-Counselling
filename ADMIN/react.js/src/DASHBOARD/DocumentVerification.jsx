import { useEffect, useState } from "react";
import { API } from "../api/axios.js";
import {
  FiFileText,
  FiEye,
  FiCheckCircle,
  FiXCircle,
  FiClock,
  FiX,
} from "react-icons/fi";

const actionButton =
  "inline-flex h-9 w-9 items-center justify-center rounded-lg border transition disabled:cursor-not-allowed disabled:opacity-50";

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
        return "bg-teal-50 text-teal-700";

      case "Rejected":
        return "bg-red-50 text-red-700";

      default:
        return "bg-amber-50 text-amber-700";
    }
  };

  return (
    <div className="min-w-0 space-y-6">

      {/* PAGE HEADER */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#0B2B2A]">
            Document Verification
          </h1>

          <p className="mt-1 text-sm text-[#3F5A58]">
            Review and verify student admission documents
          </p>
        </div>

        <button
          type="button"
          onClick={fetchDocuments}
          className="rounded-xl border border-[#CFE5E2] bg-white px-5 py-2.5 text-sm font-semibold text-[#0B2B2A] hover:bg-teal-50"
        >
          ↻ Refresh
        </button>
      </div>

      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          title="Total Documents"
          value={allDocuments.length}
          icon={<FiFileText />}
          color="border-teal-200 bg-teal-50 text-teal-700"
        />

        <SummaryCard
          title="Pending"
          value={pendingCount}
          icon={<FiClock />}
          color="border-amber-200 bg-amber-50 text-amber-600"
        />

        <SummaryCard
          title="Verified"
          value={verifiedCount}
          icon={<FiCheckCircle />}
          color="border-teal-200 bg-teal-50 text-teal-700"
        />

        <SummaryCard
          title="Rejected"
          value={rejectedCount}
          icon={<FiXCircle />}
          color="border-red-200 bg-red-50 text-red-600"
        />
      </div>

      {/* SEARCH */}
      <input
        type="text"
        placeholder="Search student, email or document..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full max-w-sm rounded-xl border border-[#9DBDBA] bg-white/80 px-4 py-2.5 text-sm text-[#0B2B2A] outline-none placeholder:text-[#4B6463] focus:border-teal-700 focus:ring-2 focus:ring-teal-200"
      />

      {/* DOCUMENTS TABLE */}
      <div className="overflow-x-auto rounded-2xl border border-white bg-white/65 text-[#0B2B2A] shadow-[0_4px_24px_rgba(15,118,110,0.08)] backdrop-blur-xl">
        <table className="w-full min-w-[1050px] text-left text-sm">
          <thead className="bg-[#F1F8F7] text-[11px] font-bold uppercase tracking-wider text-[#3F5A58]">
            <tr>
              <th className="px-4 py-4">Student</th>
              <th className="px-4 py-4">Document</th>
              <th className="px-4 py-4">File Name</th>
              <th className="px-4 py-4">Uploaded At</th>
              <th className="px-4 py-4">Status</th>
              <th className="px-4 py-4">Actions</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan="6"
                  className="px-4 py-10 text-center text-[#3F5A58]"
                >
                  Loading documents...
                </td>
              </tr>
            ) : filteredDocuments.length === 0 ? (
              <tr>
                <td
                  colSpan="6"
                  className="px-4 py-10 text-center text-[#3F5A58]"
                >
                  No documents found.
                </td>
              </tr>
            ) : (
              filteredDocuments.map((doc, index) => {
                const key = `${doc.userId}-${doc.documentType}`;

                return (
                  <tr
                    key={`${key}-${index}`}
                    className="border-t border-[#CFE5E2] hover:bg-teal-50/70"
                  >
                    <td className="px-4 py-4">
                      <p className="font-medium text-[#0B2B2A]">
                        {doc.studentName}
                      </p>

                      <p className="mt-0.5 text-xs text-[#3F5A58]">
                        {doc.studentEmail}
                      </p>
                    </td>

                    <td className="px-4 py-4 font-medium">
                      {doc.documentType}
                    </td>

                    <td className="px-4 py-4">{doc.fileName}</td>

                    <td className="px-4 py-4">
                      {doc.uploadedAt
                        ? new Date(doc.uploadedAt).toLocaleDateString()
                        : "N/A"}
                    </td>

                    <td className="px-4 py-4">
                      <span
                        className={`rounded-full px-3 py-1.5 text-xs font-semibold ${getStatusStyle(doc.status)}`}
                      >
                        {doc.status}
                      </span>
                    </td>

                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setPreview(doc)}
                          title="View Document"
                          aria-label="View Document"
                          className={`${actionButton} border-teal-200 bg-teal-50 text-teal-700 hover:bg-teal-700 hover:text-white`}
                        >
                          <FiEye size={17} />
                        </button>

                        {doc.status !== "Verified" && (
                          <button
                            type="button"
                            disabled={updating === key}
                            onClick={() =>
                              updateStatus(
                                doc.userId,
                                doc.documentType,
                                "Verified"
                              )
                            }
                            title="Verify Document"
                            aria-label="Verify Document"
                            className={`${actionButton} border-[#CFE5E2] bg-white text-[#3F5A58] hover:bg-[#0B2B2A] hover:text-white`}
                          >
                            <FiCheckCircle size={17} />
                          </button>
                        )}

                        {doc.status !== "Rejected" && (
                          <button
                            type="button"
                            disabled={updating === key}
                            onClick={() =>
                              updateStatus(
                                doc.userId,
                                doc.documentType,
                                "Rejected"
                              )
                            }
                            title="Reject Document"
                            aria-label="Reject Document"
                            className={`${actionButton} border-red-200 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white`}
                          >
                            <FiXCircle size={17} />
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

      {/* DOCUMENT PREVIEW */}
      {preview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white p-6">

            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-[#0B2B2A]">
                  Document Preview
                </h2>

                <p className="mt-1 text-sm text-[#3F5A58]">
                  {preview.documentType} - {preview.studentName}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setPreview(null)}
                aria-label="Close"
                className="text-[#3F5A58] hover:text-red-600"
              >
                <FiX size={24} />
              </button>
            </div>

            {preview.resourceType === "image" ? (
              <img
                src={preview.url}
                alt={preview.documentType}
                className="mx-auto max-h-[60vh] rounded-xl border border-[#CFE5E2] object-contain"
              />
            ) : (
              <div className="rounded-xl border border-[#CFE5E2] bg-[#F1F8F7] p-8 text-center">
                <FiFileText className="mx-auto mb-3 text-5xl text-teal-700" />

                <p className="font-medium text-[#0B2B2A]">
                  {preview.fileName}
                </p>

                <a
                  href={preview.url}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-4 inline-block rounded-lg bg-teal-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-teal-800"
                >
                  Open Document
                </a>
              </div>
            )}

            <button
              type="button"
              onClick={() => setPreview(null)}
              className="mt-6 rounded-lg border border-[#CFE5E2] px-5 py-2 text-sm font-semibold text-[#0B2B2A] hover:bg-teal-50"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function SummaryCard({ title, value, icon, color }) {
  return (
    <div className="rounded-2xl border border-white bg-white/65 p-5 text-[#0B2B2A] shadow-[0_4px_24px_rgba(15,118,110,0.08)] backdrop-blur-xl">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-[#3F5A58]">{title}</p>

          <h3 className="mt-2 text-3xl font-bold text-[#0B2B2A]">
            {value}
          </h3>
        </div>

        <div
          className={`flex h-11 w-11 items-center justify-center rounded-xl border text-xl ${color}`}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}