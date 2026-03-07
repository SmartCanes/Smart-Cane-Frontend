import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Icon } from "@iconify/react";
import FeatureCard from "@/ui/components/FeatureCard";

export default function FeatureCarousel({
  cards = [],
  autoScroll = true,
  autoScrollMs = 5000,
  className = "",
  cloneCount = 2,
  activeClassName = "opacity-100 scale-100 sm:scale-[1.02]",
  inactiveClassName = "opacity-40 sm:opacity-60 scale-[0.94]"
}) {
  const trackRef = useRef(null);
  const itemRefs = useRef([]); // refs for ALL rendered items (including clones)

  const isProgrammaticRef = useRef(false);
  const snapTimerRef = useRef(null);
  const autoTimerRef = useRef(null);
  const pauseUntilRef = useRef(0);

  const [isHovering, setIsHovering] = useState(false);

  // activeLoopedIndex = index in loopedCards (includes clones)
  const [activeLoopedIndex, setActiveLoopedIndex] = useState(0);

  // Dedupe base by id (prevents weird looping bugs)
  const baseCards = useMemo(() => {
    const seen = new Set();
    return (cards || []).filter((c) => {
      const id = c?.id ?? JSON.stringify(c);
      if (seen.has(id)) return false;
      seen.add(id);
      return true;
    });
  }, [cards]);

  const n = baseCards.length;

  const k = useMemo(() => {
    if (!n) return 0;
    return Math.max(1, Math.min(cloneCount, n));
  }, [cloneCount, n]);

  const loopedCards = useMemo(() => {
    if (!n) return [];
    const head = baseCards.slice(0, k);
    const tail = baseCards.slice(n - k);
    return [...tail, ...baseCards, ...head];
  }, [baseCards, k, n]);

  // Keep refs array aligned
  useEffect(() => {
    itemRefs.current = itemRefs.current.slice(0, loopedCards.length);
  }, [loopedCards.length]);

  const pauseAuto = useCallback((ms = 2500) => {
    pauseUntilRef.current = Date.now() + ms;
  }, []);

  // Convert looped index to base index (0..n-1)
  const loopedToBaseIndex = useCallback(
    (loopedIndex) => {
      if (!n) return 0;
      const baseIndex = loopedIndex - k; // base region starts at k
      return ((baseIndex % n) + n) % n;
    },
    [k, n]
  );

  // Center a specific looped item
  const centerToLoopedIndex = useCallback(
    (loopedIndex, behavior = "smooth") => {
      const track = trackRef.current;
      const el = itemRefs.current[loopedIndex];
      if (!track || !el) return;

      // Stable math (no layout jitter during momentum)
      const targetLeft =
        el.offsetLeft - (track.clientWidth - el.clientWidth) / 2;

      const clamped = Math.max(
        0,
        Math.min(targetLeft, track.scrollWidth - track.clientWidth)
      );

      isProgrammaticRef.current = true;

      track.scrollTo({ left: clamped, behavior });

      // Prefer scrollend when available; fallback to a timer
      const done = () => {
        isProgrammaticRef.current = false;
        track.removeEventListener("scrollend", done);
      };

      if (behavior === "auto") {
        isProgrammaticRef.current = false;
        return;
      }

      // @ts-ignore (scrollend not typed everywhere)
      track.addEventListener?.("scrollend", done, { once: true });
      window.setTimeout(() => {
        isProgrammaticRef.current = false;
      }, 450);
    },
    []
  );

  // Find which looped card is closest to the track center
  const getNearestLoopedIndex = useCallback(() => {
    const track = trackRef.current;
    if (!track) return 0;

    const { left, width } = track.getBoundingClientRect();
    const center = left + width / 2;

    let bestIdx = 0;
    let bestDist = Number.POSITIVE_INFINITY;

    itemRefs.current.forEach((el, idx) => {
      if (!el) return;
      const r = el.getBoundingClientRect();
      const c = r.left + r.width / 2;
      const d = Math.abs(center - c);
      if (d < bestDist) {
        bestDist = d;
        bestIdx = idx;
      }
    });

    return bestIdx;
  }, []);

  /**
   * Normalize index if we're on clones:
   * - left clones: 0..k-1
   * - real region: k..k+n-1
   * - right clones: k+n..k+n+k-1
   *
   * For continuous RIGHT motion, we mainly normalize when we are in RIGHT clones.
   * The jump is instantaneous and keeps the same card centered.
   */
  const normalizeIfOnClone = useCallback(
    (loopedIndex) => {
      if (!n) return loopedIndex;

      const realStart = k;
      const realEnd = k + n - 1;

      // If in right clones, jump back by n to the matching real item
      if (loopedIndex > realEnd) {
        const normalized = loopedIndex - n;
        centerToLoopedIndex(normalized, "auto");
        return normalized;
      }

      // If in left clones (rare unless user scrolls left hard), jump forward by n
      if (loopedIndex < realStart) {
        const normalized = loopedIndex + n;
        centerToLoopedIndex(normalized, "auto");
        return normalized;
      }

      return loopedIndex;
    },
    [centerToLoopedIndex, k, n]
  );

  // Snap to nearest after user scroll momentum ends
  const snapToNearest = useCallback(() => {
    if (!n) return;

    if (snapTimerRef.current) window.clearTimeout(snapTimerRef.current);

    snapTimerRef.current = window.setTimeout(() => {
      const nearest = getNearestLoopedIndex();
      centerToLoopedIndex(nearest, "smooth");

      // after smooth ends, normalize if it landed on clones
      window.setTimeout(() => {
        const normalized = normalizeIfOnClone(nearest);
        setActiveLoopedIndex(normalized);
      }, 380);
    }, 140);
  }, [centerToLoopedIndex, getNearestLoopedIndex, normalizeIfOnClone, n]);

  // Manual scroll handler (update active indicator but do NOT fight user)
  const onScroll = useCallback(() => {
    if (isProgrammaticRef.current) return;

    pauseAuto(2500);

    const nearest = getNearestLoopedIndex();
    setActiveLoopedIndex(nearest);

    // Debounced snap for *any* scroll input (wheel, touchpad, drag, fling)
    snapToNearest();
  }, [getNearestLoopedIndex, pauseAuto, snapToNearest]);

  const next = useCallback(() => {
    pauseAuto(3000);
    const target = activeLoopedIndex + 1;
    centerToLoopedIndex(target, "smooth");

    // normalize after animation finishes
    window.setTimeout(() => {
      const normalized = normalizeIfOnClone(target);
      setActiveLoopedIndex(normalized);
    }, 380);
  }, [activeLoopedIndex, centerToLoopedIndex, normalizeIfOnClone, pauseAuto]);

  const prev = useCallback(() => {
    pauseAuto(3000);
    const target = activeLoopedIndex - 1;
    centerToLoopedIndex(target, "smooth");

    window.setTimeout(() => {
      const normalized = normalizeIfOnClone(target);
      setActiveLoopedIndex(normalized);
    }, 380);
  }, [activeLoopedIndex, centerToLoopedIndex, normalizeIfOnClone, pauseAuto]);

  // Initial position: first REAL card centered (k)
  useEffect(() => {
    if (!n) return;

    const t = window.setTimeout(() => {
      setActiveLoopedIndex(k);
      centerToLoopedIndex(k, "auto");
    }, 0);

    return () => window.clearTimeout(t);
  }, [centerToLoopedIndex, k, n]);

  // Auto-scroll continuously to the RIGHT forever (no visible reset)
  useEffect(() => {
    if (!autoScroll) return;
    if (!n) return;

    const tick = () => {
      const now = Date.now();
      if (isHovering) return; // remove this line if you want auto-scroll even on hover
      if (now < pauseUntilRef.current) return;
      if (isProgrammaticRef.current) return;

      const target = activeLoopedIndex + 1;
      centerToLoopedIndex(target, "smooth");

      window.setTimeout(() => {
        const normalized = normalizeIfOnClone(target);
        setActiveLoopedIndex(normalized);
      }, 380);
    };

    autoTimerRef.current = window.setInterval(tick, autoScrollMs);

    return () => {
      if (autoTimerRef.current) window.clearInterval(autoTimerRef.current);
    };
  }, [
    activeLoopedIndex,
    autoScroll,
    autoScrollMs,
    centerToLoopedIndex,
    isHovering,
    n,
    normalizeIfOnClone
  ]);

  // Cleanup timers
  useEffect(() => {
    return () => {
      if (snapTimerRef.current) window.clearTimeout(snapTimerRef.current);
      if (autoTimerRef.current) window.clearInterval(autoTimerRef.current);
    };
  }, []);

  if (!n) return null;

  const activeBaseIndex = loopedToBaseIndex(activeLoopedIndex);

  return (
    <section className={`w-full ${className}`} aria-label="Feature carousel">
      <div className="relative mt-12 w-full">
        {/* Edge fades (modern full-bleed) */}
        <div className="pointer-events-none absolute inset-y-0 left-0 w-12 sm:w-16 bg-gradient-to-r from-[#FDFCF9] to-transparent z-10" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-12 sm:w-16 bg-gradient-to-l from-[#FDFCF9] to-transparent z-10" />

        {/* Arrows */}
        <button
          type="button"
          onClick={prev}
          className="hidden md:flex absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 z-10 h-12 w-12 items-center justify-center rounded-full bg-white/90 shadow-md ring-1 ring-black/5 backdrop-blur transition hover:scale-[1.03] active:scale-[0.98]"
          aria-label="Previous feature"
        >
          <Icon icon="mingcute:left-line" className="text-2xl" />
        </button>

        <button
          type="button"
          onClick={next}
          className="hidden md:flex absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 z-10 h-12 w-12 items-center justify-center rounded-full bg-white/90 shadow-md ring-1 ring-black/5 backdrop-blur transition hover:scale-[1.03] active:scale-[0.98]"
          aria-label="Next feature"
        >
          <Icon icon="mingcute:right-line" className="text-2xl" />
        </button>

        {/* Track */}
        <div
          ref={trackRef}
          onScroll={onScroll}
          onPointerDown={() => pauseAuto(3500)}
          onPointerUp={snapToNearest}
          onTouchEnd={snapToNearest}
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
          className={[
            "w-full",
            "flex gap-6 sm:gap-8 lg:gap-10",
            "overflow-x-auto overflow-y-hidden",
            "px-4 sm:px-6 lg:px-10",
            "scroll-px-4 sm:scroll-px-6 lg:scroll-px-10",
            "py-4 pb-8",
            "snap-x snap-mandatory",
            "scroll-smooth",
            "overscroll-x-contain",
            "md:cursor-grab active:md:cursor-grabbing",
            "[scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
          ].join(" ")}
        >
          {loopedCards.map((card, loopedIdx) => {
            const baseIdx = loopedToBaseIndex(loopedIdx);
            const isActive = baseIdx === activeBaseIndex;

            return (
              <FeatureCard
                key={`${card.id ?? baseIdx}-loop-${loopedIdx}`}
                ref={(el) => (itemRefs.current[loopedIdx] = el)}
                {...card}
                isActive={isActive}
                className={[
                  "snap-center shrink-0",
                  "w-[88vw] sm:w-[420px] lg:w-[520px]",
                  "transition-all duration-300 ease-out",
                  card.className ?? ""
                ].join(" ")}
                activeClassName={card.activeClassName ?? activeClassName}
                inactiveClassName={card.inactiveClassName ?? inactiveClassName}
              />
            );
          })}
        </div>

        {/* Dots (base only) */}
        <div className="mt-2 flex justify-center gap-2 sm:gap-3">
          {baseCards.map((card, idx) => (
            <button
              key={`${card.id ?? idx}-dot`}
              type="button"
              onClick={() => {
                pauseAuto(3500);
                goToBaseIndex(idx, "smooth");
              }}
              className={[
                "h-2.5 rounded-full transition-all duration-200",
                "focus-visible:ring-2 focus-visible:ring-[#11285A] focus-visible:ring-offset-2",
                activeBaseIndex === idx
                  ? "w-8 bg-[#11285A]"
                  : "w-2.5 bg-[#d7dde9]"
              ].join(" ")}
              aria-label={`Show ${card.title ?? "feature"} card`}
              aria-pressed={activeBaseIndex === idx}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
