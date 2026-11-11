// import { useState } from "react";
// import {
//   FiGitBranch,
//   FiCheckCircle,
//   FiClock,
//   FiCircle,
//   FiSave,
// } from "react-icons/fi";

// const initialStages = [
//   { id: "registration", label: "Registration", status: "completed", remarks: "" },
//   { id: "choice_filling", label: "Choice Filling", status: "pending", remarks: "" },
//   { id: "choice_locking", label: "Choice Locking", status: "pending", remarks: "" },
//   { id: "seat_allotment", label: "Seat Allotment", status: "pending", remarks: "" },
//   { id: "document_verification", label: "Document Verification", status: "pending", remarks: "" },
//   { id: "admission_confirmation", label: "Admission Confirmation", status: "pending", remarks: "" },
// ];

// const statusStyles = {
//   pending: "bg-gray-100 text-gray-600",
//   in_progress: "bg-amber-100 text-amber-700",
//   completed: "bg-green-100 text-green-700",
// };

// const WorkflowManagement = () => {
//   const [stages, setStages] = useState(initialStages);

//   const handleChange = (index, field, value) => {
//     const updatedStages = [...stages];
//     updatedStages[index] = {
//       ...updatedStages[index],
//       [field]: value,
//     };
//     setStages(updatedStages);
//   };

//   const completedCount = stages.filter(
//     (stage) => stage.status === "completed"
//   ).length;

//   const progress = Math.round((completedCount / stages.length) * 100);

//   const handleSave = () => {
//     console.log("Workflow Data:", stages);
//     alert("Workflow changes are ready to save.");
//   };

//   return (
//     <div className="min-h-screen bg-slate-50 p-6">
//       <div className="mx-auto max-w-6xl space-y-6">

//         {/* Header */}
//         <div className="flex flex-wrap items-center justify-between gap-4">
//           <div>
//             <div className="mb-2 flex items-center gap-2 text-indigo-600">
//               <FiGitBranch size={20} />
//               <span className="text-sm font-semibold">COUNSELLING MANAGEMENT</span>
//             </div>

//             <h1 className="text-2xl font-bold text-slate-800">
//               Counselling Workflow
//             </h1>

//             <p className="mt-1 text-sm text-slate-500">
//               Track and manage each stage of student admission.
//             </p>
//           </div>

//           <button
//             onClick={handleSave}
//             className="flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-indigo-700"
//           >
//             <FiSave size={17} />
//             Save Changes
//           </button>
//         </div>

//         {/* Student Request Information */}
//         <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
//           <h2 className="mb-4 text-lg font-semibold text-slate-800">
//             Student Request
//           </h2>

//           <div className="grid gap-4 sm:grid-cols-3">
//             <div>
//               <p className="text-xs text-slate-400">Request ID</p>
//               <p className="mt-1 font-semibold text-slate-700">Select request to load</p>
//             </div>

//             <div>
//               <p className="text-xs text-slate-400">Student Name</p>
//               <p className="mt-1 font-semibold text-slate-700">Not selected</p>
//             </div>

//             <div>
//               <p className="text-xs text-slate-400">Current Status</p>
//               <span className="mt-1 inline-block rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
//                 Workflow Overview
//               </span>
//             </div>
//           </div>
//         </div>

//         {/* Progress */}
//         <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
//           <div className="mb-3 flex items-center justify-between">
//             <div>
//               <h2 className="font-semibold text-slate-800">Overall Progress</h2>
//               <p className="mt-1 text-sm text-slate-500">
//                 {completedCount} of {stages.length} stages completed
//               </p>
//             </div>

//             <span className="text-2xl font-bold text-indigo-600">
//               {progress}%
//             </span>
//           </div>

//           <div className="h-3 overflow-hidden rounded-full bg-slate-100">
//             <div
//               className="h-full rounded-full bg-indigo-600 transition-all"
//               style={{ width: `${progress}%` }}
//             />
//           </div>
//         </div>

//         {/* Workflow Stages */}
//         <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
//           <h2 className="mb-5 text-lg font-semibold text-slate-800">
//             Admission Stages
//           </h2>

//           <div className="space-y-4">
//             {stages.map((stage, index) => (
//               <div
//                 key={stage.id}
//                 className="rounded-xl border border-slate-200 p-4 transition hover:border-indigo-200"
//               >
//                 <div className="flex flex-wrap items-center justify-between gap-3">
//                   <div className="flex items-center gap-3">
//                     <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
//                       {stage.status === "completed" ? (
//                         <FiCheckCircle size={20} />
//                       ) : stage.status === "in_progress" ? (
//                         <FiClock size={20} />
//                       ) : (
//                         <FiCircle size={20} />
//                       )}
//                     </div>

//                     <div>
//                       <p className="text-xs text-slate-400">
//                         STAGE {String(index + 1).padStart(2, "0")}
//                       </p>
//                       <h3 className="font-semibold text-slate-800">
//                         {stage.label}
//                       </h3>
//                     </div>
//                   </div>

//                   <span
//                     className={`rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[stage.status]}`}
//                   >
//                     {stage.status.replace("_", " ").toUpperCase()}
//                   </span>
//                 </div>

//                 <div className="mt-4 grid gap-4 md:grid-cols-2">
//                   <div>
//                     <label className="mb-2 block text-sm font-medium text-slate-600">
//                       Update Status
//                     </label>

//                     <select
//                       value={stage.status}
//                       onChange={(e) =>
//                         handleChange(index, "status", e.target.value)
//                       }
//                       className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
//                     >
//                       <option value="pending">Pending</option>
//                       <option value="in_progress">In Progress</option>
//                       <option value="completed">Completed</option>
//                     </select>
//                   </div>

//                   <div>
//                     <label className="mb-2 block text-sm font-medium text-slate-600">
//                       Remarks
//                     </label>

//                     <input
//                       type="text"
//                       value={stage.remarks}
//                       onChange={(e) =>
//                         handleChange(index, "remarks", e.target.value)
//                       }
//                       placeholder="Add stage remarks..."
//                       className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
//                     />
//                   </div>
//                 </div>
//               </div>
//             ))}
//           </div>

//           <div className="mt-6 flex justify-end">
//             <button
//               onClick={handleSave}
//               className="flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700"
//             >
//               <FiSave size={17} />
//               Save Workflow
//             </button>
//           </div>
//         </div>

//       </div>
//     </div>
//   );
// };

// export default WorkflowManagement;