import {
  getAllDeviceGuardians,
  getDevices,
  getPendingInvites
} from "@/api/backendService";
import { wsApi } from "@/api/ws-api";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export const useUserStore = create(
  persist(
    (set, get) => ({
      user: null,
      setUser: (updater) =>
        set((state) => ({
          user:
            typeof updater === "function"
              ? updater(state.user)
              : { ...state.user, ...updater }
        })),

      clearUser: () => set({ user: null }),
      updateUser: (updates) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...updates } : null
        })),
      updateProfileImage: (imageUrl) =>
        set((state) => ({
          user: state.user
            ? { ...state.user, guardian_image_url: imageUrl }
            : null
        })),
      getUserInfo: () => get().user,
      getUsername: () => get().user?.username || "",
      getAvatar: () => get().user?.guardian_image_url || ""
    }),
    {
      name: "user-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ user: state.user })
    }
  )
);

export const useRealtimeStore = create(
  persist(
    (set, get) => ({
      _wsConnected: false,
      connectionStatus: false,
      emergency: false,
      canePosition: null,
      guardianPosition: null,
      deviceConfig: {},
      componentHealth: {
        gpsStatus: false,
        ultrasonicStatus: false,
        infraredStatus: false,
        accelerometerStatus: false,
        esp32Status: false,
        raspberryPiStatus: false
      },
      connectWs: () => {
        wsApi.off("status");
        wsApi.off("location");
        wsApi.off("connect");
        wsApi.off("disconnect");
        wsApi.connect();

        let heartbeatTimeout;

        const resetHeartbeat = () => {
          if (heartbeatTimeout) clearTimeout(heartbeatTimeout);
          heartbeatTimeout = setTimeout(() => {
            set({ connectionStatus: false });
            console.log("WebSocket connection lost (timeout)");
          }, 12000);
        };

        wsApi.on("connect", () => {
          console.log("WebSocket connected:", wsApi.socket?.id);
          set({ _wsConnected: true });
          useBluetoothStore.getState().connectBluetoothWs();
          resetHeartbeat();
        });

        wsApi.on("disconnect", () => {
          console.log("WebSocket disconnected");
          set({ _wsConnected: false, connectionStatus: false });
          clearTimeout(heartbeatTimeout);

          setTimeout(() => {
            get().connectWs();
          }, 5000);
        });

        wsApi.on("status", (data) => {
          set({
            connectionStatus: data.status === "online",
            emergency: data.emergency,
            componentHealth: {
              gpsStatus: Number(data.gpsStatus) === 2,
              ultrasonicStatus:
                data.ultrasonicStatus === true ||
                data.ultrasonicStatus === "false",
              infraredStatus:
                data.infraredStatus === true || data.infraredStatus === "false",
              mpuStatus: data.mpuStatus === true || data.mpuStatus === "false",
              esp32Status: data.status === "online"
            }
          });
          resetHeartbeat();
        });

        wsApi.on("piStatus", (data) => {
          set((state) => ({
            componentHealth: {
              ...state.componentHealth,
              raspberryPiStatus: data.alive === true || data.alive === "false"
            }
          }));
          resetHeartbeat();
        });

        wsApi.on("location", (data) => {
          if (data?.lat != null && data?.lng != null) {
            set({ canePosition: [data.lat, data.lng] });
          }
          resetHeartbeat();
        });

        wsApi.on("deviceConfig", (data) => {
          if (!data) return;

          set((state) => ({
            deviceConfig: {
              ...data
            }
          }));

          resetHeartbeat();
        });
      },

      setGuardianLocation: (loc) => set({ guardianLocation: loc }),

      startGuardianTracking: () => {
        if ("geolocation" in navigator && get()._guardianWatchId === null) {
          const watchId = navigator.geolocation.watchPosition(
            (position) => {
              const { latitude, longitude } = position.coords;
              set({ guardianPosition: [latitude, longitude] });
            },
            (error) =>
              console.error("Failed to track guardian:", error.message),
            { enableHighAccuracy: true, maximumAge: 5000, timeout: 10000 }
          );
          set({ _guardianWatchId: watchId });
        } else if (!("geolocation" in navigator)) {
          console.error("Geolocation is not supported by this browser.");
        }
      },

      stopGuardianTracking: () => {
        const watchId = get()._guardianWatchId;
        if (watchId !== null) {
          navigator.geolocation.clearWatch(watchId);
          set({ _guardianWatchId: null });
        }
      },

      disconnectWs: () => {
        wsApi.disconnect();
        set({ _wsConnected: false, connectionStatus: false });
      },

      setDeviceConfig: (config) =>
        set((state) => ({
          deviceConfig: {
            ...config
          }
        }))
    }),
    {
      name: "realtime-storage",
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({
        deviceConfig: state.deviceConfig
      })
    }
  )
);

export const useUIStore = create(
  persist(
    (set) => ({
      isAnimationDone: false,
      setIsAnimationDone: () => set({ isAnimationDone: true }),

      error: null,
      setError: (msg) => set({ error: msg }),
      clearError: () => set({ error: null }),

      isMobileMenuOpen: false,
      setMobileMenuOpen: (open) => set({ isMobileMenuOpen: open })
    }),
    {
      name: "ui-storage",
      storage: createJSONStorage(() => sessionStorage)
    }
  )
);

export const useDevicesStore = create(
  persist(
    (set, get) => ({
      devices: [],
      selectedDevice: null,
      isLoading: false,
      lastFetchedAt: null,
      hasFetchedOnce: false,

      fetchDevices: async () => {
        const { isLoading } = get();
        if (isLoading) return;

        // if (!force && lastFetchedAt && Date.now() - lastFetchedAt < 30_000) {
        //   return;
        // }

        set({ isLoading: true });

        try {
          const response = await getDevices();
          if (!response.success) {
            throw new Error(response.message);
          }

          set({
            devices: response.data.devices,
            lastFetchedAt: Date.now(),
            hasFetchedOnce: true
          });
        } catch (error) {
          console.error("Failed to fetch devices:", error);
        } finally {
          set({ isLoading: false });
        }
      },

      upsertDevice: (updatedDevice) =>
        set((state) => {
          const exists = state.devices.some(
            (d) => d.deviceId === updatedDevice.deviceId
          );
          return {
            devices: exists
              ? state.devices.map((d) =>
                d.deviceId === updatedDevice.deviceId
                  ? { ...d, ...updatedDevice }
                  : d
              )
              : [...state.devices, updatedDevice]
          };
        }),

      removeDevice: (deviceId) =>
        set((state) => {
          const isSelected = state.selectedDevice?.deviceId === deviceId;
          return {
            devices: state.devices.filter((d) => d.deviceId !== deviceId),
            selectedDevice: isSelected ? null : state.selectedDevice
          };
        }),

      clearDevices: () =>
        set({
          devices: [],
          lastFetchedAt: null,
          hasFetchedOnce: false,
          selectedDevice: null
        }),

      setSelectedDevice: (device) => {
        set({ selectedDevice: device });

        const serial = device?.deviceSerialNumber;

        if (serial) {
          wsApi.emit("subscribe", { serial });
          console.log("Switching to serial:", serial);

          wsApi.emit("requestStatus", { serial });
          wsApi.emit("requestDeviceConfig", { serial });
        }
      }
    }),
    {
      name: "devices-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        devices: state.devices,
        selectedDevice: state.selectedDevice,
        lastFetchedAt: state.lastFetchedAt,
        hasFetchedOnce: state.hasFetchedOnce
      })
    }
  )
);

export const useGuardiansStore = create(
  persist(
    (set, get) => ({
      guardiansByDevice: [],
      pendingInvitesByDevice: [],

      guardians: (deviceId) =>
        get().guardiansByDevice.find((d) => d.deviceId === deviceId)
          ?.guardians || [],

      setGuardians: (deviceId, guardians) =>
        set((state) => {
          const existing = state.guardiansByDevice.find(
            (d) => d.deviceId === deviceId
          );
          if (existing) {
            return {
              guardiansByDevice: state.guardiansByDevice.map((d) =>
                d.deviceId === deviceId ? { ...d, guardians } : d
              )
            };
          } else {
            return {
              guardiansByDevice: [
                ...state.guardiansByDevice,
                { deviceId, guardians }
              ]
            };
          }
        }),

      upsertGuardian: (deviceId, guardian) =>
        set((state) => ({
          guardiansByDevice: state.guardiansByDevice.map((d) => {
            if (d.deviceId !== deviceId) return d;

            const exists = d.guardians.some(
              (g) => g.guardianId === guardian.guardianId
            );

            return {
              ...d,
              guardians: exists
                ? d.guardians.map((g) =>
                  g.guardianId === guardian.guardianId
                    ? { ...g, ...guardian }
                    : g
                )
                : [...d.guardians, guardian]
            };
          })
        })),

      currentGuardianRole: (guardianId) => {
        const guardian = get()
          .guardiansByDevice.flatMap((d) => d.guardians)
          .find((g) => g.guardianId === guardianId);

        return guardian ? guardian.role : "primary";
      },

      removeGuardian: (deviceId, guardianId) =>
        set((state) => ({
          guardiansByDevice: state.guardiansByDevice.map((d) =>
            d.deviceId === deviceId
              ? {
                ...d,
                guardians: d.guardians.filter(
                  (g) => g.guardianId !== guardianId
                )
              }
              : d
          )
        })),

      clearGuardians: (deviceId) =>
        set((state) => ({
          guardiansByDevice: state.guardiansByDevice.map((d) =>
            d.deviceId === deviceId
              ? { ...d, guardians: [], lastFetchedAt: null }
              : d
          )
        })),

      clearAllGuardians: () =>
        set({
          guardiansByDevice: []
        }),

      setPendingInvitesCount: (deviceId, count) =>
        set((state) => {
          const existing = state.pendingInvitesByDevice.find(
            (d) => d.deviceId === deviceId
          );
          if (existing) {
            return {
              pendingInvitesByDevice: state.pendingInvitesByDevice.map((d) =>
                d.deviceId === deviceId ? { ...d, count } : d
              )
            };
          } else {
            return {
              pendingInvitesByDevice: [
                ...state.pendingInvitesByDevice,
                { deviceId, count }
              ]
            };
          }
        }),

      pendingInvitesCount: (deviceId) =>
        (
          get().pendingInvitesByDevice.find((d) => d.deviceId === deviceId) ||
          {}
        ).count || 0,

      fetchGuardiansAndInvites: async () => {
        try {
          const response = await getAllDeviceGuardians();
          if (!response.success) {
            return { success: false, message: response.message };
          }

          const guardiansByDevice = response.data.guardiansByDevice.map(
            (d) => ({
              deviceId: d.deviceId,
              guardians: d.guardians || []
            })
          );
          set({ guardiansByDevice });

          const inviteRes = await getPendingInvites();
          if (inviteRes.success) {
            inviteRes.data.pendingInvitesCounts.forEach((item) => {
              get().setPendingInvitesCount(
                item.deviceId,
                item.pendingInvitesCount
              );
            });
          }

          return { success: true, data: guardiansByDevice };
        } catch (error) {
          console.error("Error fetching guardians and invites:", error);
          return { success: false, message: error.message || "Failed" };
        }
      }
    }),
    {
      name: "guardians-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        guardiansByDevice: state.guardiansByDevice,
        pendingInvitesByDevice: state.pendingInvitesByDevice
      })
    }
  )
);

export const useRouteStore = create(
  persist(
    (set, get) => ({
      destinationPos: null,
      routeCoords: [],
      completedRoute: [],
      remainingRoute: [],
      activeIndex: 0,

      setRoute: ({ destinationPos, routeCoords }) =>
        set({
          destinationPos,
          routeCoords,
          completedRoute: [],
          remainingRoute: routeCoords,
          activeIndex: 0
        }),

      updateProgress: ({ completedRoute, remainingRoute, activeIndex }) =>
        set({
          completedRoute,
          remainingRoute,
          activeIndex
        }),

      clearRoute: () =>
        set({
          destinationPos: null,
          routeCoords: [],
          completedRoute: [],
          remainingRoute: [],
          activeIndex: 0
        })
    }),
    {
      name: "route-storage",
      storage: createJSONStorage(() => localStorage)
    }
  )
);

export const useBluetoothStore = create(
  persist(
    (set, get) => ({
      devices: [],
      isScanning: false,
      isBluetoothProcessing: false,
      processingMac: null,
      lastUpdatedAt: null,
      _wsListenerAttached: false,

      // -----------------------------
      // Payload Sync
      // -----------------------------

      handleBluetoothPayload: (data) => {
        if (!data?.payload?.devices) return;

        const devices = data.payload.devices;

        set(() => ({
          devices,
          lastUpdatedAt: Date.now(),
          isScanning: false
        }));
      },

      // -----------------------------
      // Pair Status
      // -----------------------------

      handlePairStatus: (data) => {
        const { status, mac } = data || {};
        console.log("Pair status update:", data);

        if (!mac) return;

        if (status === "starting") {
          set({ isBluetoothProcessing: true, processingMac: mac });
          return;
        }

        if (status === "success") {
          set((state) => ({
            devices: state.devices.map((d) =>
              d.mac === mac
                ? { ...d, trusted: true, connected: true, paired: true }
                : d
            ),
            isBluetoothProcessing: false,
            processingMac: null
          }));
        }

        if (status === "failed") {
          set({ isBluetoothProcessing: false, processingMac: null });
        }
      },

      // -----------------------------
      // Unpair Status
      // -----------------------------

      handleUnpairStatus: (data) => {
        const { status, mac } = data || {};
        console.log("Unpair status update:", data);
        if (!mac) return;

        if (status === "starting") {
          set({ isBluetoothProcessing: true, processingMac: mac });
          return;
        }

        if (status === "success") {
          set((state) => ({
            devices: state.devices.filter((d) => d.mac !== mac),
            isBluetoothProcessing: false,
            processingMac: null
          }));

          return;
        }

        if (status === "failed") {
          set({ isBluetoothProcessing: false, processingMac: null });
        }
      },

      // -----------------------------
      // Connect Status
      // -----------------------------

      handleConnectStatus: (data) => {
        const { status, mac } = data || {};
        if (!mac) return;

        if (status === "starting") {
          set({ isBluetoothProcessing: true, processingMac: mac });
          return;
        }

        if (status === "success") {
          set((state) => ({
            devices: state.devices.map((d) =>
              d.mac === mac ? { ...d, connected: true, trusted: true } : d
            ),
            isBluetoothProcessing: false,
            processingMac: null
          }));
        }

        if (status === "failed") {
          set({ isBluetoothProcessing: false, processingMac: null });
        }
      },

      // -----------------------------
      // Disconnect Status
      // -----------------------------

      handleDisconnectStatus: (data) => {
        const { status, mac } = data || {};
        if (!mac) return;

        if (status === "starting") {
          set({ isBluetoothProcessing: true, processingMac: mac });
          return;
        }

        if (status === "success") {
          set((state) => ({
            devices: state.devices.map((d) =>
              d.mac === mac ? { ...d, connected: false } : d
            ),
            isBluetoothProcessing: false,
            processingMac: null
          }));
        }

        if (status === "failed") {
          set({ isBluetoothProcessing: false, processingMac: null });
        }
      },

      requestScan: () => {
        set({ isScanning: true });
        wsApi.emit("scanBluetooth");
      },

      pairDevice: (mac) => {
        if (!mac) return;
        if (get().isBluetoothProcessing) return;

        wsApi.emit("pairBluetooth", { mac });
      },

      unpairDevice: (mac) => {
        if (!mac) return;
        if (get().isBluetoothProcessing) return;

        wsApi.emit("unpairBluetooth", { mac });
      },

      connectDevice: (mac) => {
        if (!mac) return;
        if (get().isBluetoothProcessing) return;

        wsApi.emit("connectBluetooth", { mac });
      },

      disconnectDevice: (mac) => {
        if (!mac) return;
        if (get().isBluetoothProcessing) return;

        wsApi.emit("disconnectBluetooth", { mac });
      },

      clearDevices: () =>
        set({
          devices: [],
          lastUpdatedAt: null
        }),

      getDeviceByMac: (mac) => get().devices.find((d) => d.mac === mac),

      getTrustedDevices: () => get().devices.filter((d) => d.trusted)
    }),
    {
      name: "bluetooth-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        lastUpdatedAt: state.lastUpdatedAt
      })
    }
  )
);
