import {
  getAccountHistory,
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
      _guardianWatchId: null,
      emergency: false,
      fall: false,
      canePosition: null,
      guardianPosition: null,
      deviceConfig: {},
      gps: {
        status: 0,
        sats: 0,
        fix: false,
        hdop: null,
        ready: false,
        lat: null,
        lng: null
      },
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
        wsApi.off("gps");
        wsApi.off("connect");
        wsApi.off("disconnect");
        wsApi.off("guardianPresence");
        wsApi.off("guardianPresenceSnapshot");
        wsApi.off("piStatus");
        wsApi.off("deviceConfig");
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
          set({ _wsConnected: true });
          const user = useUserStore.getState().user;
          if (user?.guardianId) {
            wsApi.emit("guardian:join", {
              guardianId: user.guardianId
            });
          }

          wsApi.emit("requestGuardianPresence");
        });

        wsApi.on("disconnect", () => {
          console.log("WebSocket disconnected");
          set({ _wsConnected: false, connectionStatus: false });
          clearTimeout(heartbeatTimeout);

          setTimeout(() => {
            get().connectWs();
          }, 5000);
        });

        wsApi.on("guardianPresence", (data) => {
          const payload = data?.payload || data;
          useGuardiansStore
            .getState()
            .updateGuardianPresence(payload.guardianId, payload.status);
        });

        wsApi.on("guardianPresenceSnapshot", (payload) => {
          const onlineIds = new Set(
            (payload?.onlineGuardianIds || []).map(Number)
          );

          useGuardiansStore.getState().setGuardianPresenceSnapshot(onlineIds);
        });

        wsApi.on("status", (data) => {
          console.log(data);
          set({
            connectionStatus: data.status === "online",
            emergency: data.emergency,
            fall: data.fall === true || data.fall === "true",
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

        wsApi.on("gps", (data) => {
          const payload = data?.payload || data;

          const lat = payload?.lat;
          const lng = payload?.lng;

          set((state) => ({
            canePosition:
              lat != null && lng != null ? [lat, lng] : state.canePosition,
            gps: {
              status: Number(payload?.status || 0),
              sats: Number(payload?.sats || 0),
              fix: Boolean(payload?.fix),
              hdop:
                payload?.hdop != null ? Number(payload.hdop).toFixed(2) : null,
              ready: Boolean(payload?.ready),
              lat: lat ?? null,
              lng: lng ?? null
            }
          }));

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

      setGuardianLocation: (loc) => set({ guardianPosition: loc }),

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
          set({
            _guardianWatchId: null,
            guardianPosition: null
          });
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
          guardiansByDevice: [],
          pendingInvitesByDevice: []
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

          const existing = get().guardiansByDevice;

          const guardiansByDevice = response.data.guardiansByDevice.map((d) => {
            const existingGroup = existing.find(
              (group) => Number(group.deviceId) === Number(d.deviceId)
            );

            return {
              deviceId: d.deviceId,
              guardians: (d.guardians || []).map((guardian) => {
                const existingGuardian = existingGroup?.guardians?.find(
                  (g) => Number(g.guardianId) === Number(guardian.guardianId)
                );

                return {
                  ...guardian,
                  isOnline: existingGuardian?.isOnline ?? false
                };
              })
            };
          });

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
      },

      updateGuardianPresence: (guardianId, isOnline) =>
        set((state) => ({
          guardiansByDevice: state.guardiansByDevice.map((group) => ({
            ...group,
            guardians: group.guardians.map((guardian) =>
              Number(guardian.guardianId) === Number(guardianId)
                ? { ...guardian, isOnline }
                : guardian
            )
          }))
        })),
      setGuardianPresenceSnapshot: (onlineIds) =>
        set((state) => ({
          guardiansByDevice: state.guardiansByDevice.map((group) => ({
            ...group,
            guardians: group.guardians.map((guardian) => ({
              ...guardian,
              isOnline: onlineIds.has(Number(guardian.guardianId))
            }))
          }))
        }))
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

      handleBluetoothPayload: (data) => {
        if (!data?.payload?.devices) {
          set({
            devices: [],
            lastUpdatedAt: Date.now()
          });
          return;
        }

        const incomingDevices = data.payload.devices;

        const normalizedDevices = incomingDevices
          .filter((device) => device?.mac)
          .map((device) => ({
            mac: device.mac,
            deviceId: device.deviceId ?? device.mac,
            name: device.name ?? "Unknown",
            paired: device.paired ?? false,
            connected: device.connected ?? false,
            trusted: device.trusted ?? false,
            type: device.type ?? "Unknown",
            icon: device.icon ?? "",
            rssi: device.rssi != null ? device.rssi : null,
            batteryLevel:
              device.batteryLevel != null ? device.batteryLevel : null,
            lastSeen: device.lastSeen ?? null
          }));

        const uniqueMap = new Map();

        for (const device of normalizedDevices) {
          uniqueMap.set(device.mac, device);
        }

        const devices = Array.from(uniqueMap.values()).sort((a, b) => {
          const aPriority = a.paired || a.connected ? 0 : 1;
          const bPriority = b.paired || b.connected ? 0 : 1;

          if (aPriority !== bPriority) return aPriority - bPriority;

          const aRssi = a.rssi ?? -1000;
          const bRssi = b.rssi ?? -1000;

          return bRssi - aRssi;
        });

        set({
          devices,
          lastUpdatedAt: Date.now()
        });
      },

      handleScanStatus: (data) => {
        const payload = data?.payload ?? data;
        const status = payload?.status;

        if (status === "started") {
          set({ isScanning: true });
          return;
        }

        if (status === "completed") {
          set({ isScanning: false });
          return;
        }

        if (status === "error") {
          set({ isScanning: false });
          return;
        }

        if (status === "scanning_in_progress") {
          set({ isScanning: true });
        }
      },

      handlePairStatus: (data) => {
        const payload = data?.payload ?? data;
        const { status, mac } = payload || {};
        if (!mac) return;

        if (status === "starting") {
          set({ isBluetoothProcessing: true, processingMac: mac });
          return;
        }

        if (status === "success") {
          set((state) => ({
            devices: state.devices.map((d) =>
              d.mac === mac
                ? {
                    ...d,
                    paired: true,
                    connected: true,
                    trusted: true
                  }
                : d
            ),
            isBluetoothProcessing: false,
            processingMac: null
          }));
          return;
        }

        if (status === "failed") {
          set({ isBluetoothProcessing: false, processingMac: null });
        }
      },

      handleConnectStatus: (data) => {
        const payload = data?.payload ?? data;
        const { status, mac } = payload || {};
        if (!mac) return;

        if (status === "starting") {
          set({ isBluetoothProcessing: true, processingMac: mac });
          return;
        }

        if (status === "success") {
          set((state) => ({
            devices: state.devices.map((d) =>
              d.mac === mac
                ? {
                    ...d,
                    paired: true,
                    connected: true,
                    trusted: true
                  }
                : d
            ),
            isBluetoothProcessing: false,
            processingMac: null
          }));
          return;
        }

        if (status === "failed") {
          set({ isBluetoothProcessing: false, processingMac: null });
        }
      },

      handleDisconnectStatus: (data) => {
        const payload = data?.payload ?? data;
        const { status, mac } = payload || {};
        if (!mac) return;

        if (status === "starting") {
          set({ isBluetoothProcessing: true, processingMac: mac });
          return;
        }

        if (status === "success") {
          set((state) => ({
            devices: state.devices.map((d) =>
              d.mac === mac
                ? {
                    ...d,
                    paired: true,
                    connected: false
                  }
                : d
            ),
            isBluetoothProcessing: false,
            processingMac: null
          }));
          return;
        }

        if (status === "failed") {
          set({ isBluetoothProcessing: false, processingMac: null });
        }
      },

      handleUnpairStatus: (data) => {
        const payload = data?.payload ?? data;
        const { status, mac } = payload || {};
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

      forgetDevice: (mac) => {
        if (!mac) return;

        set((state) => ({
          devices: state.devices.filter((d) => d.mac !== mac)
        }));
      },

      requestScan: () => {
        set({ isScanning: true });
        wsApi.emit("scanBluetooth");
      },

      requestBluetoothState: () => {
        wsApi.emit("getBluetoothState");
      },

      refreshBluetoothDevices: () => {
        const { requestBluetoothState, requestScan } = get();
        requestBluetoothState();
        requestScan();
      },

      pairDevice: (mac) => {
        if (!mac || get().isBluetoothProcessing) return;
        wsApi.emit("pairBluetooth", { mac });
      },

      unpairDevice: (mac) => {
        if (!mac || get().isBluetoothProcessing) return;
        wsApi.emit("unpairBluetooth", { mac });
      },

      connectDevice: (mac) => {
        if (!mac || get().isBluetoothProcessing) return;
        wsApi.emit("connectBluetooth", { mac });
      },

      disconnectDevice: (mac) => {
        if (!mac || get().isBluetoothProcessing) return;
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

export const useActivityReportsStore = create(
  persist(
    (set, get) => ({
      history: [],
      isLoading: false,
      isRefreshing: false,
      error: null,
      lastFetchedAt: null,
      hasHydrated: false,

      fetchHistory: async () => {
        const { history } = get();
        const hasCache = Array.isArray(history) && history.length > 0;

        // if cache exists -> refresh silently (keeps UI)
        // else -> show loading
        await get().fetch({ silent: hasCache });
      },
      fetch: async ({ silent } = { silent: false }) => {
        const { isLoading, isRefreshing } = get();

        // block only if the same mode is already running
        if (!silent && isLoading) return;
        if (silent && isRefreshing) return;

        if (silent) set({ isRefreshing: true, error: null });
        else set({ isLoading: true, error: null });

        try {
          const response = await getAccountHistory();
          if (!response?.success) throw new Error("Failed");

          const history =
            response.data?.history || response.data?.data?.history || [];

          set({
            history,
            lastFetchedAt: Date.now(),
            error: null
          });
        } catch (e) {
          set({ error: "Failed to load activity history" });
        } finally {
          if (silent) set({ isRefreshing: false });
          else set({ isLoading: false });
        }
      },

      clearHistory: () =>
        set({
          history: [],
          isLoading: false,
          isRefreshing: false,
          error: null,
          lastFetchedAt: null
        })
    }),
    {
      name: "activity-reports-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        history: state.history,
        lastFetchedAt: state.lastFetchedAt
      }),
      onRehydrateStorage: () => (state) => {
        state?.setState?.({ hasHydrated: true });
      }
    }
  )
);

export const useSettingsStore = create(
  persist(
    (set, get) => ({
      settings: {
        notifications: {
          push: true,
          email: true,
          sms: false,
          emergency: true
        },
        privacy: {
          location: true,
          twoFactor: true,
          analytics: false
        },
        demoMode: false
      },

      setSettings: (updater) =>
        set((state) => ({
          settings:
            typeof updater === "function"
              ? updater(state.settings)
              : { ...state.settings, ...updater }
        })),

      updateNotifications: (updates) =>
        set((state) => ({
          settings: {
            ...state.settings,
            notifications: {
              ...state.settings.notifications,
              ...updates
            }
          }
        })),

      updatePrivacy: (updates) =>
        set((state) => ({
          settings: {
            ...state.settings,
            privacy: {
              ...state.settings.privacy,
              ...updates
            }
          }
        })),

      toggleNotification: (key) =>
        set((state) => ({
          settings: {
            ...state.settings,
            notifications: {
              ...state.settings.notifications,
              [key]: !state.settings.notifications[key]
            }
          }
        })),

      togglePrivacy: (key) =>
        set((state) => ({
          settings: {
            ...state.settings,
            privacy: {
              ...state.settings.privacy,
              [key]: !state.settings.privacy[key]
            }
          }
        })),

      setDemoMode: (value) => {
        set((state) => ({
          settings: {
            ...state.settings,
            demoMode: value
          }
        }));

        wsApi.emit("updateDemoMode", {
          enabled: value
        });
      },

      toggleDemoMode: () => {
        const nextValue = !get().settings.demoMode;

        set((state) => ({
          settings: {
            ...state.settings,
            demoMode: nextValue
          }
        }));

        wsApi.emit("updateDemoMode", {
          enabled: nextValue
        });
      },

      clearSettings: () =>
        set({
          settings: {
            notifications: {
              push: true,
              email: true,
              sms: false,
              emergency: true
            },
            privacy: {
              location: true,
              twoFactor: true,
              analytics: false
            },
            demoMode: false
          }
        }),

      getSettings: () => get().settings,
      getNotifications: () => get().settings.notifications,
      getPrivacy: () => get().settings.privacy,
      isDemoMode: () => get().settings.demoMode
    }),
    {
      name: "settings-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ settings: state.settings })
    }
  )
);
