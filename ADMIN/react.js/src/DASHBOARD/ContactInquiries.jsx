import { useEffect, useState } from "react";
import { FiEye } from "react-icons/fi";
import { API } from "../api/axios";

const actionButton =
  "inline-flex h-9 w-9 items-center justify-center rounded-lg border transition";

function ContactInquiries() {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedContact, setSelectedContact] = useState(null);

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    try {
      const response = await API.get("/contact");
      setContacts(response.data.contacts || []);
    } catch (error) {
      console.error("Error fetching contact inquiries:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredContacts = contacts.filter((contact) => {
    const searchText = search.toLowerCase();

    return (
      contact.name?.toLowerCase().includes(searchText) ||
      contact.email?.toLowerCase().includes(searchText) ||
      contact.subject?.toLowerCase().includes(searchText)
    );
  });

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="min-w-0 space-y-6">

      {/* PAGE HEADER */}
      <div>
        <h1 className="text-2xl font-bold text-[#0B2B2A]">
          Contact Inquiries
        </h1>

        <p className="mt-1 text-sm text-[#3F5A58]">
          View messages submitted through the contact form
        </p>
      </div>

      {/* TOTAL COUNT */}
      <div className="max-w-xs rounded-2xl border border-white bg-white/65 p-5 text-[#0B2B2A] shadow-[0_4px_24px_rgba(15,118,110,0.08)] backdrop-blur-xl">
        <p className="text-sm font-medium text-[#3F5A58]">
          Total Inquiries
        </p>

        <h2 className="mt-2 text-3xl font-bold text-[#0B2B2A]">
          {contacts.length}
        </h2>
      </div>

      {/* SEARCH */}
      <input
        type="search"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search by name, email or subject..."
        className="w-full max-w-sm rounded-xl border border-[#9DBDBA] bg-white/80 px-4 py-2.5 text-sm text-[#0B2B2A] outline-none placeholder:text-[#4B6463] focus:border-teal-700 focus:ring-2 focus:ring-teal-200"
      />

      {/* INQUIRIES TABLE */}
      <div className="overflow-x-auto rounded-2xl border border-white bg-white/65 text-[#0B2B2A] shadow-[0_4px_24px_rgba(15,118,110,0.08)] backdrop-blur-xl">
        <table className="w-full min-w-[850px] text-left text-sm">
          <thead className="bg-[#F1F8F7] text-[11px] font-bold uppercase tracking-wider text-[#3F5A58]">
            <tr>
              <th className="px-4 py-4">Name</th>
              <th className="px-4 py-4">Email</th>
              <th className="px-4 py-4">Phone</th>
              <th className="px-4 py-4">Subject</th>
              <th className="px-4 py-4">Date</th>
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
                  Loading inquiries...
                </td>
              </tr>
            ) : filteredContacts.length === 0 ? (
              <tr>
                <td
                  colSpan="6"
                  className="px-4 py-10 text-center text-[#3F5A58]"
                >
                  No inquiries found.
                </td>
              </tr>
            ) : (
              filteredContacts.map((contact) => (
                <tr
                  key={contact._id}
                  className="border-t border-[#CFE5E2] hover:bg-teal-50/70"
                >
                  <td className="px-4 py-4 font-medium text-[#0B2B2A]">
                    {contact.name}
                  </td>

                  <td className="px-4 py-4">{contact.email}</td>

                  <td className="px-4 py-4">{contact.phone || "-"}</td>

                  <td className="px-4 py-4">{contact.subject}</td>

                  <td className="px-4 py-4">
                    {formatDate(contact.createdAt)}
                  </td>

                  <td className="px-4 py-4">
                    <button
                      type="button"
                      onClick={() => setSelectedContact(contact)}
                      title="View Inquiry"
                      aria-label="View Inquiry"
                      className={`${actionButton} border-teal-200 bg-teal-50 text-teal-700 hover:bg-teal-700 hover:text-white`}
                    >
                      <FiEye size={17} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* VIEW INQUIRY */}
      {selectedContact && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6">

            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-xl font-bold text-[#0B2B2A]">
                Inquiry Details
              </h2>

              <button
                type="button"
                onClick={() => setSelectedContact(null)}
                aria-label="Close"
                className="text-2xl text-[#3F5A58]"
              >
                &times;
              </button>
            </div>

            <div className="space-y-4">
              <p>
                <b>Name:</b> {selectedContact.name || "-"}
              </p>

              <p>
                <b>Email:</b> {selectedContact.email || "-"}
              </p>

              <p>
                <b>Phone:</b> {selectedContact.phone || "-"}
              </p>

              <p>
                <b>Subject:</b> {selectedContact.subject || "-"}
              </p>

              <div>
                <p className="mb-1.5">
                  <b>Message:</b>
                </p>

                <p className="whitespace-pre-wrap rounded-xl border border-[#CFE5E2] bg-[#F1F8F7] p-4 text-sm leading-6">
                  {selectedContact.message}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setSelectedContact(null)}
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

export default ContactInquiries;