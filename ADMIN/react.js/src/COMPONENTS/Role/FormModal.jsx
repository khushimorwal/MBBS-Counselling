// import { FiX, FiShield } from "react-icons/fi";

// const MODULES = [
//   { key: "students", label: "Students" },
//   { key: "colleges", label: "Colleges" },
//   { key: "universities", label: "Universities" },
//   { key: "streams", label: "Streams" },
//   { key: "degrees", label: "Degrees" },
//   { key: "courses", label: "Courses" },
//   { key: "specializations", label: "Specializations" },
//   { key: "roles", label: "Role & Permissions" },
//   { key: "emailTemplates", label: "Email Templates" },
// ];

// const ACTIONS = ["view", "add", "edit", "delete"];

// // Get all assigned permissions for View mode.
// const getEnabledPermissions = (permissions) => {
//   const enabledPermissions = [];

//   MODULES.forEach((module) => {
//     const actions = permissions?.[module.key];

//     if (!actions) return;

//     ACTIONS.forEach((action) => {
//       if (actions[action] === true) {
//         enabledPermissions.push({
//           key: `${module.key}-${action}`,
//           label: `${module.label} · ${action}`,
//         });
//       }
//     });
//   });

//   return enabledPermissions;
// };

// function FormModal({
//   setShowModal,
//   handleAddRole,
//   handleEditRole,
//   formData,
//   handleChange,
//   isEdit,
//   isView = false,
//   dataLoading,
// }) {
//   const isStudent = formData.role === "Student";
//   const isAdmin = formData.role === "Admin";
//   const isSuperAdmin = formData.role === "Super Admin";

//   const enabledPermissions = getEnabledPermissions(
//     formData.permissions
//   );

//   const handleSubmit = (event) => {
//     event.preventDefault();

//     if (isView || dataLoading) return;

//     if (isEdit) {
//       handleEditRole(event);
//     } else {
//       handleAddRole(event);
//     }
//   };

//   const isPermissionDisabled = (moduleKey, action) => {
//     if (isView || dataLoading || isSuperAdmin) {
//       return true;
//     }

//     // Student: Students module mein View + Add.
//     // Baaki modules mein sirf View.
//     if (isStudent) {
//       if (action === "view") return false;

//       return !(moduleKey === "students" && action === "add");
//     }

//     // Admin: Delete permission allowed nahi hai.
//     if (isAdmin && action === "delete") {
//       return true;
//     }

//     return false;
//   };

//   return (
//     <div className="fixed inset-0 z-[100] flex items-center justify-center bg-brand-dark/50 p-4">
//       <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-2xl bg-white shadow-xl">

//         {/* HEADER */}
//         <div className="sticky top-0 z-10 flex items-center justify-between border-b border-line bg-white px-5 py-4 sm:px-6">
//           <div className="flex items-center gap-3">
//             <div className="rounded-xl bg-brand-soft p-3 text-brand">
//               <FiShield size={22} />
//             </div>

//             <div>
//               <h2 className="text-xl font-bold text-brand-dark">
//                 {isView
//                   ? "View Role Permissions"
//                   : isEdit
//                     ? "Edit Role Permissions"
//                     : "Add Role"}
//               </h2>

//               <p className="mt-1 text-sm text-muted">
//                 {isView
//                   ? "View the permissions assigned to this role."
//                   : "Assign permissions to the selected role."}
//               </p>
//             </div>
//           </div>

//           <button
//             type="button"
//             onClick={() => setShowModal(false)}
//             className="rounded-lg p-2 text-muted transition hover:bg-surface"
//             aria-label="Close modal"
//           >
//             <FiX size={22} />
//           </button>
//         </div>

//         {/* FORM */}
//         <form onSubmit={handleSubmit}>

//           {/* ROLE FIELD */}
//           {isView ? (
//             <div className="border-b border-line px-5 py-5 sm:px-6">
//               <p className="text-sm font-medium text-muted">
//                 Role Name
//               </p>

//               <h3 className="mt-1 text-xl font-bold text-brand-dark">
//                 {formData.role}
//               </h3>
//             </div>
//           ) : (
//             <div className="border-b border-line px-5 py-5 sm:px-6">
//               <label
//                 htmlFor="role"
//                 className="mb-2 block text-sm font-semibold text-brand-dark"
//               >
//                 Role Name
//               </label>

//               <select
//                 id="role"
//                 name="role"
//                 value={formData.role}
//                 onChange={handleChange}
//                 disabled={isEdit || dataLoading}
//                 required
//                 className="w-full rounded-xl border border-line bg-white px-4 py-3 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/10 disabled:cursor-not-allowed disabled:bg-surface"
//               >
//                 <option value="">Select Role</option>
//                 <option value="Admin">Admin</option>
//                 <option value="Student">Student</option>
//               </select>
//             </div>
//           )}

//           {/* PERMISSIONS */}
//           <div className="px-5 py-5 sm:px-6">
//             {isView ? (
//               <>
//                 <div className="mb-4">
//                   <h3 className="text-base font-bold text-brand-dark">
//                     Assigned Permissions
//                   </h3>

//                   <p className="mt-1 text-sm text-muted">
//                     Permissions assigned to this role.
//                   </p>
//                 </div>

//                 <div className="flex flex-wrap gap-2">
//                   {isSuperAdmin ? (
//                     <span className="rounded-full bg-brand-soft px-3 py-2 text-sm font-medium text-brand-dark">
//                       Full Access
//                     </span>
//                   ) : enabledPermissions.length > 0 ? (
//                     enabledPermissions.map((permission) => (
//                       <span
//                         key={permission.key}
//                         className="rounded-full bg-brand-soft px-3 py-2 text-sm font-medium text-brand-dark"
//                       >
//                         {permission.label}
//                       </span>
//                     ))
//                   ) : (
//                     <p className="text-sm text-muted">
//                       No permissions assigned.
//                     </p>
//                   )}
//                 </div>

//                 <p className="mt-4 text-xs text-muted">
//                   Total:{" "}
//                   {isSuperAdmin
//                     ? MODULES.length * ACTIONS.length
//                     : enabledPermissions.length}{" "}
//                   permissions
//                 </p>
//               </>
//             ) : (
//               <>
//                 <div className="mb-4">
//                   <h3 className="text-base font-bold text-brand-dark">
//                     Permissions
//                   </h3>

//                   <p className="mt-1 text-sm text-muted">
//                     Select the permissions you want to assign to this role.
//                   </p>
//                 </div>

//                 <div className="overflow-x-auto rounded-xl border border-line">
//                   <table className="w-full min-w-[600px] text-left">
//                     <thead className="bg-surface">
//                       <tr>
//                         <th className="px-4 py-3 text-sm font-semibold text-brand-dark">
//                           Module
//                         </th>

//                         {ACTIONS.map((action) => (
//                           <th
//                             key={action}
//                             className="px-4 py-3 text-center text-sm font-semibold capitalize text-brand-dark"
//                           >
//                             {action}
//                           </th>
//                         ))}
//                       </tr>
//                     </thead>

//                     <tbody className="divide-y divide-line">
//                       {MODULES.map((module) => (
//                         <tr key={module.key}>
//                           <td className="px-4 py-3 text-sm font-medium text-brand-dark">
//                             {module.label}
//                           </td>

//                           {ACTIONS.map((action) => {
//                             const checked = Boolean(
//                               formData.permissions?.[module.key]?.[action]
//                             );

//                             const disabled = isPermissionDisabled(
//                               module.key,
//                               action
//                             );

//                             return (
//                               <td
//                                 key={action}
//                                 className="px-4 py-3 text-center"
//                               >
//                                 <input
//                                   type="checkbox"
//                                   name={`permissions.${module.key}.${action}`}
//                                   checked={checked}
//                                   onChange={handleChange}
//                                   disabled={disabled}
//                                   className="h-4 w-4 accent-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
//                                 />
//                               </td>
//                             );
//                           })}
//                         </tr>
//                       ))}
//                     </tbody>
//                   </table>
//                 </div>

//                 {isStudent && (
//                   <p className="mt-3 text-sm text-muted">
//                     Student can view modules and add student records only.
//                   </p>
//                 )}

//                 {isAdmin && (
//                   <p className="mt-3 text-sm text-muted">
//                     Admin cannot have Delete permission.
//                   </p>
//                 )}
//               </>
//             )}
//           </div>

//           {/* FOOTER */}
//           <div className="flex flex-col-reverse gap-3 border-t border-line px-5 py-4 sm:flex-row sm:justify-end sm:px-6">
//             <button
//               type="button"
//               onClick={() => setShowModal(false)}
//               className="rounded-xl border border-line px-5 py-3 text-sm font-semibold text-brand-dark transition hover:bg-surface"
//             >
//               {isView ? "Close" : "Cancel"}
//             </button>

//             {!isView && (
//               <button
//                 type="submit"
//                 disabled={dataLoading || isSuperAdmin}
//                 className="rounded-xl bg-brand px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-60"
//               >
//                 {dataLoading
//                   ? "Please wait..."
//                   : isEdit
//                     ? "Save Permissions"
//                     : "Create Role"}
//               </button>
//             )}
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// }

// export default FormModal;

