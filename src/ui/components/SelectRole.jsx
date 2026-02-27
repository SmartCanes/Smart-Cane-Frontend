import { AnimatePresence, motion } from "framer-motion";
import { Icon } from "@iconify/react";
import { useState, useMemo, useEffect } from "react";

const PERMISSION_CATEGORIES = [
  {
    name: "User Management",
    description: "Manage user accounts and access",
    permissions: [
      "View all devices",
      "Add new users",
      "Edit user profiles",
      "Remove guardians",
      "Reset passwords",
      "Assign roles",
      "Invite Guardians"
    ]
  },
  {
    name: "Content Management",
    description: "Control and manage content",
    permissions: ["Send Notes", "Set Location"]
  },
  {
    name: "Administrative",
    description: "System administration tasks",
    permissions: ["Access advanced features"]
  }
];

const ROLE_OPTIONS = [
  // {
  //   value: "primary",
  //   title: "Primary Guardian",
  //   description: "Full system access and control",
  //   icon: ({ className }) => (
  //     <Icon icon="ph:crown-simple-bold" className={className} />
  //   ),
  //   permissions: ["All permissions"]
  // },
  {
    value: "secondary",
    title: "Secondary Guardian",
    description: "Manage and publish content",
    icon: ({ className }) => (
      <Icon icon="ph:shield-chevron-bold" className={className} />
    ),
    permissions: [
      "Invite Guardians",
      "Publish content",
      "Send Notes",
      "Set Location"
    ]
  },
  {
    value: "guardian",
    title: "Guardian",
    description: "Read-only access to content",
    icon: ({ className }) => <Icon icon="ph:user-bold" className={className} />,
    permissions: ["View all devices"]
  }
];

export const SelectRole = ({
  isOpen,
  onClose,
  selectedGuardian,
  setSelectedGuardian,
  handleEditGuardianRole,
  isSubmitting
}) => {
  const [selectedRoleValue, setSelectedRoleValue] = useState(null);

  const isRoleUnchanged = selectedGuardian?.role === selectedRoleValue;

  useEffect(() => {
    if (selectedGuardian?.role) {
      setSelectedRoleValue(selectedGuardian.role);
    }
  }, [selectedGuardian]);

  const selectedRole = ROLE_OPTIONS.find(
    (role) => role.value === selectedRoleValue
  );

  const rolePermissionCategories = useMemo(() => {
    if (!selectedRole) return [];
    if (selectedRole.permissions.includes("All permissions"))
      return PERMISSION_CATEGORIES;
    return PERMISSION_CATEGORIES.map((category) => ({
      ...category,
      permissions: category.permissions.filter((p) =>
        selectedRole.permissions.includes(p)
      )
    })).filter((c) => c.permissions.length > 0);
  }, [selectedRole]);

  if (!isOpen) return null;

  return (
    <AnimatePresence mode="sync">
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        {/* Overlay */}
        <motion.div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        />

        {/* Modal Content */}
        <motion.div
          className="relative bg-white rounded-2xl shadow-2xl mx-4 w-full max-w-6xl h-[90vh] flex flex-col border border-gray-100 overflow-hidden"
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ duration: 0.2 }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Edit Guardian Role
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Choose a role and view its permissions
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 p-1 cursor-pointer disabled:cursor-not-allowed"
              disabled={isSubmitting}
            >
              <Icon icon="ph:x-bold" className="w-6 h-6" />
            </button>
          </div>

          <div className="flex flex-col h-full overflow-hidden">
            <div className="flex-1 overflow-y-auto space-y-6 p-4">
              <div>
                <div className="mb-4">
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Select Role
                  </label>
                  <p className="text-sm text-gray-600">
                    Choose a predefined role
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {ROLE_OPTIONS.map((role) => {
                    const isSelected = selectedRoleValue === role.value;
                    const RoleIcon =
                      role.icon ||
                      (() => <Icon icon="mdi:check" className="w-5 h-5" />);

                    return (
                      <motion.button
                        key={role.value}
                        type="button"
                        onClick={() => {
                          // setSelectedGuardian((prev) => ({
                          //   ...prev,
                          //   role: role.value
                          // }));
                          setSelectedRoleValue(role.value);
                        }}
                        whileHover={{ y: -4, scale: 1.01 }}
                        transition={{ duration: 0.15, ease: "easeOut" }}
                        className={`relative text-left p-5 rounded-xl border-2 transition-all duration-200 cursor-pointer flex flex-col justify-start
                          ${
                            isSelected
                              ? "border-blue-500 bg-gradient-to-br from-blue-50 to-blue-25 shadow-sm ring-blue-200"
                              : "border-gray-200 ring-transparent hover:border-blue-300 hover:bg-gray-50 hover:shadow-sm"
                          }`}
                      >
                        <div>
                          <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-2 mb-2">
                              <div
                                className={`p-2 rounded-lg ${isSelected ? "bg-blue-100" : "bg-gray-100"}`}
                              >
                                <RoleIcon
                                  className={`w-4 h-4 ${isSelected ? "text-blue-600" : "text-gray-600"}`}
                                />
                              </div>
                              <h3 className="font-semibold text-gray-900 text-base">
                                {role.title}
                              </h3>
                            </div>
                            <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                              {role.description}
                            </p>
                          </div>

                          {/* Key Permissions */}
                          <div className="space-y-3">
                            <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Key Permissions
                            </div>
                            <ul className="space-y-2">
                              {role.permissions.slice(0, 3).map((perm) => (
                                <li
                                  key={perm}
                                  className="flex items-start gap-2 text-sm"
                                >
                                  <Icon
                                    icon="mdi:check-circle"
                                    className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0"
                                  />
                                  <span className="text-gray-700">{perm}</span>
                                </li>
                              ))}
                              {role.permissions.length > 3 && (
                                <li className="text-xs text-gray-500 font-medium pl-6">
                                  +{role.permissions.length - 3} more
                                  permissions
                                </li>
                              )}
                            </ul>
                          </div>
                        </div>

                        {isSelected && (
                          <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center">
                            <Icon
                              icon="mdi:check"
                              className="w-3 h-3 text-white"
                            />
                          </div>
                        )}
                      </motion.button>
                    );
                  })}
                </div>
              </div>

              <div className="border-t border-gray-200 pt-6">
                <div className="mb-4">
                  <h3 className="text-sm font-semibold text-gray-900 mb-2">
                    Detailed Permissions
                  </h3>
                  <p className="text-sm text-gray-600">
                    All permissions included with this role
                  </p>
                </div>

                <motion.div
                  layout
                  initial={false}
                  animate={{
                    borderRadius: "0.5rem",
                    borderWidth: "1px",
                    borderColor: "#e5e7eb",
                    backgroundColor: "#f9fafb"
                  }}
                  transition={{
                    type: "spring",
                    stiffness: 280,
                    damping: 25,
                    mass: 0.7,
                    layout: {
                      type: "spring",
                      stiffness: 280,
                      damping: 25,
                      mass: 0.7
                    }
                  }}
                  className="overflow-hidden"
                >
                  <div className="hidden md:grid grid-cols-12 gap-4 p-4 bg-gray-100 border-b border-gray-200">
                    <div className="col-span-5 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Permission Category
                    </div>
                    <div className="col-span-7 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Permissions
                    </div>
                  </div>

                  <motion.div
                    layout
                    transition={{
                      type: "spring",
                      stiffness: 300,
                      damping: 30,
                      mass: 0.8
                    }}
                  >
                    <AnimatePresence mode="wait">
                      {selectedRole ? (
                        <motion.div
                          key="permissions-list"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.15 }}
                          layout="position"
                        >
                          <AnimatePresence mode="popLayout">
                            {rolePermissionCategories.map((category, index) => (
                              <motion.div
                                key={category.name}
                                layout
                                initial={{ opacity: 0, y: 4 }}
                                animate={{
                                  opacity: 1,
                                  y: 0,
                                  transition: {
                                    type: "spring",
                                    stiffness: 300,
                                    damping: 30,
                                    delay: index * 0.02
                                  }
                                }}
                                exit={{
                                  opacity: 0,
                                  y: -4,
                                  transition: {
                                    duration: 0.1
                                  }
                                }}
                                className="grid grid-cols-1 md:grid-cols-12 gap-4 p-4 rounded-lg"
                              >
                                <div className="md:col-span-5">
                                  <div className="flex items-start gap-3">
                                    <motion.div
                                      initial={{ scale: 0.9 }}
                                      animate={{ scale: 1 }}
                                      transition={{
                                        delay: index * 0.02 + 0.05
                                      }}
                                      className="p-2 rounded-lg bg-blue-50 shrink-0 mt-0.5"
                                    >
                                      <Icon
                                        icon="mdi:information-outline"
                                        className="w-4 h-4 text-blue-600"
                                      />
                                    </motion.div>
                                    <div>
                                      <motion.h4
                                        initial={{ opacity: 0, x: -2 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{
                                          delay: index * 0.02 + 0.1
                                        }}
                                        className="font-medium text-gray-900 text-sm"
                                      >
                                        {category.name}
                                      </motion.h4>
                                      <motion.p
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{
                                          delay: index * 0.02 + 0.15
                                        }}
                                        className="text-xs text-gray-500 mt-0.5"
                                      >
                                        {category.description}
                                      </motion.p>
                                    </div>
                                  </div>
                                </div>
                                <div className="md:col-span-7">
                                  <motion.div
                                    className="flex flex-wrap gap-1.5"
                                    layout
                                  >
                                    {category.permissions.map(
                                      (permission, permIndex) => (
                                        <motion.span
                                          key={permission}
                                          layout
                                          initial={{ opacity: 0, scale: 0.8 }}
                                          animate={{
                                            opacity: 1,
                                            scale: 1,
                                            transition: {
                                              type: "spring",
                                              stiffness: 400,
                                              damping: 25,
                                              delay:
                                                index * 0.02 + permIndex * 0.008
                                            }
                                          }}
                                          exit={{
                                            opacity: 0,
                                            scale: 0.8,
                                            transition: {
                                              duration: 0.08
                                            }
                                          }}
                                          //   whileHover={{
                                          //     scale: 1.05,
                                          //     borderColor: "#9ca3af"
                                          //   }}
                                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white border border-gray-200 text-xs text-gray-700 cursor-default"
                                        >
                                          <Icon
                                            icon="mdi:check-circle"
                                            className="w-3 h-3 text-green-500 shrink-0"
                                          />
                                          <span className="whitespace-nowrap">
                                            {permission}
                                          </span>
                                        </motion.span>
                                      )
                                    )}
                                  </motion.div>
                                </div>
                              </motion.div>
                            ))}
                          </AnimatePresence>
                        </motion.div>
                      ) : (
                        <motion.div
                          key="empty-state"
                          layout="position"
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{
                            opacity: 1,
                            scale: 1,
                            transition: {
                              type: "spring",
                              stiffness: 300,
                              damping: 30
                            }
                          }}
                          exit={{
                            opacity: 0,
                            scale: 0.95,
                            transition: {
                              duration: 0.15
                            }
                          }}
                          className="flex items-center justify-center p-8"
                        >
                          <div className="max-w-xs text-center">
                            <motion.div
                              initial={{ scale: 0, rotate: -180 }}
                              animate={{
                                scale: 1,
                                rotate: 0,
                                transition: {
                                  type: "spring",
                                  stiffness: 250,
                                  damping: 20
                                }
                              }}
                              className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3"
                            >
                              <Icon
                                icon="mdi:shield-account-outline"
                                className="w-6 h-6 text-gray-400"
                              />
                            </motion.div>
                            <motion.p
                              initial={{ opacity: 0, y: 4 }}
                              animate={{
                                opacity: 1,
                                y: 0,
                                transition: { delay: 0.1 }
                              }}
                              className="text-gray-500 text-sm font-medium"
                            >
                              Select a role to view permissions
                            </motion.p>
                            <motion.p
                              initial={{ opacity: 0, y: 4 }}
                              animate={{
                                opacity: 1,
                                y: 0,
                                transition: { delay: 0.15 }
                              }}
                              className="text-gray-400 text-xs mt-1"
                            >
                              Each role includes specific capabilities
                            </motion.p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                </motion.div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex flex-col-reverse sm:flex-row gap-3 pt-4 px-6 py-4 border-t border-gray-200 bg-white rounded-b-2xl">
              <button
                onClick={() => {
                  setSelectedGuardian(null);
                  onClose();
                }}
                disabled={isSubmitting}
                className={`flex-1 px-4 py-2 border rounded-lg transition  ${
                  isSubmitting
                    ? "border-gray-200 text-gray-400 cursor-not-allowed"
                    : "border-gray-300 hover:bg-gray-200 cursor-pointer"
                }`}
              >
                Cancel
              </button>

              <button
                onClick={() => handleEditGuardianRole(selectedRoleValue)}
                disabled={!selectedRoleValue || isSubmitting || isRoleUnchanged}
                className={`flex justify-center items-center gap-2 flex-1 px-4 py-2.5 bg-[#11285A] hover:bg-[#0d1b3d] text-white font-semibold rounded-lg transition-all hover:shadow-lg ${
                  !selectedRoleValue || isSubmitting || isRoleUnchanged
                    ? "cursor-not-allowed opacity-70"
                    : "cursor-pointer "
                } text-white`}
              >
                {isSubmitting && (
                  <Icon
                    icon="ph:circle-notch-bold"
                    className="w-5 h-5 animate-spin"
                  />
                )}
                {isSubmitting ? "Updating Role..." : "Update Role"}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
