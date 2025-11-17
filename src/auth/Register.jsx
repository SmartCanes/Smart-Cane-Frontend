import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import SidebarContent from "../ui/components/SidebarContent";
import TextField from "../ui/components/TextField";
import SelectField from "../ui/components/SelectField";
import PasswordField from "../ui/components/PasswordField";
import PrimaryButton from "../ui/components/PrimaryButton";
import ValidationModal from "../ui/components/ValidationModal";
import Loader from "../ui/components/Loader";
import { BlinkingIcon } from "@/wrapper/MotionWrapper";

const Register = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1 = Basic Info, 2 = Address Info, 3 = OTP Verification
  const [modalConfig, setModalConfig] = useState({
    visible: false,
    type: null,
    position: "center"
  });

  const CONTACT_NUMBER_LENGTH = 11;
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  // Form data state
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    username: "",
    password: "",
    confirmPassword: "",
    streetAddress: "",
    barangay: "",
    city: "",
    province: "",
    relationship: "",
    email: "",
    contactNumber: ""
  });

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    // If updating contact number, allow digits only (strip non-numeric chars)
    const newValue =
      name === "contactNumber"
        ? value.replace(/[^0-9]/g, "").slice(0, CONTACT_NUMBER_LENGTH)
        : value;

    setFormData((prev) => ({
      ...prev,
      [name]: newValue
    }));
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  const otpRefs = [
    React.createRef(),
    React.createRef(),
    React.createRef(),
    React.createRef()
  ];

  // Temporary dummy data for testing
  const dummyBarangays = [
    { value: "brgy1", label: "Barangay 1" },
    { value: "brgy2", label: "Barangay 2" },
    { value: "brgy3", label: "Barangay 3" },
    { value: "brgy4", label: "Barangay 4" },
    { value: "brgy5", label: "Barangay 5" }
  ];

  const dummyCities = [
    { value: "city1", label: "Manila" },
    { value: "city2", label: "Quezon City" },
    { value: "city3", label: "Makati" },
    { value: "city4", label: "Pasig" },
    { value: "city5", label: "Taguig" }
  ];

  const dummyProvinces = [
    { value: "prov1", label: "Metro Manila" },
    { value: "prov2", label: "Bulacan" },
    { value: "prov3", label: "Cavite" },
    { value: "prov4", label: "Laguna" },
    { value: "prov5", label: "Rizal" }
  ];

  // Geographic data states
  const [regions, setRegions] = useState([]);
  const [provinces, setProvinces] = useState(dummyProvinces);
  const [cities, setCities] = useState(dummyCities);
  const [barangays, setBarangays] = useState(dummyBarangays);

  // Selected values
  const [selectedRegion, setSelectedRegion] = useState("");
  const [selectedProvince, setSelectedProvince] = useState("");
  const [selectedCity, setSelectedCity] = useState("");

  const handleRegionChange = (e) => {
    const regionCode = e.target.value;
    setSelectedRegion(regionCode);
    setSelectedProvince("");
    setSelectedCity("");
    // loadProvinces(regionCode) // Disabled
  };

  const handleProvinceChange = (e) => {
    const provinceCode = e.target.value;
    setSelectedProvince(provinceCode);
    setSelectedCity("");
    // loadCities(provinceCode) // Disabled
  };

  const handleCityChange = (e) => {
    const cityCode = e.target.value;
    setSelectedCity(cityCode);
    // loadBarangays(cityCode) // Disabled
  };

  const hideModal = () => {
    setModalConfig({ visible: false, type: null, position: "center" });
  };

  const handleModalAction = () => {
    if (modalConfig.type === "account-created") {
      navigate("/login");
    }
    hideModal();
  };

  const handleNext = (e) => {
    e.preventDefault();
    const REQUIRED_MSG = "This field is required";

    if (step === 1) {
      const step1Errors = {};
      if (!formData.firstName.trim()) step1Errors.firstName = REQUIRED_MSG;
      if (!formData.lastName.trim()) step1Errors.lastName = REQUIRED_MSG;
      if (!formData.username.trim()) step1Errors.username = REQUIRED_MSG;
      if (!formData.password) step1Errors.password = REQUIRED_MSG;
      if (!formData.confirmPassword) step1Errors.confirmPassword = REQUIRED_MSG;
      if (
        formData.password &&
        formData.confirmPassword &&
        formData.password !== formData.confirmPassword
      ) {
        step1Errors.confirmPassword = "Password don't match!";
      }

      if (Object.keys(step1Errors).length) {
        setErrors((prev) => ({ ...prev, ...step1Errors }));
        return;
      }
      setStep(2);
    } else if (step === 2) {
      const step2Errors = {};
      if (!formData.streetAddress.trim())
        step2Errors.streetAddress = REQUIRED_MSG;
      if (!formData.province) step2Errors.province = REQUIRED_MSG;
      if (!formData.barangay) step2Errors.barangay = REQUIRED_MSG;
      if (!formData.city) step2Errors.city = REQUIRED_MSG;
      if (!formData.relationship) step2Errors.relationship = REQUIRED_MSG;
      if (!formData.contactNumber) {
        step2Errors.contactNumber = REQUIRED_MSG;
      } else if (formData.contactNumber.length !== CONTACT_NUMBER_LENGTH) {
        step2Errors.contactNumber = `Contact number must be ${CONTACT_NUMBER_LENGTH} digits.`;
      }
      if (!formData.email.trim()) step2Errors.email = REQUIRED_MSG;

      if (Object.keys(step2Errors).length) {
        setErrors((prev) => ({ ...prev, ...step2Errors }));
        return;
      }
      // Show phone verification modal
      setModalConfig({
        visible: true,
        type: "phone-verification",
        position: "center"
      });
      // Auto-hide modal and move to step 3 after 3 seconds
      setTimeout(() => {
        hideModal();
        setTimeout(() => setStep(3), 500);
      }, 3000);
    } else {
      // Submit the form (after OTP verification)
      setIsSubmitting(true);

      // Simulate API submission
      setTimeout(() => {
        setIsSubmitting(false);
        setModalConfig({
          visible: true,
          type: "account-created",
          position: "center"
        });
      }, 2000);
    }
  };

  const handleOtpChange = (index, value) => {
    if (value.length <= 1 && /^[0-9]*$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);

      // Auto-focus next input
      if (value && index < 3) {
        otpRefs[index + 1].current?.focus();
      }
    }
  };

  const handleOtpKeyDown = (index, e) => {
    // Handle backspace to go to previous input
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs[index - 1].current?.focus();
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col sm:flex-row">
      <SidebarContent />

      {step === 3 && isSubmitting && (
        <div className="absolute inset-0 sm:inset-y-0 sm:left-0 w-full sm:w-1/2 flex items-center justify-center z-30">
          <Loader size="large" color="#FDFCFA" />
        </div>
      )}

      {/* Phone Verification Modal */}
      {modalConfig.visible && (
        <ValidationModal
          type={modalConfig.type}
          position={modalConfig.position}
          onAction={handleModalAction}
        />
      )}

      {step === 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-[92%] flex justify-center z-10">
          {/* <p className='font-poppins pb-4 font-[12px] whitespace-nowrap'>
  Thank you so much for choosing to stay with us during your recent visit. We truly enjoyed having you as our guest and hope your stay was comfortable and pleasant. Your visit brought warmth to our place, and we look forward to welcoming you again soon. If you have any questions or need help planning your next stay, feel free to reach out. 🙏😊
</p> */}
        </div>
      )}
      <div className="relative flex flex-col w-full sm:flex-1 min-h-screen bg-[#FDFCFA] px-6 sm:px-10">
        <Link to="/">
          <div className="sm:hidden py-4 flex gap-2 absolute top-0 left-4">
            <BlinkingIcon
              src="src/assets/images/smartcane-logo-blue.png"
              alt="Smart Cane Logo"
              className="object-contain w-[45px]"
            />
            <h1 className="font-gabriela text-4xl text-card-100">icane</h1>
          </div>
        </Link>
        <div className="flex-1 flex justify-center items-center pt-24 pb-5 sm:pt-0 sm:pb-0">
          <form
            className="w-full max-w-md sm:max-w-none lg:max-w-lg"
            onSubmit={handleNext}
            noValidate
          >
            <div className="text-center mb-7 sm:mb-10">
              <h1 className="font-poppins text-5xl sm:text-h1 font-bold text-[#1C253C] mb-4">
                {step === 3 ? "Phone Verification" : "Welcome"}
              </h1>
              <p className="font-poppins text-[#1C253C] text-paragraph">
                {step === 1 ? (
                  "Start your journey to safer and smarter mobility by signing up."
                ) : step === 2 ? (
                  "Start your journey to safer and smarter mobility by signing up."
                ) : (
                  <>
                    Enter the{" "}
                    <span className="font-bold">One-Time Password (OTP)</span>{" "}
                    we have sent to your registered contact number 09*******345.
                  </>
                )}
              </p>
            </div>

            {/* Step 1: Basic Information */}
            {step === 1 && (
              <div className="space-y-3 sm:space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <TextField
                    className="font-poppins"
                    label={"First Name"}
                    placeholder="First Name..."
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleFormChange}
                    inputClassName="py-3"
                    error={errors.firstName}
                    required
                  />

                  <TextField
                    className="font-poppins"
                    label={"Last Name"}
                    placeholder="Last Name..."
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleFormChange}
                    inputClassName="py-3"
                    error={errors.lastName}
                    required
                  />
                </div>

                <TextField
                  className="font-poppins"
                  label={"Username"}
                  placeholder="Enter your username..."
                  name="username"
                  value={formData.username}
                  onChange={handleFormChange}
                  inputClassName="py-3"
                  error={errors.username}
                  required
                />

                <PasswordField
                  className="font-poppins"
                  label={"Password"}
                  placeholder="Enter your password..."
                  name="password"
                  value={formData.password}
                  onChange={handleFormChange}
                  error={errors.password}
                  showValidationRules
                  inputClassName="py-3"
                  required
                />

                <PasswordField
                  className="font-poppins"
                  label={"Re-enter Password"}
                  placeholder="Re-enter your password..."
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleFormChange}
                  error={errors.confirmPassword}
                  inputClassName="py-3"
                  required
                />
              </div>
            )}

            {/* Step 2: Address Information */}
            {step === 2 && (
              <div className="space-y-4">
                {/* Lot No./Bldg./Street and Province - Side by side */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <TextField
                    className="font-poppins"
                    label={"Lot No./Bldg./Street"}
                    placeholder="Enter your Lot No..."
                    name="streetAddress"
                    value={formData.streetAddress}
                    onChange={handleFormChange}
                    error={errors.streetAddress}
                    required
                  />

                  <SelectField
                    className="font-poppins"
                    label={"Province"}
                    placeholder="Province..."
                    required
                    options={provinces}
                    onChange={(e) => {
                      setFormData((prev) => ({
                        ...prev,
                        province: e.target.value
                      }));
                      handleProvinceChange(e);
                      setErrors((prev) => ({ ...prev, province: "" }));
                    }}
                    value={formData.province}
                    error={errors.province}
                  />
                </div>

                {/* Barangay and City - Side by side */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <SelectField
                    className="font-poppins"
                    label={"Barangay"}
                    placeholder="Barangay..."
                    required
                    options={barangays}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        barangay: e.target.value
                      }))
                    }
                    value={formData.barangay}
                    error={errors.barangay}
                  />

                  <SelectField
                    className="font-poppins "
                    label={"City"}
                    placeholder="City..."
                    required
                    options={cities}
                    onChange={(e) => {
                      setFormData((prev) => ({
                        ...prev,
                        city: e.target.value
                      }));
                      handleCityChange(e);
                      setErrors((prev) => ({ ...prev, city: "" }));
                    }}
                    value={formData.city}
                    error={errors.city}
                  />
                </div>

                {/* Relationship to the VIP - Full width */}
                <SelectField
                  className="font-poppins py-[16px]"
                  label={"Relationship to the VIP"}
                  placeholder="Relationship..."
                  required
                  options={[
                    { value: "Husband", label: "Husband" },
                    { value: "Legal Guardian", label: "Legal Guardian" },
                    { value: "Sibling", label: "Sibling" },
                    { value: "Wife", label: "Wife" }
                  ]}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      relationship: e.target.value
                    }))
                  }
                  value={formData.relationship || ""}
                  error={errors.relationship}
                />

                {/* Contact Number - Full width */}
                <TextField
                  className="font-poppins"
                  label={"Contact Number"}
                  placeholder="09XX XXX XXXX"
                  type="tel"
                  name="contactNumber"
                  value={formData.contactNumber}
                  onChange={handleFormChange}
                  inputMode="numeric"
                  maxLength={11}
                  error={errors.contactNumber}
                  required
                />

                {/* Email Address - Full width */}
                <TextField
                  className="font-poppins"
                  label={"Email Address"}
                  placeholder="sample.email@gmail.com"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleFormChange}
                  error={errors.email}
                  required
                />
              </div>
            )}

            {/* Step 3: OTP Verification */}
            {step === 3 && (
              <div className="space-y-6">
                {/* OTP Input Boxes */}
                <div className="flex justify-center gap-4">
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      ref={otpRefs[index]}
                      type="text"
                      maxLength="1"
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(index, e)}
                      className="w-16 h-16 text-center text-2xl font-bold border-2 border-gray-300 rounded-lg focus:border-primary-100 focus:outline-none"
                    />
                  ))}
                </div>

                {/* Resend OTP Link */}
                <div className="text-center">
                  <p className="font-poppins text-[#1C253C] text-sm mb-2">
                    Didn't receive an OTP?
                  </p>
                  <button
                    type="button"
                    className="font-poppins text-[#1C253C] hover:underline text-sm"
                  >
                    Resend OTP
                  </button>
                </div>
              </div>
            )}
            <PrimaryButton
              className="font-poppins w-full py-4 text-[18px] font-medium mt-6"
              bgColor="bg-primary-100"
              text={`${step === 3 ? "Submit" : "Next"}`}
              type="submit"
              disabled={isSubmitting}
            />
            <p className="font-poppins text-center text-[18px] mt-4">
              Already have an Account?{" "}
              <Link
                to="/login"
                className="font-poppins text-blue-500 hover:underline text-[18px]"
              >
                Sign In
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
