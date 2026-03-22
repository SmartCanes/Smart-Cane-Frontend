import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { useLocation } from "react-router-dom";
import { Icon } from "@iconify/react";
import { useTranslation } from "react-i18next";
import { useTourStore } from "@/stores/useTourStore";
import { useUserStore, useUIStore } from "@/stores/useStore";
import { useTourSteps } from "@/data/tourConfig";

// ─── Constants ───────────────────────────────────────────────────────────────
const SPOTLIGHT_PADDING = 10; // extra space around the target element
const TOOLTIP_MARGIN = 14; // gap between target edge and tooltip
const TOOLTIP_SIDE_PADDING = 16; // minimum gap from viewport edge
const BOTTOM_NAV_HEIGHT = 80;
const MOBILE_TARGET_TOOLTIP_GAP = 20;

// Responsive tooltip width: shrink on narrow screens so it never clips
const getTooltipWidth = () =>
  Math.min(320, window.innerWidth - TOOLTIP_SIDE_PADDING * 2);

function waitForTourTarget(
  target,
  onFound,
  onTimeout,
  interval = 100,
  maxAttempts = 40
) {
  let attempts = 0;
  let cancelled = false;
  let timer = null;

  const tryFind = () => {
    if (cancelled) return;
    const el = document.querySelector(`[data-tour="${target}"]`);
    if (el && (el.offsetWidth > 0 || el.offsetHeight > 0)) {
      onFound?.(el);
      return;
    }

    if (attempts >= maxAttempts) {
      onTimeout?.();
      return;
    }

    attempts += 1;
    timer = setTimeout(tryFind, interval);
  };

  tryFind();

  return () => {
    cancelled = true;
    clearTimeout(timer);
  };
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Clamp a tooltip position so it stays fully inside the viewport.
 */
function clampToViewport(
  top,
  left,
  tooltipWidth,
  tooltipHeight,
  {
    minTop = TOOLTIP_SIDE_PADDING,
    minLeft = TOOLTIP_SIDE_PADDING,
    maxRightInset = TOOLTIP_SIDE_PADDING,
    maxBottomInset = TOOLTIP_SIDE_PADDING
  } = {}
) {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  return {
    top: Math.max(
      minTop,
      Math.min(top, vh - tooltipHeight - maxBottomInset)
    ),
    left: Math.max(
      minLeft,
      Math.min(left, vw - tooltipWidth - maxRightInset)
    )
  };
}

/**
 * Calculate the best tooltip position relative to the target element rect.
 * Tries the preferred direction first, then falls back through the others.
 * On mobile, placement is computed dynamically (above or below the spotlight)
 * while preserving a safe area above the fixed bottom navigation.
 */
function computeTooltipPos(
  rect,
  preferred,
  tooltipHeight = 220,
  isMobile = false
) {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const tw = getTooltipWidth();

  const p = SPOTLIGHT_PADDING;
  const m = TOOLTIP_MARGIN;

  // ── Mobile: choose above/below dynamically with strict spotlight spacing ──
  if (isMobile) {
    const gap = Math.max(m, MOBILE_TARGET_TOOLTIP_GAP);
    const minTop = TOOLTIP_SIDE_PADDING;
    const maxBottomInset = TOOLTIP_SIDE_PADDING + BOTTOM_NAV_HEIGHT;
    const centerLeft = rect.left + rect.width / 2 - tw / 2;

    const belowTop = rect.bottom + p + gap;
    const aboveTop = rect.top - p - gap - tooltipHeight;

    const spaceBelow = vh - maxBottomInset - (rect.bottom + p + gap);
    const spaceAbove = rect.top - p - gap - minTop;

    const fitsBelow = spaceBelow >= tooltipHeight;
    const fitsAbove = spaceAbove >= tooltipHeight;

    let chosenTop;
    if (fitsBelow && fitsAbove) {
      chosenTop = spaceBelow >= spaceAbove ? belowTop : aboveTop;
    } else if (fitsBelow) {
      chosenTop = belowTop;
    } else if (fitsAbove) {
      chosenTop = aboveTop;
    } else {
      // If space is tight on both sides, prefer the side with more room.
      chosenTop = spaceBelow >= spaceAbove ? belowTop : aboveTop;
    }

    return clampToViewport(
      chosenTop,
      centerLeft,
      tw,
      tooltipHeight,
      { minTop, maxBottomInset }
    );
  }

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
  "tour-vip-dropdown": "tour-mobile-vip",
  "tour-connection-status": "tour-mobile-connection",
  "tour-notifications": "tour-mobile-notifications",
  "tour-profile-menu": "tour-mobile-profile"
};

// ─── Component ───────────────────────────────────────────────────────────────

const TourGuide = ({ canAutoStart = true, onComplete, onClose }) => {
  const location = useLocation();
  const { t, i18n } = useTranslation("pages");
  const isRtl = i18n.language === "ar" || i18n.resolvedLanguage === "ar";
  const { tourSteps, mobileTourFlow } = useTourSteps();
  const {
    hasCompletedPage,
    activeTourPage,
    currentStep,
    startTour,
    completePage,
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

  // Normalize keys because auth/login payloads may use camelCase while
  // hydrated profile data from backend uses snake_case.
  const guardianId = user?.guardianId ?? user?.guardian_id ?? null;
  const hasSeenTourCsv =
    typeof user?.has_seen_tour === "string"
      ? user.has_seen_tour
      : typeof user?.hasSeenTour === "string"
        ? user.hasSeenTour
        : "";
  // const hasSeenEmergencyTour =
  //   user?.has_seen_emergency_tour ?? user?.hasSeenEmergencyTour ?? false;

  // ── Hydrate per-user backend data whenever the logged-in user changes ─
  useEffect(() => {
    if (guardianId) {
      hydrate({
        guardian_id: guardianId,
        has_seen_tour: hasSeenTourCsv,
        // has_seen_emergency_tour: hasSeenEmergencyTour,
      });
    }
    
  }, [guardianId, hasSeenTourCsv,  hydrate]);

  // ── Track mobile breakpoint as React state so steps recompute on resize ─
  const [isMobileView, setIsMobileView] = useState(
    () => window.innerWidth < 768
  );
  useEffect(() => {
    const onResize = () => setIsMobileView(window.innerWidth < 768);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const rawSteps = useMemo(
    () => tourSteps[location.pathname] ?? [],
    [location.pathname, tourSteps]
  );
  const mobileFlow = mobileTourFlow[location.pathname];

  const steps = useMemo(() => {
    if (!isMobileView) return rawSteps;

    const out = [];
    let headerInserted = false;

    for (const s of rawSteps) {
      if (MOBILE_HEADER_TARGETS.has(s.target)) {
        if (!headerInserted) {
          // STEP 1 of header section: the hamburger gateway.
          out.push({
            target: "tour-mobile-menu",
            title: mobileFlow?.headerMenuIntro?.title ?? "Open the Header Menu",
            description:
              mobileFlow?.headerMenuIntro?.description ??
              "Open the Header Menu to access your connection status, VIP dropdown, and other settings.",
            position: "bottom",
            icon: mobileFlow?.headerMenuIntro?.icon ?? "ph:list-bold",
            isMobileMenuTrigger: true
          });

          // STEPS 2-N: individual items inside the menu, in original order.
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
        // Skip - already emitted above in a single pass.
      } else {
        out.push(s);
      }
    }

    return out;
  }, [isMobileView, rawSteps, mobileFlow]);

  const isActive = activeTourPage === location.pathname;
  const step = isActive && steps[currentStep] ? steps[currentStep] : null;
  const firstStepTarget = steps[0]?.target ?? null;
  // ── Auto-start for incomplete page tours ──────────────────────────────────
  useEffect(() => {
    if (!canAutoStart) return;

    // Reset evaluation gate when navigating to a different page
    if (evaluatedForPathRef.current !== location.pathname) {
      hasEvaluatedAutoStartRef.current = false;
      evaluatedForPathRef.current = location.pathname;
    }

    // // Already decided for this page — don't re-evaluate on re-renders
    if (hasEvaluatedAutoStartRef.current) return;

    if (steps.length === 0) return;
    if (!guardianId) return; // wait for user to finish loading

    // Page already completed in backend CSV, do not re-trigger it.
    if (hasCompletedPage(location.pathname)) {
      hasEvaluatedAutoStartRef.current = true;
      return;
    }

    let cancelled = false;
    let attempts = 0;
    const maxAttempts = 20;

    const tryStart = () => {
      if (cancelled || hasEvaluatedAutoStartRef.current) return;
      if (!firstStepTarget) return;

      const targetEl = document.querySelector(
        `[data-tour="${firstStepTarget}"]`
      );

      // Wait until dashboard/header elements are mounted and measurable.
      if (
        !targetEl ||
        (targetEl.offsetWidth === 0 && targetEl.offsetHeight === 0)
      ) {
        if (attempts < maxAttempts) {
          attempts += 1;
          setTimeout(tryStart, 120);
        }
        return;
      }

      hasEvaluatedAutoStartRef.current = true;
      startTour(location.pathname);
    };

    // Slight delay lets route transition and header layout settle.
    const t = setTimeout(tryStart, 180);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [
    location.pathname,
    canAutoStart,
    steps,
    firstStepTarget,
    guardianId,
    hasCompletedPage,
    startTour
  ]);

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
    if (!step) return false;

    const el = document.querySelector(`[data-tour="${step.target}"]`);
    if (!el) return false;

    const tw = getTooltipWidth();
    setTooltipWidth(tw);

    const rect = el.getBoundingClientRect();
    // Skip if the element has no size yet (menu still animating in)
    if (rect.width === 0 && rect.height === 0) return false;

    setSpotlightRect({ ...rect.toJSON() });

    const tooltipHeight = tooltipRef.current?.offsetHeight ?? 220;
    setTooltipPos(
      computeTooltipPos(
        rect,
        step.position ?? "auto",
        tooltipHeight,
        isMobileView
      )
    );
    setStepReady(true);
    return true;
  }, [step, isMobileView]);

  // When the active step changes: scroll to target, wait for scroll to settle,
  // then measure
  useEffect(() => {
    setStepReady(false);
    if (!step) return;

    let retryTimer = null;
    let skipTimer = null;
    let attempts = 0;
    const maxAttempts = 40;

    const el = document.querySelector(`[data-tour="${step.target}"]`);
    if (el) {
      // Only scroll if the element isn't already fully visible — prevents
      // programmatic scroll from firing accidental touch/click events on
      // mobile (e.g. accidentally toggling the hamburger menu).
      const r = el.getBoundingClientRect();
      const safeBottom = isMobileView
        ? window.innerHeight - (BOTTOM_NAV_HEIGHT + TOOLTIP_SIDE_PADDING)
        : window.innerHeight;
      const inViewport =
        r.top >= 0 &&
        r.bottom <= safeBottom &&
        r.left >= 0 &&
        r.right <= window.innerWidth;
      if (!inViewport) {
        // ── Scroll lock: ignore scroll events while the animation is in
        //    flight so we don't trigger the scroll→recompute→scroll loop.
        isScrollingRef.current = true;
        clearTimeout(scrollLockTimerRef.current);
        el.scrollIntoView({
          behavior: "smooth",
          block: isMobileView ? "start" : "center",
          inline: "nearest"
        });
        // Release the lock once the smooth scroll has had time to settle.
        // 700ms covers most devices; the 360ms measurement timer below fires
        // after the lock is released, so positions are always accurate.
        scrollLockTimerRef.current = setTimeout(() => {
          isScrollingRef.current = false;
        }, 700);
      }
    }

    const tryMeasure = () => {
      const measured = updatePosition();
      if (measured) return;

      if (attempts >= maxAttempts) {
        if (step.skipIfMissing) {
          skipTimer = setTimeout(() => {
            setStepReady(false);
            if (currentStep < steps.length - 1) {
              nextStep();
            }
          }, 0);
        }
        return;
      }

      attempts += 1;
      retryTimer = setTimeout(tryMeasure, 120);
    };

    // Steps that need the mobile menu open require a longer settle time:
    // the menu control effect opens it at t≈80ms, the spring animation
    // finishes around t≈400ms, so we measure at t=620ms to be safe.
    const delay = step.requiresMobileMenu ? 620 : 360;
    const t = setTimeout(tryMeasure, delay);
    return () => {
      clearTimeout(t);
      clearTimeout(retryTimer);
      clearTimeout(skipTimer);
      clearTimeout(scrollLockTimerRef.current);
      isScrollingRef.current = false;
    };
  }, [step, updatePosition, currentStep, steps.length, nextStep]);

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

  // Lock body scroll only on desktop while the tour overlay is shown.
  // Mobile must remain scrollable so scrollIntoView can move to lower targets.
  useEffect(() => {
    if (!isActive || isMobileView) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isActive, isMobileView]);

  // Hard-close drawer whenever the tour is not actively controlling mobile
  // header steps. This prevents stale open state for returning users.
  useEffect(() => {
    if (!isActive || !isMobileView) {
      setMobileMenuOpen(false);
    }
  }, [isActive, isMobileView, setMobileMenuOpen]);

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

  // ── Persist onboarding completion to backend ───────────────────────────────
  // Completion is delayed until either:
  // 1) user skips onboarding, or
  // 2) user has explicitly completed every configured page in the sequence.
  const completeTour = useCallback(
    async (mode = "page-complete") => {
      setMobileMenuOpen(false); // close drawer if it was opened by the tour

      if (mode === "page-complete") {
        await completePage(location.pathname);
      }

      endTour();

      if (mode === "skip") {
        onClose?.();
      } else {
        onComplete?.();
      }

      // Page-level completion is already persisted by completePage().
      // Skip mode intentionally does not mark the page as completed.
    },
    [
      location.pathname,
      completePage,
      endTour,
      onClose,
      onComplete,
      setMobileMenuOpen
    ]
  );

  // ── Interaction-gated steps ─────────────────────────────────────────────
  // Some steps intentionally hide "Next" and advance only after a specific
  // UI interaction (e.g. opening a dropdown, then opening a modal).
  useEffect(() => {
    if (!isActive || !step?.advanceOn) return;

    const {
      target,
      event = "click",
      waitForTarget,
      waitInterval = 100,
      waitMaxAttempts = 40,
      settleDelay = 0
    } = step.advanceOn;

    let disposed = false;
    let unbind = null;
    let cleanupWait = null;

    const advance = () => {
      if (disposed) return;
      const runAdvance = () => {
        if (disposed) return;
        setStepReady(false);
        if (currentStep < steps.length - 1) {
          nextStep();
        }
      };

      if (!waitForTarget) {
        if (settleDelay > 0) {
          setTimeout(runAdvance, settleDelay);
        } else {
          runAdvance();
        }
        return;
      }

      cleanupWait = waitForTourTarget(
        waitForTarget,
        () => {
          if (settleDelay > 0) {
            setTimeout(runAdvance, settleDelay);
          } else {
            runAdvance();
          }
        },
        runAdvance,
        waitInterval,
        waitMaxAttempts
      );
    };

    const bindInteraction = () => {
      const actionEl = document.querySelector(`[data-tour="${target}"]`);
      if (!actionEl) {
        cleanupWait = waitForTourTarget(
          target,
          (el) => {
            if (disposed) return;
            const handler = () => advance();
            el.addEventListener(event, handler, { once: true });
            unbind = () => el.removeEventListener(event, handler);
          },
          undefined,
          100,
          40
        );
        return;
      }

      const handler = () => advance();
      actionEl.addEventListener(event, handler, { once: true });
      unbind = () => actionEl.removeEventListener(event, handler);
    };

    bindInteraction();

    return () => {
      disposed = true;
      unbind?.();
      cleanupWait?.();
    };
  }, [isActive, step, currentStep, steps.length, nextStep]);

  // ── Handlers ─────────────────────────────────────────────────────────────
  const handleNext = () => {
    if (currentStep >= steps.length - 1) {
      completeTour();
    } else {
      // Open drawer right after the hamburger step so the next step can
      // spotlight inner menu items after the menu animation settles.
      if (isMobileView && step?.isMobileMenuTrigger) {
        setMobileMenuOpen(true);
      }
      setStepReady(false);
      nextStep();
    }
  };

  const handlePrev = () => {
    setStepReady(false);
    prevStep();
  };

  const handleSkip = () => completeTour("skip");

  // ── Nothing to render ────────────────────────────────────────────────────
  if (!isActive || !step || !stepReady || !spotlightRect) return null;

  const hl = {
    top: spotlightRect.top - SPOTLIGHT_PADDING,
    left: spotlightRect.left - SPOTLIGHT_PADDING,
    width: spotlightRect.width + SPOTLIGHT_PADDING * 2,
    height: spotlightRect.height + SPOTLIGHT_PADDING * 2
  };

  const isLastStep = currentStep >= steps.length - 1;
  const BADGE_SIZE = 24;
  const badgeTop = Math.max(TOOLTIP_SIDE_PADDING, hl.top - 10);
  const badgeLeft = Math.max(
    TOOLTIP_SIDE_PADDING,
    Math.min(
      hl.left + hl.width - 10,
      window.innerWidth - BADGE_SIZE - TOOLTIP_SIDE_PADDING
    )
  );

  return createPortal(
    <AnimatePresence>
      {/* ── Backdrop: 4 fixed panels around the spotlight ─────────────────
           Using separate panels instead of a 9999px box-shadow avoids the
           body overflow / layout-glitch on mobile browsers.            ── */}
      {[
        {
          key: "bd-top",
          style: { top: 0, left: 0, right: 0, height: Math.max(0, hl.top) }
        },
        {
          key: "bd-bottom",
          style: { top: hl.top + hl.height, left: 0, right: 0, bottom: 0 }
        },
        {
          key: "bd-left",
          style: {
            top: hl.top,
            left: 0,
            width: Math.max(0, hl.left),
            height: hl.height
          }
        },
        {
          key: "bd-right",
          style: {
            top: hl.top,
            left: hl.left + hl.width,
            right: 0,
            height: hl.height
          }
        }
      ].map(({ key, style }) => (
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
        style={{
          top: hl.top,
          left: hl.left,
          width: hl.width,
          height: hl.height
        }}
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
          top: badgeTop,
          left: badgeLeft
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
        dir={isRtl ? "rtl" : "ltr"}
        style={{
          width: tooltipWidth,
          maxHeight: isMobileView
            ? `calc(100vh - ${BOTTOM_NAV_HEIGHT + TOOLTIP_SIDE_PADDING * 2}px)`
            : undefined,
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

        <div
          className={`px-4 pt-4 pb-5 sm:px-5 ${isRtl ? "text-right" : "text-left"}`}
          style={{
            maxHeight: isMobileView
              ? `calc(100vh - ${BOTTOM_NAV_HEIGHT + TOOLTIP_SIDE_PADDING * 2 + 6}px)`
              : undefined,
            overflowY: isMobileView ? "auto" : undefined
          }}
        >
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
              aria-label={t("tour.ui.skip", { defaultValue: "Skip" })}
            >
              <Icon icon="ph:x-bold" className="text-sm" />
            </button>
          </div>

          {/* Description */}
          <p className="text-xs text-gray-500 leading-relaxed mb-4">
            {step.description}
          </p>

          {/* Footer: progress dots + navigation buttons */}
          <div
            className={`mt-1 flex ${isMobileView ? "flex-col gap-3" : `items-center gap-4 ${isRtl ? "flex-row-reverse" : ""}`}`}
          >
            {/* Step progress dots */}
            <div
              className={`flex items-center ${isMobileView ? "justify-center gap-2" : "shrink-0 gap-1.5"}`}
            >
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
            <div
              className={`flex flex-wrap items-center gap-2 ${
                isMobileView
                  ? isRtl
                    ? "justify-start"
                    : "justify-end"
                  : isRtl
                    ? "mr-auto flex-row-reverse justify-start"
                    : "ml-auto justify-end"
              }`}
            >
              {currentStep > 0 && (
                <button
                  onClick={handlePrev}
                  className="px-3 py-1.5 min-w-[58px] text-xs font-medium text-gray-600 rounded-lg hover:bg-gray-100 border border-gray-200 transition-colors cursor-pointer"
                >
                  {t("tour.ui.back", { defaultValue: "Back" })}
                </button>
              )}
              {!step.hideNext && (
                <button
                  onClick={handleNext}
                  className="px-4 py-1.5 min-w-[62px] text-xs font-semibold text-white bg-blue-500 hover:bg-blue-600 rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  {isLastStep ? (
                    <>
                      {t("tour.ui.done", { defaultValue: "Done" })}
                      <Icon icon="ph:check-bold" className="text-[11px]" />
                    </>
                  ) : (
                    <>
                      {t("tour.ui.next", { defaultValue: "Next" })}
                      <Icon
                        icon="ph:arrow-right-bold"
                        className="text-[11px]"
                      />
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>,
    document.body
  );
};

export default TourGuide;
