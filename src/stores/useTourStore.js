import { create } from "zustand";

/**
 * Tour store for the first-time user onboarding pointer system.
 *
 * - `visitedPages` is stored in localStorage under a PER-USER key:
 *   `icane-tour:<guardianId>` — so different accounts on the same browser
 *   each maintain their own independent tour history.
 * - Active tour state (activeTourPage, currentStep) is always runtime-only.
 */

// ─── localStorage helpers (per-user key) ─────────────────────────────────────

const storageKey = (guardianId) => `icane-tour:${guardianId}`;

function readVisited(guardianId) {
  if (!guardianId) return {};
  try {
    return JSON.parse(localStorage.getItem(storageKey(guardianId)) ?? "{}");
  } catch {
    return {};
  }
}

function writeVisited(guardianId, visitedPages) {
  if (!guardianId) return;
  try {
    localStorage.setItem(storageKey(guardianId), JSON.stringify(visitedPages));
  } catch {
    // localStorage quota exceeded – silently ignore
  }
}

function normalizeVisitedTourPages(value) {
  if (!Array.isArray(value)) return [];
  return value.filter((path) => typeof path === "string" && path.startsWith("/"));
}

function arrayToVisitedMap(paths) {
  return normalizeVisitedTourPages(paths).reduce((acc, path) => {
    acc[path] = true;
    return acc;
  }, {});
}

// ─── Store ────────────────────────────────────────────────────────────────────

export const useTourStore = create((set, get) => ({
  // ─── Runtime state ─────────────────────────────────────────────────────────
  /** Visited pages map for the currently loaded user. */
  visitedPages: {},
  /** Guardian ID whose visited data is currently loaded. */
  currentGuardianId: null,
  /** Pathname of the page whose tour is currently active, or null. */
  activeTourPage: null,
  /** Zero-based index of the current tour step. */
  currentStep: 0,

  // ─── Selectors ─────────────────────────────────────────────────────────────
  hasVisited: (path) => !!get().visitedPages[path],

  // ─── Actions ───────────────────────────────────────────────────────────────

  /**
   * Must be called once the logged-in user is known (e.g. on mount in
   * TourGuide or after login). Merges server-tracked page progress with
   * localStorage so per-page completion survives device/incognito changes.
   */
  hydrate: (guardianId, backendVisitedTourPages = []) => {
    if (!guardianId) return;

    const localVisited = readVisited(guardianId);
    const backendVisited = arrayToVisitedMap(backendVisitedTourPages);
    const mergedVisited = { ...localVisited, ...backendVisited };

    writeVisited(guardianId, mergedVisited);

    set({
      visitedPages: mergedVisited,
      currentGuardianId: guardianId
    });
  },

  /**
   * Start the tour for `path`. Immediately marks the page as visited and
   * persists that to the user-scoped localStorage key.
   */
  startTour: (path) => {
    const { currentGuardianId } = get();
    const updated = { ...get().visitedPages, [path]: true };
    writeVisited(currentGuardianId, updated);
    set({ activeTourPage: path, currentStep: 0, visitedPages: updated });
  },

  endTour: () => set({ activeTourPage: null, currentStep: 0 }),

  nextStep: () => set((s) => ({ currentStep: s.currentStep + 1 })),

  prevStep: () => set((s) => ({ currentStep: Math.max(0, s.currentStep - 1) })),

  /** Dev / testing helper — clears tour history for the current user. */
  resetAllTours: () => {
    const { currentGuardianId } = get();
    writeVisited(currentGuardianId, {});
    set({ visitedPages: {} });
  }
}));
