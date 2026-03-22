import {
  getAccountHistory,
  getAllDeviceGuardians,
  getDeviceLog,
  getDevices,
  getLastLocation,
  getPendingInvites
} from "@/api/backendService";
import {
  getGuardianSettings,
  updateGuardianSettings
} from "@/api/settingsService";
import { getLocationByCoords } from "@/api/locationsApi";
import { wsApi } from "@/api/ws-api";
import {
  mapActivityHistoryToNotifications,
  mapDeviceLogsToNotifications,
  normalizeDeviceLogs
} from "@/utils/deviceLogs";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { useRouteStore } from "./useRouteStore";

const ensureSerialPrefix = (serial) => {
  if (!serial) return null;

  const normalized = String(serial).trim();
  if (!normalized) return null;

  const withoutPrefix = normalized.replace(/^SC-?/i, "");
  return `SC-${withoutPrefix}`;
};

function buildGuardianResolver(deviceId) {
  if (!deviceId) return null;

  const guardians =
    useGuardiansStore.getState?.().guardians(deviceId) || [];
  const currentUser = useUserStore.getState?.().user;

  const lookup = new Map();

  guardians.forEach((guardian) => {
    if (guardian?.guardianId == null) return;
    const id = Number(guardian.guardianId);
    if (!Number.isFinite(id)) return;
    lookup.set(id, guardian);
  });

  if (currentUser?.guardianId != null) {
    const id = Number(currentUser.guardianId);
    if (Number.isFinite(id) && !lookup.has(id)) {
      lookup.set(id, currentUser);
    }
  }

  if (lookup.size === 0) return null;

  return (guardianId) => {
    const id = Number(guardianId);
    if (!Number.isFinite(id)) return null;
    return lookup.get(id) || null;
  };
}

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
      _guardianWatchId: null,
      emergency: false,
      fall: false,
      lastKnownCanePosition: null,
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
        obstacleDetectionStatus: false,
        edgeDetectionStatus: false,
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
        wsApi.off("configSaved");
        wsApi.off("deviceConfig");
        wsApi.off("emergencyTriggered");
        wsApi.off("fallDetected");
        wsApi.off("routeResponse");
        wsApi.off("destinationReached");
        wsApi.off("destinationCleared");
        wsApi.off("routeError");
        wsApi.connect();

        let heartbeatTimeout;
        const toBool = (value) => value === true || value === "true";
        const locationLabelCache = new Map();

        const resolveRealtimeLocationLabel = async (lat, lng) => {
          if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;

          const cacheKey = `${lat.toFixed(5)},${lng.toFixed(5)}`;
          if (locationLabelCache.has(cacheKey)) {
            return locationLabelCache.get(cacheKey);
          }

          try {
            const res = await getLocationByCoords(lat, lng);
            const features = res?.features || res?.data?.features;
            const feature = Array.isArray(features) ? features[0] : null;
            const geocoding = feature?.properties?.geocoding || feature?.properties;
            const label =
              geocoding?.label ||
              geocoding?.name ||
              geocoding?.street ||
              geocoding?.city ||
              feature?.properties?.name ||
              null;

            const cleaned = typeof label === "string" ? label.trim() : null;
            if (cleaned) {
              locationLabelCache.set(cacheKey, cleaned);
            }

            return cleaned;
          } catch (error) {
            console.error("Failed to resolve realtime location label:", error);
            return null;
          }
        };


        const normalizeIncomingConfig = (rawConfig) => {
          if (!rawConfig || typeof rawConfig !== "object") return {};

          if (Array.isArray(rawConfig.components)) {
            return Object.fromEntries(
              rawConfig.components
                .filter((component) => component?.codeName)
                .map((component) => [
                  component.codeName,
                  {
                    enabled: component.enabled,
                    config: component.config || {}
                  }
                ])
            );
          }

          return Object.fromEntries(
            Object.entries(rawConfig).map(([codeName, component]) => [
              codeName,
              {
                enabled: component?.enabled,
                config: component?.config || {}
              }
            ])
          );
        };

        const resetHeartbeat = () => {
          if (heartbeatTimeout) clearTimeout(heartbeatTimeout);
          heartbeatTimeout = setTimeout(() => {
            get().resetRealtimeState();
          }, 15000);
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
          wsApi.emit("requestStatus");
          // wsApi.emit("requestDeviceConfig");

          const selected = useDevicesStore.getState().selectedDevice;
          if (!get().lastKnownCanePosition && selected?.deviceSerialNumber) {
            get().loadLastLocation(selected.deviceSerialNumber);
          }
        });

        wsApi.on("disconnect", () => {
          console.log("WebSocket disconnected");
          set({ _wsConnected: false });
          clearTimeout(heartbeatTimeout);
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

        const refreshDeviceLogs = () => {
          const selectedDevice = useDevicesStore.getState().selectedDevice;
          const deviceId = selectedDevice?.deviceId;

          if (!deviceId) return;

          useDeviceLogsStore.getState().fetchDeviceLogs(deviceId, {
            force: true,
            silent: true,
            selectedDevice
          });
        };

        const pushRealtimeAlertLog = async (type, payload = {}) => {
          const selectedDevice = useDevicesStore.getState().selectedDevice;
          const deviceId = selectedDevice?.deviceId;
          if (!deviceId) return;

          const nowIso = new Date().toISOString();
          const lat = payload?.lat ?? payload?.latitude ?? null;
          const lng = payload?.lng ?? payload?.lon ?? payload?.longitude ?? null;
          const locationLabel =
            payload?.location ||
            payload?.locationLabel ||
            payload?.address ||
            payload?.placeName ||
            (await resolveRealtimeLocationLabel(
              Number(lat ?? NaN),
              Number(lng ?? NaN)
            )) ||
            null;

          const rawLog = {
            log_id: `realtime-${type}-${Date.now()}`,
            activity_type: type,
            status: type,
            created_at: nowIso,
            metadata: {
              payload: {
                lat,
                lng,
                location: locationLabel,
                locationLabel,
                address: payload?.address || null,
                placeName: payload?.placeName || null,
                source: payload?.source || null,
                timestamp: payload?.timestamp || Date.now()
              },
              location: locationLabel ? { label: locationLabel } : undefined
            }
          };

          const guardianResolver = deviceId
            ? buildGuardianResolver(deviceId)
            : null;

          const normalized = normalizeDeviceLogs(
            [rawLog],
            selectedDevice,
            { guardianResolver }
          );
          if (!normalized.length) return;

          const logEntry = normalized[0];

          useDeviceLogsStore.setState((state) => {
            const existing = state.logsByDevice?.[deviceId] || [];
            return {
              logsByDevice: {
                ...state.logsByDevice,
                [deviceId]: [logEntry, ...existing]
              },
              lastFetchedAtByDevice: {
                ...state.lastFetchedAtByDevice,
                [deviceId]: Date.now()
              }
            };
          });
        };

        wsApi.on("status", (data) => {
          const emergency = toBool(data.emergency);

          set((state) => ({
            emergency,
            fall: emergency ? false : toBool(data.fall),
            componentHealth: {
              ...state.componentHealth,
              obstacleDetectionStatus: toBool(data.obstacleDetectionStatus),
              edgeDetectionStatus: toBool(data.edgeDetectionStatus),
              accelerometerStatus: toBool(data.accelerometerStatus),
              esp32Status: data.esp32Status === "online"
            }
          }));
          resetHeartbeat();
        });

        wsApi.on("piStatus", (data) => {
          const payload = data?.payload || data;
          const isPiAlive = payload.alive === true || payload.alive === "true";

          set((state) => ({
            componentHealth: {
              ...state.componentHealth,
              raspberryPiStatus: isPiAlive
            }
          }));

          if (!isPiAlive) {
            useBluetoothStore.setState({ isScanning: false });
          }

          resetHeartbeat();
        });

        wsApi.on("gps", (data) => {
          const payload = data?.payload || data;

          const lat = payload?.lat;
          const lng = payload?.lng;

          set((state) => ({
            componentHealth: {
              ...state.componentHealth,
              gpsStatus: true
            },
            lastKnownCanePosition:
              lat != null && lng != null
                ? [lat, lng]
                : state.lastKnownCanePosition,
            gps: {
              status: Number(payload?.status || 0),
              sats: Number(payload?.sats || 0),
              fix: toBool(payload?.fix),
              hdop:
                payload?.hdop != null ? Number(payload.hdop).toFixed(2) : null,
              ready: toBool(payload?.ready),
              lat: lat ?? null,
              lng: lng ?? null
            }
          }));

          resetHeartbeat();
        });

        wsApi.on("deviceConfig", (data) => {
          const payload = data?.payload || data;
          if (!payload) return;

          const normalizedConfig = normalizeIncomingConfig(payload);

          set({
            deviceConfig: normalizedConfig
          });
        });

        wsApi.on("configSaved", (data) => {
          const payload = data?.payload || data;
          if (!payload) return;

          if (payload.success === false) {
            console.error("Device rejected config:", payload.error);
            return;
          }

          if (payload.config) {
            set({
              deviceConfig: normalizeIncomingConfig(payload.config)
            });
          }

          resetHeartbeat();
        });

        wsApi.on("emergencyTriggered", (data) => {
          const payload = data?.payload || data || {};

          const lat = payload?.lat;
          const lng = payload?.lng;

          set((state) => ({
            emergency: true,
            fall: false,
            lastKnownCanePosition:
              lat != null && lng != null
                ? [Number(lat), Number(lng)]
                : state.lastKnownCanePosition
          }));

          pushRealtimeAlertLog("EMERGENCY", payload).then(() => {
            setTimeout(() => refreshDeviceLogs(), 400);
          });
        });

        wsApi.on("fallDetected", (data) => {
          const payload = data?.payload || data || {};

          const lat = payload?.lat;
          const lng = payload?.lng;

          set((state) => ({
            fall: true,
            lastKnownCanePosition:
              lat != null && lng != null
                ? [Number(lat), Number(lng)]
                : state.lastKnownCanePosition
          }));

          pushRealtimeAlertLog("FALL", payload).then(() => {
            setTimeout(() => refreshDeviceLogs(), 400);
          });
        });

        // ROUTE RELATED EVENTS
        const refreshSharedRoute = async () => {
          const selectedDevice = useDevicesStore.getState().selectedDevice;
          const deviceId = selectedDevice?.deviceId;

          if (!deviceId) return;

          await useRouteStore.getState().fetchSharedRoute(deviceId);
        };

        wsApi.on("routeResponse", async () => {
          await refreshSharedRoute();
          refreshDeviceLogs();
        });

        wsApi.on("destinationReached", async () => {
          await refreshSharedRoute();
          refreshDeviceLogs();
        });

        wsApi.on("destinationCleared", async () => {
          await refreshSharedRoute();
          refreshDeviceLogs();
        });

        wsApi.on("routeError", async () => {
          await refreshSharedRoute();
          refreshDeviceLogs();
        });


      },

      setGuardianLocation: (loc) => set({ guardianPosition: loc }),

      startGuardianTracking: () =>
        new Promise((resolve) => {
          if (!("geolocation" in navigator)) {
            console.error("Geolocation is not supported by this browser.");
            resolve({
              success: false,
              reason: "unsupported"
            });
            return;
          }

          const existingWatchId = get()._guardianWatchId;
          if (existingWatchId !== null) {
            resolve({
              success: true,
              reason: "already-tracking"
            });
            return;
          }

          navigator.geolocation.getCurrentPosition(
            (position) => {
              const { latitude, longitude } = position.coords;
              const watchId = navigator.geolocation.watchPosition(
                (trackedPosition) => {
                  const {
                    latitude: trackedLatitude,
                    longitude: trackedLongitude
                  } = trackedPosition.coords;

                  set({
                    guardianPosition: [trackedLatitude, trackedLongitude]
                  });
                },
                (error) => {
                  console.error("Failed to track guardian:", error.message);
                  navigator.geolocation.clearWatch(watchId);
                  set((state) =>
                    state._guardianWatchId === watchId
                      ? {
                        _guardianWatchId: null,
                        guardianPosition: null
                      }
                      : state
                  );
                },
                { enableHighAccuracy: true, maximumAge: 5000, timeout: 10000 }
              );

              set({
                _guardianWatchId: watchId,
                guardianPosition: [latitude, longitude]
              });

              resolve({
                success: true,
                coords: [latitude, longitude]
              });
            },
            (error) => {
              console.error(
                "Failed to start guardian tracking:",
                error.message
              );
              set({
                _guardianWatchId: null,
                guardianPosition: null
              });
              resolve({
                success: false,
                reason: error?.code,
                error
              });
            },
            { enableHighAccuracy: true, maximumAge: 5000, timeout: 10000 }
          );
        }),

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

      setLastKnownCanePosition: (coords) =>
        set({ lastKnownCanePosition: coords }),

      loadLastLocation: async (deviceSerial) => {
        const serial = ensureSerialPrefix(deviceSerial);
        if (!serial) return null;

        try {
          const response = await getLastLocation(serial);
          if (!response?.success) return null;

          const payload = response?.data?.lastLocation || response?.data || null;
          const lat = payload?.lat != null ? Number(payload.lat) : null;
          const lng = payload?.lng != null ? Number(payload.lng) : null;

          if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
            return null;
          }

          const coords = [lat, lng];
          set({ lastKnownCanePosition: coords });
          return coords;
        } catch (error) {
          console.error("Failed to load last location:", error);
          return null;
        }
      },

      disconnectWs: () => {
        wsApi.disconnect();
        set({ _wsConnected: false });
      },
      resetRealtimeState: () =>
        set((state) => {
          const isDemoMode = useSettingsStore.getState().settings.demoMode;

          return {
            ...state,
            emergency: false,
            fall: false,
            lastKnownCanePosition: state.lastKnownCanePosition,
            deviceConfig: {},
            gps: isDemoMode
              ? state.gps
              : {
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
              obstacleDetectionStatus: false,
              edgeDetectionStatus: false,
              accelerometerStatus: false,
              esp32Status: false,
              raspberryPiStatus: false
            }
          };
        }),
      setDeviceConfig: (config) =>
        set(() => ({
          deviceConfig: {
            ...config
          }
        }))
    }),
    {
      name: "realtime-storage",
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({
        deviceConfig: state.deviceConfig,
        lastKnownCanePosition: state.lastKnownCanePosition
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

      setSelectedDevice: async (device) => {
        const prev = get().selectedDevice;
        const nextSerial = device?.deviceSerialNumber;
        const prevSerial = prev?.deviceSerialNumber;

        set({ selectedDevice: device });

        if (prevSerial !== nextSerial) {
          useRealtimeStore.getState().resetRealtimeState();
          useRouteStore.getState().clearRoute();
          useActivityReportsStore
            .getState()
            .fetchHistory({ deviceId: device?.deviceId ?? null });
        }

        if (nextSerial) {
          wsApi.emit("subscribe", { serial: nextSerial });
          wsApi.emit("requestStatus", { serial: nextSerial });
          wsApi.emit("requestDeviceConfig", { serial: nextSerial });


          useRealtimeStore.getState().loadLastLocation(nextSerial);

          if (device?.deviceId) {
            await useRouteStore.getState().fetchSharedRoute(device.deviceId);
          }
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
      historyByDevice: {},
      isLoading: false,
      isRefreshing: false,
      error: null,
      lastFetchedAt: null,
      lastFetchedAtByDevice: {},
      hasHydrated: false,

      fetchHistory: async ({ deviceId = null, silent } = {}) => {
        const cache = deviceId
          ? get().historyByDevice?.[deviceId] || []
          : get().history;

        const hasCache = Array.isArray(cache) && cache.length > 0;

        await get().fetch({ deviceId, silent: silent ?? hasCache });
      },
      fetch: async ({ deviceId = null, silent } = { silent: false }) => {
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

          const scopedHistory = deviceId
            ? history.filter(
              (item) =>
                Number(item?.device_id ?? item?.deviceId) ===
                Number(deviceId)
            )
            : history;

          set({
            history: scopedHistory,
            historyByDevice: deviceId
              ? {
                ...get().historyByDevice,
                [deviceId]: scopedHistory
              }
              : get().historyByDevice,
            lastFetchedAt: Date.now(),
            lastFetchedAtByDevice: deviceId
              ? {
                ...get().lastFetchedAtByDevice,
                [deviceId]: Date.now()
              }
              : get().lastFetchedAtByDevice,
            error: null
          });
        } catch {
          set({ error: "Failed to load activity history" });
        } finally {
          if (silent) set({ isRefreshing: false });
          else set({ isLoading: false });
        }
      },

      clearHistory: () =>
        set({
          history: [],
          historyByDevice: {},
          isLoading: false,
          isRefreshing: false,
          error: null,
          lastFetchedAt: null,
          lastFetchedAtByDevice: {}
        })
    }),
    {
      name: "activity-reports-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        history: state.history,
        historyByDevice: state.historyByDevice,
        lastFetchedAt: state.lastFetchedAt,
        lastFetchedAtByDevice: state.lastFetchedAtByDevice
      }),
      onRehydrateStorage: () => (state) => {
        state?.setState?.({ hasHydrated: true });
      }
    }
  )
);

const routeLabelCache = new Map();

const resolveLocationLabelByCoords = async (lat, lng) => {
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;

  const cacheKey = `${lat.toFixed(5)},${lng.toFixed(5)}`;
  if (routeLabelCache.has(cacheKey)) {
    return routeLabelCache.get(cacheKey);
  }

  try {
    const res = await getLocationByCoords(lat, lng);
    const features = res?.features || res?.data?.features;
    const feature = Array.isArray(features) ? features[0] : null;
    const geocoding = feature?.properties?.geocoding || feature?.properties;

    const label =
      geocoding?.label ||
      geocoding?.name ||
      geocoding?.street ||
      geocoding?.city ||
      feature?.properties?.name ||
      null;

    const cleaned = typeof label === "string" ? label.trim() : null;

    if (cleaned) {
      routeLabelCache.set(cacheKey, cleaned);
    }

    return cleaned;
  } catch (error) {
    console.error("Failed to reverse geocode route label:", error);
    return null;
  }
};

const enrichRouteLabels = async (logs = []) => {
  const enriched = await Promise.all(
    logs.map(async (log) => {
      if (log.action !== "REACH_DESTINATION" && log.action !== "SET_ROUTE") {
        return log;
      }

      const next = { ...log };

      if (
        Array.isArray(log.originCoords) &&
        log.originCoords.length === 2 &&
        (!log.location || log.location === "No origin available" || /^\-?\d+\.\d+,\s*\-?\d+\.\d+$/.test(log.location))
      ) {
        const label = await resolveLocationLabelByCoords(
          log.originCoords[0],
          log.originCoords[1]
        );
        if (label) {
          next.location = label;
          next.lastLocation = label;
        }
      }

      if (
        Array.isArray(log.destinationCoords) &&
        log.destinationCoords.length === 2 &&
        (!log.destination ||
          log.destination === "No destination available" ||
          /^\-?\d+\.\d+,\s*\-?\d+\.\d+$/.test(log.destination))
      ) {
        const label = await resolveLocationLabelByCoords(
          log.destinationCoords[0],
          log.destinationCoords[1]
        );
        if (label) {
          next.destination = label;
        }
      }

      return next;
    })
  );

  return enriched;
};

export const useDeviceLogsStore = create(
  persist(
    (set, get) => ({
      logsByDevice: {},
      isLoadingByDevice: {},
      isRefreshingByDevice: {},
      errorsByDevice: {},
      lastFetchedAtByDevice: {},
      lastRequestedAtByDevice: {},
      blockedUntilByDevice: {},

      fetchDeviceLogs: async (deviceId, options = {}) => {
        if (!deviceId) return;

        const {
          force = false,
          silent = undefined,
          selectedDevice = null
        } = options;
        const cachedLogs = get().logsByDevice?.[deviceId] || [];
        const hasCache = Array.isArray(cachedLogs) && cachedLogs.length > 0;
        const lastRequestedAt = get().lastRequestedAtByDevice?.[deviceId] || 0;
        const blockedUntil = get().blockedUntilByDevice?.[deviceId] || 0;
        const now = Date.now();

        if (!force) {
          if (blockedUntil > now) return;
          if (now - lastRequestedAt < 15_000) return;
        }

        await get().fetch({
          deviceId,
          selectedDevice,
          silent: silent ?? hasCache
        });
      },

      fetch: async ({ deviceId, selectedDevice = null, silent = false }) => {
        if (!deviceId) return;

        const { isLoadingByDevice, isRefreshingByDevice } = get();

        if (!silent && isLoadingByDevice?.[deviceId]) return;
        if (silent && isRefreshingByDevice?.[deviceId]) return;

        const resolvedDevice =
          selectedDevice ||
          useDevicesStore
            .getState()
            .devices.find(
              (device) => Number(device.deviceId) === Number(deviceId)
            ) ||
          null;

        if (silent) {
          set((state) => ({
            isRefreshingByDevice: {
              ...state.isRefreshingByDevice,
              [deviceId]: true
            },
            errorsByDevice: {
              ...state.errorsByDevice,
              [deviceId]: null
            },
            lastRequestedAtByDevice: {
              ...state.lastRequestedAtByDevice,
              [deviceId]: Date.now()
            }
          }));
        } else {
          set((state) => ({
            isLoadingByDevice: {
              ...state.isLoadingByDevice,
              [deviceId]: true
            },
            errorsByDevice: {
              ...state.errorsByDevice,
              [deviceId]: null
            },
            lastRequestedAtByDevice: {
              ...state.lastRequestedAtByDevice,
              [deviceId]: Date.now()
            }
          }));
        }

        try {
          const serialSource =
            resolvedDevice?.deviceSerialNumber ||
            resolvedDevice?.device_serial_number ||
            (typeof deviceId === "string" ? deviceId : null);

          const deviceSerial = ensureSerialPrefix(serialSource);

          if (!deviceSerial) {
            throw new Error("Device serial unavailable for log request");
          }

          const response = await getDeviceLog(deviceSerial);
          if (response?.success === false) throw new Error("Failed");

          const responseSerial = ensureSerialPrefix(
            response?.data?.deviceSerialNumber || response?.deviceSerialNumber
          );

          const effectiveSerial = responseSerial || deviceSerial;

          const rawLogs =
            response?.data?.logs ||
            response?.data?.deviceLogs ||
            response?.data?.data?.logs ||
            response?.logs ||
            response?.deviceLogs ||
            (Array.isArray(response) ? response : []);

          const normalizedDevice = resolvedDevice
            ? { ...resolvedDevice, deviceSerialNumber: effectiveSerial }
            : { deviceSerialNumber: effectiveSerial };

          const guardianResolver = buildGuardianResolver(deviceId);

          const normalizedLogs = await enrichRouteLabels(
            normalizeDeviceLogs(rawLogs, normalizedDevice, {
              guardianResolver
            })
          );

          set((state) => ({
            logsByDevice: {
              ...state.logsByDevice,
              [deviceId]: normalizedLogs
            },
            lastFetchedAtByDevice: {
              ...state.lastFetchedAtByDevice,
              [deviceId]: Date.now()
            },
            errorsByDevice: {
              ...state.errorsByDevice,
              [deviceId]: null
            },
            blockedUntilByDevice: {
              ...state.blockedUntilByDevice,
              [deviceId]: 0
            }
          }));
        } catch (error) {
          const statusCode = error?.response?.status;
          const retryDelay = statusCode === 404 ? 5 * 60 * 1000 : 30 * 1000;

          set((state) => ({
            errorsByDevice: {
              ...state.errorsByDevice,
              [deviceId]:
                statusCode === 404
                  ? "Device logs endpoint is not available."
                  : "Failed to load device logs"
            },
            blockedUntilByDevice: {
              ...state.blockedUntilByDevice,
              [deviceId]: Date.now() + retryDelay
            }
          }));
        } finally {
          if (silent) {
            set((state) => ({
              isRefreshingByDevice: {
                ...state.isRefreshingByDevice,
                [deviceId]: false
              }
            }));
          } else {
            set((state) => ({
              isLoadingByDevice: {
                ...state.isLoadingByDevice,
                [deviceId]: false
              }
            }));
          }
        }
      },

      getDeviceLogs: (deviceId) => get().logsByDevice?.[deviceId] || [],
      isLoadingDeviceLogs: (deviceId) =>
        Boolean(get().isLoadingByDevice?.[deviceId]),
      isRefreshingDeviceLogs: (deviceId) =>
        Boolean(get().isRefreshingByDevice?.[deviceId]),
      getDeviceLogsError: (deviceId) =>
        get().errorsByDevice?.[deviceId] || null,

      clearDeviceLogs: () =>
        set({
          logsByDevice: {},
          isLoadingByDevice: {},
          isRefreshingByDevice: {},
          errorsByDevice: {},
          lastFetchedAtByDevice: {},
          lastRequestedAtByDevice: {},
          blockedUntilByDevice: {}
        })
    }),
    {
      name: "device-logs-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        logsByDevice: state.logsByDevice,
        lastFetchedAtByDevice: state.lastFetchedAtByDevice,
        blockedUntilByDevice: state.blockedUntilByDevice
      })
    }
  )
);

export const useSettingsStore = create(
  persist(
    (set, get) => ({
      settings: {
        notifications: {
          push: false,
          email: true,
          sms: false,
          emergency: true
        },
        privacy: {
          location: false,
          twoFactor: false,
          analytics: false
        },
        demoMode: false
      },
      isHydratingFromServer: false,
      hasHydratedFromServer: false,

      setSettings: (updater) =>
        set((state) => ({
          settings:
            typeof updater === "function"
              ? updater(state.settings)
              : { ...state.settings, ...updater }
        })),

      hydrateSettingsFromServer: async (guardianIdOverride = null) => {
        if (get().isHydratingFromServer) return null;

        const userGuardianId = guardianIdOverride ??
          useUserStore.getState().user?.guardian_id ??
          useUserStore.getState().user?.guardianId ??
          null;

        if (!userGuardianId) return null;

        set({ isHydratingFromServer: true });

        try {
          const response = await getGuardianSettings(userGuardianId);
          const serverSettings = response?.data ?? response;

          if (!serverSettings) return null;

          set((state) => ({
            settings: {
              ...state.settings,
              notifications: {
                ...state.settings.notifications,
                push: Boolean(serverSettings.push_notifications),
                email: Boolean(serverSettings.email_notifications),
                sms: Boolean(serverSettings.sms_alerts)
              },
              privacy: {
                ...state.settings.privacy,
                location: Boolean(serverSettings.allow_location),
                twoFactor: Boolean(serverSettings.two_factor_enabled)
              }
            }
          }));

          set({ hasHydratedFromServer: true, isHydratingFromServer: false });
          return serverSettings;
        } catch (error) {
          console.error(
            "Failed to hydrate guardian settings:",
            error?.message || error
          );
          set({ isHydratingFromServer: false });
          return null;
        }
      },

      ensureHydratedFromServer: async (guardianIdOverride = null) => {
        if (get().hasHydratedFromServer || get().isHydratingFromServer) {
          return null;
        }

        const userGuardianId = guardianIdOverride ??
          useUserStore.getState().user?.guardian_id ??
          useUserStore.getState().user?.guardianId ??
          null;

        if (!userGuardianId) return null;

        return get().hydrateSettingsFromServer(userGuardianId);
      },

      persistSettingsToServer: async (overrides = {}, guardianIdOverride = null) => {
        const userGuardianId = guardianIdOverride ??
          useUserStore.getState().user?.guardian_id ??
          useUserStore.getState().user?.guardianId ??
          null;

        if (!userGuardianId) return null;

        const current = get().settings;

        const payload = {
          allow_location:
            overrides.allow_location ?? current.privacy.location ?? false,
          push_notifications:
            overrides.push_notifications ?? current.notifications.push ?? false,
          email_notifications:
            overrides.email_notifications ?? current.notifications.email ?? false,
          sms_alerts:
            overrides.sms_alerts ?? current.notifications.sms ?? false,
          two_factor_enabled:
            overrides.two_factor_enabled ?? current.privacy.twoFactor ?? false
        };

        try {
          await updateGuardianSettings(userGuardianId, payload);
          return payload;
        } catch (error) {
          console.error(
            "Failed to persist guardian settings:",
            error?.message || error
          );
          return null;
        }
      },

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
              push: false,
              email: true,
              sms: false,
              emergency: true
            },
            privacy: {
              location: false,
              twoFactor: false,
              analytics: false
            },
            demoMode: false
          },
          hasHydratedFromServer: false,
          isHydratingFromServer: false
        }),

      getSettings: () => get().settings,
      getNotifications: () => get().settings.notifications,
      getPrivacy: () => get().settings.privacy
    }),
    {
      name: "settings-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ settings: state.settings }),
      onRehydrateStorage: () => (state, error) => {
        if (error) return;

        // Defer to ensure the store is ready before hydrating from server
        setTimeout(() => {
          try {
            const ensure = useSettingsStore.getState().ensureHydratedFromServer;
            ensure?.();
          } catch (err) {
            console.error("Settings rehydrate hook failed:", err);
          }
        }, 0);
      }
    }
  )
);

// Notif van copy mo na lang hanggang dulo
const MAX_EVENT_NOTIFICATIONS = 50;
const MAX_EVENT_COOLDOWN_KEYS = 50;

const toNotificationTime = (value) => {
  if (!value) return 0;

  const date = new Date(value);
  const time = date.getTime();

  return Number.isNaN(time) ? 0 : time;
};

const sortNotificationsByTimestamp = (notifications) =>
  [...notifications].sort(
    (a, b) => toNotificationTime(b.timestamp) - toNotificationTime(a.timestamp)
  );

const trimEventCooldowns = (cooldowns) =>
  Object.fromEntries(
    Object.entries(cooldowns)
      .sort(([, a], [, b]) => b - a)
      .slice(0, MAX_EVENT_COOLDOWN_KEYS)
  );

export const NOTIFICATION_META = {
  CREATE: {
    label: "Device Created",
    icon: "ph:device-mobile-plus",
    color: "blue"
  },
  UPDATE: {
    label: "Device Updated",
    icon: "ph:pencil-simple",
    color: "indigo"
  },
  DELETE: { label: "Device Deleted", icon: "ph:trash", color: "red" },
  PAIR: { label: "Device Paired", icon: "ph:link", color: "green" },
  UNPAIR: { label: "Device Unpaired", icon: "ph:link-break", color: "orange" },
  INVITE: {
    label: "Guardian Invited",
    icon: "ph:envelope-simple",
    color: "purple"
  },
  REMOVE_GUARDIAN: {
    label: "Guardian Removed",
    icon: "ph:user-minus",
    color: "red"
  },
  UPDATE_ROLE: { label: "Role Updated", icon: "ph:shield", color: "indigo" },
  ACCEPT_INVITE: {
    label: "Invite Accepted",
    icon: "ph:check-circle",
    color: "green"
  },
  SET_EMERGENCY: {
    label: "Emergency Contact Set",
    icon: "ph:warning-circle",
    color: "red"
  },
  UPDATE_RELATIONSHIP: {
    label: "Relationship Updated",
    icon: "ph:users",
    color: "blue"
  },
  LIVE_WEATHER: {
    label: "Weather Alert",
    icon: "ph:cloud-rain",
    color: "orange"
  },
  LIVE_EMERGENCY: {
    label: "Emergency Alert",
    icon: "ph:warning-octagon",
    color: "red"
  },
  LIVE_FALL: {
    label: "Fall Detected",
    icon: "ph:person-simple-run",
    color: "orange"
  },
  ROUTE_ARRIVAL: {
    label: "Destination Reached",
    icon: "ph:map-pin-area",
    color: "green"
  }
};

export const useNotificationsStore = create(
  persist(
    (set, get) => ({
      readIds: [],
      eventNotifications: [],
      eventCooldowns: {},

      markAsRead: (historyId) =>
        set((state) => ({
          readIds: state.readIds.includes(historyId)
            ? state.readIds
            : [...state.readIds, historyId]
        })),

      markAllRead: (historyIds) =>
        set((state) => ({
          readIds: [...new Set([...state.readIds, ...historyIds])]
        })),

      clearRead: () => set({ readIds: [] }),

      addEventNotification: (notification, options = {}) => {
        const { dedupeKey = null, cooldownMs = 0 } = options;
        const now = Date.now();
        const lastTriggeredAt = dedupeKey
          ? get().eventCooldowns?.[dedupeKey]
          : null;

        if (
          dedupeKey &&
          lastTriggeredAt &&
          now - lastTriggeredAt < cooldownMs
        ) {
          return false;
        }

        const action = notification?.action || "SYSTEM_ALERT";
        const meta = NOTIFICATION_META[action] || {};
        const historyId = String(
          notification?.historyId || notification?.id || crypto.randomUUID()
        );

        const normalizedNotification = {
          id: historyId,
          historyId,
          action,
          title: notification?.title || meta.label || "System Alert",
          message:
            notification?.message ||
            "Important activity was detected on iCane.",
          guardianName: notification?.guardianName || "iCane System",
          color: notification?.color || meta.color || "gray",
          icon: notification?.icon || meta.icon || "ph:bell",
          timestamp: notification?.timestamp || new Date(now).toISOString(),
          navigation: notification?.navigation || null
        };

        set((state) => {
          const nextEventNotifications = sortNotificationsByTimestamp([
            normalizedNotification,
            ...state.eventNotifications.filter(
              (item) => item.historyId !== historyId
            )
          ]).slice(0, MAX_EVENT_NOTIFICATIONS);

          const nextCooldowns = dedupeKey
            ? trimEventCooldowns({
              ...state.eventCooldowns,
              [dedupeKey]: now
            })
            : state.eventCooldowns;

          return {
            eventNotifications: nextEventNotifications,
            eventCooldowns: nextCooldowns
          };
        });

        return true;
      },

      getNotifications: (history, deviceLogs, currentGuardianId) => {
        const readIds = get().readIds;
        const deviceNotifications = mapDeviceLogsToNotifications(
          deviceLogs
        ).map((notification) => ({
          ...notification,
          read: readIds.includes(notification.historyId)
        }));

        const historyNotifications = mapActivityHistoryToNotifications(
          history,
          currentGuardianId,
          NOTIFICATION_META
        ).map((notification) => ({
          ...notification,
          read: readIds.includes(notification.historyId)
        }));

        return sortNotificationsByTimestamp([
          ...deviceNotifications,
          ...historyNotifications
        ]);
      }
    }),
    {
      name: "notifications-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        readIds: state.readIds,
        eventNotifications: state.eventNotifications,
        eventCooldowns: state.eventCooldowns
      })
    }
  )
);
