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

      // Only Super Admin and roles created/assigned by Super Admin
      databaseRoles.sort((a, b) => {
  if (a.role === "Super Admin") return -1;
  if (b.role === "Super Admin") return 1;

  return a.role.localeCompare(b.role);
});

setRoles(databaseRoles);

      visibleRoles.sort((a, b) => {
        if (a.role === "Super Admin") return -1;
        if (b.role === "Super Admin") return 1;

        return a.role.localeCompare(b.role);
      });

      setRoles(visibleRoles);
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

  // COUNTS
  const totalRoles = roles.length;

  const activeRoles = roles.filter(
    (role) => role.role === "Super Admin" || role.isAssigned === true
  ).length

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
    const matchedType = ROLE_OPTIONS.includes(role.role)
      ? role.role
      : "Other";

    setMode("edit");
    setEditId(role._id);

    setFormData({
      roleType: matchedType,
      customRole: matchedType === "Other" ? role.role : "",
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

    const roleName =
      formData.roleType === "Other"
        ? formData.customRole.trim()
        : formData.roleType;

    if (!roleName) {
      toast.error("Please select or enter a role name");
      return;
    }

    if (roleName.toLowerCase() === "super admin") {
      toast.error("Super Admin is a protected role");
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
    <div className="mx-auto w-full max-w-[1400px] space-y-6 px-3 pb-8 sm:px-5">

      {/* HEADER */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="mb-1 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-brand">
            <FiShield size={14} />
            Access Control
          </div>

          <h1 className="text-2xl font-bold text-brand-dark sm:text-3xl">
            Roles & Permissions
          </h1>

          <p className="mt-1 text-sm text-muted">
            Manage user roles and control access across your counselling organization.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreate}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-dark"
        >
          <FiPlus size={18} />
          Create Role
        </button>
      </div>

      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">

        <div className="rounded-2xl border border-line bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted">
              Total Roles
            </span>

            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-soft text-brand">
              <FiShield size={19} />
            </span>
          </div>

          <p className="mt-3 text-3xl font-bold text-brand-dark">
            {loading ? "—" : totalRoles}
          </p>

          <p className="mt-1 text-xs text-muted">
            All created roles
          </p>
        </div>

        <div className="rounded-2xl border border-line bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted">
              Active Roles
            </span>

            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-50 text-green-600">
              <FiCheckCircle size={19} />
            </span>
          </div>

          <p className="mt-3 text-3xl font-bold text-brand-dark">
            {loading ? "—" : activeRoles}
          </p>

          <p className="mt-1 text-xs text-muted">
            Currently available roles
          </p>
        </div>

        <div className="rounded-2xl border border-line bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted">
              Inactive Roles
            </span>

            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
              <FiClock size={19} />
            </span>
          </div>

          <p className="mt-3 text-3xl font-bold text-brand-dark">
            {loading ? "—" : inactiveRoles}
          </p>

          <p className="mt-1 text-xs text-muted">
            Deactivated roles
          </p>
        </div>
      </div>

      {/* ROLE DIRECTORY */}
      <section className="overflow-hidden rounded-2xl border border-line bg-white shadow-sm">

        <div className="flex flex-col gap-3 border-b border-line p-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <div>
            <h2 className="text-base font-bold text-brand-dark">
              Role Directory
            </h2>

            <p className="mt-1 text-xs text-muted">
              View and manage access levels for your team.
            </p>
          </div>

          <select
            value={roleType}
            onChange={(event) => setRoleType(event.target.value)}
            className="rounded-xl border border-line bg-white px-4 py-2.5 text-sm text-brand-dark outline-none focus:border-brand"
          >
            <option value="all">All Roles</option>
            

            {ROLE_OPTIONS.filter((item) => item !== "Other").map(
              (item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              )
            )}
          </select>
        </div>

        {/* TABLE */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[750px] text-left">
            <thead className="bg-surface">
              <tr>
                <th className="px-5 py-3 text-[11px] font-bold uppercase tracking-wider text-muted">
                  Role Name
                </th>

                <th className="px-5 py-3 text-[11px] font-bold uppercase tracking-wider text-muted">
                  Permissions
                </th>

                <th className="px-5 py-3 text-[11px] font-bold uppercase tracking-wider text-muted">
                  Current Status
                </th>

                <th className="px-5 py-3 text-right text-[11px] font-bold uppercase tracking-wider text-muted">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-line">
              {loading ? (
                <tr>
                  <td colSpan="4" className="px-5 py-12 text-center text-sm text-muted">
                    Loading roles...
                  </td>
                </tr>
              ) : filteredRoles.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-5 py-12 text-center">
                    <p className="text-sm font-semibold text-brand-dark">
                      No roles found
                    </p>

                    <p className="mt-1 text-xs text-muted">
                      Select another filter or create a new role.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredRoles.map((role) => (
                  <tr key={role._id} className="transition hover:bg-surface/60">

                    {/* ROLE NAME */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-soft text-brand">
                          <FiShield size={17} />
                        </span>

                        <div>
                          <p className="text-sm font-semibold text-brand-dark">
                            {role.role}
                          </p>

                          {role.role === "Super Admin" && (
                            <span className="mt-0.5 inline-block text-[10px] font-semibold uppercase text-brand">
                              System Role
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* PERMISSIONS */}
                    <td className="px-5 py-4 text-sm text-muted">
                      {role.role === "Super Admin"
                        ? "Full Access"
                        : `${role.permissions?.length || 0} permissions`}
                    </td>

                    {/* STATUS TOGGLE */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          disabled={
                            role.role === "Super Admin" ||
                            updatingStatus === role._id
                          }
                          onClick={() => handleStatusToggle(role)}
                          className={`relative h-6 w-11 rounded-full transition ${
                            getStatus(role)
                              ? "bg-green-500"
                              : "bg-gray-300"
                          } ${
                            role.role === "Super Admin"
                              ? "cursor-not-allowed opacity-70"
                              : "cursor-pointer"
                          }`}
                          aria-label={`Toggle ${role.role} status`}
                        >
                          <span
                            className={`absolute top-1 h-4 w-4 rounded-full bg-white transition ${
                              getStatus(role) ? "left-6" : "left-1"
                            }`}
                          />
                        </button>

                        <span
                          className={`text-xs font-semibold ${
                            getStatus(role)
                              ? "text-green-600"
                              : "text-gray-500"
                          }`}
                        >
                          {role.role === "Super Admin"
                            ? "Full Access"
                            : getStatus(role)
                            ? "Active"
                            : "Inactive"}
                        </span>
                      </div>
                    </td>

                    {/* ACTIONS */}
                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => openView(role)}
                          title="View permissions"
                          className="flex h-8 w-8 items-center justify-center rounded-lg border border-line text-brand hover:bg-brand-soft"
                        >
                          <FiEye size={15} />
                        </button>

                        {role.role !== "Super Admin" && (
                          <>
                            <button
                              type="button"
                              onClick={() => openEdit(role)}
                              title="Edit role"
                              className="flex h-8 w-8 items-center justify-center rounded-lg border border-line text-blue-600 hover:bg-blue-50"
                            >
                              <FiEdit2 size={15} />
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDelete(role)}
                              title="Deactivate role"
                              className="flex h-8 w-8 items-center justify-center rounded-lg border border-line text-red-600 hover:bg-red-50"
                            >
                              <FiTrash2 size={15} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="border-t border-line px-5 py-3 text-xs text-muted">
          Showing {filteredRoles.length} of {totalRoles} roles
        </div>
      </section>

      {/* CREATE / EDIT MODAL */}
      {showEditor && (
        <div className="fixed inset-0 z-[60] overflow-y-auto bg-black/50 p-3 sm:p-6">
          <div className="mx-auto my-4 w-full max-w-5xl overflow-hidden rounded-2xl bg-white shadow-2xl">

            <div className="flex items-start justify-between border-b border-line px-5 py-4 sm:px-7">
              <div>
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-brand">
                  <FiShield size={14} />
                  Access Configuration
                </div>

                <h2 className="mt-1 text-xl font-bold text-brand-dark">
                  {mode === "edit" ? "Edit Role" : "Create New Role"}
                </h2>

                <p className="mt-1 text-sm text-muted">
                  Configure module-wise access for this role.
                </p>
              </div>

              <button
                type="button"
                onClick={closeEditor}
                className="rounded-lg p-2 text-muted hover:bg-surface"
              >
                <FiX size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="space-y-6 p-5 sm:p-7">

                {/* ROLE TYPE */}
                <div className="rounded-xl border border-line p-4">
                  <label className="mb-2 block text-sm font-semibold text-brand-dark">
                    Select Role Type
                  </label>

                  <select
                    value={formData.roleType}
                    onChange={handleRoleTypeChange}
                    disabled={mode === "edit"}
                    required
                    className="w-full rounded-xl border border-line bg-white px-4 py-3 text-sm outline-none focus:border-brand disabled:bg-surface"
                  >
                    <option value="">Select a role</option>

                    {ROLE_OPTIONS.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>

                  {formData.roleType === "Other" && (
                    <input
                      type="text"
                      value={formData.customRole}
                      onChange={(event) =>
                        setFormData((previous) => ({
                          ...previous,
                          customRole: event.target.value,
                        }))
                      }
                      placeholder="Enter custom role name"
                      required
                      className="mt-3 w-full rounded-xl border border-line px-4 py-3 text-sm outline-none focus:border-brand"
                    />
                  )}
                </div>

                {/* PERMISSIONS */}
                <div>
                  <div className="mb-3">
                    <h3 className="text-base font-bold text-brand-dark">
                      Module Permissions
                    </h3>

                    <p className="mt-1 text-xs text-muted">
                      Select the actions this role can perform in each module.
                    </p>
                  </div>

                  <div className="overflow-x-auto rounded-xl border border-line">
                    <table className="w-full min-w-[650px] text-left">
                      <thead className="bg-surface">
                        <tr>
                          <th className="px-4 py-3 text-xs font-bold uppercase tracking-wide text-muted">
                            Module
                          </th>

                          {ACTIONS.map((action) => (
                            <th
                              key={action}
                              className="px-3 py-3 text-center text-xs font-bold uppercase tracking-wide text-muted"
                            >
                              {action}
                            </th>
                          ))}
                        </tr>
                      </thead>

                      <tbody className="divide-y divide-line">
                        {MODULES.map((module) => {
                          const allChecked = ACTIONS.every(
                            (action) =>
                              formData.permissions[module.key]?.[action]
                          );

                          return (
                            <tr key={module.key} className="hover:bg-surface/50">
                              <td className="px-4 py-3">
                                <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-brand-dark">
                                  <input
                                    type="checkbox"
                                    checked={allChecked}
                                    onChange={(event) =>
                                      toggleModule(
                                        module.key,
                                        event.target.checked
                                      )
                                    }
                                    className="h-4 w-4 accent-current"
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
                                    className="h-4 w-4 cursor-pointer accent-current"
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

              {/* FOOTER */}
              <div className="flex justify-end gap-3 border-t border-line bg-surface/60 px-5 py-4 sm:px-7">
                <button
                  type="button"
                  onClick={closeEditor}
                  className="rounded-xl border border-line bg-white px-5 py-2.5 text-sm font-semibold text-brand-dark"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-xl bg-brand px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-dark disabled:opacity-60"
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
          <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl">

            <div className="flex items-center justify-between border-b border-line px-5 py-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-brand">
                  Role Details
                </p>

                <h2 className="mt-1 text-lg font-bold text-brand-dark">
                  {selectedRole.role}
                </h2>
              </div>

              <button
                type="button"
                onClick={() => setShowViewModal(false)}
                className="rounded-lg p-2 text-muted hover:bg-surface"
              >
                <FiX size={19} />
              </button>
            </div>

            <div className="max-h-[65vh] space-y-4 overflow-y-auto p-5">
              <div className="rounded-xl bg-brand-soft/50 p-3">
                <p className="text-xs font-medium text-muted">
                  Assigned Permissions
                </p>

                <p className="mt-1 text-lg font-bold text-brand-dark">
                  {selectedRole.role === "Super Admin"
                    ? "Full Access"
                    : `${selectedRole.permissions?.length || 0} Permissions`}
                </p>
              </div>

              <div>
                <h3 className="mb-3 text-sm font-bold text-brand-dark">
                  Module-wise Access
                </h3>

                <div className="space-y-2">
                  {getPermissionGroups(selectedRole).length === 0 ? (
                    <p className="rounded-xl bg-surface p-3 text-sm text-muted">
                      No permissions assigned.
                    </p>
                  ) : (
                    getPermissionGroups(selectedRole).map((item) => (
                      <div
                        key={item.label}
                        className="rounded-xl border border-line p-3"
                      >
                        <p className="text-sm font-semibold text-brand-dark">
                          {item.label}
                        </p>

                        <div className="mt-2 flex flex-wrap gap-2">
                          {item.permissions.map((permission) => (
                            <span
                              key={permission}
                              className="rounded-full bg-green-50 px-2.5 py-1 text-xs font-semibold text-green-700"
                            >
                              {permission}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            <div className="border-t border-line px-5 py-4 text-right">
              <button
                type="button"
                onClick={() => setShowViewModal(false)}
                className="rounded-xl bg-brand px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-dark"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default RolePermissions;