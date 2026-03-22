import { create } from "zustand";
import { markTourComplete } from "@/api/backendService";

/**
 * Tour store for backend-synced per-page onboarding progression.
 *
 * `has_seen_tour` is persisted by the API as a comma-separated list of paths:
 *   "/dashboard,/devices,/weather-board"
 */

function parseCompletedPages(csvValue) {
  if (typeof csvValue !== "string" || !csvValue.trim()) return {};

  return csvValue
    .split(",")
    .map((p) => p.trim())
    .filter((p) => p && p.startsWith("/"))
    .reduce((acc, p) => {
      acc[p] = true;
      return acc;
    }, {});
}

function toCsv(completedPages) {
  return Object.keys(completedPages)
    .filter((path) => completedPages[path])
    .join(",");
}

// ─── Store ────────────────────────────────────────────────────────────────────

export const useTourStore = create((set, get) => ({
  // ─── Runtime state ─────────────────────────────────────────────────────────
  /** Visited pages map for the currently loaded user. */
  visitedPages: {},
  /** Completed pages map for the currently loaded user. */
  completedPages: {},
  /** Guardian ID whose visited data is currently loaded. */
  currentGuardianId: null,
  /** Backend completion for mini-tour gating. */
  hasSeenEmergencyTour: false,
  /** Pathname of the page whose tour is currently active, or null. */
  activeTourPage: null,
  /** Zero-based index of the current tour step. */
  currentStep: 0,

  // ─── Selectors ─────────────────────────────────────────────────────────────
  hasVisited: (path) => !!get().visitedPages[path],
  hasCompletedPage: (path) => !!get().completedPages[path],
  isEmergencyTourEligible: () => !get().hasSeenEmergencyTour,
  areAllTrackedPagesCompleted: (paths) => {
    const completedPages = get().completedPages;
    return paths.every((path) => !!completedPages[path]);
  },

  // ─── Actions ───────────────────────────────────────────────────────────────

  /**
   * Hydrate from logged-in user payload.
   */
  hydrate: (userLike) => {
    if (!userLike) return;

    const guardianId =
      userLike?.guardian_id ??
      userLike?.guardianId ??
      (typeof userLike === "number" ? userLike : null);

    if (!guardianId) return;

    const csv =
      typeof userLike === "object"
        ? userLike?.has_seen_tour ?? userLike?.hasSeenTour ?? ""
        : "";
    const completedPages = parseCompletedPages(csv);

    set({
      visitedPages: { ...completedPages },
      completedPages,
      currentGuardianId: guardianId,
      hasSeenEmergencyTour: Boolean(
        userLike?.has_seen_emergency_tour ?? userLike?.hasSeenEmergencyTour
      )
    });
  },

  /**
   * Start the tour for a page/feature key.
   */
  startTour: (path) => {
    const visitedPages = { ...get().visitedPages, [path]: true };
    set({ activeTourPage: path, currentStep: 0, visitedPages });
  },

  completePage: async (path) => {
    if (!path) return;

    const completedPages = { ...get().completedPages };
    if (completedPages[path]) return;

    completedPages[path] = true;
    set({ completedPages });

    try {
      await markTourComplete({ completed_page: path });
    } catch (error) {
      // Keep UI responsive but rollback to avoid drift from backend truth.
      const rollback = { ...get().completedPages };
      delete rollback[path];
      set({ completedPages: rollback });
      throw error;
    }
  },

  completeMainTour: async () => {
    const activePath = get().activeTourPage;
    if (!activePath || !activePath.startsWith("/")) return;
    await get().completePage(activePath);
  },

  completeEmergencyTour: () => set({ hasSeenEmergencyTour: true }),

  getCompletedPagesCsv: () => toCsv(get().completedPages),

  backendHasSeenTour: false,

  endTour: () => set({ activeTourPage: null, currentStep: 0 }),

  nextStep: () => set((s) => ({ currentStep: s.currentStep + 1 })),

  prevStep: () => set((s) => ({ currentStep: Math.max(0, s.currentStep - 1) })),

  /** Dev / testing helper — clears runtime state. */
  resetAllTours: () => {
    set({ visitedPages: {}, completedPages: {}, hasSeenEmergencyTour: false });
  }
}));
