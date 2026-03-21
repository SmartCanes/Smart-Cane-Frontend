import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { getSharedDeviceRoute } from "@/api/backendService";

const mapRoutePayloadToStore = (route) => {
  if (!route?.routeGeoJson?.coordinates?.length) {
    return {
      routeId: route?.routeId ?? null,
      status: route?.status ?? null,
      destinationPos:
        route?.destination?.lat != null && route?.destination?.lng != null
          ? [route.destination.lat, route.destination.lng]
          : null,
      routeCoords: [],
      completedRoute: [],
      remainingRoute: [],
      activeIndex: 0,
      updatedAt: route?.updatedAt ?? null
    };
  }

  const coords = route.routeGeoJson.coordinates.map(([lng, lat]) => [lat, lng]);

  return {
    routeId: route.routeId,
    status: route.status,
    destinationPos:
      route.destination?.lat != null && route.destination?.lng != null
        ? [route.destination.lat, route.destination.lng]
        : null,
    routeCoords: coords,
    completedRoute: [],
    remainingRoute: coords,
    activeIndex: 0,
    updatedAt: route.updatedAt ?? null
  };
};

export const useRouteStore = create(
  persist(
    (set, get) => ({
      routeId: null,
      status: null,
      destinationPos: null,
      routeCoords: [],
      completedRoute: [],
      remainingRoute: [],
      activeIndex: 0,
      updatedAt: null,
      isLoading: false,

      fetchSharedRoute: async (deviceId) => {
        if (!deviceId) return null;

        set({ isLoading: true });

        try {
          const response = await getSharedDeviceRoute(deviceId);

          if (!response?.success) {
            throw new Error(
              response?.message || "Failed to fetch shared route"
            );
          }

          const route = response?.data?.route ?? null;

          if (!route) {
            set({
              routeId: null,
              status: null,
              destinationPos: null,
              routeCoords: [],
              completedRoute: [],
              remainingRoute: [],
              activeIndex: 0,
              updatedAt: null,
              isLoading: false
            });

            return null;
          }

          set({
            ...mapRoutePayloadToStore(route),
            isLoading: false
          });

          return route;
        } catch (error) {
          console.error("Failed to fetch shared route:", error);
          set({ isLoading: false });
          return null;
        }
      },

      setRouteFromBackend: (route) => {
        if (!route) {
          set({
            routeId: null,
            status: null,
            destinationPos: null,
            routeCoords: [],
            completedRoute: [],
            remainingRoute: [],
            activeIndex: 0,
            updatedAt: null
          });
          return;
        }

        set(mapRoutePayloadToStore(route));
      },

      updateProgress: ({ completedRoute, remainingRoute, activeIndex }) =>
        set((state) => ({
          ...state,
          completedRoute,
          remainingRoute,
          activeIndex
        })),

      clearRoute: () =>
        set({
          routeId: null,
          status: null,
          destinationPos: null,
          routeCoords: [],
          completedRoute: [],
          remainingRoute: [],
          activeIndex: 0,
          updatedAt: null
        })
    }),
    {
      name: "route-storage",
      storage: createJSONStorage(() => localStorage)
    }
  )
);
