import { useEffect, useState } from "react";
import { API } from "../api/axios";

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
    <div className="mx-auto w-full max-w-[1500px]">

      {/* Heading */}
      <div className="mb-6">
        <h1 className="font-display text-3xl font-bold text-brand-dark">
          Contact Inquiries
        </h1>

        <p className="mt-2 text-sm text-muted">
          View messages submitted through the contact form.
        </p>
      </div>

      {/* Total Count */}
      <div className="mb-6 rounded-2xl border border-line bg-white p-5">
        <p className="text-sm text-muted">Total Inquiries</p>

        <h2 className="mt-2 text-3xl font-bold text-brand-dark">
          {contacts.length}
        </h2>
      </div>

      {/* Search */}
      <div className="mb-5 rounded-2xl border border-line bg-white p-4">
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, email or subject..."
          className="w-full rounded-xl border border-line px-4 py-3 text-sm outline-none focus:border-brand"
        />
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-line bg-white">

        <div className="overflow-x-auto">

          <table className="w-full text-left text-sm">

            <thead className="bg-[#F9FBFA] text-[11px] font-bold uppercase tracking-wider text-muted">
              <tr>
                <th className="px-5 py-4 font-semibold">Name</th>
                <th className="px-5 py-4 font-semibold">Email</th>
                <th className="px-5 py-4 font-semibold">Phone</th>
                <th className="px-5 py-4 font-semibold">Subject</th>
                <th className="px-5 py-4 font-semibold">Date</th>
                <th className="px-5 py-4 font-semibold">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-line">

              {loading ? (
                <tr>
                  <td colSpan="6" className="px-5 py-10 text-center text-muted">
                    Loading inquiries...
                  </td>
                </tr>
              ) : filteredContacts.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-5 py-10 text-center text-muted">
                    No inquiries found.
                  </td>
                </tr>
              ) : (
                filteredContacts.map((contact) => (
                  <tr key={contact._id} className="hover:bg-surface/60">

                    <td className="px-5 py-4 font-semibold text-brand-dark">
                      {contact.name}
                    </td>

                    <td className="px-5 py-4 text-muted">
                      {contact.email}
                    </td>

                    <td className="px-5 py-4 text-muted">
                      {contact.phone || "—"}
                    </td>

                    <td className="px-5 py-4 text-brand-dark">
                      {contact.subject}
                    </td>

                    <td className="px-5 py-4 text-muted">
                      {formatDate(contact.createdAt)}
                    </td>

                    <td className="px-5 py-4">
                      <button
                        type="button"
                        onClick={() => setSelectedContact(contact)}
                        className="rounded-lg bg-brand-soft px-3 py-2 text-xs font-semibold text-brand hover:bg-brand/10"
                      >
                        View
                      </button>
                    </td>

                  </tr>
                ))
              )}

            </tbody>

          </table>

        </div>
      </div>

      {/* View Message Modal */}
      {selectedContact && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">

          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">

            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-xl font-bold text-brand-dark">
                Inquiry Details
              </h2>

              <button
                type="button"
                onClick={() => setSelectedContact(null)}
                className="text-xl text-muted hover:text-red-500"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">

              <div>
                <p className="text-xs text-muted">Name</p>
                <p className="font-semibold text-brand-dark">
                  {selectedContact.name}
                </p>
              </div>

              <div>
                <p className="text-xs text-muted">Email</p>
                <p className="font-semibold text-brand-dark">
                  {selectedContact.email}
                </p>
              </div>

              <div>
                <p className="text-xs text-muted">Phone</p>
                <p className="font-semibold text-brand-dark">
                  {selectedContact.phone || "—"}
                </p>
              </div>

              <div>
                <p className="text-xs text-muted">Subject</p>
                <p className="font-semibold text-brand-dark">
                  {selectedContact.subject}
                </p>
              </div>

              <div>
                <p className="text-xs text-muted">Message</p>
                <p className="mt-1 whitespace-pre-wrap rounded-xl bg-surface p-4 text-sm leading-6 text-brand-dark">
                  {selectedContact.message}
                </p>
              </div>

            </div>

            <button
              type="button"
              onClick={() => setSelectedContact(null)}
              className="mt-6 w-full rounded-xl bg-accent px-4 py-3 text-sm font-bold text-white hover:bg-[#cf4a24]"
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