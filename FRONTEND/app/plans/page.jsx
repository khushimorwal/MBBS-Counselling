
"use client";

import { useEffect, useState } from "react";

const API_URL = "http://localhost:3000";

// Load Razorpay Checkout Script
const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const existingScript = document.querySelector(
      'script[src="https://checkout.razorpay.com/v1/checkout.js"]'
    );

    if (existingScript) {
      existingScript.addEventListener("load", () => resolve(true), {
        once: true,
      });

      existingScript.addEventListener("error", () => resolve(false), {
        once: true,
      });

      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);

    document.body.appendChild(script);
  });
};

// Safely read JSON response
const readResponse = async (response) => {
  const text = await response.text();

  try {
    return text ? JSON.parse(text) : {};
  } catch {
    throw new Error(
      "Server se valid response nahi mila. API URL aur backend check karo."
    );
  }
};

export default function Plans() {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingPackage, setLoadingPackage] = useState(null);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  const getToken = () => localStorage.getItem("token");

  const showMessage = (text, type = "success") => {
    setMessage(text);
    setMessageType(type);
  };

  // ======================================
  // FETCH PACKAGES FROM MONGODB
  // ======================================
  const fetchPackages = async () => {
    try {
      setLoading(true);
      setMessage("");

      const response = await fetch(`${API_URL}/packages/all`);
      const data = await readResponse(response);

      if (!response.ok || data.success === false) {
        throw new Error(data.message || "Packages load nahi ho paaye.");
      }

      // Handle different API response formats
      const packageList = Array.isArray(data)
        ? data
        : data.packages || data.data || [];

      setPackages(
        packageList.filter(
          (item) => item.status === "Active"
        )
      );
    } catch (error) {
      console.error("Fetch Packages Error:", error);
      showMessage(error.message || "Unable to load packages.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPackages();
  }, []);

  // ======================================
  // GET LOGGED-IN USER DETAILS
  // ======================================
  const getUserDetails = () => {
    try {
      return JSON.parse(localStorage.getItem("user") || "{}");
    } catch {
      return {};
    }
  };

  // ======================================
  // FREE PACKAGE ACTIVATION
  // ======================================
  const activateFreePackage = async (pkg) => {
    try {
      const token = getToken();

      if (!token) {
        showMessage("Please login first to activate your package.", "error");
        return;
      }

      setLoadingPackage(pkg._id);
      setSelectedPackage(pkg);
      setMessage("");

      const response = await fetch(`${API_URL}/payment/activate-free`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          packageId: pkg._id,
        }),
      });

      const data = await readResponse(response);

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Free package activation failed.");
      }

      showMessage(`${pkg.name} package activated successfully!`);
    } catch (error) {
      console.error("Free Package Error:", error);
      showMessage(error.message || "Something went wrong.", "error");
    } finally {
      setLoadingPackage(null);
    }
  };

  // ======================================
  // PAID PACKAGE PAYMENT
  // ======================================
  const handlePaidPackage = async (pkg) => {
    try {
      const token = getToken();

      if (!token) {
        showMessage("Please login first to purchase a package.", "error");
        return;
      }

      setLoadingPackage(pkg._id);
      setSelectedPackage(pkg);
      setMessage("");

      // Load Razorpay
      const scriptLoaded = await loadRazorpayScript();

      if (!scriptLoaded) {
        throw new Error("Unable to load Razorpay. Please try again.");
      }

      // Create order using MongoDB package ID
      const orderResponse = await fetch(
        `${API_URL}/payment/create-order`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            packageId: pkg._id,
          }),
        }
      );

      const orderData = await readResponse(orderResponse);

      if (!orderResponse.ok || !orderData.success) {
        throw new Error(orderData.message || "Unable to create payment order.");
      }

      const user = getUserDetails();

      // Razorpay Checkout Options
      const options = {
        key: orderData.key,
        amount: orderData.order.amount,
        currency: orderData.order.currency,
        name: "MBBS Counselling",
        description: `${pkg.name} Package`,
        order_id: orderData.order.id,

        handler: async function (paymentResponse) {
          try {
            const verifyResponse = await fetch(
              `${API_URL}/payment/verify-payment`,
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(paymentResponse),
              }
            );

            const verifyData = await readResponse(verifyResponse);

            if (!verifyResponse.ok || !verifyData.success) {
              throw new Error(
                verifyData.message || "Payment verification failed."
              );
            }

            showMessage(`${pkg.name} package activated successfully!`);
          } catch (error) {
            console.error("Payment Verification Error:", error);
            showMessage(
              error.message || "Payment verification failed.",
              "error"
            );
          } finally {
            setLoadingPackage(null);
          }
        },

        prefill: {
          name: user.name || "",
          email: user.email || "",
        },

        theme: {
          color: "#0d9488",
        },

        modal: {
          ondismiss: function () {
            setLoadingPackage(null);
            showMessage("Payment window closed.", "error");
          },
        },
      };

      const razorpay = new window.Razorpay(options);

      razorpay.on("payment.failed", function (response) {
        console.error("Payment Failed:", response.error);

        showMessage(
          response.error.description || "Payment failed. Please try again.",
          "error"
        );

        setLoadingPackage(null);
      });

      razorpay.open();
    } catch (error) {
      console.error("Payment Error:", error);
      showMessage(error.message || "Unable to process payment.", "error");
      setLoadingPackage(null);
    }
  };

  // ======================================
  // PACKAGE SELECTION
  // ======================================
  const handlePackageSelection = (pkg) => {
    if (loadingPackage) return;

    if (Number(pkg.price) === 0) {
      activateFreePackage(pkg);
    } else {
      handlePaidPackage(pkg);
    }
  };

  // Format duration
  const getDuration = (pkg) => {
    if (!pkg.duration) return "One Time";

    const unit = pkg.durationType || "months";

    if (Number(pkg.duration) === 1) {
      return `1 ${unit.replace(/s$/, "")}`;
    }

    return `${pkg.duration} ${unit}`;
  };

  // Handle package features
  const getFeatures = (features) => {
    if (Array.isArray(features)) return features;

    if (typeof features === "string") {
      return features.split("\n").filter(Boolean);
    }

    return [];
  };

  return (
    <main className="min-h-screen overflow-hidden bg-slate-50">

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-teal-50 via-white to-cyan-50 px-5 py-20 text-center">
        <span className="inline-block rounded-full border border-teal-100 bg-white px-5 py-2 text-xs font-bold tracking-[2px] text-teal-700 shadow-sm">
          OUR PRICING
        </span>

        <h1 className="mx-auto mt-6 max-w-3xl text-3xl font-extrabold leading-tight text-slate-900 sm:text-4xl md:text-5xl">
          Choose the Right Plan for Your{" "}
          <span className="text-teal-600">Medical Journey</span>
        </h1>

        <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
          Get the right guidance and support to make your medical admission
          journey easier, smarter and more organized.
        </p>
      </section>

      {/* Packages Section */}
      <section className="mx-auto max-w-7xl px-5 py-16">

        <div className="mb-12 text-center">
          <h2 className="text-3xl font-extrabold text-slate-900 sm:text-4xl">
            Our Plans
          </h2>

          <p className="mt-3 text-sm text-slate-500 sm:text-base">
            Simple pricing. Better guidance. Smarter decisions.
          </p>
        </div>

        {/* Loading */}
        {loading && (
          <div className="py-16 text-center">
            <p className="text-lg font-semibold text-teal-700">
              Loading packages...
            </p>
          </div>
        )}

        {/* Package Cards */}
        {!loading && packages.length > 0 && (
          <div className="grid grid-cols-1 items-stretch gap-7 sm:grid-cols-2 lg:grid-cols-3">

            {packages.map((pkg) => {
              const features = getFeatures(pkg.features);
              const isFree = Number(pkg.price) === 0;

              return (
                <div
                  key={pkg._id}
                  className="relative flex flex-col rounded-2xl border border-slate-200 bg-white p-7 shadow-md shadow-slate-200/50 transition duration-300 hover:-translate-y-2 hover:shadow-xl"
                >

                  {/* Package Name */}
                  <div>
                    <h3 className="text-2xl font-extrabold text-slate-900">
                      {pkg.name}
                    </h3>

                    <p className="mt-3 min-h-[44px] text-sm leading-6 text-slate-500">
                      {pkg.description || "Get the support you need for your counselling journey."}
                    </p>
                  </div>

                  {/* Price */}
                  <div className="my-7 flex items-baseline gap-2">
                    <span className="text-4xl font-extrabold text-slate-900">
                      ₹{Number(pkg.price || 0).toLocaleString("en-IN")}
                    </span>

                    <span className="text-xs font-medium text-slate-500">
                      / {getDuration(pkg)}
                    </span>
                  </div>

                  <div className="mb-6 h-px bg-slate-100"></div>

                  {/* Features */}
                  <div className="flex-1">
                    <h4 className="mb-5 text-sm font-bold text-slate-800">
                      What's included?
                    </h4>

                    {features.length > 0 ? (
                      <ul className="space-y-4">
                        {features.map((feature, index) => (
                          <li
                            key={index}
                            className="flex items-start gap-3 text-sm leading-5 text-slate-600"
                          >
                            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-teal-50 text-xs font-bold text-teal-600">
                              ✓
                            </span>

                            {feature}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-slate-400">
                        No features added yet.
                      </p>
                    )}
                  </div>

                  {/* Button */}
                  <button
                    onClick={() => handlePackageSelection(pkg)}
                    disabled={loadingPackage !== null}
                    className="mt-8 flex w-full items-center justify-center gap-2 rounded-xl bg-teal-600 px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-teal-600/20 transition duration-300 hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {loadingPackage === pkg._id
                      ? "Please wait..."
                      : isFree
                        ? "Get Started"
                        : `Choose ${pkg.name}`}

                    {loadingPackage !== pkg._id && <span>→</span>}
                  </button>
                </div>
              );
            })}

          </div>
        )}

        {/* No Packages */}
        {!loading && packages.length === 0 && (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-5 py-16 text-center">
            <h3 className="text-xl font-bold text-slate-800">
              No Packages Available
            </h3>

            <p className="mt-3 text-sm text-slate-500">
              Currently, there are no active packages available.
            </p>

            <button
              onClick={fetchPackages}
              className="mt-6 rounded-xl bg-teal-600 px-6 py-3 text-sm font-bold text-white hover:bg-teal-700"
            >
              Refresh Packages
            </button>
          </div>
        )}

        {/* Status Message */}
        {message && (
          <div
            className={`mx-auto mt-10 max-w-xl rounded-xl border p-5 text-center ${
              messageType === "error"
                ? "border-red-200 bg-red-50 text-red-700"
                : "border-teal-200 bg-teal-50 text-teal-800"
            }`}
          >
            <p className="font-bold">{message}</p>
          </div>
        )}

        {/* Selected Package */}
        {selectedPackage && !message && loadingPackage && (
          <div className="mx-auto mt-10 max-w-xl rounded-xl border border-teal-200 bg-teal-50 p-5 text-center">
            <p className="font-bold text-teal-800">
              {selectedPackage.name} Package Selected!
            </p>

            <p className="mt-2 text-sm text-teal-700">
              Processing your request...
            </p>
          </div>
        )}
      </section>

      {/* Contact Section */}
      <section className="mx-auto mb-16 max-w-5xl px-5">
        <div className="rounded-3xl bg-gradient-to-r from-teal-800 to-cyan-700 px-6 py-12 text-center shadow-xl sm:px-12">
          <h2 className="text-2xl font-extrabold text-white sm:text-3xl">
            Need Help Choosing a Plan?
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-teal-50">
            Not sure which plan is right for you? Our team can help you choose
            the best option for your counselling journey.
          </p>

          <a
            href="/contact"
            className="mt-7 inline-flex items-center gap-2 rounded-xl bg-white px-7 py-3.5 text-sm font-bold text-teal-800 transition hover:-translate-y-1 hover:bg-teal-50"
          >
            Contact Us →
          </a>
        </div>
      </section>

    </main>
  );
}
