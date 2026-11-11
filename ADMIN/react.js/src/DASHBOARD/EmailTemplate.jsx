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
    <div className="min-h-screen bg-surface p-4 md:p-6">
      {/* PAGE HEADER */}
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-brand">Email Templates</h1>

          <p className="mt-1 text-sm text-muted">
            Create and manage your email templates.
          </p>
        </div>

        <button
          type="button"
          onClick={handleAdd}
          className="rounded-lg bg-accent px-5 py-2.5 font-bold text-white transition hover:bg-[#cf4a24]"
        >
          + Add Email
        </button>
      </div>

      {/* SEARCH BAR */}
      <div className="mb-5">
        <input
          type="text"
          placeholder="Search email templates..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-sm rounded-lg border border-line bg-white px-4 py-2.5 outline-none focus:border-brand"
        />
      </div>

      {/* EMAIL TEMPLATES TABLE */}
      <div className="overflow-x-auto rounded-xl border border-line bg-white">
        <table className="w-full min-w-[750px] text-left">
          <thead className="bg-[#F9FBFA]">
            <tr>
              <th className="px-5 py-4 text-sm font-semibold text-brand">
                Title
              </th>

              <th className="px-5 py-4 text-sm font-semibold text-brand">
                Description
              </th>

              <th className="px-5 py-4 text-sm font-semibold text-brand">
                Content
              </th>

              <th className="px-5 py-4 text-center text-sm font-semibold text-brand">
                Actions
              </th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan="4" className="px-5 py-10 text-center text-muted">
                  Loading email templates...
                </td>
              </tr>
            ) : filteredTemplates.length > 0 ? (
              filteredTemplates.map((template) => (
                <tr
                  key={template._id}
                  className="border-t border-line hover:bg-surface"
                >
                  <td className="px-5 py-4 font-medium text-brand-dark">
                    {template.Title}
                  </td>

                  <td className="px-5 py-4 text-brand-dark">
                    {template.Description}
                  </td>

                  <td className="max-w-xs px-5 py-4 text-muted">
                    <p className="truncate">{template.Content}</p>
                  </td>

                  {/* ACTION BUTTONS */}
                  <td className="px-5 py-4">
                    <div className="flex justify-center gap-3">
                      <button
                        type="button"
                        onClick={() => setViewTemplate(template)}
                        title="View"
                        className="text-brand hover:text-brand-dark"
                      >
                        <Eye size={18} />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleEdit(template)}
                        title="Edit"
                        className="text-brand hover:text-brand-dark"
                      >
                        <Pencil size={18} />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDelete(template._id)}
                        title="Delete"
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="px-5 py-10 text-center text-muted">
                  {search
                    ? "No matching email templates found."
                    : "No email templates found. Click Add Email to create one."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ADD / EDIT FORM MODAL */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-4">
          <div className="my-auto w-full max-w-2xl rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-bold text-brand">
                {editId ? "Edit Email Template" : "Add Email Template"}
              </h2>

              <button
                type="button"
                onClick={resetForm}
                className="text-2xl text-muted hover:text-red-500"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              {/* TITLE */}
              <div className="mb-4">
                <label className="mb-1 block text-sm font-medium">
                  Title *
                </label>

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
                  className="w-full rounded-lg border border-line px-3 py-2.5 outline-none focus:border-brand"
                />
              </div>

              {/* DESCRIPTION */}
              <div className="mb-4">
                <label className="mb-1 block text-sm font-medium">
                  Description *
                </label>

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
                  className="w-full resize-y rounded-lg border border-line px-3 py-2.5 outline-none focus:border-brand"
                />
              </div>

              {/* CONTENT - CKEDITOR ONLY IN ADD / EDIT FORM */}
              <div className="mb-6">
                <label className="mb-2 block text-sm font-medium">
                  Content *
                </label>

                <div className="rounded-lg border border-line">
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

              {/* FORM BUTTONS */}
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={resetForm}
                  className="rounded-lg border border-line px-5 py-2.5"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="rounded-lg bg-accent px-5 py-2.5 font-bold text-white hover:bg-[#cf4a24]"
                >
                  {editId ? "Update Template" : "Save Template"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW MODAL */}
      {viewTemplate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-4">
          <div className="my-auto w-full max-w-2xl rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-xl font-bold text-brand">
                Email Template Details
              </h2>

              <button
                type="button"
                onClick={() => setViewTemplate(null)}
                className="text-2xl text-muted hover:text-red-500"
              >
                &times;
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted">Title</p>
                <p className="font-medium">{viewTemplate.Title}</p>
              </div>

              <div>
                <p className="text-sm text-muted">Description</p>
                <p className="font-medium">{viewTemplate.Description}</p>
              </div>

              <div>
                <p className="mb-1 text-sm text-muted">Content</p>

                <div
                  className="rounded-lg bg-surface p-4"
                  dangerouslySetInnerHTML={{
                    __html: viewTemplate.Content || "",
                  }}
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => setViewTemplate(null)}
                className="rounded-lg bg-accent px-5 py-2.5 text-white hover:bg-[#cf4a24]"
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
