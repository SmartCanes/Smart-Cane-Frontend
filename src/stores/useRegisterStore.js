import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export const useRegisterStore = create(
  persist(
    (set) => ({
      formData: {
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
        contactNumber: "",
        deviceSerial: ""
      },
      step: 1,
      otpSent: false,
      guardianId: null,
      setGuardianId: (id) => set({ guardianId: id }),
      setStep: (step) => set({ step }),
      updateForm: (field, value) =>
        set((state) => ({
          formData: { ...state.formData, [field]: value }
        })),
      setOtpSent: (sent) => set({ otpSent: sent }),
      setDeviceSerial: (serial) =>
        set((state) => ({
          formData: { ...state.formData, deviceSerial: serial }
        })),
      clearStore: () =>
        set({
          formData: {
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
            contactNumber: "",
            deviceSerial: ""
          },
          otp: ["", "", "", "", "", ""],
          otpSent: false,
          guardianId: null
        })
    }),

    {
      name: "register-session",
      storage: createJSONStorage(() => sessionStorage)
    }
  )
);
