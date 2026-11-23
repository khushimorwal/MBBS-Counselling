import { useEffect, useState } from "react";
import { API } from "../api/axios";
import { Eye, Pencil, Trash2 } from "lucide-react";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import {
  ClassicEditor,
  Essentials,
  Paragraph,
  Bold,
  Italic,
  Underline,
  Heading,
  List,
  Link,
} from "ckeditor5";
import "ckeditor5/ckeditor5.css";

const API_URL = "/email-template";

// Shared classes (same as College page)
const inputClass =
  "w-full rounded-lg border border-[#9DBDBA] bg-white px-3 py-2.5 text-sm text-[#0B2B2A] outline-none placeholder:text-[#4B6463] focus:border-teal-700 focus:ring-2 focus:ring-teal-200";

const labelClass = "mb-1.5 block text-sm font-medium text-[#0B2B2A]";

const actionButton =
  "inline-flex h-9 w-9 items-center justify-center rounded-lg border transition";

export default function EmailTemplate() {
  const [templates, setTemplates] = useState([]);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [viewTemplate, setViewTemplate] = useState(null);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    Title: "",
    Description: "",
    Content: "",
  });

  // FETCH EMAIL TEMPLATES
  const fetchTemplates = async () => {
    try {
      setLoading(true);

      const response = await API.get(API_URL);

      const data = Array.isArray(response.data)
        ? response.data
        : response.data.templates || [];

      setTemplates(data);
    } catch (error) {
      console.error("Error fetching templates:", error);
      setTemplates([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  // RESET FORM
  const resetForm = () => {
    setFormData({
      Title: "",
      Description: "",
      Content: "",
    });

    setEditId(null);
    setShowForm(false);
  };

  // OPEN ADD FORM
  const handleAdd = () => {
    setFormData({
      Title: "",
      Description: "",
      Content: "",
    });

    setEditId(null);
    setShowForm(true);
  };

  // SAVE OR UPDATE TEMPLATE
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editId) {
        await API.put(`${API_URL}/${editId}`, formData);
        alert("Email template updated successfully!");
      } else {
        await API.post(API_URL, formData);
        alert("Email template added successfully!");
      }

      resetForm();
      await fetchTemplates();
    } catch (error) {
      console.error("Error saving template:", error);

      alert(error.response?.data?.message || "Failed to save email template");
    }
  };

  // EDIT TEMPLATE
  const handleEdit = (template) => {
    setEditId(template._id);

    setFormData({
      Title: template.Title || "",
      Description: template.Description || "",
      Content: template.Content || "",
    });

    setShowForm(true);
  };

  // DELETE TEMPLATE
  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this email template?",
    );

    if (!confirmDelete) return;

    try {
      await API.delete(`${API_URL}/${id}`);

      alert("Email template deleted successfully!");

      await fetchTemplates();
    } catch (error) {
      console.error("Error deleting template:", error);

      alert(
        error.response?.data?.message || "Failed to delete email template.",
      );
    }
  };

  // SEARCH TEMPLATES
  const filteredTemplates = templates.filter((template) =>
    [template.Title, template.Description, template.Content]
      .join(" ")
      .toLowerCase()
      .includes(search.toLowerCase()),
  );

  // CKEDITOR CONFIGURATION
  const editorConfig = {
    licenseKey: "GPL",
    plugins: [
      Essentials,
      Paragraph,
      Bold,
      Italic,
      Underline,
      Heading,
      List,
      Link,
    ],
    toolbar: [
      "undo",
      "redo",
      "|",
      "heading",
      "|",
      "bold",
      "italic",
      "underline",
      "|",
      "bulletedList",
      "numberedList",
      "|",
      "link",
    ],
  };

  return (
    <div className="min-w-0 space-y-6">

      {/* PAGE HEADER */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#0B2B2A]">
            Email Templates
          </h1>

          <p className="mt-1 text-sm text-[#3F5A58]">
            Create and manage your email templates
          </p>
        </div>

        <button
          type="button"
          onClick={handleAdd}
          className="rounded-xl bg-teal-700 px-5 py-2.5 text-sm font-bold text-white hover:bg-teal-800"
        >
          + Add Email
        </button>
      </div>

      {/* SEARCH */}
      <input
        type="text"
        placeholder="Search email template..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full max-w-sm rounded-xl border border-[#9DBDBA] bg-white/80 px-4 py-2.5 text-sm text-[#0B2B2A] outline-none placeholder:text-[#4B6463] focus:border-teal-700 focus:ring-2 focus:ring-teal-200"
      />

      {/* EMAIL TEMPLATES TABLE */}
      <div className="overflow-x-auto rounded-2xl border border-white bg-white/65 text-[#0B2B2A] shadow-[0_4px_24px_rgba(15,118,110,0.08)] backdrop-blur-xl">
        <table className="w-full min-w-[750px] text-left text-sm">
          <thead className="bg-[#F1F8F7] text-[11px] font-bold uppercase tracking-wider text-[#3F5A58]">
            <tr>
              <th className="px-4 py-4">Title</th>
              <th className="px-4 py-4">Description</th>
              <th className="px-4 py-4">Content</th>
              <th className="px-4 py-4">Actions</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan="4"
                  className="px-4 py-10 text-center text-[#3F5A58]"
                >
                  Loading email templates...
                </td>
              </tr>
            ) : filteredTemplates.length > 0 ? (
              filteredTemplates.map((template) => (
                <tr
                  key={template._id}
                  className="border-t border-[#CFE5E2] hover:bg-teal-50/70"
                >
                  <td className="px-4 py-4 font-medium text-[#0B2B2A]">
                    {template.Title}
                  </td>

                  <td className="px-4 py-4">{template.Description}</td>

                  <td className="max-w-xs px-4 py-4 text-[#3F5A58]">
                    <p className="truncate">{template.Content}</p>
                  </td>

                  {/* ACTION BUTTONS */}
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setViewTemplate(template)}
                        title="View Template"
                        aria-label="View Template"
                        className={`${actionButton} border-teal-200 bg-teal-50 text-teal-700 hover:bg-teal-700 hover:text-white`}
                      >
                        <Eye size={17} />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleEdit(template)}
                        title="Edit Template"
                        aria-label="Edit Template"
                        className={`${actionButton} border-[#CFE5E2] bg-white text-[#3F5A58] hover:bg-[#0B2B2A] hover:text-white`}
                      >
                        <Pencil size={17} />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDelete(template._id)}
                        title="Delete Template"
                        aria-label="Delete Template"
                        className={`${actionButton} border-red-200 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white`}
                      >
                        <Trash2 size={17} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="4"
                  className="px-4 py-10 text-center text-[#3F5A58]"
                >
                  {search
                    ? "No matching email templates found."
                    : "No email templates found. Click Add Email to create one."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ADD / EDIT FORM */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">

            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-teal-700">
                {editId ? "Edit Email Template" : "Add Email Template"}
              </h2>

              <button
                type="button"
                onClick={resetForm}
                aria-label="Close"
                className="text-2xl text-[#3F5A58] hover:text-red-600"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 gap-4">

                {/* TITLE */}
                <div>
                  <label className={labelClass}>Title *</label>

                  <input
                    type="text"
                    required
                    value={formData.Title}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        Title: e.target.value,
                      })
                    }
                    placeholder="Enter template title"
                    className={inputClass}
                  />
                </div>

                {/* DESCRIPTION */}
                <div>
                  <label className={labelClass}>Description *</label>

                  <textarea
                    required
                    rows="3"
                    value={formData.Description}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        Description: e.target.value,
                      })
                    }
                    placeholder="Enter template description"
                    className={`${inputClass} resize-y`}
                  />
                </div>

                {/* CONTENT - CKEDITOR ONLY IN ADD / EDIT FORM */}
                <div>
                  <label className={labelClass}>Content *</label>

                  <div className="overflow-hidden rounded-lg border border-[#9DBDBA]">
                    <CKEditor
                      editor={ClassicEditor}
                      config={editorConfig}
                      data={formData.Content}
                      onChange={(event, editor) => {
                        setFormData((previousData) => ({
                          ...previousData,
                          Content: editor.getData(),
                        }));
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* FORM BUTTONS */}
              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={resetForm}
                  className="rounded-lg border border-[#CFE5E2] px-5 py-2"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="rounded-lg bg-teal-700 px-5 py-2 font-medium text-white hover:bg-teal-800"
                >
                  {editId ? "Update Template" : "Save Template"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW TEMPLATE */}
      {viewTemplate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6">

            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-xl font-bold text-[#0B2B2A]">
                Email Template Details
              </h2>

              <button
                type="button"
                onClick={() => setViewTemplate(null)}
                aria-label="Close"
                className="text-2xl text-[#3F5A58]"
              >
                &times;
              </button>
            </div>

            <div className="space-y-4">
              <p>
                <b>Title:</b> {viewTemplate.Title || "-"}
              </p>

              <p>
                <b>Description:</b> {viewTemplate.Description || "-"}
              </p>

              <div>
                <p className="mb-1.5">
                  <b>Content:</b>
                </p>

                <div
                  className="rounded-xl border border-[#CFE5E2] bg-[#F1F8F7] p-4 text-sm"
                  dangerouslySetInnerHTML={{
                    __html: viewTemplate.Content || "",
                  }}
                />
              </div>
            </div>

            <button
              type="button"
              onClick={() => setViewTemplate(null)}
              className="mt-6 rounded-lg bg-teal-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-teal-800"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}