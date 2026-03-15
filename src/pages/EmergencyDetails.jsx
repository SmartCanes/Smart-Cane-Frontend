import logo from "@/assets/images/smartcane-logo.png";
import { useLocation } from "react-router-dom";
import {
  useDevicesStore,
  useGuardiansStore,
  useUserStore
} from "@/stores/useStore";
import { Icon } from "@iconify/react";
import { resolveProfileImageSrc } from "@/utils/ResolveImage";

const EmergencyDetails = () => {
  const location = useLocation();
  const { user } = useUserStore();
  const { selectedDevice } = useDevicesStore();
  const { guardians } = useGuardiansStore();
  const emergencyData = location.state?.emergencyData || null;

  const pick = (...values) => values.find((value) => value != null);
  const capitalize = (value) =>
    value ? value.charAt(0).toUpperCase() + value.slice(1) : "";

  const formatDateTime = (value) => {
    if (!value) return "Not set";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return String(value);
    return d.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const deviceId = selectedDevice?.deviceId;
  const storeGuardians = (guardians(deviceId) ?? []).filter(
    (g) => g.guardianId !== user?.guardianId
  );
  const rawGuardians =
    emergencyData?.guardians?.length > 0
      ? emergencyData.guardians
      : storeGuardians;

  const vipFromState = emergencyData?.vip || null;
  const vipFromDevice = selectedDevice?.vip || null;
  const deviceFromState = emergencyData?.device || null;

  const vipFirstName =
    pick(
      vipFromState?.firstName,
      vipFromState?.first_name,
      vipFromDevice?.firstName,
      vipFromDevice?.first_name
    ) || "";

  const vipMiddleName =
    pick(
      vipFromState?.middleName,
      vipFromState?.middle_name,
      vipFromDevice?.middleName,
      vipFromDevice?.middle_name
    ) || "";

  const vipLastName =
    pick(
      vipFromState?.lastName,
      vipFromState?.last_name,
      vipFromDevice?.lastName,
      vipFromDevice?.last_name
    ) || "";

  const vipFullName =
    [vipFirstName, vipMiddleName, vipLastName].filter(Boolean).join(" ") ||
    "Unnamed VIP";

  const vipImage = pick(
    vipFromState?.vipImageUrl,
    vipFromState?.vip_image_url,
    vipFromDevice?.vipImageUrl,
    vipFromDevice?.vip_image_url
  );

  const vipAddress = [
    pick(
      vipFromState?.streetAddress,
      vipFromState?.street_address,
      vipFromDevice?.streetAddress,
      vipFromDevice?.street_address
    ),
    pick(vipFromState?.village, vipFromState?.village, vipFromDevice?.village),
    pick(vipFromState?.barangay, vipFromDevice?.barangay),
    pick(vipFromState?.city, vipFromDevice?.city),
    pick(vipFromState?.province, vipFromDevice?.province)
  ]
    .filter(Boolean)
    .join(", ");

  const vipFields = [
    {
      label: "First Name",
      value: pick(
        vipFromState?.first_name,
        vipFromState?.firstName,
        vipFromDevice?.firstName
      ),
      icon: "ph:user"
    },
    {
      label: "Middle Name",
      value: pick(
        vipFromState?.middle_name,
        vipFromState?.middleName,
        vipFromDevice?.middleName
      ),
      icon: "ph:user"
    },
    {
      label: "Last Name",
      value: pick(
        vipFromState?.last_name,
        vipFromState?.lastName,
        vipFromDevice?.lastName
      ),
      icon: "ph:user"
    },
    {
      label: "Device Serial",
      value: pick(
        deviceFromState?.deviceSerialNumber,
        deviceFromState?.device_serial_number,
        selectedDevice?.deviceSerialNumber,
        selectedDevice?.device_serial_number
      ),
      icon: "ph:hash"
    }
  ];

  const normalizedGuardians = rawGuardians.map((guardian) => {
    const firstName = pick(guardian.firstName, guardian.first_name) || "";
    const middleName = pick(guardian.middleName, guardian.middle_name) || "";
    const lastName = pick(guardian.lastName, guardian.last_name) || "";
    const name =
      [firstName, middleName, lastName].filter(Boolean).join(" ") || "Unknown";

    const address = [
      pick(guardian.streetAddress, guardian.street_address),
      pick(guardian.village),
      pick(guardian.barangay),
      pick(guardian.city),
      pick(guardian.province)
    ]
      .filter(Boolean)
      .join(", ");

    return {
      id: pick(guardian.guardianId, guardian.guardian_id, name),
      name,
      initials: (firstName?.[0] || name?.[0] || "?").toUpperCase(),
      username: guardian.username,
      email: guardian.email || null,
      phone: pick(
        guardian.contactNumber,
        guardian.contact_number,
        guardian.guardianPhone
      ),
      role: pick(guardian.role, "guardian"),
      relationship: pick(guardian.relationship),
      status: pick(guardian.status, "active"),
      image: pick(guardian.guardianImageUrl, guardian.guardian_image_url),
      assignedAt: pick(guardian.assignedAt, guardian.assigned_at),
      createdAt: pick(guardian.createdAt, guardian.created_at),
      updatedAt: pick(guardian.updatedAt, guardian.updated_at),
      address
    };
  });

  const emergencyGuardian = normalizedGuardians[0] || null;

  const statusColor = (status) => {
    switch (status) {
      case "active":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "pending":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "inactive":
        return "bg-slate-50 text-slate-700 border-slate-200";
      default:
        return "bg-slate-50 text-slate-700 border-slate-200";
    }
  };

  return (
    <main className="font-poppins bg-gradient-to-br rounded-t-[32px] md:rounded-none h-[calc(100vh-var(--header-height)-var(--mobile-nav-height))] md:h-[calc(100vh-var(--header-height))] overflow-hidden flex flex-col pb-[calc(var(--mobile-nav-height)+0.5rem)] md:pb-0">
      {/* Header with glass morphism effect */}
      <header className="w-full h-[var(--header-height)] bg-primary-100 flex items-center justify-between px-4 sm:px-6 md:px-8 lg:px-12 xl:px-15 relative z-20 shadow-lg">
        <div className="flex items-center gap-3 md:gap-4 min-w-0">
          <div className="bg-white/15 p-2 rounded-xl backdrop-blur-sm">
            <img
              src={logo}
              alt="SmartCane Logo"
              className="h-6 w-6 sm:h-8 sm:w-8 md:h-10 md:w-10 object-contain"
            />
          </div>
          <div className="min-w-0">
            <p className="text-white text-base sm:text-lg md:text-xl font-bold leading-tight truncate flex items-center gap-2">
              Emergency Details
            </p>
            <p className="text-white/70 text-[11px] sm:text-xs truncate">
              VIP identity and emergency guardian information
            </p>
          </div>
        </div>

        {/* Emergency Mode badge */}
        <div className="inline-flex items-center gap-1 sm:gap-1.5 rounded-xl bg-white/10 backdrop-blur-sm px-2.5 py-1.5 sm:px-4 sm:py-2 text-white font-semibold border border-white/20 whitespace-nowrap">
          <Icon
            icon="ph:warning-diamond-fill"
            className="text-xs sm:text-sm text-amber-300"
          />
          <span className="hidden sm:inline text-xs">
            Emergency Mode • Active
          </span>
          <span className="sm:hidden text-[10px]">Active</span>
        </div>
      </header>

      <div className="flex-1 min-h-0 overflow-y-auto p-4 md:p-6">
        <div className="flex flex-col gap-6 lg:grid lg:grid-cols-2 lg:h-full">
          <VIPSection
            vipFullName={vipFullName}
            vipImage={vipImage}
            vipAddress={vipAddress}
            vipFields={vipFields}
          />
          <GuardianSection
            emergencyGuardian={emergencyGuardian}
            guardianCount={normalizedGuardians.length}
            formatDateTime={formatDateTime}
            statusColor={statusColor}
            capitalize={capitalize}
          />
        </div>
      </div>
    </main>
  );
};

// Extracted VIP Section component
const VIPSection = ({ vipFullName, vipImage, vipAddress, vipFields }) => (
  <section className="bg-white/90 backdrop-blur-sm border border-white/50 rounded-3xl shadow-xl overflow-hidden h-full flex flex-col">
    <div className="px-6 py-5 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
      <div className="flex items-center gap-3">
        <div className="bg-[#1a4a9f]/10 p-2.5 rounded-xl">
          <Icon icon="ph:user-focus-fill" className="text-2xl text-[#1a4a9f]" />
        </div>
        <div>
          <h2 className="text-lg md:text-xl font-bold tracking-wide text-slate-800">
            VIP Profile
          </h2>
          <p className="text-xs text-slate-500">
            Personal information and device details
          </p>
        </div>
      </div>
    </div>

    <div className="p-6 md:p-7 space-y-6 flex-1 overflow-y-auto">
      {/* VIP Header Card */}
      <div className="bg-gradient-to-br from-slate-50 to-white rounded-2xl p-5 border border-slate-200/80 shadow-sm">
        <div className="flex items-center gap-5">
          <div className="relative">
            <div className="w-20 h-20 sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-2xl overflow-hidden border-4 border-white shadow-lg bg-gradient-to-br from-[#1a4a9f] to-[#0a1e3f]">
              {vipImage ? (
                <img
                  src={resolveProfileImageSrc(vipImage)}
                  alt={vipFullName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white text-3xl sm:text-4xl font-bold">
                  {vipFullName.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <div className="absolute -bottom-1 -right-1 bg-emerald-500 w-6 h-6 rounded-full border-4 border-white"></div>
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="text-lg sm:text-2xl md:text-3xl font-bold text-[#0a1e3f] leading-tight mb-1">
              {vipFullName}
            </h3>
            {/* <div className="flex items-center gap-2 text-sm text-slate-500 mb-2">
              <Icon icon="ph:map-pin-fill" className="text-[#1a4a9f]" />
              <span className="truncate">
                {vipAddress || "Address not available"}
              </span>
            </div> */}
            <div className="flex items-center gap-2 text-xs">
              <span className="bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full border border-emerald-200">
                Active
              </span>
              <span className="bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full">
                VIP
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Info Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {vipFields.map((item) => (
          <InfoTile
            key={item.label}
            icon={item.icon}
            label={item.label}
            value={item.value || "Not set"}
          />
        ))}
      </div>
    </div>
  </section>
);

// Extracted Guardian Section component
const GuardianSection = ({
  emergencyGuardian,
  guardianCount,
  formatDateTime,
  statusColor,
  capitalize
}) => (
  <section className="bg-white/90 backdrop-blur-sm border border-white/50 rounded-3xl shadow-xl overflow-hidden h-full flex flex-col">
    <div className="px-6 py-5 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-[#1a4a9f]/10 p-2.5 rounded-xl">
            <Icon
              icon="ph:users-three-fill"
              className="text-2xl text-[#1a4a9f]"
            />
          </div>
          <div>
            <h2 className="text-lg md:text-xl font-bold tracking-wide text-slate-800">
              Emergency Guardian
            </h2>
            <p className="text-xs text-slate-500">Primary contact person</p>
          </div>
        </div>
        <span className="text-xs font-semibold rounded-full bg-blue-50 text-blue-700 px-3 py-1.5 border border-blue-200 whitespace-nowrap">
          {guardianCount} {guardianCount === 1 ? "contact" : "contacts"}
        </span>
      </div>
    </div>

    <div className="p-6 md:p-7 flex-1 overflow-y-auto">
      {!emergencyGuardian ? (
        <EmptyGuardianState />
      ) : (
        <div className="space-y-5">
          {/* Guardian Profile Card */}
          <div className="bg-gradient-to-br from-slate-50 to-white rounded-2xl p-5 border border-slate-200/80 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="relative">
                <div className="w-16 h-16 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-2xl overflow-hidden border-4 border-white shadow-lg bg-gradient-to-br from-[#1a4a9f] to-[#0a1e3f]">
                  {emergencyGuardian.image ? (
                    <img
                      src={resolveProfileImageSrc(emergencyGuardian.image)}
                      alt={emergencyGuardian.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white font-bold text-2xl sm:text-3xl">
                      {emergencyGuardian.initials}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <h3 className="font-bold text-[#0a1e3f] text-lg sm:text-2xl md:text-3xl leading-tight">
                    {emergencyGuardian.name}
                  </h3>
                  <span
                    className={`text-xs font-semibold rounded-full px-3 py-1 border ${statusColor(emergencyGuardian.status)}`}
                  >
                    {capitalize(emergencyGuardian.status)}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-sm text-slate-600 mb-3">
                  <Icon icon="ph:briefcase" className="text-[#1a4a9f]" />
                  <span>{capitalize(emergencyGuardian.role)}</span>
                  {emergencyGuardian.relationship && (
                    <>
                      <span className="text-slate-300">•</span>
                      <span>{capitalize(emergencyGuardian.relationship)}</span>
                    </>
                  )}
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 gap-2 mt-3">
                  {emergencyGuardian.phone && (
                    <div className="bg-slate-100 rounded-xl p-2 text-center">
                      <p className="text-xs text-slate-500">Phone</p>
                      <p className="text-sm font-semibold text-slate-700 truncate">
                        {emergencyGuardian.phone}
                      </p>
                    </div>
                  )}
                  {emergencyGuardian.email && (
                    <div className="bg-slate-100 rounded-xl p-2 text-center">
                      <p className="text-xs text-slate-500">Email</p>
                      <p className="text-sm font-semibold text-slate-700 truncate">
                        {emergencyGuardian.email}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 gap-3">
            <DetailCard
              icon="ph:envelope-simple"
              label="Email"
              value={emergencyGuardian.email || "Not on file"}
              href={
                emergencyGuardian.email
                  ? `mailto:${emergencyGuardian.email}`
                  : null
              }
            />
            <DetailCard
              icon="ph:phone"
              label="Contact"
              value={emergencyGuardian.phone || "Not on file"}
              href={
                emergencyGuardian.phone
                  ? `tel:${emergencyGuardian.phone}`
                  : null
              }
            />
            <DetailCard
              icon="ph:map-pin"
              label="Address"
              value={emergencyGuardian.address || "Not set"}
            />
            <DetailCard
              icon="ph:clock-counter-clockwise"
              label="Updated At"
              value={formatDateTime(emergencyGuardian.updatedAt)}
            />
          </div>

          {/* Call Button */}
          {emergencyGuardian.phone && (
            <a
              href={`tel:${emergencyGuardian.phone}`}
              className="group mt-5 inline-flex items-center justify-center gap-3 w-full py-4 rounded-xl bg-gradient-to-r from-[#1a4a9f] to-[#0a1e3f] text-white text-base md:text-lg font-semibold hover:shadow-lg hover:shadow-[#1a4a9f]/25 transition-all duration-300 transform hover:scale-[1.02]"
            >
              <Icon
                icon="ph:phone-call-fill"
                className="text-xl group-hover:animate-pulse"
              />
              Call Emergency Guardian
            </a>
          )}
        </div>
      )}
    </div>
  </section>
);

// Empty state component
const EmptyGuardianState = () => (
  <div className="h-full min-h-[400px] flex flex-col items-center justify-center text-center rounded-2xl border-2 border-dashed border-slate-200 bg-gradient-to-br from-slate-50 to-white px-6">
    <div className="bg-slate-100 p-4 rounded-2xl mb-4">
      <Icon icon="ph:user-circle-dashed" className="text-6xl text-slate-400" />
    </div>
    <p className="text-lg font-semibold text-slate-700 mb-2">
      No emergency guardian found
    </p>
    <p className="text-sm text-slate-500 max-w-[200px]">
      Assign an emergency contact to show details here
    </p>
  </div>
);

// Enhanced InfoTile component
const InfoTile = ({ icon, label, value }) => (
  <div className="group rounded-xl border border-slate-200 bg-white hover:border-[#1a4a9f]/30 hover:shadow-md transition-all duration-300 p-3 md:p-3.5">
    <div className="flex items-center gap-2 text-slate-400 group-hover:text-[#1a4a9f] mb-1 transition-colors">
      <Icon icon={icon} className="text-base" />
      <p className="text-xs font-semibold uppercase tracking-wide">{label}</p>
    </div>
    <p className="text-sm md:text-base text-slate-700 break-words leading-relaxed font-medium pl-6">
      {value}
    </p>
  </div>
);

// Enhanced DetailCard component
const DetailCard = ({ icon, label, value, href = null }) => (
  <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100 hover:border-slate-200 transition-all">
    <div className="bg-white p-2 rounded-lg shadow-sm">
      <Icon icon={icon} className="text-[#1a4a9f] text-lg" />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-xs uppercase tracking-wide text-slate-500 font-semibold mb-0.5">
        {label}
      </p>
      {href ? (
        <a
          href={href}
          className="text-sm md:text-base text-[#1a4a9f] hover:text-[#0a1e3f] hover:underline font-medium break-words transition-colors"
        >
          {value}
        </a>
      ) : (
        <p className="text-sm md:text-base text-slate-700 break-words font-medium">
          {value}
        </p>
      )}
    </div>
  </div>
);

export default EmergencyDetails;
