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
  const [saving, setSaving] = useState(false);
  const [sharing, setSharing] = useState(false);

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

  // Load existing recommendation for selected request
  const loadExistingRecommendation = async (requestId) => {
    try {
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
      // A 404 means no recommendation has been created yet.
      if (error.response?.status !== 404) {
        console.error("Load Recommendation Error:", error);
        toast.error("Failed to load existing recommendation.");
      }

      setRecommendationId("");
      setRecommendationStatus("draft");
      setSelectedColleges([]);
      setRemarks("");
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

  // Share recommendation with student
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
      <div className="rounded-2xl border border-line bg-white p-10 text-center">
        <p className="text-sm font-medium text-muted">
          Loading recommendation data...
        </p>
      </div>
    );
  }

  const request = selectedAssignment?.counsellingRequest;
  const student = request?.student;

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-2xl font-bold text-brand-dark">
            College Recommendations
          </h2>

          <p className="mt-1 text-sm text-muted">
            Recommend suitable colleges to your assigned student.
          </p>
        </div>

        <span
          className={`w-fit rounded-full px-4 py-2 text-xs font-bold ${recommendationStatus === "shared"
              ? "bg-green-100 text-green-700"
              : "bg-yellow-100 text-yellow-700"
            }`}
        >
          {recommendationStatus === "shared" ? "Shared" : "Draft"}
        </span>
      </div>

      {/* Select Student */}
      <div className="rounded-2xl border border-line bg-white p-5 shadow-sm">
        <h3 className="mb-4 text-lg font-bold text-brand-dark">
          Select Assigned Student
        </h3>

        <select
          value={selectedAssignment?._id || ""}
          onChange={handleAssignmentChange}
          className="w-full rounded-xl border border-line bg-white px-4 py-3 text-sm outline-none focus:border-brand"
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
                {" - "}
                {assignedStudent?.email || "No email"}
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

      {/* Student Details */}
      <div className="rounded-2xl border border-line bg-white p-5 shadow-sm">
        <h3 className="mb-4 text-lg font-bold text-brand-dark">
          Student Details
        </h3>

        {student ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <p className="text-xs text-muted">Student Name</p>
              <p className="mt-1 font-semibold text-brand-dark">
                {student.name || "N/A"}
              </p>
            </div>

            <div>
              <p className="text-xs text-muted">Email</p>
              <p className="mt-1 font-semibold text-brand-dark">
                {student.email || "N/A"}
              </p>
            </div>

            <div>
              <p className="text-xs text-muted">Phone</p>
              <p className="mt-1 font-semibold text-brand-dark">
                {student.phone || "Not available"}
              </p>
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted">
            Select an assigned student to view details.
          </p>
        )}
      </div>

      {/* Recommendation Form */}
      <form onSubmit={handleSaveDraft} className="space-y-5">

        {/* College Selection */}
        <div className="rounded-2xl border border-line bg-white p-5 shadow-sm">
          <h3 className="mb-4 text-lg font-bold text-brand-dark">
            Select Colleges
          </h3>

          <select
            onChange={handleCollegeChange}
            defaultValue=""
            disabled={
              !student || recommendationStatus === "shared"
            }
            className="w-full rounded-xl border border-line bg-white px-4 py-3 text-sm outline-none focus:border-brand disabled:bg-gray-100"
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

          {/* Selected Colleges */}
          <div className="mt-5 space-y-3">
            {selectedColleges.length === 0 ? (
              <p className="rounded-xl bg-surface p-4 text-center text-sm text-muted">
                No colleges selected yet.
              </p>
            ) : (
              selectedColleges.map((college, index) => (
                <div
                  key={college._id}
                  className="flex items-center justify-between rounded-xl border border-line p-4"
                >
                  <div>
                    <p className="text-xs text-muted">
                      Priority {index + 1}
                    </p>

                    <p className="mt-1 font-semibold text-brand-dark">
                      {college.name}
                    </p>
                  </div>

                  {recommendationStatus !== "shared" && (
                    <button
                      type="button"
                      onClick={() => removeCollege(college._id)}
                      className="rounded-lg px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-50"
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Counsellor Remarks */}
        <div className="rounded-2xl border border-line bg-white p-5 shadow-sm">
          <label className="mb-2 block text-sm font-bold text-brand-dark">
            Counsellor Remarks
          </label>

          <textarea
            rows="4"
            value={remarks}
            onChange={(event) => setRemarks(event.target.value)}
            disabled={recommendationStatus === "shared"}
            placeholder="Add your recommendation remarks..."
            className="w-full resize-none rounded-xl border border-line px-4 py-3 text-sm outline-none focus:border-brand disabled:bg-gray-100"
          />
        </div>

        {/* Action Buttons */}
        {recommendationStatus !== "shared" && (
          <div className="flex flex-wrap justify-end gap-3">
            <button
              type="submit"
              disabled={
                saving ||
                sharing ||
                !student ||
                selectedColleges.length === 0
              }
              className="rounded-xl border border-brand px-6 py-3 text-sm font-bold text-brand transition hover:bg-brand/5 disabled:cursor-not-allowed disabled:opacity-50"
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
              disabled={!recommendationId || saving || sharing}
              className="rounded-xl bg-accent px-6 py-3 text-sm font-bold text-white transition hover:bg-[#cf4a24] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {sharing ? "Sharing..." : "Share With Student"}
            </button>
          </div>
        )}
      </form>
    </div>
  );
};

export default Recommendation;