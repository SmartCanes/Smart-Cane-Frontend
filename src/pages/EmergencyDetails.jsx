import logo from "@/assets/images/smartcane-logo.png";
import { useDevicesStore, useGuardiansStore, useUserStore } from "@/stores/useStore";
import { Icon } from "@iconify/react";

const EmergencyDetails = () => {
  const { user } = useUserStore();
  const { selectedDevice } = useDevicesStore();
  const { guardians } = useGuardiansStore();

  const deviceId = selectedDevice?.deviceId;
  const allGuardians = (guardians(deviceId) ?? []).filter(
    (g) => g.guardianId !== user?.guardianId
  );

  const fullName = user
    ? `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() || "—"
    : "—";

  const bloodType = user?.bloodType ?? null;
  const medicalNotes = user?.medicalNotes ?? "No known allergies. Uses an assistive smart cane.";
  const deviceSerial = selectedDevice?.deviceSerialNumber ?? "—";
  const userPhone = user?.contactNumber ?? null;
  const userEmail = user?.email ?? null;

  const capitalize = (str) =>
    str ? str.charAt(0).toUpperCase() + str.slice(1) : "";

  const roleLabel = (role) => capitalize(role) || "Guardian";

  const statusColor = (status) => {
    if (status === "active") return "bg-green-50 text-green-700";
    if (status === "pending") return "bg-yellow-50 text-yellow-700";
    return "bg-gray-100 text-gray-500";
  };

  const DetailRow = ({ icon, children, className = "" }) => (
    <div className={`flex items-start gap-3 ${className}`}>
      <Icon icon={icon} className="text-lg text-primary-100/60 flex-shrink-0 mt-0.5" />
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  );

  return (
    <main className="font-poppins bg-[#f0f2f7] rounded-t-[32px] md:rounded-none h-[calc(100vh-var(--header-height)-var(--mobile-nav-height))] md:h-[calc(100vh-var(--header-height))] overflow-hidden flex flex-col pb-[calc(var(--mobile-nav-height)+0.5rem)] md:pb-0">

      {/* Header Banner */}
      <header className="flex-shrink-0 relative overflow-hidden bg-primary-100 shadow-md">
        {/* Emergency red top strip */}
        
        <div className="px-5 py-4 flex items-center gap-4">
          <img
            src={logo}
            alt="SmartCane Logo"
            className="h-8 w-auto object-contain drop-shadow-sm flex-shrink-0"
          />
          <div className="flex-1 min-w-0">
            <h1 className="font-poppins text-xl md:text-2xl font-bold tracking-wide text-white leading-tight">
              EMERGENCY INFO
            </h1>
            <p className="font-poppins text-sm md:text-sm text-white/70 mt-0.5 hidden sm:block">
              In case of emergency, please contact the guardians below.
            </p>
          </div>
          
        </div>
      </header>

      {/* Body — two-column on desktop */}
      <div className="flex-1 min-h-0 overflow-y-auto md:overflow-hidden p-4 md:p-5 flex flex-col md:flex-row gap-4">

        {/* Personal Details Card */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm flex flex-col md:w-[42%] flex-shrink-0 overflow-hidden">
          <div className="px-5 pt-4 pb-3 border-b border-gray-100 flex-shrink-0">
            <div className="flex items-center gap-2">
              <Icon icon="ph:user-circle-fill" className="text-lg text-primary-100" />
              <h2 className="font-poppins text-lg font-bold uppercase tracking-[0.1em] text-primary-100/70">
                Personal Details
              </h2>
            </div>
          </div>

          <div className="px-5 py-3 flex flex-col gap-3 overflow-y-auto flex-1 min-h-0">
            {/* Name + badges */}
            <div>
              <h3 className="font-poppins text-xl md:text-2xl font-bold text-primary-100 leading-tight mb-2">
                {fullName}
              </h3>
              <div className="flex flex-wrap gap-2">
                <span className={`font-poppins inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-bold ${bloodType ? "bg-red-50 text-red-700 border border-red-200" : "bg-gray-100 text-gray-500"}`}>
                  <Icon icon="ph:drop-fill" className="text-sm" />
                  {bloodType ?? "Blood Type Unknown"}
                </span>
                <span className="font-poppins inline-flex items-center gap-1.5 rounded-full bg-primary-100/10 px-3 py-1 text-sm font-semibold text-primary-100">
                  <Icon icon="ph:eye-slash-fill" className="text-sm" />
                  Visually Impaired
                </span>
              </div>
            </div>

            <div className="h-px bg-gray-100" />

            {/* Detail rows */}
            <div className="space-y-2.5">
              <DetailRow icon="ph:note-pencil">
                <p className="font-poppins text-lg font-semibold text-primary-100/60 uppercase tracking-wide mb-0.5">Medical Notes</p>
                <p className="font-poppins text-md text-gray-700 leading-snug">{medicalNotes}</p>
              </DetailRow>

              <DetailRow icon="ph:cpu">
                <p className="font-poppins text-lg font-semibold text-primary-100/60 uppercase tracking-wide mb-0.5">Device ID</p>
                <p className="font-poppins text-md text-gray-800 font-medium">{deviceSerial}</p>
              </DetailRow>

              <DetailRow icon="ph:phone-fill">
                <p className="font-poppins text-lg font-semibold text-primary-100/60 uppercase tracking-wide mb-0.5">Phone</p>
                {userPhone ? (
                  <a href={`tel:${userPhone}`} className="font-poppins text-md font-semibold text-primary-100 hover:underline">
                    {userPhone}
                  </a>
                ) : (
                  <p className="font-poppins text-md text-gray-400 italic">Not on file</p>
                )}
              </DetailRow>

              <DetailRow icon="ph:envelope-simple-fill">
                <p className="font-poppins text-lg font-semibold text-primary-100/60 uppercase tracking-wide mb-0.5">Email</p>
                {userEmail ? (
                  <a href={`mailto:${userEmail}`} className="font-poppins text-md text-gray-700 hover:underline truncate block">
                    {userEmail}
                  </a>
                ) : (
                  <p className="font-poppins text-md text-gray-400 italic">Not on file</p>
                )}
              </DetailRow>
            </div>
          </div>
        </div>

        {/* Emergency Contacts Card */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm flex flex-col flex-1 min-h-0 overflow-hidden">
          <div className="px-5 pt-4 pb-3 border-b border-gray-100 flex-shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Icon icon="ph:warning-circle-fill" className="text-lg text-red-500" />
                <h2 className="font-poppins text-md font-bold uppercase tracking-[0.1em] text-primary-100/70">
                  Emergency Contacts
                </h2>
              </div>
              {allGuardians.length > 0 && (
                <span className="font-poppins text-md font-semibold text-primary-100/50">
                  {allGuardians.length} {allGuardians.length === 1 ? "contact" : "contacts"}
                </span>
              )}
            </div>
          </div>

          <div className="px-5 py-4 flex-1 min-h-0 overflow-y-auto">
            {allGuardians.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center gap-2 py-8">
                <Icon icon="ph:users-three" className="text-4xl text-gray-300" />
                <p className="font-poppins text-md font-semibold text-gray-400">No emergency contacts found</p>
                <p className="font-poppins text-md text-gray-300">Guardians will appear here once added.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {allGuardians.map((guardian) => {
                  const name = [guardian.firstName, guardian.lastName]
                    .filter(Boolean)
                    .join(" ") || "Unknown";
                  const initials = (guardian.firstName?.[0] ?? "?").toUpperCase();
                  const phone = guardian.contactNumber || guardian.guardianPhone;

                  return (
                    <article
                      key={guardian.guardianId}
                      className="rounded-xl border border-gray-200 bg-gray-50 p-4 hover:border-primary-100/30 hover:bg-primary-100/[0.02] transition-all"
                    >
                      <div className="flex items-start gap-3">
                        {/* Avatar */}
                        <div className="w-11 h-11 rounded-full bg-primary-100 flex items-center justify-center text-white font-bold text-base flex-shrink-0">
                          {initials}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-0.5">
                            <p className="font-poppins text-lg font-bold text-primary-100 leading-tight">
                              {name}
                            </p>
                            {guardian.status && (
                              <span className={`font-poppins text-lg font-semibold px-2 py-0.5 rounded-full ${statusColor(guardian.status)}`}>
                                {capitalize(guardian.status)}
                              </span>
                            )}
                          </div>

                          <div className="flex flex-wrap items-center gap-1.5 mb-2">
                            <span className="font-poppins text-lg font-semibold text-primary-100/60 capitalize">
                              {roleLabel(guardian.role)}
                            </span>
                            {guardian.relationship && (
                              <>
                                <span className="text-gray-300 text-md">·</span>
                                <span className="font-poppins text-md text-gray-500 capitalize">
                                  {capitalize(guardian.relationship)}
                                </span>
                              </>
                            )}
                          </div>

                          {guardian.email && (
                            <div className="flex items-center gap-1.5 text-gray-500 mb-1.5">
                              <Icon icon="ph:envelope-simple" className="text-md flex-shrink-0" />
                              <a href={`mailto:${guardian.email}`} className="font-poppins text-md hover:underline truncate">
                                {guardian.email}
                              </a>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Call button / no phone */}
                      {phone ? (
                        <a
                          href={`tel:${phone}`}
                          className="mt-2.5 flex items-center justify-center gap-2 w-full py-2 rounded-xl bg-primary-100 text-white font-poppins font-bold text-base hover:bg-primary-100/90 active:scale-[0.98] transition-all"
                        >
                          <Icon icon="ph:phone-call-fill" className="text-base" />
                          {phone}
                        </a>
                      ) : (
                        <div className="mt-2.5 flex items-center justify-center gap-2 w-full py-2 rounded-xl bg-gray-100 text-gray-400 font-poppins text-md italic">
                          <Icon icon="ph:phone-slash" className="text-md" />
                          No phone number on file
                        </div>
                      )}
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        </div>

      </div>
    </main>
  );
};

export default EmergencyDetails;
