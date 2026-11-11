import ProtectedRoute from "@/components/ProtectedRoute";
import Navbar from "@/components/Navbar";

export default function PortalLayout({ children }) {
  return (
    <ProtectedRoute>
      <Navbar />
      <main className="mx-auto max-w-4xl px-4 py-8">{children}</main>
    </ProtectedRoute>
  );
}
