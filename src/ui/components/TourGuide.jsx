import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { useLocation } from "react-router-dom";
import { Icon } from "@iconify/react";
import { useTourStore } from "@/stores/useTourStore";
import { useUserStore, useUIStore } from "@/stores/useStore";
import { TOUR_STEPS } from "@/data/tourConfig";
import { markTourComplete } from "@/api/backendService";

// ─── Constants ───────────────────────────────────────────────────────────────
const SPOTLIGHT_PADDING = 10; // extra space around the target element
const TOOLTIP_MARGIN = 14; // gap between target edge and tooltip
const TOOLTIP_SIDE_PADDING = 16; // minimum gap from viewport edge

// Responsive tooltip width: shrink on narrow screens so it never clips
const getTooltipWidth = () =>
  Math.min(320, window.innerWidth - TOOLTIP_SIDE_PADDING * 2);

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Clamp a tooltip position so it stays fully inside the viewport.
 */
function clampToViewport(top, left, tooltipWidth, tooltipHeight) {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  return {
    top: Math.max(TOOLTIP_SIDE_PADDING, Math.min(top, vh - tooltipHeight - TOOLTIP_SIDE_PADDING)),
    left: Math.max(TOOLTIP_SIDE_PADDING, Math.min(left, vw - tooltipWidth - TOOLTIP_SIDE_PADDING))
  };
}

/**
 * Calculate the best tooltip position relative to the target element rect.
 * Tries the preferred direction first, then falls back through the others.
 * On mobile (isMobile=true) always returns a bottom-center fixed modal position
 * so the tooltip never overflows or clips against the spotlight.
 */
function computeTooltipPos(rect, preferred, tooltipHeight = 220, isMobile = false) {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const tw = getTooltipWidth();

  // ── Mobile: anchor tooltip to the bottom-centre of the viewport ──────────
  // This avoids the tooltip being squeezed between the spotlight and screen
  // edges, which is a common source of overflow/flicker on narrow screens.
  if (isMobile) {
    return clampToViewport(
      vh - tooltipHeight - 24,
      (vw - tw) / 2,
      tw,
      tooltipHeight
    );
  }

  const p = SPOTLIGHT_PADDING;
  const m = TOOLTIP_MARGIN;

  const candidates = {
    bottom: {
      top: rect.bottom + p + m,
      left: rect.left + rect.width / 2 - tw / 2
    },
    top: {
      top: rect.top - p - m - tooltipHeight,
      left: rect.left + rect.width / 2 - tw / 2
    },
    right: {
      top: rect.top + rect.height / 2 - tooltipHeight / 2,
      left: rect.right + p + m
    },
    left: {
      top: rect.top + rect.height / 2 - tooltipHeight / 2,
      left: rect.left - p - m - tw
    }
  };

  const order =
    preferred === "auto"
      ? ["bottom", "top", "right", "left"]
      : [preferred, "bottom", "top", "right", "left"];

  for (const dir of order) {
    const { top, left } = candidates[dir];
    if (
      top >= TOOLTIP_SIDE_PADDING &&
      left >= TOOLTIP_SIDE_PADDING &&
      top + tooltipHeight <= vh - TOOLTIP_SIDE_PADDING &&
      left + tw <= vw - TOOLTIP_SIDE_PADDING
    ) {
      return { top, left };
    }
  }

  // Fallback: centre horizontally, place below target, clamp to viewport
  return clampToViewport(
    candidates.bottom.top,
    (vw - tw) / 2,
    tw,
    tooltipHeight
  );
}

// Header targets that live in `hidden md:flex` — invisible on mobile.
// Defined outside the component so no new Set is created on every render.
const MOBILE_HEADER_TARGETS = new Set([
  "tour-vip-dropdown",
  "tour-connection-status",
  "tour-notifications",
  "tour-profile-menu"
]);

// Maps each desktop header data-tour key → its mobile-menu equivalent.
// The mobile menu items carry these attributes so TourGuide can spotlight them.
const MOBILE_HEADER_STEP_MAP = {
  "tour-vip-dropdown":      "tour-mobile-vip",
  "tour-connection-status": "tour-mobile-connection",
  "tour-notifications":     "tour-mobile-notifications",
  "tour-profile-menu":      "tour-mobile-profile"
};

// ─── Component ───────────────────────────────────────────────────────────────

const TourGuide = () => {
  const location = useLocation();
  const {
    hasVisited,
    activeTourPage,
    currentStep,
    startTour,
    endTour,
    nextStep,
    prevStep
  } = useTourStore();

  const [spotlightRect, setSpotlightRect] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ top: 0, left: 0 });
  const [tooltipWidth, setTooltipWidth] = useState(320);
  const [stepReady, setStepReady] = useState(false);
  const tooltipRef = useRef(null);

  // ── Scroll-lock: prevents the scroll→recompute→scroll infinite loop ───────
  // Set to true while a programmatic scrollIntoView is in flight so that
  // incoming scroll events are ignored until the scroll animation settles.
  const isScrollingRef = useRef(false);
  const scrollLockTimerRef = useRef(null);

  // ── Auto-start stability: evaluated once per page per user load ───────────
  // Using refs (instead of state) means the decision survives parent re-renders
  // without triggering a new effect run, which would cancel the startup timer.
  const hasEvaluatedAutoStartRef = useRef(false);
  const evaluatedForPathRef = useRef(null);

  const { user } = useUserStore();
  const { hydrate } = useTourStore();
  const { setMobileMenuOpen } = useUIStore();

  // ── Hydrate per-user localStorage data whenever the logged-in user changes ─
  // This is the key fix: each guardian ID gets its own localStorage key, so
  // a new account on the same browser never inherits another user's tour history.
  useEffect(() => {
    if (user?.guardianId) {
      hydrate(user.guardianId);
    }
  }, [user?.guardianId, hydrate]);

  // ── Track mobile breakpoint as React state so steps recompute on resize ─
  const [isMobileView, setIsMobileView] = useState(() => window.innerWidth < 768);
  useEffect(() => {
    const onResize = () => setIsMobileView(window.innerWidth < 768);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const rawSteps = TOUR_STEPS[location.pathname] ?? [];

  const steps = isMobileView
    ? (() => {
        const out = [];
        let headerInserted = false;

        for (const s of rawSteps) {
          if (MOBILE_HEADER_TARGETS.has(s.target)) {
            if (!headerInserted) {
              // STEP 1 of header section: the hamburger gateway
              out.push({
                target: "tour-mobile-menu",
                title: "Open the Header Menu",
                description:
                  "Tap the three-line icon to open the app menu. It contains your VIP device switcher, connection status, notifications, and account settings.",
                position: "bottom",
                icon: "ph:list-bold",
                isMobileMenuTrigger: true
              });

              // STEPS 2-N: individual items inside the menu, in original order
              for (const hs of rawSteps) {
                if (MOBILE_HEADER_TARGETS.has(hs.target)) {
                  out.push({
                    ...hs,
                    target: MOBILE_HEADER_STEP_MAP[hs.target],
                    requiresMobileMenu: true
                  });
                }
              }

              headerInserted = true;
            }
            // Skip — already emitted above in a single pass
          } else {
            out.push(s);
          }
        }
        return out;
      })()
    : rawSteps;

  const isActive = activeTourPage === location.pathname;
  const step = isActive && steps[currentStep] ? steps[currentStep] : null;

  // ── Auto-start for first-time page visits ─────────────────────────────────
  // Guards:
  //   1. backend `isNewUser` (based on created_at) — no schema changes needed
  //   2. per-user per-page localStorage flag — each page tracked independently
  //
  // hasSeenTour is intentionally NOT used here because it is set globally
  // after the *first* page's tour completes, which would suppress every other
  // page's tour. Per-page `hasVisited` tracking is the correct mechanism.
  //
  // The evaluatedForPath/hasEvaluated refs ensure the decision is made ONCE
  // after the user object loads, and is NOT re-evaluated on every parent
  // re-render (e.g. WebSocket reconnect, location-polling), which would
  // repeatedly cancel the startup timer and prevent the tour from showing.
  useEffect(() => {
    // Reset evaluation gate when navigating to a different page
    if (evaluatedForPathRef.current !== location.pathname) {
      hasEvaluatedAutoStartRef.current = false;
      evaluatedForPathRef.current = location.pathname;
    }

    // Already decided for this page — don't re-evaluate on re-renders
    if (hasEvaluatedAutoStartRef.current) return;

    if (steps.length === 0) return;
    if (!user?.guardianId) return;   // wait for user to finish loading
    if (!user?.isNewUser) return;    // account older than 7 days
    if (hasVisited(location.pathname)) return; // page already toured

    // Commit: mark as evaluated so concurrent re-renders don't schedule a
    // second timer while this one is still counting down.
    hasEvaluatedAutoStartRef.current = true;

    // Small delay so the page content can render before we start
    const t = setTimeout(() => startTour(location.pathname), 500);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname, user?.guardianId, user?.isNewUser]);

  // ── End any active tour when navigating to a different page ───────────────
  useEffect(() => {
    if (activeTourPage && activeTourPage !== location.pathname) {
      setMobileMenuOpen(false);
      endTour();
    }
  }, [location.pathname, activeTourPage, endTour, setMobileMenuOpen]);

  // ── Measure target element and compute positions ──────────────────────────
  // On mobile, header step targets are inside `hidden md:flex` so they have
  // no dimensions — they've already been remapped to "tour-mobile-menu" via
  // the effectiveSteps logic above, so no further remapping is needed here.
  const updatePosition = useCallback(() => {
    if (!step) return;

    const el = document.querySelector(`[data-tour="${step.target}"]`);
    if (!el) return;

    const tw = getTooltipWidth();
    setTooltipWidth(tw);

    const rect = el.getBoundingClientRect();
    // Skip if the element has no size yet (menu still animating in)
    if (rect.width === 0 && rect.height === 0) return;

    setSpotlightRect({ ...rect.toJSON() });

    const tooltipHeight = tooltipRef.current?.offsetHeight ?? 220;
    setTooltipPos(computeTooltipPos(rect, step.position ?? "auto", tooltipHeight, isMobileView));
    setStepReady(true);
  }, [step, isMobileView]);

  // When the active step changes: scroll to target, wait for scroll to settle,
  // then measure
  useEffect(() => {
    setStepReady(false);
    if (!step) return;

    const el = document.querySelector(`[data-tour="${step.target}"]`);
    if (el) {
      // Only scroll if the element isn't already fully visible — prevents
      // programmatic scroll from firing accidental touch/click events on
      // mobile (e.g. accidentally toggling the hamburger menu).
      const r = el.getBoundingClientRect();
      const inViewport =
        r.top >= 0 && r.bottom <= window.innerHeight &&
        r.left >= 0 && r.right <= window.innerWidth;
      if (!inViewport) {
        // ── Scroll lock: ignore scroll events while the animation is in
        //    flight so we don't trigger the scroll→recompute→scroll loop.
        isScrollingRef.current = true;
        clearTimeout(scrollLockTimerRef.current);
        el.scrollIntoView({ behavior: "smooth", block: "center", inline: "nearest" });
        // Release the lock once the smooth scroll has had time to settle.
        // 700ms covers most devices; the 360ms measurement timer below fires
        // after the lock is released, so positions are always accurate.
        scrollLockTimerRef.current = setTimeout(() => {
          isScrollingRef.current = false;
        }, 700);
      }
    }

    // Steps that need the mobile menu open require a longer settle time:
    // the menu control effect opens it at t≈80ms, the spring animation
    // finishes around t≈400ms, so we measure at t=620ms to be safe.
    const delay = step.requiresMobileMenu ? 620 : 360;
    const t = setTimeout(updatePosition, delay);
    return () => {
      clearTimeout(t);
      clearTimeout(scrollLockTimerRef.current);
      isScrollingRef.current = false;
    };
  }, [step, updatePosition]);

  // Recompute positions on scroll or resize.
  // The scroll handler is guarded by isScrollingRef so that programmatic
  // scrollIntoView calls don't trigger an infinite recompute→scroll loop.
  useEffect(() => {
    if (!step) return;
    const handleScroll = () => {
      if (isScrollingRef.current) return;
      updatePosition();
    };
    window.addEventListener("scroll", handleScroll, true);
    window.addEventListener("resize", updatePosition);
    return () => {
      window.removeEventListener("scroll", handleScroll, true);
      window.removeEventListener("resize", updatePosition);
    };
  }, [step, updatePosition]);

  // Lock body scroll while the tour overlay is shown — prevents the background
  // page from scrolling/shifting under the dark backdrop on mobile.
  useEffect(() => {
    if (!isActive) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isActive]);

  // ── Mobile menu gate: automatically open/close the drawer as the tour
  //    moves between the hamburger step and its inner sub-steps. ─────────────
  useEffect(() => {
    if (!isActive || !isMobileView) return;

    if (step?.requiresMobileMenu) {
      // Open the drawer slightly before we start measuring positions.
      // The measurement timer (620ms) is longer than this delay, so the
      // spring animation has time to settle before getBoundingClientRect runs.
      const t = setTimeout(() => setMobileMenuOpen(true), 80);
      return () => clearTimeout(t);
    }

    // Close the drawer when on the hamburger step or any non-menu step.
    setMobileMenuOpen(false);
  }, [step, isActive, isMobileView, setMobileMenuOpen]);

  // ── Persist tour completion to backend (fire-and-forget analytics) ─────────
  // NOTE: We intentionally do NOT set hasSeenTour=true here. That flag was
  // previously set after the very first page tour, which silently blocked every
  // subsequent page from ever starting its own tour. Per-page tracking via
  // hasVisited (set inside startTour) is the correct mechanism.
  const completeTour = useCallback(async () => {
    setMobileMenuOpen(false); // close drawer if it was opened by the tour
    endTour();
    try {
      await markTourComplete();
    } catch {
      // Non-critical — per-page localStorage guard still prevents re-show
    }
  }, [endTour, setMobileMenuOpen]);

  // ── Handlers ─────────────────────────────────────────────────────────────
  const handleNext = () => {
    if (currentStep >= steps.length - 1) {
      completeTour();
    } else {
      setStepReady(false);
      nextStep();
    }
  };

  const handlePrev = () => {
    setStepReady(false);
    prevStep();
  };

  const handleSkip = () => completeTour();

  // ── Nothing to render ────────────────────────────────────────────────────
  if (!isActive || !step || !stepReady || !spotlightRect) return null;

  const hl = {
    top: spotlightRect.top - SPOTLIGHT_PADDING,
    left: spotlightRect.left - SPOTLIGHT_PADDING,
    width: spotlightRect.width + SPOTLIGHT_PADDING * 2,
    height: spotlightRect.height + SPOTLIGHT_PADDING * 2
  };

  const isLastStep = currentStep >= steps.length - 1;

  return createPortal(
    <AnimatePresence>
      {/* ── Backdrop: 4 fixed panels around the spotlight ─────────────────
           Using separate panels instead of a 9999px box-shadow avoids the
           body overflow / layout-glitch on mobile browsers.            ── */}
      {([
        { key: "bd-top",    style: { top: 0, left: 0, right: 0, height: Math.max(0, hl.top) } },
        { key: "bd-bottom", style: { top: hl.top + hl.height, left: 0, right: 0, bottom: 0 } },
        { key: "bd-left",   style: { top: hl.top, left: 0, width: Math.max(0, hl.left), height: hl.height } },
        { key: "bd-right",  style: { top: hl.top, left: hl.left + hl.width, right: 0, height: hl.height } }
      ]).map(({ key, style }) => (
        <motion.div
          key={key}
          className="fixed z-[9999] bg-black/[.52]"
          style={style}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
        />
      ))}

      {/* ── Spotlight ring ────────────────────────────────────────────────── */}
      <motion.div
        key={`spotlight-${step.target}`}
        className="fixed z-[10000] rounded-xl pointer-events-none"
        style={{ top: hl.top, left: hl.left, width: hl.width, height: hl.height }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25 }}
      >
        {/* Pulsing blue ring */}
        <motion.div
          className="absolute inset-0 rounded-xl border-[2.5px] border-blue-400"
          animate={{
            boxShadow: [
              "0 0 0 0px rgba(59,130,246,0.55)",
              "0 0 0 8px rgba(59,130,246,0)"
            ]
          }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeOut" }}
        />
        {/* Static solid border on top of the pulse */}
        <div className="absolute inset-0 rounded-xl border-[2px] border-blue-500" />
      </motion.div>

      {/* ── Step badge (dot on corner of spotlight) ────────────────────────── */}
      <motion.div
        key="tour-badge"
        className="fixed z-[10001] flex items-center justify-center w-6 h-6 rounded-full bg-blue-500 border-2 border-white shadow-lg pointer-events-none text-[10px] font-bold text-white"
        style={{
          top: hl.top - 10,
          left: hl.left + hl.width - 10
        }}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0 }}
        transition={{ type: "spring", stiffness: 400, damping: 20 }}
      >
        {currentStep + 1}
      </motion.div>

      {/* ── Tooltip card ──────────────────────────────────────────────────── */}
      <motion.div
        key={`tooltip-${step.target}`}
        ref={tooltipRef}
        className="fixed z-[10000] bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden"
        style={{
          width: tooltipWidth,
          top: tooltipPos.top,
          left: tooltipPos.left
        }}
        initial={{ opacity: 0, scale: 0.9, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 10 }}
        transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* Top colour accent bar */}
        <div className="h-1.5 bg-gradient-to-r from-blue-500 to-indigo-500 w-full" />

        <div className="p-4">
          {/* Header row: icon + title + close */}
          <div className="flex items-start justify-between gap-3 mb-2.5">
            <div className="flex items-center gap-2.5">
              {step.icon && (
                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                  <Icon
                    icon={step.icon}
                    className="text-blue-600 text-[17px]"
                  />
                </div>
              )}
              <h3 className="text-sm font-bold text-gray-900 leading-snug">
                {step.title}
              </h3>
            </div>
            <button
              onClick={handleSkip}
              className="text-gray-400 hover:text-gray-600 transition-colors shrink-0 mt-0.5 cursor-pointer"
              aria-label="Skip tour"
            >
              <Icon icon="ph:x-bold" className="text-sm" />
            </button>
          </div>

          {/* Description */}
          <p className="text-xs text-gray-500 leading-relaxed mb-4">
            {step.description}
          </p>

          {/* Footer: progress dots + navigation buttons */}
          <div className="flex items-center justify-between">
            {/* Step progress dots */}
            <div className="flex items-center gap-1.5">
              {steps.map((_, i) => (
                <div
                  key={i}
                  className={`rounded-full transition-all duration-300 ${
                    i === currentStep
                      ? "w-5 h-2 bg-blue-500"
                      : i < currentStep
                        ? "w-2 h-2 bg-blue-300"
                        : "w-2 h-2 bg-gray-200"
                  }`}
                />
              ))}
            </div>

            {/* Navigation buttons */}
            <div className="flex items-center gap-2">
              {currentStep > 0 && (
                <button
                  onClick={handlePrev}
                  className="px-3 py-1.5 text-xs font-medium text-gray-600 rounded-lg hover:bg-gray-100 border border-gray-200 transition-colors cursor-pointer"
                >
                  Back
                </button>
              )}
              <button
                onClick={handleNext}
                className="px-4 py-1.5 text-xs font-semibold text-white bg-blue-500 hover:bg-blue-600 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                {isLastStep ? (
                  <>
                    Done
                    <Icon icon="ph:check-bold" className="text-[11px]" />
                  </>
                ) : (
                  <>
                    Next
                    <Icon icon="ph:arrow-right-bold" className="text-[11px]" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>,
    document.body
  );
};

export default TourGuide;
