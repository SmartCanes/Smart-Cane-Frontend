import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Icon } from "@iconify/react";
import FeatureCard from "@/ui/components/FeatureCard";

const AUTO_SCROLL_MS_DEFAULT = 2500;
const AUTO_PAUSE_MS = 3200;
const SNAP_IDLE_MS = 140;
const ANIMATION_MS = 420;
const NAV_LOCK_MS = 380;
const DRAG_THRESHOLD_PX = 3;

export default function FeatureCarousel({
  cards = [],
  autoScroll = true,
  autoScrollMs = AUTO_SCROLL_MS_DEFAULT,
  className = "",
  activeClassName = "opacity-100 scale-100 sm:scale-[1.02]",
  inactiveClassName = "opacity-40 sm:opacity-60 scale-[0.94]"
}) {
  const trackRef = useRef(null);
  const itemRefs = useRef([]);

  const autoTimerRef = useRef(null);
  const idleTimerRef = useRef(null);
  const navUnlockTimerRef = useRef(null);
  const animationDoneTimerRef = useRef(null);

  const pauseUntilRef = useRef(0);
  const isHoveringRef = useRef(false);
  const isDraggingRef = useRef(false);
  const hasDraggedRef = useRef(false);
  const isProgrammaticRef = useRef(false);
  const canNavigateRef = useRef(true);

  const dragPointerIdRef = useRef(null);
  const dragStartXRef = useRef(0);
  const dragStartScrollLeftRef = useRef(0);

  const [isHovering, setIsHovering] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [activeLoopedIndex, setActiveLoopedIndex] = useState(0);
  const [canNavigate, setCanNavigate] = useState(true);

  const baseCards = useMemo(() => {
    const seen = new Set();

    return (cards || []).filter((card) => {
      const id = card?.id ?? JSON.stringify(card);
      if (seen.has(id)) return false;
      seen.add(id);
      return true;
    });
  }, [cards]);

  const n = baseCards.length;

  const loopedCards = useMemo(() => {
    if (!n) return [];
    return [...baseCards, ...baseCards, ...baseCards];
  }, [baseCards, n]);

  const middleStart = n;
  const middleEnd = 2 * n - 1;

  useEffect(() => {
    itemRefs.current = itemRefs.current.slice(0, loopedCards.length);
  }, [loopedCards.length]);

  useEffect(() => {
    isHoveringRef.current = isHovering;
  }, [isHovering]);

  const pauseAuto = useCallback((ms = AUTO_PAUSE_MS) => {
    pauseUntilRef.current = Date.now() + ms;
  }, []);

  const setNavigationEnabled = useCallback((enabled) => {
    canNavigateRef.current = enabled;
    setCanNavigate(enabled);
  }, []);

  const lockNavigation = useCallback(
    (ms = NAV_LOCK_MS) => {
      setNavigationEnabled(false);

      if (navUnlockTimerRef.current) {
        window.clearTimeout(navUnlockTimerRef.current);
      }

      navUnlockTimerRef.current = window.setTimeout(() => {
        setNavigationEnabled(true);
      }, ms);
    },
    [setNavigationEnabled]
  );

  const toBaseIndex = useCallback(
    (loopedIndex) => {
      if (!n) return 0;
      return ((loopedIndex % n) + n) % n;
    },
    [n]
  );

  const getEquivalentMiddleIndex = useCallback(
    (loopedIndex) => {
      if (!n) return 0;
      return middleStart + toBaseIndex(loopedIndex);
    },
    [middleStart, n, toBaseIndex]
  );

  const getTrackLeftForIndex = useCallback((loopedIndex) => {
    const track = trackRef.current;
    const el = itemRefs.current[loopedIndex];

    if (!track || !el) return null;

    const targetLeft = el.offsetLeft - (track.clientWidth - el.clientWidth) / 2;

    const maxLeft = track.scrollWidth - track.clientWidth;
    return Math.max(0, Math.min(targetLeft, maxLeft));
  }, []);

  const scrollToLoopedIndex = useCallback(
    (loopedIndex, behavior = "smooth") => {
      const track = trackRef.current;
      const left = getTrackLeftForIndex(loopedIndex);

      if (!track || left == null) return;

      track.scrollTo({ left, behavior });
    },
    [getTrackLeftForIndex]
  );

  const getNearestLoopedIndex = useCallback(() => {
    const track = trackRef.current;
    if (!track) return middleStart;

    const trackRect = track.getBoundingClientRect();
    const trackCenter = trackRect.left + trackRect.width / 2;

    let nearestIndex = middleStart;
    let nearestDistance = Number.POSITIVE_INFINITY;

    itemRefs.current.forEach((el, idx) => {
      if (!el) return;

      const rect = el.getBoundingClientRect();
      const cardCenter = rect.left + rect.width / 2;
      const distance = Math.abs(cardCenter - trackCenter);

      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearestIndex = idx;
      }
    });

    return nearestIndex;
  }, [middleStart]);

  const normalizeInstantlyIfNeeded = useCallback(
    (loopedIndex) => {
      if (!n) return loopedIndex;

      if (loopedIndex < middleStart || loopedIndex > middleEnd) {
        const normalized = getEquivalentMiddleIndex(loopedIndex);
        isProgrammaticRef.current = true;
        scrollToLoopedIndex(normalized, "auto");
        setActiveLoopedIndex(normalized);

        requestAnimationFrame(() => {
          isProgrammaticRef.current = false;
        });

        return normalized;
      }

      return loopedIndex;
    },
    [getEquivalentMiddleIndex, middleEnd, middleStart, n, scrollToLoopedIndex]
  );

  const finishProgrammaticScroll = useCallback(
    (targetIndex) => {
      const normalized = normalizeInstantlyIfNeeded(targetIndex);
      setActiveLoopedIndex(normalized);
      isProgrammaticRef.current = false;
    },
    [normalizeInstantlyIfNeeded]
  );

  const animateToLoopedIndex = useCallback(
    (targetIndex) => {
      if (!n) return;

      const track = trackRef.current;
      if (!track) return;

      if (!canNavigateRef.current) return;
      if (isDraggingRef.current) return;

      pauseAuto(3500);
      lockNavigation();

      isProgrammaticRef.current = true;
      setActiveLoopedIndex(targetIndex);
      scrollToLoopedIndex(targetIndex, "smooth");

      if (animationDoneTimerRef.current) {
        window.clearTimeout(animationDoneTimerRef.current);
      }

      animationDoneTimerRef.current = window.setTimeout(() => {
        finishProgrammaticScroll(targetIndex);
      }, ANIMATION_MS);
    },
    [
      finishProgrammaticScroll,
      lockNavigation,
      n,
      pauseAuto,
      scrollToLoopedIndex
    ]
  );

  const snapToNearest = useCallback(() => {
    if (!n) return;
    if (isDraggingRef.current) return;

    const nearest = getNearestLoopedIndex();
    const currentLeft = trackRef.current?.scrollLeft ?? 0;
    const targetLeft = getTrackLeftForIndex(nearest);

    setActiveLoopedIndex(nearest);

    if (targetLeft == null) return;

    const almostCentered = Math.abs(currentLeft - targetLeft) < 1.5;

    if (nearest < middleStart || nearest > middleEnd) {
      if (almostCentered) {
        normalizeInstantlyIfNeeded(nearest);
        return;
      }

      isProgrammaticRef.current = true;
      lockNavigation();
      scrollToLoopedIndex(nearest, "smooth");

      if (animationDoneTimerRef.current) {
        window.clearTimeout(animationDoneTimerRef.current);
      }

      animationDoneTimerRef.current = window.setTimeout(() => {
        finishProgrammaticScroll(nearest);
      }, ANIMATION_MS);

      return;
    }

    if (!almostCentered) {
      isProgrammaticRef.current = true;
      lockNavigation();
      scrollToLoopedIndex(nearest, "smooth");

      if (animationDoneTimerRef.current) {
        window.clearTimeout(animationDoneTimerRef.current);
      }

      animationDoneTimerRef.current = window.setTimeout(() => {
        finishProgrammaticScroll(nearest);
      }, ANIMATION_MS);

      return;
    }

    setActiveLoopedIndex(nearest);
  }, [
    finishProgrammaticScroll,
    getNearestLoopedIndex,
    getTrackLeftForIndex,
    lockNavigation,
    middleEnd,
    middleStart,
    n,
    normalizeInstantlyIfNeeded,
    scrollToLoopedIndex
  ]);

  const scheduleSnap = useCallback(
    (delay = SNAP_IDLE_MS) => {
      if (idleTimerRef.current) {
        window.clearTimeout(idleTimerRef.current);
      }

      idleTimerRef.current = window.setTimeout(() => {
        if (!isDraggingRef.current && !isProgrammaticRef.current) {
          snapToNearest();
        }
      }, delay);
    },
    [snapToNearest]
  );

  const next = useCallback(() => {
    animateToLoopedIndex(activeLoopedIndex + 1);
  }, [activeLoopedIndex, animateToLoopedIndex]);

  const prev = useCallback(() => {
    animateToLoopedIndex(activeLoopedIndex - 1);
  }, [activeLoopedIndex, animateToLoopedIndex]);

  const goToBaseIndex = useCallback(
    (baseIndex) => {
      if (!n) return;
      if (!canNavigateRef.current) return;

      const safeBaseIndex = ((baseIndex % n) + n) % n;
      const target = middleStart + safeBaseIndex;
      animateToLoopedIndex(target);
    },
    [animateToLoopedIndex, middleStart, n]
  );

  const onScroll = useCallback(() => {
    if (!n) return;

    const nearest = getNearestLoopedIndex();
    setActiveLoopedIndex(nearest);
    pauseAuto(2500);

    if (isProgrammaticRef.current) return;
    scheduleSnap();
  }, [getNearestLoopedIndex, n, pauseAuto, scheduleSnap]);

  const endMouseDrag = useCallback(
    (pointerId) => {
      const track = trackRef.current;

      if (track && pointerId != null) {
        track.releasePointerCapture?.(pointerId);
      }

      if (!isDraggingRef.current) return;

      isDraggingRef.current = false;
      setIsDragging(false);
      dragPointerIdRef.current = null;

      pauseAuto(2500);
      scheduleSnap(40);
      lockNavigation();
    },
    [lockNavigation, pauseAuto, scheduleSnap]
  );

  const onPointerDown = useCallback(
    (e) => {
      pauseAuto(3500);

      if (e.pointerType !== "mouse") return;

      const track = trackRef.current;
      if (!track) return;

      isDraggingRef.current = true;
      hasDraggedRef.current = false;
      setIsDragging(true);

      dragPointerIdRef.current = e.pointerId;
      dragStartXRef.current = e.clientX;
      dragStartScrollLeftRef.current = track.scrollLeft;

      track.setPointerCapture?.(e.pointerId);
    },
    [pauseAuto]
  );

  const onPointerMove = useCallback((e) => {
    if (!isDraggingRef.current) return;
    if (e.pointerType !== "mouse") return;

    const track = trackRef.current;
    if (!track) return;

    const dx = e.clientX - dragStartXRef.current;

    if (Math.abs(dx) > DRAG_THRESHOLD_PX) {
      hasDraggedRef.current = true;
    }

    track.scrollLeft = dragStartScrollLeftRef.current - dx;
  }, []);

  const onPointerUp = useCallback(
    (e) => {
      if (e.pointerType !== "mouse") return;
      endMouseDrag(e.pointerId);
    },
    [endMouseDrag]
  );

  const onPointerCancel = useCallback(
    (e) => {
      if (e.pointerType !== "mouse") return;
      endMouseDrag(e.pointerId);
    },
    [endMouseDrag]
  );

  useEffect(() => {
    if (!n) return;

    const startIndex = middleStart;

    requestAnimationFrame(() => {
      scrollToLoopedIndex(startIndex, "auto");
      setActiveLoopedIndex(startIndex);
    });
  }, [middleStart, n, scrollToLoopedIndex]);

  useEffect(() => {
    if (!autoScroll || !n) return;

    autoTimerRef.current = window.setInterval(() => {
      if (Date.now() < pauseUntilRef.current) return;
      if (isHoveringRef.current) return;
      if (isDraggingRef.current) return;
      if (isProgrammaticRef.current) return;
      if (!canNavigateRef.current) return;

      const nearest = getEquivalentMiddleIndex(getNearestLoopedIndex());
      animateToLoopedIndex(nearest + 1);
    }, autoScrollMs);

    return () => {
      if (autoTimerRef.current) {
        window.clearInterval(autoTimerRef.current);
      }
    };
  }, [
    animateToLoopedIndex,
    autoScroll,
    autoScrollMs,
    getEquivalentMiddleIndex,
    getNearestLoopedIndex,
    n
  ]);

  useEffect(() => {
    return () => {
      if (autoTimerRef.current) window.clearInterval(autoTimerRef.current);
      if (idleTimerRef.current) window.clearTimeout(idleTimerRef.current);
      if (navUnlockTimerRef.current) {
        window.clearTimeout(navUnlockTimerRef.current);
      }
      if (animationDoneTimerRef.current) {
        window.clearTimeout(animationDoneTimerRef.current);
      }
    };
  }, []);

  if (!n) return null;

  const activeBaseIndex = toBaseIndex(activeLoopedIndex);

  return (
    <section className={`w-full ${className}`} aria-label="Feature carousel">
      <div className="relative mt-12 w-full">
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-12 bg-gradient-to-r from-[#FDFCF9] to-transparent sm:w-16" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-12 bg-gradient-to-l from-[#FDFCF9] to-transparent sm:w-16" />

        <button
          type="button"
          onClick={prev}
          aria-label="Previous feature"
          aria-disabled={!canNavigate}
          className={[
            "absolute left-3 top-1/2 z-10 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full",
            "bg-white/90 shadow-md ring-1 ring-black/5 backdrop-blur transition",
            "md:flex sm:left-6",
            canNavigate
              ? "hover:scale-[1.03] active:scale-[0.98]"
              : "opacity-70"
          ].join(" ")}
        >
          <Icon icon="mingcute:left-line" className="text-2xl" />
        </button>

        <button
          type="button"
          onClick={next}
          aria-label="Next feature"
          aria-disabled={!canNavigate}
          className={[
            "absolute right-3 top-1/2 z-10 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full",
            "bg-white/90 shadow-md ring-1 ring-black/5 backdrop-blur transition",
            "md:flex sm:right-6",
            canNavigate
              ? "hover:scale-[1.03] active:scale-[0.98]"
              : "opacity-70"
          ].join(" ")}
        >
          <Icon icon="mingcute:right-line" className="text-2xl" />
        </button>

        <div
          ref={trackRef}
          onScroll={onScroll}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerCancel}
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
          className={[
            "w-full",
            "flex gap-6 sm:gap-8 lg:gap-10",
            "overflow-x-auto overflow-y-hidden",
            "px-4 sm:px-6 lg:px-10",
            "scroll-px-4 sm:scroll-px-6 lg:scroll-px-10",
            "py-4 pb-8",
            "overscroll-x-contain",
            "touch-pan-x select-none",
            "cursor-default md:cursor-grab",
            isDragging ? "md:cursor-grabbing" : "",
            "[scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden",
            "scrollbar-hide"
          ].join(" ")}
          style={{
            userSelect: "none",
            WebkitUserSelect: "none",
            scrollBehavior: "auto"
          }}
        >
          {loopedCards.map((card, loopedIdx) => {
            const baseIdx = toBaseIndex(loopedIdx);
            const isActive = baseIdx === activeBaseIndex;

            return (
              <FeatureCard
                key={`${card.id ?? baseIdx}-loop-${loopedIdx}`}
                ref={(el) => {
                  itemRefs.current[loopedIdx] = el;
                }}
                {...card}
                isActive={isActive}
                className={[
                  "shrink-0",
                  "w-[88vw] sm:w-[420px] lg:w-[520px]",
                  "transition-[transform,opacity] duration-300 ease-out",
                  card.className ?? ""
                ].join(" ")}
                activeClassName={card.activeClassName ?? activeClassName}
                inactiveClassName={card.inactiveClassName ?? inactiveClassName}
              />
            );
          })}
        </div>

        <div className="mt-2 flex justify-center gap-2 sm:gap-3">
          {baseCards.map((card, idx) => (
            <button
              key={`${card.id ?? idx}-dot`}
              type="button"
              onClick={() => goToBaseIndex(idx)}
              aria-label={`Show ${card.title ?? "feature"} card`}
              aria-pressed={activeBaseIndex === idx}
              className={[
                "h-2.5 rounded-full transition-all duration-200",
                "focus-visible:ring-2 focus-visible:ring-[#11285A] focus-visible:ring-offset-2",
                activeBaseIndex === idx
                  ? "w-8 bg-[#11285A]"
                  : "w-2.5 bg-[#d7dde9]"
              ].join(" ")}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
