"use client";

import { useState } from "react";

export default function ContactPage() {
  const initialForm = {
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  };

  const [formData, setFormData] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");
  const [isError, setIsError] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setStatus("");
    setIsError(false);

    try {
      const response = await fetch("http://localhost:3000/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to submit your message.");
      }

      setStatus(data.message || "Your message has been submitted successfully!");
      setIsError(false);
      setFormData(initialForm);
    } catch (error) {
      console.error("Contact form error:", error);
      setIsError(true);
      setStatus(error.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full rounded-xl border border-teal-100/80 bg-white/70 px-4 py-3 text-sm text-slate-700 outline-none backdrop-blur-md transition duration-300 placeholder:text-slate-400 focus:border-teal-500 focus:bg-white focus:ring-4 focus:ring-teal-100";

  return (
    <main className="min-h-screen overflow-hidden bg-[#edfafa] text-slate-800">

      {/* Background Effects */}
      <div className="pointer-events-none fixed inset-0 -z-0">
        <div className="absolute -left-32 top-40 h-80 w-80 rounded-full bg-cyan-200/40 blur-3xl" />
        <div className="absolute -right-32 top-[550px] h-96 w-96 rounded-full bg-teal-200/40 blur-3xl" />
      </div>

      {/* Hero Section */}
      <section className="relative mx-4 mt-5 overflow-hidden rounded-[30px] sm:mx-8 lg:mx-12">

        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?q=85&w=2000')",
          }}
        />

        <div className="absolute inset-0 bg-gradient-to-r from-[#073e46]/90 via-[#075b62]/80 to-[#087d83]/45" />

        <div className="relative mx-auto flex min-h-[340px] max-w-7xl items-center justify-center px-6 py-16 text-center sm:px-12">

          <div className="max-w-3xl animate-fade-up text-white">

            <span className="inline-block rounded-full border border-white/30 bg-white/15 px-5 py-2 text-sm font-medium backdrop-blur-md">
              Get in Touch
            </span>

            <h1 className="mt-6 text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">
              We're Here to
              <span className="block text-cyan-200">
                Help You!
              </span>
            </h1>

            <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-white/85 sm:text-lg">
              Have questions about MBBS admission, counselling, college
              selection or our services? Feel free to reach out.
              We're happy to help you.
            </p>

          </div>
        </div>
      </section>

      {/* Contact Form and Information */}
      <section className="relative mx-auto grid max-w-7xl gap-8 px-5 py-14 sm:px-8 lg:grid-cols-2">

        {/* Contact Form */}
        <div className="rounded-3xl border border-white/80 bg-white/75 p-6 shadow-[0_12px_40px_rgba(15,118,110,0.09)] backdrop-blur-xl sm:p-9">

          <div className="mb-7">
            <span className="text-sm font-bold uppercase tracking-[2px] text-teal-600">
              Send an Enquiry
            </span>

            <h2 className="mt-2 text-2xl font-bold text-slate-800 sm:text-3xl">
              Send Us a Message
            </h2>

            <p className="mt-3 text-sm leading-6 text-slate-500">
              Fill in the form below and our team will get back to you soon.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Name */}
            <div>
              <label htmlFor="name" className="mb-2 block text-sm font-semibold text-slate-700">
                Full Name *
              </label>

              <input
                id="name"
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your name"
                required
                className={inputClass}
              />
            </div>

            {/* Email and Phone */}
            <div className="grid gap-5 sm:grid-cols-2">

              <div>
                <label htmlFor="email" className="mb-2 block text-sm font-semibold text-slate-700">
                  Email Address *
                </label>

                <input
                  id="email"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  required
                  className={inputClass}
                />
              </div>

              <div>
                <label htmlFor="phone" className="mb-2 block text-sm font-semibold text-slate-700">
                  Phone Number
                </label>

                <input
                  id="phone"
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Enter your phone"
                  className={inputClass}
                />
              </div>

            </div>

            {/* Subject */}
            <div>
              <label htmlFor="subject" className="mb-2 block text-sm font-semibold text-slate-700">
                Subject *
              </label>

              <input
                id="subject"
                type="text"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                placeholder="What is your enquiry about?"
                required
                className={inputClass}
              />
            </div>

            {/* Message */}
            <div>
              <label htmlFor="message" className="mb-2 block text-sm font-semibold text-slate-700">
                Your Message *
              </label>

              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                placeholder="Write your message here..."
                rows={5}
                required
                className={`${inputClass} resize-y`}
              />
            </div>

            {/* Status */}
            {status && (
              <div
                className={`rounded-xl px-4 py-3 text-sm ${
                  isError
                    ? "border border-red-200 bg-red-50 text-red-600"
                    : "border border-green-200 bg-green-50 text-green-600"
                }`}
              >
                {status}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-teal-600 to-cyan-600 px-6 py-4 font-semibold text-white shadow-lg shadow-teal-600/20 transition duration-300 hover:-translate-y-1 hover:from-teal-700 hover:to-cyan-700 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Sending..." : "Send Message"}
              {!loading && <span>→</span>}
            </button>

          </form>
        </div>

        {/* Contact Information */}
        <div className="space-y-7">

          <div className="rounded-3xl border border-white/80 bg-white/75 p-6 shadow-[0_12px_40px_rgba(15,118,110,0.09)] backdrop-blur-xl sm:p-9">

            <span className="text-sm font-bold uppercase tracking-[2px] text-teal-600">
              Contact Details
            </span>

            <h2 className="mt-2 text-2xl font-bold text-slate-800 sm:text-3xl">
              Contact Information
            </h2>

            <p className="mt-3 text-sm leading-6 text-slate-500">
              You can also reach us through the following details.
            </p>

            <div className="mt-8 space-y-6">

              {/* Phone */}
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-cyan-100 text-xl">
                  📞
                </div>

                <div className="min-w-0">
                  <h3 className="font-semibold text-slate-800">Phone</h3>

                  <a href="tel:+91XXXXXXXXXX" className="mt-1 block text-sm text-slate-500 transition hover:text-teal-700">
                    +91XXXXXXXXXX
                  </a>
                </div>
              </div>

              {/* Email */}
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-teal-100 text-xl">
                  ✉️
                </div>

                <div className="min-w-0">
                  <h3 className="font-semibold text-slate-800">Email</h3>

                  <a href="mailto:YOUR_EMAIL@example.com" className="mt-1 block break-all text-sm text-slate-500 transition hover:text-teal-700">
                    YOUR_EMAIL@example.com
                  </a>
                </div>
              </div>

              {/* Address */}
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-cyan-100 text-xl">
                  📍
                </div>

                <div>
                  <h3 className="font-semibold text-slate-800">Address</h3>

                  <p className="mt-1 text-sm leading-6 text-slate-500">
                    123, Medical Street
                    <br />
                    Bangalore, Karnataka - 560001
                  </p>
                </div>
              </div>

              {/* Working Hours */}
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-teal-100 text-xl">
                  🕒
                </div>

                <div>
                  <h3 className="font-semibold text-slate-800">Working Hours</h3>

                  <p className="mt-1 text-sm leading-6 text-slate-500">
                    Monday - Saturday: 9:00 AM - 6:00 PM
                    <br />
                    Sunday Closed
                  </p>
                </div>
              </div>

            </div>
          </div>

          {/* Map */}
          <div className="overflow-hidden rounded-3xl border border-white/80 bg-white/75 shadow-[0_12px_40px_rgba(15,118,110,0.09)] backdrop-blur-xl">

            <div className="p-6 sm:p-8">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-100 text-xl">
                  🗺️
                </div>

                <div>
                  <h2 className="text-xl font-bold text-slate-800">Find Us</h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Visit our location for counselling and guidance.
                  </p>
                </div>
              </div>
            </div>

            <iframe
              title="MBBS Counselling Location"
              src="https://maps.google.com/maps?q=Bangalore&t=&z=12&ie=UTF8&iwloc=&output=embed"
              width="100%"
              height="280"
              loading="lazy"
              className="border-0"
            />

          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="relative mx-4 mb-10 overflow-hidden rounded-[30px] bg-gradient-to-r from-[#075b62] to-[#07969a] px-6 py-12 text-center text-white shadow-xl sm:mx-8 sm:px-12 lg:mx-12">

        <div className="absolute -right-16 -top-20 h-64 w-64 rounded-full border-[35px] border-white/10" />

        <div className="relative mx-auto max-w-2xl">
          <h2 className="text-2xl font-bold sm:text-3xl">
            We're Always Happy to Help!
          </h2>

          <p className="mt-3 leading-7 text-white/85">
            Your medical admission journey matters to us.
            Reach out and let us guide you in the right direction.
          </p>
        </div>
      </section>

      {/* Animations */}
      <style jsx>{`
        @keyframes fadeUp {
          from {
            opacity: 0;
            transform: translateY(25px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-up {
          animation: fadeUp 0.8s ease-out both;
        }

        @media (prefers-reduced-motion: reduce) {
          .animate-fade-up {
            animation: none;
          }
        }
      `}</style>

    </main>
  );
}