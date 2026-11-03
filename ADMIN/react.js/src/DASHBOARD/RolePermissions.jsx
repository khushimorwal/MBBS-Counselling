import { useEffect, useState } from "react";
import {
  FiSearch,
  FiPlus,
  FiEdit2,
  FiShield,
  FiEye,
  FiTrash2,
} from "react-icons/fi";
import { toast } from "react-toastify";
import { API } from "../api/axios.js";

const MODULES = [
  { key: "students", label: "Students" },
  { key: "colleges", label: "Colleges" },
  { key: "universities", label: "Universities" },
  { key: "streams", label: "Streams" },
  { key: "degrees", label: "Degrees" },
  { key: "courses", label: "Courses" },
  { key: "specializations", label: "Specializations" },
  { key: "roles", label: "Role & Permissions" },
  { key: "emailTemplates", label: "Email Templates" },
];

const ACTIONS = ["view", "add", "edit", "delete"];

const createEmptyForm = () => ({
  role: "",
  permissions: Object.fromEntries(
    MODULES.map(({ key }) => [
      key,
      {
        view: false,
        add: false,
        edit: false,
        delete: false,
      },
    ])
  ),
});

function RolePermissions() {
  const [roles, setRoles] = useState([]);
  const [allRoles, setAllRoles] = useState([]);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [isView, setIsView] = useState(false);
  const [editId, setEditId] = useState(null);
  const [dataLoading, setDataLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState(createEmptyForm());

  // FETCH EXISTING ROLES
  const fetchRoles = async () => {
    try {
      const response = await API.get("/role/get-role");

      const databaseRoles = Array.isArray(response.data.role)
        ? response.data.role
        : [];

      setAllRoles(databaseRoles);

      const visibleRoles = databaseRoles.filter(
        (role) =>
          role.role === "Super Admin" ||
          (["Admin", "Student"].includes(role.role) &&
            role.isAssigned === true)
      );

      visibleRoles.sort((a, b) => {
        if (a.role === "Super Admin") return -1;
        if (b.role === "Super Admin") return 1;
        return 0;
      });

      setRoles(visibleRoles);
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to fetch roles"
      );
    } finally {
      setDataLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  // OPEN ADD ROLE MODAL
  const handleAddRoleModal = () => {
    setIsEdit(false);
    setIsView(false);
    setEditId(null);
    setFormData(createEmptyForm());
    setShowModal(true);
  };

  const handleRoleChange = (event) => {
    const selectedRole = event.target.value;

    setFormData((previous) => ({
      ...previous,
      role: selectedRole,
    }));
  };

  // OPEN VIEW / EDIT MODAL
  const openRoleModal = (role, mode) => {
    const savedPermissions = Array.isArray(role.permissions)
      ? role.permissions
      : [];

    const permissions = Object.fromEntries(
      MODULES.map(({ key }) => [
        key,
        {
          view:
            role.role === "Super Admin" ||
            savedPermissions.includes(`${key}_view`),

          add:
            role.role === "Super Admin" ||
            savedPermissions.includes(`${key}_add`),

          edit:
            role.role === "Super Admin" ||
            savedPermissions.includes(`${key}_edit`),

          delete:
            role.role === "Super Admin" ||
            savedPermissions.includes(`${key}_delete`),
        },
      ])
    );

    setIsEdit(mode === "edit");
    setIsView(mode === "view");
    setEditId(role._id);

    setFormData({
      role: role.role,
      permissions,
    });

    setShowModal(true);
  };

  // GET ASSIGNED PERMISSIONS
  const getAssignedPermissions = (permissions) => {
    const assigned = [];

    MODULES.forEach((module) => {
      const modulePermissions = permissions?.[module.key];

      if (!modulePermissions) return;

      const actions = ACTIONS.filter(
        (action) => modulePermissions[action] === true
      );

      if (actions.length > 0) {
        assigned.push({
          module: module.label,
          actions,
        });
      }
    });

    return assigned;
  };

  // HANDLE CHECKBOX CHANGES
  const handleChange = (event) => {
    const { name, checked } = event.target;

    if (name.startsWith("permissions.")) {
      const [, module, action] = name.split(".");

      setFormData((previous) => ({
        ...previous,
        permissions: {
          ...previous.permissions,
          [module]: {
            ...previous.permissions[module],
            [action]: checked,
          },
        },
      }));
    }
  };

  // CONVERT CHECKBOXES INTO STRING ARRAY
  const getSelectedPermissions = () => {
    const selectedPermissions = [];

    MODULES.forEach(({ key }) => {
      ACTIONS.forEach((action) => {
        if (formData.permissions[key]?.[action]) {
          selectedPermissions.push(`${key}_${action}`);
        }
      });
    });

    return selectedPermissions;
  };

  // SAVE PERMISSIONS
  const handleSavePermissions = async (event) => {
    event.preventDefault();

    const roleName = formData.role.trim();

    if (!["Admin", "Student"].includes(roleName)) {
      toast.error("Please enter Admin or Student");
      return;
    }

    const selectedPermissions = getSelectedPermissions();

    if (selectedPermissions.length === 0) {
      toast.error("Please select at least one permission");
      return;
    }

    const selectedRole = allRoles.find(
      (role) => role.role === roleName
    );

    if (!selectedRole) {
      toast.error(`${roleName} role not found in the database`);
      return;
    }

    setIsSaving(true);

    try {
      const response = await API.put(
        `/role/update/${selectedRole._id}`,
        {
          permissions: selectedPermissions,
        }
      );

      toast.success(
        response.data.message || "Permissions saved successfully"
      );

      setShowModal(false);
      setEditId(null);
      setFormData(createEmptyForm());

      await fetchRoles();
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Failed to save permissions"
      );
    } finally {
      setIsSaving(false);
    }
  };

  // UPDATE PERMISSIONS
  const handleEditRole = async (event) => {
    event.preventDefault();

    if (!editId) {
      toast.error("Role ID not found");
      return;
    }

    const selectedPermissions = getSelectedPermissions();

    if (selectedPermissions.length === 0) {
      toast.error("Please select at least one permission");
      return;
    }

    setIsSaving(true);

    try {
      const response = await API.put(`/role/update/${editId}`, {
        permissions: selectedPermissions,
      });

      toast.success(
        response.data.message || "Permissions updated successfully"
      );

      setShowModal(false);
      setEditId(null);
      setFormData(createEmptyForm());

      await fetchRoles();
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Failed to update permissions"
      );
    } finally {
      setIsSaving(false);
    }
  };

  // DELETE ROLE
  const handleDeleteRole = async (role) => {
    if (role.role === "Super Admin") {
      toast.error("Super Admin role cannot be deleted");
      return;
    }

    const confirmDelete = window.confirm(
      `Are you sure you want to delete ${role.role} role?`
    );

    if (!confirmDelete) return;

    try {
      const response = await API.delete(
        `/role/delete/${role._id}`
      );

      toast.success(
        response.data.message || "Role deleted successfully"
      );

      await fetchRoles();
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to delete role"
      );
    }
  };

  // SEARCH ROLES
  const filteredRoles = roles.filter((role) =>
    role.role?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="mx-auto w-full max-w-[1200px] space-y-5 px-3 sm:px-5">
      {/* PAGE HEADER */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-brand-dark">
            Role Management
          </h1>

          <p className="mt-1 text-sm text-muted">
            Manage roles and their permissions.
          </p>
        </div>

        <button
          type="button"
          onClick={handleAddRoleModal}
          className="flex items-center justify-center gap-2 rounded-xl bg-brand px-5 py-3 text-sm font-semibold text-white hover:bg-brand-dark"
        >
          <FiPlus size={18} />
          Add Role
        </button>
      </div>

      {/* SEARCH */}
      <div className="rounded-2xl border border-line bg-white p-3">
        <div className="relative w-full sm:max-w-md">
          <FiSearch
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted"
          />

          <input
            type="text"
            placeholder="Search role..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="w-full rounded-xl border border-line bg-surface py-3 pl-10 pr-4 text-sm outline-none focus:border-brand"
          />
        </div>
      </div>

      {/* ROLES TABLE */}
      <div className="overflow-hidden rounded-2xl border border-line bg-white">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[650px] text-left">
            <thead className="border-b border-line bg-surface">
              <tr>
                <th className="px-5 py-4 text-xs font-bold uppercase text-muted">
                  #
                </th>

                <th className="px-5 py-4 text-xs font-bold uppercase text-muted">
                  Role Name
                </th>

                <th className="px-5 py-4 text-right text-xs font-bold uppercase text-muted">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-line">
              {dataLoading ? (
                <tr>
                  <td
                    colSpan="3"
                    className="px-5 py-10 text-center text-sm text-muted"
                  >
                    Loading roles...
                  </td>
                </tr>
              ) : filteredRoles.length === 0 ? (
                <tr>
                  <td
                    colSpan="3"
                    className="px-5 py-12 text-center text-sm text-muted"
                  >
                    No roles found.
                  </td>
                </tr>
              ) : (
                filteredRoles.map((role, index) => (
                  <tr
                    key={role._id}
                    className="transition hover:bg-surface/70"
                  >
                    <td className="px-5 py-4 align-middle">
                      {index + 1}
                    </td>

                    <td className="px-5 py-4 align-middle">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-soft text-brand">
                          <FiShield size={18} />
                        </div>

                        <div>
                          <p className="font-semibold text-brand-dark">
                            {role.role}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* ICON ACTIONS */}
                    <td className="px-5 py-4 align-middle">
                      <div className="flex justify-end gap-2">
                        {/* VIEW */}
                        <button
                          type="button"
                          disabled={dataLoading}
                          onClick={() => openRoleModal(role, "view")}
                          title="View permissions"
                          aria-label="View permissions"
                          className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand text-white hover:bg-brand-dark disabled:opacity-60"
                        >
                          <FiEye size={17} />
                        </button>

                        {/* EDIT */}
                        <button
                          type="button"
                          disabled={dataLoading}
                          onClick={() => openRoleModal(role, "edit")}
                          title="Edit permissions"
                          aria-label="Edit permissions"
                          className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60"
                        >
                          <FiEdit2 size={16} />
                        </button>

                        {/* DELETE */}
                        {role.role !== "Super Admin" && (
                          <button
                            type="button"
                            disabled={dataLoading}
                            onClick={() => handleDeleteRole(role)}
                            title="Delete role"
                            aria-label="Delete role"
                            className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-60"
                          >
                            <FiTrash2 size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ASSIGN / VIEW / EDIT MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-2xl bg-white p-5 sm:p-6">
            {/* MODAL HEADER */}
            <div className="mb-6 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-bold text-brand-dark">
                  {isView
                    ? "View Permissions"
                    : isEdit
                      ? "Edit Permissions"
                      : "Assign Permissions"}
                </h2>

                <p className="mt-1 text-sm text-muted">
                  Select an existing role and assign its permissions.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="rounded-lg px-3 py-2 text-gray-500 hover:bg-gray-100"
                aria-label="Close modal"
              >
                ✕
              </button>
            </div>

            <form
              onSubmit={isEdit ? handleEditRole : handleSavePermissions}
            >
              {/* EXISTING ROLE INPUT */}
              <div className="mb-6">
                <label
                  htmlFor="role"
                  className="mb-2 block text-sm font-semibold text-brand-dark"
                >
                  Enter Role
                </label>

                <input
                  type="text"
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleRoleChange}
                  placeholder="Type Admin or Student"
                  disabled={isEdit || isView}
                  required
                  className="w-full rounded-xl border border-line bg-white p-3 text-sm outline-none focus:border-brand disabled:bg-gray-100"
                />
              </div>

              {/* VIEW PERMISSIONS */}
              {isView ? (
                <div className="rounded-xl border border-line p-4">
                  <h3 className="mb-4 text-base font-bold text-brand-dark">
                    Permissions Assigned
                  </h3>

                  {getAssignedPermissions(formData.permissions).length > 0 ? (
                    <div className="space-y-3">
                      {getAssignedPermissions(
                        formData.permissions
                      ).map((item) => (
                        <div
                          key={item.module}
                          className="flex flex-col gap-1 rounded-lg bg-surface p-3 sm:flex-row sm:items-center sm:justify-between"
                        >
                          <span className="text-sm font-semibold text-brand-dark">
                            {item.module}
                          </span>

                          <span className="text-sm capitalize text-muted">
                            {item.actions.join(", ")}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted">
                      No permissions assigned to this role.
                    </p>
                  )}
                </div>
              ) : (
                <>
                  {/* PERMISSIONS HEADING */}
                  <div className="mb-3">
                    <h3 className="text-base font-bold text-brand-dark">
                      Add Role
                    </h3>

                    <p className="mt-1 text-sm text-muted">
                      Select which actions this role can perform in each
                      module.
                    </p>
                  </div>

                  {/* PERMISSIONS CHECKBOX TABLE */}
                  <div className="overflow-x-auto rounded-xl border border-line">
                    <table className="w-full min-w-[600px] border-collapse text-left">
                      <thead className="bg-surface">
                        <tr>
                          <th className="p-3 text-sm font-semibold">
                            Module
                          </th>

                          {ACTIONS.map((action) => (
                            <th
                              key={action}
                              className="p-3 text-center text-sm font-semibold capitalize"
                            >
                              {action}
                            </th>
                          ))}
                        </tr>
                      </thead>

                      <tbody className="divide-y divide-line">
                        {MODULES.map((module) => (
                          <tr key={module.key}>
                            <td className="p-3 text-sm font-medium text-brand-dark">
                              {module.label}
                            </td>

                            {ACTIONS.map((action) => (
                              <td
                                key={action}
                                className="p-3 text-center"
                              >
                                <input
                                  type="checkbox"
                                  name={`permissions.${module.key}.${action}`}
                                  checked={Boolean(
                                    formData.permissions[module.key]?.[
                                      action
                                    ]
                                  )}
                                  onChange={handleChange}
                                  disabled={!formData.role}
                                  className="h-4 w-4 cursor-pointer accent-current"
                                />
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}

              {/* MODAL BUTTONS */}
              <div className="mt-6 flex flex-wrap justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="rounded-xl border border-line px-5 py-2.5 text-sm font-semibold text-brand-dark hover:bg-surface"
                >
                  {isView ? "Close" : "Cancel"}
                </button>

                {!isView && (
                  <button
                    type="submit"
                    disabled={isSaving || !formData.role.trim()}
                    className="rounded-xl bg-brand px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isSaving ? "Saving..." : "Save Permissions"}
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default RolePermissions;