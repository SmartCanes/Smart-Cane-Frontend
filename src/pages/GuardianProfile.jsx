import { useUserStore } from "@/stores/useStore";
import { useState } from "react";
import avatarPlaceholder from "@/assets/images/team-photo.png";
import { Icon } from "@iconify/react";
import TextField from "@/ui/components/TextField";
import SelectField from "@/ui/components/SelectField";
import Toast from "@/ui/components/Toast";

const relationshipOptions = [
  { value: "Husband", label: "Husband" },
  { value: "Wife", label: "Wife" },
  { value: "Sibling", label: "Sibling" },
  { value: "Legal Guardian", label: "Legal Guardian" },
  { value: "Other", label: "Other" }
];

export const GuardianProfile = () => {
  const { user } = useUserStore();
  const [profile, setProfile] = useState({
    fullName: user.guardian_name,
    email: user.email,
    phone: user.contact_number,
    relationship: user.relationship,
    region: user.region || "",
    province: user.province || "",
    city: user.city || "",
    barangay: user.barangay || "",
    village: user.village || "",
    streetAddress: user.street_address || ""
  });

  const [isEditMode, setIsEditMode] = useState(false);
  const [toastConfig, setToastConfig] = useState({
    message: "",
    type: "info"
  });

  const [showToast, setShowToast] = useState(false);

  const handleProfileChange = ({ target }) => {
    const { name, value } = target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditProfile = () => {
    setIsEditMode(true);
    setToastConfig({ message: "Edit mode activated", type: "info" });
    setShowToast(true);
  };

  const handleSaveProfile = () => {
    // setOriginalProfile(profile);
    setIsEditMode(false);
    setToastConfig({ message: "Profile saved successfully", type: "success" });
    setShowToast(true);
  };

  const handleCancelEdit = () => {
    // setProfile(originalProfile);
    setIsEditMode(false);
    setToastConfig({ message: "Changes cancelled", type: "warning" });
    setShowToast(true);
  };

  // const filteredCities = (options.cities || []).filter(
  //   (c) => c.province_code === profile.province
  // );

  // const filteredBarangays = (options.barangays || []).filter(
  //   (b) => b.city_code === profile.city
  // );

  // useEffect(() => {
  //   const loadAll = async () => {
  //     try {
  //       const allData = await fetchLocations();
  //       console.log(allData);
  //       setOptions(allData);
  //     } catch (error) {
  //       console.error("Error fetching location data:", error);
  //     }
  //   };
  //   loadAll();
  // }, []);

  return (
    <main className="bg-white md:bg-[#f9fafb] rounded-t-[32px] md:rounded-none min-h-[calc(100vh-var(--header-height)-var(--mobile-nav-height))] md:min-h-[calc(100vh-var(--header-height))] md:max-h-[calc(100vh-var(--header-height))] overflow-y-visible md:overflow-y-auto p-6 pb-[calc(var(--mobile-nav-height)+1.5rem)] md:pb-6">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 md:p-8 flex flex-col gap-5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="flex items-center gap-4">
            <img
              src={avatarPlaceholder}
              alt={profile.fullName}
              className="w-16 h-16 rounded-full object-cover"
            />
            <div>
              <h3 className="text-lg font-semibold text-[#11285A]">
                {profile.fullName}
              </h3>
              <p className="text-sm text-gray-500">{profile.email}</p>
            </div>
          </div>

          {!isEditMode ? (
            <button
              onClick={handleEditProfile}
              className="flex items-center gap-2 px-4 py-2 rounded-xl border border-[#11285A] text-[#11285A] text-sm font-semibold hover:bg-blue-50 transition-colors"
            >
              <Icon icon="solar:pen-bold" className="text-lg" />
              Edit Profile
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={handleSaveProfile}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#11285A] text-white text-sm font-semibold hover:bg-[#0d1b3d] transition-colors"
              >
                <Icon icon="solar:check-circle-bold" className="text-lg" />
                Save
              </button>
              <button
                onClick={handleCancelEdit}
                className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-300 text-gray-600 text-sm font-semibold hover:bg-gray-50 transition-colors"
              >
                <Icon icon="solar:close-circle-bold" className="text-lg" />
                Cancel
              </button>
            </div>
          )}
        </div>

        <div className="grid md:grid-cols-2 gap-5">
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Full Name
            </label>
            <TextField
              type="text"
              name="fullName"
              value={profile.fullName}
              onChange={handleProfileChange}
              disabled={!isEditMode}
              inputClassName={`${!isEditMode ? "bg-gray-100" : "bg-white"}`}
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Email Address
            </label>
            <TextField
              type="email"
              name="email"
              value={profile.email}
              onChange={handleProfileChange}
              disabled={!isEditMode}
              inputClassName={`${!isEditMode ? "bg-gray-100" : "bg-white"}`}
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Phone Number
            </label>
            <TextField
              type="tel"
              name="phone"
              value={profile.phone}
              onChange={handleProfileChange}
              disabled={!isEditMode}
              inputClassName={`${!isEditMode ? "bg-gray-100" : "bg-white"}`}
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Lot No./Bldg./Street
            </label>
            <TextField
              name="streetAddress"
              value={profile.streetAddress}
              placeholder="Enter your Lot No..."
              onChange={handleProfileChange}
              disabled={!isEditMode}
              inputClassName={`${!isEditMode ? "bg-gray-100" : "bg-white"}`}
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Province
            </label>
            <SelectField
              placeholder="Province"
              disabled={true}
              options={[{ value: "Metro Manila", label: "Metro Manila" }]}
              onChange={handleProfileChange}
              value={profile.province}
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Barangay
            </label>
            <SelectField
              placeholder="Barangay"
              disabled
              options={[{ value: "San Bartolome", label: "San Bartolome" }]}
              onChange={handleProfileChange}
              value={profile.barangay}
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              City
            </label>
            <SelectField
              placeholder="City"
              options={[{ value: "Quezon City", label: "Quezon City" }]}
              disabled
              onChange={handleProfileChange}
              value={profile.city}
            />
          </div>
        </div>

        {showToast && (
          <Toast
            message={toastConfig.message}
            type={toastConfig.type}
            duration={3000}
            position="top-right"
            onClose={() => setShowToast(false)}
          />
        )}
      </div>
    </main>
  );
};
