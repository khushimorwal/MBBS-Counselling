
"use client";

import React, { useEffect, useState } from "react";
import { API } from "../../api/axios";
import { toast } from "react-toastify";

const Recommendation = () => {
  const [assignments, setAssignments] = useState([]);
  const [colleges, setColleges] = useState([]);

  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [selectedColleges, setSelectedColleges] = useState([]);
  const [remarks, setRemarks] = useState("");

  const [recommendationId, setRecommendationId] = useState("");
  const [recommendationStatus, setRecommendationStatus] = useState("draft");

  const [loading, setLoading] = useState(true);
  const [loadingRecommendation, setLoadingRecommendation] = useState(false);
  const [saving, setSaving] = useState(false);
  const [sharing, setSharing] = useState(false);

  // Theme classes
  const inputClass =
    "w-full rounded-xl border border-[#9DBDBA] bg-white px-4 py-3 text-sm text-[#0B2B2A] outline-none transition focus:border-teal-700 focus:ring-2 focus:ring-teal-100 disabled:cursor-not-allowed disabled:bg-gray-100";

  const cardClass =
    "rounded-2xl border border-[#D5E8E5] bg-white p-5 shadow-[0_3px_15px_rgba(11,43,42,0.06)] sm:p-6";

  const headingClass =
    "mb-4 text-lg font-bold text-[#0B2B2A]";

  // Fetch assigned students and colleges
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);

        const [assignmentResponse, collegeResponse] =
          await Promise.all([
            API.get("/counselling-assignment/my-assignments"),
            API.get("/college/public-list"),
          ]);

        setAssignments(assignmentResponse.data.data || []);

        setColleges(
          collegeResponse.data.colleges ||
          collegeResponse.data.data ||
          []
        );
      } catch (error) {
        console.error("Recommendation Data Error:", error);

        toast.error(
          error.response?.data?.message ||
          "Failed to load recommendation data."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  // Load existing recommendation
  const loadExistingRecommendation = async (requestId) => {
    try {
      setLoadingRecommendation(true);

      const response = await API.get(
        `/college-recommendations/request/${requestId}`
      );

      const recommendation = response.data.data;

      setRecommendationId(recommendation._id);
      setRecommendationStatus(recommendation.status);
      setRemarks(recommendation.counsellorNote || "");

      const savedColleges = recommendation.colleges
        .map((item) => {
          const collegeId =
            item.college?._id || item.college;

          return colleges.find(
            (college) => college._id === collegeId
          );
        })
        .filter(Boolean);

      setSelectedColleges(savedColleges);

    } catch (error) {
      if (error.response?.status !== 404) {
        console.error("Load Recommendation Error:", error);

        toast.error(
          "Failed to load existing recommendation."
        );
      }

      setRecommendationId("");
      setRecommendationStatus("draft");
      setSelectedColleges([]);
      setRemarks("");
    } finally {
      setLoadingRecommendation(false);
    }
  };

  // Select assigned student
  const handleAssignmentChange = async (event) => {
    const assignmentId = event.target.value;

    const assignment = assignments.find(
      (item) => item._id === assignmentId
    );

    setSelectedAssignment(assignment || null);
    setSelectedColleges([]);
    setRemarks("");
    setRecommendationId("");
    setRecommendationStatus("draft");

    if (assignment?.counsellingRequest?._id) {
      await loadExistingRecommendation(
        assignment.counsellingRequest._id
      );
    }
  };

  // Select college
  const handleCollegeChange = (event) => {
    const collegeId = event.target.value;

    if (!collegeId) return;

    const college = colleges.find(
      (item) => item._id === collegeId
    );

    if (!college) return;

    const alreadySelected = selectedColleges.some(
      (item) => item._id === collegeId
    );

    if (alreadySelected) return;

    setSelectedColleges((previous) => [
      ...previous,
      college,
    ]);

    event.target.value = "";
  };

  // Remove selected college
  const removeCollege = (collegeId) => {
    setSelectedColleges((previous) =>
      previous.filter((item) => item._id !== collegeId)
    );
  };

  // Save recommendation draft
  const handleSaveDraft = async (event) => {
    event.preventDefault();

    const requestId =
      selectedAssignment?.counsellingRequest?._id;

    if (!requestId) {
      toast.error("Please select an assigned student.");
      return;
    }

    if (selectedColleges.length === 0) {
      toast.error("Please select at least one college.");
      return;
    }

    try {
      setSaving(true);

      const payload = {
        counsellingRequest: requestId,
        colleges: selectedColleges.map(
          (college) => college._id
        ),
        counsellorNote: remarks,
      };

      let response;

      if (recommendationId) {
        response = await API.put(
          `/college-recommendations/draft/${recommendationId}`,
          {
            colleges: payload.colleges,
            counsellorNote: payload.counsellorNote,
          }
        );
      } else {
        response = await API.post(
          "/college-recommendations/draft",
          payload
        );
      }

      const recommendation = response.data.data;

      setRecommendationId(recommendation._id);
      setRecommendationStatus(recommendation.status);

      toast.success(response.data.message);

    } catch (error) {
      console.error("Save Recommendation Error:", error);

      toast.error(
        error.response?.data?.message ||
        "Failed to save recommendation."
      );
    } finally {
      setSaving(false);
    }
  };

  // Share recommendation
  const handleShare = async () => {
    if (!recommendationId) {
      toast.error("Please save the recommendation first.");
      return;
    }

    try {
      setSharing(true);

      const response = await API.patch(
        `/college-recommendations/share/${recommendationId}`
      );

      setRecommendationStatus("shared");

      toast.success(response.data.message);

    } catch (error) {
      console.error("Share Recommendation Error:", error);

      toast.error(
        error.response?.data?.message ||
        "Failed to share recommendation."
      );
    } finally {
      setSharing(false);
    }
  };

  // Loading screen
  if (loading) {
    return (
      <div className="rounded-2xl border border-[#D5E8E5] bg-white p-10 text-center shadow-sm">
        <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-4 border-[#D5E8E5] border-t-teal-700" />

        <p className="text-sm font-medium text-[#3F5A58]">
          Loading recommendation data...
        </p>
      </div>
    );
  }

  const request = selectedAssignment?.counsellingRequest;
  const student = request?.student;

  return (
    <div className="min-h-full rounded-2xl bg-gradient-to-br from-[#DDF5F1] via-[#EDF8F6] to-[#F5FAF9] p-4 sm:p-6 lg:p-7">

      {/* HEADER */}
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">

        <div>
          <h2 className="text-2xl font-bold tracking-tight text-[#0B2B2A] sm:text-3xl">
            College Recommendations
          </h2>

          <p className="mt-2 text-sm text-[#3F5A58]">
            Recommend suitable colleges to your assigned student.
          </p>
        </div>

        <span
          className={`w-fit rounded-full border px-4 py-2 text-xs font-bold ${
            recommendationStatus === "shared"
              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
              : "border-amber-200 bg-amber-50 text-amber-700"
          }`}
        >
          <span className="mr-2 inline-block h-2 w-2 rounded-full bg-current" />

          {recommendationStatus === "shared"
            ? "Shared"
            : "Draft"}
        </span>

      </div>

      {/* SELECT STUDENT */}
      <div className={`${cardClass} mb-5`}>

        <div className="mb-4 flex items-center gap-3">

          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#E2F2EF] text-lg">
            👤
          </div>

          <div>
            <h3 className="text-base font-bold text-[#0B2B2A]">
              Select Assigned Student
            </h3>

            <p className="mt-0.5 text-xs text-[#66817D]">
              Choose a student to create college recommendations.
            </p>
          </div>

        </div>

        <select
          value={selectedAssignment?._id || ""}
          onChange={handleAssignmentChange}
          className={inputClass}
        >
          <option value="">Select a student</option>

          {assignments.map((assignment) => {
            const assignedStudent =
              assignment.counsellingRequest?.student;

            return (
              <option
                key={assignment._id}
                value={assignment._id}
              >
                {assignedStudent?.name || "Unknown Student"}
              </option>
            );
          })}
        </select>

        {assignments.length === 0 && (
          <p className="mt-3 text-sm text-red-500">
            No active student assignments found.
          </p>
        )}

      </div>

      {/* STUDENT DETAILS */}
      <div className={`${cardClass} mb-5`}>

        <div className="mb-5 flex items-center gap-3">

          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#E2F2EF] text-lg">
            📋
          </div>

          <div>
            <h3 className="text-base font-bold text-[#0B2B2A]">
              Student Details
            </h3>

            <p className="mt-0.5 text-xs text-[#66817D]">
              Student information and contact details.
            </p>
          </div>

        </div>

        {student ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

            <div className="rounded-xl border border-[#D5E8E5] bg-[#F6FBFA] p-4">
              <p className="text-xs font-medium text-[#66817D]">
                Student Name
              </p>

              <p className="mt-2 break-words font-semibold text-[#0B2B2A]">
                {student.name || "N/A"}
              </p>
            </div>

            <div className="rounded-xl border border-[#D5E8E5] bg-[#F6FBFA] p-4">
              <p className="text-xs font-medium text-[#66817D]">
                Email Address
              </p>

              <p className="mt-2 break-all font-semibold text-[#0B2B2A]">
                {student.email || "N/A"}
              </p>
            </div>

            <div className="rounded-xl border border-[#D5E8E5] bg-[#F6FBFA] p-4">
              <p className="text-xs font-medium text-[#66817D]">
                Phone Number
              </p>

              <p className="mt-2 font-semibold text-[#0B2B2A]">
                {student.phone || "Not available"}
              </p>
            </div>

          </div>
        ) : (
          <div className="rounded-xl bg-[#F6FBFA] px-4 py-8 text-center">
            <p className="text-sm text-[#66817D]">
              Select an assigned student to view details.
            </p>
          </div>
        )}

      </div>

      {/* RECOMMENDATION FORM */}
      <form onSubmit={handleSaveDraft} className="space-y-5">

        {/* SELECT COLLEGES */}
        <div className={cardClass}>

          <div className="mb-5 flex items-center gap-3">

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#E2F2EF] text-lg">
              🏛️
            </div>

            <div>
              <h3 className="text-base font-bold text-[#0B2B2A]">
                Select Colleges
              </h3>

              <p className="mt-0.5 text-xs text-[#66817D]">
                Choose suitable colleges for your assigned student.
              </p>
            </div>

          </div>

          <select
            onChange={handleCollegeChange}
            defaultValue=""
            disabled={
              !student ||
              recommendationStatus === "shared"
            }
            className={inputClass}
          >
            <option value="">Select a college</option>

            {colleges.map((college) => (
              <option
                key={college._id}
                value={college._id}
                disabled={selectedColleges.some(
                  (item) => item._id === college._id
                )}
              >
                {college.name}
              </option>
            ))}
          </select>

          {colleges.length === 0 && (
            <p className="mt-3 text-sm text-red-500">
              No colleges available.
            </p>
          )}

          {/* SELECTED COLLEGES */}
          <div className="mt-6">

            <div className="mb-3 flex items-center justify-between">
              <h4 className="text-sm font-bold text-[#0B2B2A]">
                Selected Colleges
              </h4>

              <span className="rounded-full bg-[#E2F2EF] px-3 py-1 text-xs font-bold text-teal-800">
                {selectedColleges.length} Selected
              </span>
            </div>

            {selectedColleges.length === 0 ? (
              <div className="rounded-xl border border-dashed border-[#9DBDBA] bg-[#F6FBFA] p-7 text-center">

                <div className="mb-2 text-3xl">
                  🏫
                </div>

                <p className="text-sm font-semibold text-[#3F5A58]">
                  No colleges selected yet.
                </p>

                <p className="mt-1 text-xs text-[#66817D]">
                  Select a college from the dropdown above.
                </p>

              </div>
            ) : (
              <div className="space-y-3">

                {selectedColleges.map((college, index) => (
                  <div
                    key={college._id}
                    className="flex flex-col justify-between gap-3 rounded-xl border border-[#D5E8E5] bg-[#F6FBFA] p-4 sm:flex-row sm:items-center"
                  >

                    <div className="flex items-center gap-3">

                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#DDEFEA] text-sm font-bold text-teal-800">
                        {index + 1}
                      </div>

                      <div>
                        <p className="text-xs font-medium text-[#66817D]">
                          Priority {index + 1}
                        </p>

                        <p className="mt-1 font-semibold text-[#0B2B2A]">
                          {college.name}
                        </p>
                      </div>

                    </div>

                    {recommendationStatus !== "shared" && (
                      <button
                        type="button"
                        onClick={() => removeCollege(college._id)}
                        className="rounded-lg border border-red-200 bg-white px-4 py-2 text-xs font-bold text-red-600 transition hover:bg-red-50"
                      >
                        Remove
                      </button>
                    )}

                  </div>
                ))}

              </div>
            )}

          </div>

        </div>

        {/* COUNSELLOR REMARKS */}
        <div className={cardClass}>

          <div className="mb-4 flex items-center gap-3">

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#E2F2EF] text-lg">
              📝
            </div>

            <div>
              <h3 className="text-base font-bold text-[#0B2B2A]">
                Counsellor Remarks
              </h3>

              <p className="mt-0.5 text-xs text-[#66817D]">
                Add suggestions and guidance for the student.
              </p>
            </div>

          </div>

          <textarea
            rows="4"
            value={remarks}
            onChange={(event) => setRemarks(event.target.value)}
            disabled={recommendationStatus === "shared"}
            placeholder="Add your recommendation remarks..."
            className={`${inputClass} resize-none`}
          />

        </div>

        {/* LOADING EXISTING RECOMMENDATION */}
        {loadingRecommendation && (
          <p className="text-right text-sm font-medium text-teal-700">
            Loading saved recommendation...
          </p>
        )}

        {/* ACTION BUTTONS */}
        {recommendationStatus !== "shared" && (
          <div className="flex flex-col justify-end gap-3 sm:flex-row">

            <button
              type="submit"
              disabled={
                saving ||
                sharing ||
                loadingRecommendation ||
                !student ||
                selectedColleges.length === 0
              }
              className="rounded-xl border border-teal-700 bg-white px-6 py-3 text-sm font-bold text-teal-800 transition hover:bg-[#E2F2EF] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving
                ? "Saving..."
                : recommendationId
                  ? "Update Draft"
                  : "Save Draft"}
            </button>

            <button
              type="button"
              onClick={handleShare}
              disabled={
                !recommendationId ||
                saving ||
                sharing ||
                loadingRecommendation
              }
              className="rounded-xl bg-teal-700 px-6 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {sharing
                ? "Sharing..."
                : "Share With Student"}
            </button>

          </div>
        )}

      </form>

      {/* SHARED MESSAGE */}
      {recommendationStatus === "shared" && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
          <p className="text-sm font-semibold text-emerald-800">
            ✓ Recommendation successfully shared with the student.
          </p>
        </div>
      )}

    </div>
  );
};

export default Recommendation;
