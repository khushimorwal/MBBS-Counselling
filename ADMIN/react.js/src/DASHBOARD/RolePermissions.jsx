import { useEffect, useMemo, useState } from "react";
import {
  FiPlus,
  FiEdit2,
  FiShield,
  FiEye,
  FiTrash2,
  FiCheckCircle,
  FiClock,
  FiX,
} from "react-icons/fi";
import { toast } from "react-toastify";
import { API } from "../api/axios.js";

const MODULES = [
  { key: "dashboard", label: "Dashboard" },
  { key: "students", label: "Students" },
  { key: "users", label: "Users" },
  { key: "colleges", label: "Colleges" },
  { key: "university", label: "University" },
  { key: "streams", label: "Stream" },
  { key: "degrees", label: "Degree" },
  { key: "courses", label: "Course" },
  { key: "contactInquiries", label: "Contact Inquiries" },
  { key: "collegeApplications", label: "College Applications" },
  { key: "documentVerification", label: "Document Verification" },
  { key: "counsellingmanagement", label: "Counselling Management" },
];

const ACTIONS = ["view", "add", "edit", "delete"];

const ROLE_OPTIONS = [
  "Admin",
  "Student",
  "Manager",
  "Teacher",
  "Counsellor",
  "Editor",
  "Admission Officer",
  "Document Manager",
  "Support Executive",
  "Other",
];

// Shared classes (same as College page)
const inputClass =
  "w-full rounded-lg border border-[#9DBDBA] bg-white px-3 py-2.5 text-sm text-[#0B2B2A] outline-none placeholder:text-[#4B6463] focus:border-teal-700 focus:ring-2 focus:ring-teal-200 disabled:bg-[#F1F8F7] disabled:text-[#3F5A58]";

const labelClass = "mb-1.5 block text-sm font-medium text-[#0B2B2A]";

const actionButton =
  "inline-flex h-9 w-9 items-center justify-center rounded-lg border transition";

const glassCard =
  "rounded-2xl border border-white bg-white/65 text-[#0B2B2A] shadow-[0_4px_24px_rgba(15,118,110,0.08)] backdrop-blur-xl";

const createEmptyPermissions = () =>
  Object.fromEntries(
    MODULES.map(({ key }) => [
      key,
      {
        view: false,
        add: false,
        edit: false,
        delete: false,
      },
    ])
  );

const getRolePermissions = (role) => {
  const saved = Array.isArray(role.permissions) ? role.permissions : [];

  return Object.fromEntries(
    MODULES.map(({ key }) => [
      key,
      Object.fromEntries(
        ACTIONS.map((action) => [
          action,
          saved.includes(`${key}_${action}`),
        ])
      ),
    ])
  );
};

function RolePermissions() {
  const [roles, setRoles] = useState([]);
  const [roleType, setRoleType] = useState("all");

  const [showEditor, setShowEditor] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);

  const [selectedRole, setSelectedRole] = useState(null);

  const [mode, setMode] = useState("create");
  const [editId, setEditId] = useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(null);

  const [formData, setFormData] = useState({
    roleType: "",
    customRole: "",
    permissions: createEmptyPermissions(),
  });

  // FETCH ROLES
  const fetchRoles = async () => {
    try {
      const response = await API.get("/role/get-role");

      const databaseRoles = Array.isArray(response.data.role)
        ? response.data.role
        : [];

      // Super Admin first, then alphabetical
      databaseRoles.sort((a, b) => {
        if (a.role === "Super Admin") return -1;
        if (b.role === "Super Admin") return 1;

        return a.role.localeCompare(b.role);
      });

      setRoles(databaseRoles);
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to fetch roles"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  // DROPDOWN OPTIONS: default roles + every role already created
  const roleOptions = useMemo(() => {
    const base = ROLE_OPTIONS.filter((item) => item !== "Other");
    const created = roles
      .map((item) => item.role)
      .filter((name) => name && name !== "Super Admin");

    return [...new Set([...base, ...created])];
  }, [roles]);

  // COUNTS
  const totalRoles = roles.length;

  const activeRoles = roles.filter(
    (role) => role.role === "Super Admin" || role.isAssigned === true
  ).length;

  const inactiveRoles = roles.filter(
    (role) => role.role !== "Super Admin" && role.isAssigned === false
  ).length;

  // FILTER
  const filteredRoles = useMemo(() => {
    if (roleType === "all") return roles;

    return roles.filter(
      (role) => role.role.toLowerCase() === roleType.toLowerCase()
    );
  }, [roles, roleType]);

  // OPEN CREATE
  const openCreate = () => {
    setMode("create");
    setEditId(null);

    setFormData({
      roleType: "",
      customRole: "",
      permissions: createEmptyPermissions(),
    });

    setShowEditor(true);
  };

  // OPEN EDIT
  const openEdit = (role) => {
    setMode("edit");
    setEditId(role._id);

    setFormData({
      roleType: role.role,
      customRole: "",
      permissions: getRolePermissions(role),
    });

    setShowEditor(true);
  };

  // OPEN VIEW
  const openView = (role) => {
    setSelectedRole(role);
    setShowViewModal(true);
  };

  // CLOSE EDITOR
  const closeEditor = () => {
    if (saving) return;

    setShowEditor(false);
    setEditId(null);
  };

  // ROLE TYPE CHANGE
  const handleRoleTypeChange = (event) => {
    setFormData((previous) => ({
      ...previous,
      roleType: event.target.value,
      customRole: "",
    }));
  };

  // NEW ROLE NAME CHANGE
  const handleCustomRoleChange = (event) => {
    setFormData((previous) => ({
      ...previous,
      customRole: event.target.value,
      roleType: "",
    }));
  };

  // PERMISSION CHANGE
  const handlePermissionChange = (moduleKey, action, checked) => {
    setFormData((previous) => ({
      ...previous,
      permissions: {
        ...previous.permissions,
        [moduleKey]: {
          ...previous.permissions[moduleKey],
          [action]: checked,
        },
      },
    }));
  };

  // MODULE SELECT ALL
  const toggleModule = (moduleKey, checked) => {
    setFormData((previous) => ({
      ...previous,
      permissions: {
        ...previous.permissions,
        [moduleKey]: Object.fromEntries(
          ACTIONS.map((action) => [action, checked])
        ),
      },
    }));
  };

  // CONVERT PERMISSIONS
  const getSelectedPermissions = () => {
    const selected = [];

    MODULES.forEach(({ key }) => {
      ACTIONS.forEach((action) => {
        if (formData.permissions[key]?.[action]) {
          selected.push(`${key}_${action}`);
        }
      });
    });

    return selected;
  };

  // CREATE / UPDATE
  const handleSubmit = async (event) => {
    event.preventDefault();

    const roleName = formData.customRole.trim() || formData.roleType;

    if (!roleName) {
      toast.error("Please select or enter a role name");
      return;
    }

    if (roleName.toLowerCase() === "super admin") {
      toast.error("Super Admin is a protected role");
      return;
    }

    if (
      mode === "create" &&
      roles.some((item) => item.role.toLowerCase() === roleName.toLowerCase())
    ) {
      toast.error("This role already exists. Select it from the dropdown.");
      return;
    }

    const permissions = getSelectedPermissions();

    if (permissions.length === 0) {
      toast.error("Please assign at least one permission");
      return;
    }

    setSaving(true);

    try {
      if (mode === "edit") {
        await API.put(`/role/update/${editId}`, {
          permissions,
          isAssigned: true,
        });

        toast.success("Role permissions updated successfully");
      } else {
        await API.post("/role/create", {
          role: roleName,
          permissions,
        });

        toast.success("Role created successfully");
      }

      setShowEditor(false);
      await fetchRoles();
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Something went wrong"
      );
    } finally {
      setSaving(false);
    }
  };

  // STATUS TOGGLE
  const handleStatusToggle = async (role) => {
    if (role.role === "Super Admin") {
      return;
    }

    const newStatus = !role.isAssigned;

    setUpdatingStatus(role._id);

    try {
      await API.put(`/role/update/${role._id}`, {
        permissions: role.permissions || [],
        isAssigned: newStatus,
      });

      toast.success(
        newStatus
          ? "Role activated successfully"
          : "Role deactivated successfully"
      );

      await fetchRoles();
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Unable to update role status"
      );
    } finally {
      setUpdatingStatus(null);
    }
  };

  // DELETE / DEACTIVATE
  const handleDelete = async (role) => {
    if (role.role === "Super Admin") return;

    const confirmDelete = window.confirm(
      `Are you sure you want to deactivate ${role.role}?`
    );

    if (!confirmDelete) return;

    try {
      await API.delete(`/role/delete/${role._id}`);

      toast.success("Role deactivated successfully");
      await fetchRoles();
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Unable to deactivate role"
      );
    }
  };

  // VIEW PERMISSION GROUPS
  const getPermissionGroups = (role) => {
    if (role.role === "Super Admin") {
      return MODULES.map((module) => ({
        label: module.label,
        permissions: ["View", "Add", "Edit", "Delete"],
      }));
    }

    const saved = Array.isArray(role.permissions)
      ? role.permissions
      : [];

    return MODULES.map((module) => ({
      label: module.label,
      permissions: ACTIONS.filter((action) =>
        saved.includes(`${module.key}_${action}`)
      ).map(
        (action) => action.charAt(0).toUpperCase() + action.slice(1)
      ),
    })).filter((item) => item.permissions.length > 0);
  };

  // STATUS LABEL
  const getStatus = (role) =>
    role.role === "Super Admin" || role.isAssigned === true;

  return (
    <div className="min-w-0 space-y-6">

      {/* PAGE HEADER */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#0B2B2A]">
            Roles & Permissions
          </h1>

          <p className="mt-1 text-sm text-[#3F5A58]">
            Manage user roles and control access
          </p>
        </div>

        <button
          type="button"
          onClick={openCreate}
          className="inline-flex items-center gap-2 rounded-xl bg-teal-700 px-5 py-2.5 text-sm font-bold text-white hover:bg-teal-800"
        >
          <FiPlus size={17} />
          Create Role
        </button>
      </div>

      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">

        <div className={`${glassCard} p-5`}>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-[#3F5A58]">
              Total Roles
            </span>

            <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-teal-200 bg-teal-50 text-teal-700">
              <FiShield size={19} />
            </span>
          </div>

          <p className="mt-3 text-3xl font-bold text-[#0B2B2A]">
            {loading ? "—" : totalRoles}
          </p>

          <p className="mt-1 text-xs text-[#3F5A58]">
            All created roles
          </p>
        </div>

        <div className={`${glassCard} p-5`}>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-[#3F5A58]">
              Active Roles
            </span>

            <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-teal-200 bg-teal-50 text-teal-700">
              <FiCheckCircle size={19} />
            </span>
          </div>

          <p className="mt-3 text-3xl font-bold text-[#0B2B2A]">
            {loading ? "—" : activeRoles}
          </p>

          <p className="mt-1 text-xs text-[#3F5A58]">
            Currently available roles
          </p>
        </div>

        <div className={`${glassCard} p-5`}>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-[#3F5A58]">
              Inactive Roles
            </span>

            <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#CFE5E2] bg-[#F1F8F7] text-[#3F5A58]">
              <FiClock size={19} />
            </span>
          </div>

          <p className="mt-3 text-3xl font-bold text-[#0B2B2A]">
            {loading ? "—" : inactiveRoles}
          </p>

          <p className="mt-1 text-xs text-[#3F5A58]">
            Deactivated roles
          </p>
        </div>
      </div>

      {/* FILTER */}
      <select
        value={roleType}
        onChange={(event) => setRoleType(event.target.value)}
        className="w-full max-w-sm rounded-xl border border-[#9DBDBA] bg-white/80 px-4 py-2.5 text-sm text-[#0B2B2A] outline-none focus:border-teal-700 focus:ring-2 focus:ring-teal-200"
      >
        <option value="all">All Roles</option>

        {[...new Set(roles.map((item) => item.role))].map((item) => (
          <option key={item} value={item}>
            {item}
          </option>
        ))}
      </select>

      {/* ROLES TABLE */}
      <div className="overflow-x-auto rounded-2xl border border-white bg-white/65 text-[#0B2B2A] shadow-[0_4px_24px_rgba(15,118,110,0.08)] backdrop-blur-xl">
        <table className="w-full min-w-[750px] text-left text-sm">
          <thead className="bg-[#F1F8F7] text-[11px] font-bold uppercase tracking-wider text-[#3F5A58]">
            <tr>
              <th className="px-4 py-4">Role Name</th>
              <th className="px-4 py-4">Permissions</th>
              <th className="px-4 py-4">Status</th>
              <th className="px-4 py-4">Actions</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan="4"
                  className="px-4 py-10 text-center text-[#3F5A58]"
                >
                  Loading roles...
                </td>
              </tr>
            ) : filteredRoles.length > 0 ? (
              filteredRoles.map((role) => (
                <tr
                  key={role._id}
                  className="border-t border-[#CFE5E2] hover:bg-teal-50/70"
                >
                  {/* ROLE NAME */}
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-teal-200 bg-teal-50 text-teal-700">
                        <FiShield size={17} />
                      </span>

                      <div>
                        <p className="font-medium text-[#0B2B2A]">
                          {role.role}
                        </p>

                        {role.role === "Super Admin" && (
                          <span className="text-xs text-teal-700">
                            System role
                          </span>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* PERMISSIONS */}
                  <td className="px-4 py-4">
                    {role.role === "Super Admin"
                      ? "Full Access"
                      : `${role.permissions?.length || 0} permissions`}
                  </td>

                  {/* STATUS TOGGLE */}
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        disabled={
                          role.role === "Super Admin" ||
                          updatingStatus === role._id
                        }
                        onClick={() => handleStatusToggle(role)}
                        aria-label={`Toggle ${role.role} status`}
                        className={`relative h-7 w-12 rounded-full transition ${getStatus(role) ? "bg-teal-700" : "bg-slate-400"
                          } ${role.role === "Super Admin"
                            ? "cursor-not-allowed opacity-70"
                            : "cursor-pointer"
                          }`}
                      >
                        <span
                          className={`absolute top-1 h-5 w-5 rounded-full bg-white transition ${getStatus(role) ? "left-6" : "left-1"
                            }`}
                        />
                      </button>

                      <span className="text-xs capitalize text-[#3F5A58]">
                        {role.role === "Super Admin"
                          ? "Full Access"
                          : getStatus(role)
                            ? "Active"
                            : "Inactive"}
                      </span>
                    </div>
                  </td>

                  {/* ACTIONS */}
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        title="View Permissions"
                        aria-label="View Permissions"
                        onClick={() => openView(role)}
                        className={`${actionButton} border-teal-200 bg-teal-50 text-teal-700 hover:bg-teal-700 hover:text-white`}
                      >
                        <FiEye size={17} />
                      </button>

                      {role.role !== "Super Admin" && (
                        <>
                          <button
                            type="button"
                            title="Edit Role"
                            aria-label="Edit Role"
                            onClick={() => openEdit(role)}
                            className={`${actionButton} border-[#CFE5E2] bg-white text-[#3F5A58] hover:bg-[#0B2B2A] hover:text-white`}
                          >
                            <FiEdit2 size={17} />
                          </button>

                          <button
                            type="button"
                            title="Deactivate Role"
                            aria-label="Deactivate Role"
                            onClick={() => handleDelete(role)}
                            className={`${actionButton} border-red-200 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white`}
                          >
                            <FiTrash2 size={17} />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="4"
                  className="px-4 py-10 text-center text-[#3F5A58]"
                >
                  No roles found.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        <div className="border-t border-[#CFE5E2] px-4 py-3 text-xs text-[#3F5A58]">
          Showing {filteredRoles.length} of {totalRoles} roles
        </div>
      </div>

      {/* CREATE / EDIT MODAL */}
      {showEditor && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">

            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-teal-700">
                  {mode === "edit" ? "Edit Role" : "Create New Role"}
                </h2>

                <p className="mt-1 text-sm text-[#3F5A58]">
                  Configure module-wise access for this role.
                </p>
              </div>

              <button
                type="button"
                onClick={closeEditor}
                aria-label="Close"
                className="text-[#3F5A58] hover:text-red-600"
              >
                <FiX size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="space-y-6">

                {/* NEW ROLE NAME (create only) */}
                {mode === "create" && (
                  <div>
                    <label className={labelClass}>New Role Name</label>

                    <input
                      type="text"
                      value={formData.customRole}
                      onChange={handleCustomRoleChange}
                      placeholder="Type a new role name to create it"
                      className={inputClass}
                    />
                  </div>
                )}

                {/* ROLE TYPE */}
                <div>
                  <label className={labelClass}>
                    {mode === "create" ? "Or Select Existing Role" : "Role Type"}
                  </label>

                  <select
                    value={formData.roleType}
                    onChange={handleRoleTypeChange}
                    disabled={mode === "edit"}
                    required={!formData.customRole.trim()}
                    className={inputClass}
                  >
                    <option value="">Select a role</option>

                    {roleOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>

                {/* PERMISSIONS */}
                <div>
                  <div className="mb-3">
                    <h3 className="text-base font-bold text-[#0B2B2A]">
                      Module Permissions
                    </h3>

                    <p className="mt-1 text-xs text-[#3F5A58]">
                      Select the actions this role can perform in each module.
                    </p>
                  </div>

                  <div className="overflow-x-auto rounded-xl border border-[#CFE5E2]">
                    <table className="w-full min-w-[650px] text-left text-sm">
                      <thead className="bg-[#F1F8F7] text-[11px] font-bold uppercase tracking-wider text-[#3F5A58]">
                        <tr>
                          <th className="px-4 py-3">Module</th>

                          {ACTIONS.map((action) => (
                            <th
                              key={action}
                              className="px-3 py-3 text-center"
                            >
                              {action}
                            </th>
                          ))}
                        </tr>
                      </thead>

                      <tbody>
                        {MODULES.map((module) => {
                          const allChecked = ACTIONS.every(
                            (action) =>
                              formData.permissions[module.key]?.[action]
                          );

                          return (
                            <tr
                              key={module.key}
                              className="border-t border-[#CFE5E2] hover:bg-teal-50/70"
                            >
                              <td className="px-4 py-3">
                                <label className="flex cursor-pointer items-center gap-2 font-medium text-[#0B2B2A]">
                                  <input
                                    type="checkbox"
                                    checked={allChecked}
                                    onChange={(event) =>
                                      toggleModule(
                                        module.key,
                                        event.target.checked
                                      )
                                    }
                                    className="h-4 w-4 accent-teal-700"
                                  />
                                  {module.label}
                                </label>
                              </td>

                              {ACTIONS.map((action) => (
                                <td
                                  key={action}
                                  className="px-3 py-3 text-center"
                                >
                                  <input
                                    type="checkbox"
                                    checked={Boolean(
                                      formData.permissions[module.key]?.[action]
                                    )}
                                    onChange={(event) =>
                                      handlePermissionChange(
                                        module.key,
                                        action,
                                        event.target.checked
                                      )
                                    }
                                    className="h-4 w-4 cursor-pointer accent-teal-700"
                                  />
                                </td>
                              ))}
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* FORM BUTTONS */}
              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={closeEditor}
                  className="rounded-lg border border-[#CFE5E2] px-5 py-2"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-lg bg-teal-700 px-5 py-2 font-medium text-white hover:bg-teal-800 disabled:opacity-60"
                >
                  {saving
                    ? "Saving..."
                    : mode === "edit"
                      ? "Save Changes"
                      : "Create Role"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW PERMISSIONS MODAL */}
      {showViewModal && selectedRole && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6">

            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-[#0B2B2A]">
                  Role Details
                </h2>

                <p className="mt-1 text-sm text-[#3F5A58]">
                  {selectedRole.role}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowViewModal(false)}
                aria-label="Close"
                className="text-[#3F5A58]"
              >
                <FiX size={24} />
              </button>
            </div>

            <div className="mb-5 rounded-xl border border-[#CFE5E2] bg-[#F1F8F7] p-4">
              <p className="text-xs font-medium text-[#3F5A58]">
                Assigned Permissions
              </p>

              <p className="mt-1 text-lg font-bold text-[#0B2B2A]">
                {selectedRole.role === "Super Admin"
                  ? "Full Access"
                  : `${selectedRole.permissions?.length || 0} Permissions`}
              </p>
            </div>

            <h3 className="mb-3 text-sm font-bold text-[#0B2B2A]">
              Module-wise Access
            </h3>

            <div className="space-y-2">
              {getPermissionGroups(selectedRole).length === 0 ? (
                <p className="rounded-xl bg-[#F1F8F7] p-3 text-sm text-[#3F5A58]">
                  No permissions assigned.
                </p>
              ) : (
                getPermissionGroups(selectedRole).map((item) => (
                  <div
                    key={item.label}
                    className="rounded-xl border border-[#CFE5E2] p-3"
                  >
                    <p className="text-sm font-semibold text-[#0B2B2A]">
                      {item.label}
                    </p>

                    <div className="mt-2 flex flex-wrap gap-2">
                      {item.permissions.map((permission) => (
                        <span
                          key={permission}
                          className="rounded-full bg-teal-50 px-2.5 py-1 text-xs font-semibold text-teal-700"
                        >
                          {permission}
                        </span>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>

            <button
              type="button"
              onClick={() => setShowViewModal(false)}
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

export default RolePermissions;