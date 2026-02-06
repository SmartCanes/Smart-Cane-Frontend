import { useEffect, useMemo, useState } from "react";
import { Icon } from "@iconify/react";
import Modal from "./Modal";
import Toast from "./Toast";
import {
  useDevicesStore,
  useGuardiansStore,
  useUserStore
} from "@/stores/useStore";
import { inviteGuardianLink } from "@/api/backendService";

const GuardianSkeleton = () => (
  <div className="bg-white border border-gray-200 rounded-xl p-4 flex items-center gap-4 animate-pulse">
    <div className="w-14 h-14 rounded-full bg-gray-200"></div>
    <div className="flex-1">
      <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
      <div className="h-3 bg-gray-200 rounded w-1/4 mb-2"></div>
      <div className="h-2 bg-gray-200 rounded w-1/5"></div>
    </div>
  </div>
);

const GuardianNetwork = () => {
  const { selectedDevice, hasFetchedOnce } = useDevicesStore();
  const { guardians } = useGuardiansStore();
  const { user } = useUserStore();
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: ""
  });

  const deviceId = selectedDevice?.deviceId;
  const currentGuardians = guardians(deviceId).filter(
    (g) => g.guardianId !== user?.guardianId
  );

  const handleSendInvite = async () => {
    if (!email || !email.includes("@")) {
      setToast({
        show: true,
        type: "error",
        message: "Please enter a valid email address"
      });
      return;
    }

    try {
      setIsSubmitting(true);

      const response = await inviteGuardianLink(deviceId, { email });

      if (!response.success) {
        throw new Error(response.message || "Invitation failed");
      }

      setToast({
        show: true,
        type: "success",
        message: "Invitation sent successfully"
      });

      setInviteModalOpen(false);
      setEmail("");
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to send invitation";
      setToast({
        show: true,
        type: "error",
        message: errorMessage
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="bg-white rounded-2xl shadow-sm p-6 w-full">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-4">
          <h3 className="text-xl font-semibold text-gray-800">
            Guardian Network
          </h3>
          <button
            onClick={() => setInviteModalOpen(true)}
            className="bg-[#2ECC71] text-white px-3 sm:px-5 py-2.5 rounded-lg font-bold flex items-center gap-2 justify-center cursor-pointer hover:bg-green-600 transition-colors disabled:opacity-70 disabled:cursor-not-allowed md:w-auto whitespace-nowrap text-sm sm:text-base w-full sm:w-auto"
            disabled={isSubmitting}
          >
            <Icon icon="ph:user-plus-bold" className="w-5 h-5" />
            Invite Guardian
          </button>
        </div>

        {/* Guardian List */}
        <div className="space-y-3">
          {!hasFetchedOnce && !currentGuardians.length ? (
            <>
              <GuardianSkeleton />
              <GuardianSkeleton />
              <GuardianSkeleton />
            </>
          ) : selectedDevice?.deviceId && currentGuardians?.length > 0 ? (
            currentGuardians.map((guardian) => (
              <div
                key={guardian.guardianId}
                className="bg-white border border-gray-200 rounded-xl p-4 flex items-center gap-4"
              >
                <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 font-semibold">
                  {guardian.firstName?.[0]?.toUpperCase() || "?"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 truncate">
                    {guardian.firstName} {guardian.lastName || ""}
                  </p>
                  <p className="text-gray-500 text-sm capitalize">
                    {guardian.role || "guardian"}
                  </p>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span
                      className={`w-2 h-2 rounded-full ${guardian.status === "active" ? "bg-green-500" : "bg-gray-400"}`}
                    ></span>
                    <p
                      className={`text-xs font-medium ${guardian.status === "active" ? "text-green-600" : "text-gray-500"}`}
                    >
                      {guardian.status === "active" ? "Active" : "Offline"}
                    </p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center text-gray-500 py-6 border border-dashed border-gray-200 rounded-xl">
              <p className="font-medium">No guardians yet</p>
              <p className="text-sm text-gray-400">
                Invite guardians to manage your device and get notified.
              </p>
            </div>
          )}
        </div>
      </div>

      <Modal
        key="invite-modal"
        isOpen={inviteModalOpen}
        title="Invite Guardian"
        modalType="info"
        closeTimer={null}
        footer={null}
        onClose={() => {
          setEmail("");
          setInviteModalOpen(false);
        }}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Guardian Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !isSubmitting && email) {
                  e.preventDefault();
                  handleSendInvite();
                }
              }}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              placeholder="Enter email address"
              disabled={isSubmitting}
            />
            <p className="text-sm text-gray-500 mt-2">
              An invitation will be sent to this email address
            </p>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={() => setInviteModalOpen(false)}
              className="flex-1 border py-2.5 rounded-lg font-medium transition-colors disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer border-gray-300 hover:bg-gray-200 disabled:border-gray-200 disabled:text-gray-400"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              onClick={handleSendInvite}
              disabled={isSubmitting || !email}
              className="flex-1 py-2.5 rounded-lg font-bold text-white cursor-pointer bg-[#2ECC71] hover:bg-green-600 "
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <Icon
                    icon="ph:circle-notch-bold"
                    className="w-5 h-5 animate-spin"
                  />
                  Sending...
                </span>
              ) : (
                "Send Invitation"
              )}
            </button>
          </div>
        </div>
      </Modal>

      {/* Toast Notification */}
      {toast.show && (
        <Toast
          message={toast.message}
          type={toast.type}
          position="top-right"
          onClose={() => setToast((prev) => ({ ...prev, show: false }))}
        />
      )}
    </>
  );
};

export default GuardianNetwork;
