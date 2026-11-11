import { Bricolage_Grotesque, DM_Sans } from "next/font/google";
import "./globals.css";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer } from "react-toastify";
import { AuthProvider } from "@/context/AuthContext";

const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
});

export const metadata = {
  title: "MBBS Counselling",
  description: "Student portal for MBBS counselling",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${bricolage.variable} ${dmSans.variable}`}>
      <body className="min-h-screen bg-surface text-brand-dark">
        <AuthProvider>{children}</AuthProvider>
        <ToastContainer position="top-right" autoClose={4000} />
      </body>
    </html>
  );
}
