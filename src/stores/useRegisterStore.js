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
        barangay: "San Bartolome",
        city: "Quezon City",
        province: "Metro Manila",
        village: "Saint Francis",
        email: "",
        contactNumber: "",
        deviceSerial: ""
      },
      step: 1,
      showScanner: false,
      otpSent: false,
      guardianId: null,
      deviceValidated: {
        validated: false,
        serial: null,
        status: null
      },

      setGuardianId: (id) => set({ guardianId: id }),
      setShowScanner: (show) => set({ showScanner: show }),
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

      setDeviceValidated: (deviceData) =>
        set({
          deviceValidated: {
            validated: deviceData.validated,
            serial: deviceData.serial,
            status: deviceData.status,
            validatedAt: new Date().toISOString()
          }
        }),

      clearDeviceValidated: () =>
        set({
          deviceValidated: {
            validated: false,
            serial: null,
            status: null,
            validatedAt: null
          }
        }),

      clearRegisterStore: () =>
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
          deviceValidated: {
            validated: false,
            serial: null,
            status: null,
            validatedAt: null
          },
          otp: ["", "", "", "", "", ""],
          otpSent: false,
          guardianId: null,
          showScanner: false,
          step: 1
        })
    }),

    {
      name: "register-session",
      storage: createJSONStorage(() => sessionStorage)
    }
  )
);
