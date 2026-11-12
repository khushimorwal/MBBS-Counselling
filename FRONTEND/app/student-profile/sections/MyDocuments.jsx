"use client";

import { useEffect, useRef, useState } from "react";
import axios from "axios";

import {
  FiUpload,
  FiFileText,
  FiImage,
  FiEye,
  FiTrash2,
  FiCheckCircle,
  FiClock,
  FiX,
  FiPlus,
} from "react-icons/fi";

const API_URL = "http://localhost:3000";

const initialDocuments = [
  { name: "Passport Size Photo", type: "Photo", format: "JPG, PNG" },
  { name: "Signature", type: "Image", format: "JPG, PNG" },
  { name: "10th Marksheet", type: "PDF", format: "PDF" },
  { name: "12th Marksheet", type: "PDF", format: "PDF" },
  { name: "NEET Scorecard", type: "PDF", format: "PDF" },
  { name: "Identity Proof", type: "PDF", format: "PDF" },
];

export default function MyDocuments() {
  const [documents, setDocuments] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewFile, setPreviewFile] = useState(null);

  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const fileRef = useRef(null);

  const getHeaders = () => {
    const token = localStorage.getItem("token");

    return {
      Authorization: `Bearer ${token}`,
    };
  };

  // FETCH DOCUMENTS
  const fetchDocuments = async () => {
    try {
      const response = await axios.get(`${API_URL}/documents`, {
        headers: getHeaders(),
      });

      const uploadedDocuments = response.data.documents || [];

      const updatedDocuments = initialDocuments.map((item) => {
        const uploaded = uploadedDocuments.find(
          (doc) => doc.documentType === item.name
        );

        return {
          ...item,
          document: uploaded || null,
          status: uploaded ? uploaded.status : "Not Uploaded",
        };
      });

      setDocuments(updatedDocuments);
    } catch (error) {
      console.error("Fetch Documents Error:", error);
      alert(
        error.response?.data?.message || "Unable to fetch documents"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const uploadedCount = documents.filter(
    (doc) => doc.document
  ).length;

  const verifiedCount = documents.filter(
    (doc) => doc.status === "Verified"
  ).length;

  const pendingCount = documents.filter(
    (doc) => doc.status === "Pending"
  ).length;

  // UPLOAD DOCUMENT
  const handleUpload = async () => {
    if (!selectedDocument || !selectedFile) {
      alert("Please select document and file");
      return;
    }

    try {
      setUploading(true);

      const formData = new FormData();

      formData.append("file", selectedFile);
      formData.append("documentType", selectedDocument);

      const response = await axios.post(
        `${API_URL}/documents/upload`,
        formData,
        {
          headers: getHeaders(),
        }
      );

      await fetchDocuments();

      setShowModal(false);
      setSelectedDocument("");
      setSelectedFile(null);

      if (fileRef.current) {
        fileRef.current.value = "";
      }

      alert(response.data.message || "Document uploaded successfully!");
    } catch (error) {
      console.error("Upload Error:", error);

      alert(
        error.response?.data?.message || "Document upload failed"
      );
    } finally {
      setUploading(false);
    }
  };

  // DELETE DOCUMENT
  const handleDelete = async (documentType) => {
    if (!window.confirm("Are you sure you want to remove this document?")) {
      return;
    }

    try {
      const response = await axios.delete(
        `${API_URL}/documents/${encodeURIComponent(documentType)}`,
        {
          headers: getHeaders(),
        }
      );

      await fetchDocuments();

      alert(response.data.message || "Document deleted successfully");
    } catch (error) {
      console.error("Delete Error:", error);

      alert(
        error.response?.data?.message || "Document deletion failed"
      );
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case "Verified":
        return "bg-green-50 text-green-700";

      case "Pending":
        return "bg-amber-50 text-amber-700";

      case "Rejected":
        return "bg-red-50 text-red-700";

      default:
        return "bg-slate-100 text-slate-500";
    }
  };

  return (
    <div className="min-h-screen space-y-7 bg-[#f8fafc] p-4 sm:p-6 lg:p-8">

      {/* PAGE HEADER */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-[#142653]">
            My Documents
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Upload and manage your admission documents.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center justify-center gap-2 rounded-xl bg-teal-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-700"
        >
          <FiPlus />
          Upload Document
        </button>
      </div>

      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

        <SummaryCard
          title="Total Documents"
          value={documents.length}
          icon={<FiFileText />}
          color="bg-blue-50 text-blue-600"
        />

        <SummaryCard
          title="Uploaded"
          value={uploadedCount}
          icon={<FiUpload />}
          color="bg-indigo-50 text-indigo-600"
        />

        <SummaryCard
          title="Verified"
          value={verifiedCount}
          icon={<FiCheckCircle />}
          color="bg-green-50 text-green-600"
        />

        <SummaryCard
          title="Pending Verification"
          value={pendingCount}
          icon={<FiClock />}
          color="bg-amber-50 text-amber-600"
        />

      </div>

      {/* DOCUMENT TABLE */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

        <div className="border-b border-slate-100 px-5 py-5">
          <h2 className="text-lg font-bold text-[#142653]">
            Required Documents
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Upload all required documents for your admission process.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[750px] text-left">

            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-6 py-4">Document</th>
                <th className="px-6 py-4">Required Format</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">

              {loading ? (
                <tr>
                  <td colSpan="4" className="px-6 py-10 text-center text-slate-500">
                    Loading documents...
                  </td>
                </tr>
              ) : (
                documents.map((doc) => (
                  <tr key={doc.name} className="transition hover:bg-slate-50">

                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">

                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-xl text-blue-600">
                          {doc.type === "Photo" || doc.type === "Image" ? (
                            <FiImage />
                          ) : (
                            <FiFileText />
                          )}
                        </div>

                        <div>
                          <p className="text-sm font-semibold text-slate-800">
                            {doc.name}
                          </p>

                          <p className="mt-1 text-xs text-slate-400">
                            {doc.document
                              ? doc.document.fileName
                              : "No file uploaded"}
                          </p>
                        </div>

                      </div>
                    </td>

                    <td className="px-6 py-5 text-sm text-slate-500">
                      {doc.format}
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

                        {doc.document ? (
                          <>
                            <button
                              onClick={() =>
                                setPreviewFile({
                                  url: doc.document.url,
                                  name: doc.document.fileName,
                                  type: doc.document.resourceType,
                                })
                              }
                              title="View Document"
                              className="text-blue-600 hover:text-blue-800"
                            >
                              <FiEye size={18} />
                            </button>

                            <button
                              onClick={() => handleDelete(doc.name)}
                              title="Delete Document"
                              className="text-red-500 hover:text-red-700"
                            >
                              <FiTrash2 size={18} />
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => {
                              setSelectedDocument(doc.name);
                              setShowModal(true);
                            }}
                            className="flex items-center gap-2 text-sm font-semibold text-teal-600 hover:text-teal-800"
                          >
                            <FiUpload />
                            Upload
                          </button>
                        )}

                      </div>
                    </td>

                  </tr>
                ))
              )}

            </tbody>
          </table>
        </div>
      </div>

      {/* UPLOAD MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">

          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">

            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-bold text-[#142653]">
                Upload Document
              </h2>

              <button
                onClick={() => {
                  setShowModal(false);
                  setSelectedFile(null);
                  setSelectedDocument("");

                  if (fileRef.current) {
                    fileRef.current.value = "";
                  }
                }}
                className="text-2xl text-slate-400 hover:text-red-500"
              >
                <FiX />
              </button>
            </div>

            <div className="space-y-5">

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Select Document
                </label>

                <select
                  value={selectedDocument}
                  onChange={(e) => setSelectedDocument(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-teal-500"
                >
                  <option value="">Choose document</option>

                  {documents
                    .filter((doc) => !doc.document)
                    .map((doc) => (
                      <option key={doc.name} value={doc.name}>
                        {doc.name}
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Choose File
                </label>

                <input
                  ref={fileRef}
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => setSelectedFile(e.target.files[0])}
                  className="w-full rounded-xl border border-slate-200 p-3 text-sm"
                />

                <p className="mt-2 text-xs text-slate-400">
                  Allowed formats: PDF, JPG, PNG. Maximum size: 5MB.
                </p>
              </div>

              {selectedFile && (
                <div className="rounded-xl bg-teal-50 p-3 text-sm text-teal-700">
                  Selected: {selectedFile.name}
                </div>
              )}

            </div>

            <button
              onClick={handleUpload}
              disabled={uploading}
              className="mt-7 w-full rounded-xl bg-teal-600 py-3 font-semibold text-white transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {uploading ? "Uploading..." : "Upload Document"}
            </button>

          </div>
        </div>
      )}

      {/* FILE PREVIEW MODAL */}
      {previewFile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">

          <div className="w-full max-w-2xl rounded-2xl bg-white p-5">

            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-bold text-[#142653]">
                Document Preview
              </h2>

              <button
                onClick={() => setPreviewFile(null)}
                className="text-xl text-slate-500 hover:text-red-500"
              >
                <FiX />
              </button>
            </div>

            {previewFile.type === "image" ? (
              <img
                src={previewFile.url}
                alt="Document Preview"
                className="mx-auto max-h-[65vh] rounded-xl object-contain"
              />
            ) : (
              <div className="rounded-xl bg-slate-50 p-8 text-center">
                <FiFileText className="mx-auto mb-3 text-5xl text-blue-600" />

                <p className="font-semibold text-slate-700">
                  {previewFile.name}
                </p>

                <a
                  href={previewFile.url}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-4 inline-block rounded-lg bg-teal-600 px-5 py-2 text-sm font-semibold text-white"
                >
                  Open PDF
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