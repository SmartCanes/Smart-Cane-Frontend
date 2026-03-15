import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Icon } from "@iconify/react";
import useEmblaCarousel from "embla-carousel-react";
import FeatureCard from "@/ui/components/FeatureCard";

const AUTO_SCROLL_MS_DEFAULT = 5000;
const AUTO_PAUSE_MS = 5000;

export default function FeatureCarousel({
  cards = [],
  autoScroll = true,
  autoScrollMs = AUTO_SCROLL_MS_DEFAULT,
  className = "",
  activeClassName = "opacity-100 scale-100 sm:scale-[1.02]",
  inactiveClassName = "opacity-40 sm:opacity-60 scale-[0.94]"
}) {
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

  const [viewportRef, emblaApi] = useEmblaCarousel({
    loop: true,
    align: "center",
    containScroll: false,
    dragFree: false,
    skipSnaps: false
  });

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [canNavigate, setCanNavigate] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [isInViewport, setIsInViewport] = useState(false);
  const sectionRef = useRef(null);
  const autoTimerRef = useRef(null);
  const resumeTimerRef = useRef(null);

  useEffect(() => {
    const target = sectionRef.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      ([entry]) => setIsInViewport(entry.isIntersecting),
      { threshold: 0.25 }
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, []);

  const updateSelectedIndex = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  const stopAutoTimer = useCallback(() => {
    if (autoTimerRef.current) {
      window.clearInterval(autoTimerRef.current);
      autoTimerRef.current = null;
    }
  }, []);

  const startAutoTimer = useCallback(() => {
    if (!emblaApi || !autoScroll || isHovering || !isInViewport || n <= 1)
      return;
    stopAutoTimer();
    autoTimerRef.current = window.setInterval(() => {
      if (!isHovering && isInViewport) {
        emblaApi.scrollNext();
      }
    }, autoScrollMs);
  }, [
    autoScroll,
    autoScrollMs,
    emblaApi,
    isHovering,
    isInViewport,
    n,
    stopAutoTimer
  ]);

  const pauseAutoplay = useCallback(() => {
    stopAutoTimer();
  }, [stopAutoTimer]);

  const resumeAutoplay = useCallback(() => {
    startAutoTimer();
  }, [startAutoTimer]);

  const pauseThenResumeAutoplay = useCallback(() => {
    if (!emblaApi || !isInViewport || n <= 1) return;
    stopAutoTimer();

    if (resumeTimerRef.current) {
      window.clearTimeout(resumeTimerRef.current);
    }

    resumeTimerRef.current = window.setTimeout(() => {
      if (autoScroll && !isHovering && isInViewport && emblaApi) {
        emblaApi.scrollNext();
        startAutoTimer();
      }
    }, AUTO_PAUSE_MS);
  }, [
    autoScroll,
    emblaApi,
    isHovering,
    isInViewport,
    n,
    startAutoTimer,
    stopAutoTimer
  ]);

  useEffect(() => {
    return () => {
      stopAutoTimer();
      if (resumeTimerRef.current) {
        window.clearTimeout(resumeTimerRef.current);
      }
    };
  }, [stopAutoTimer]);

  useEffect(() => {
    if (!emblaApi) return;

    updateSelectedIndex();
    setCanNavigate(n > 1);

    emblaApi.on("select", updateSelectedIndex);
    emblaApi.on("reInit", updateSelectedIndex);

    return () => {
      emblaApi.off("select", updateSelectedIndex);
      emblaApi.off("reInit", updateSelectedIndex);
    };
  }, [emblaApi, n, updateSelectedIndex]);

  useEffect(() => {
    if (!emblaApi) return;
    if (isHovering || !isInViewport) {
      stopAutoTimer();
    } else {
      startAutoTimer();
    }

    return () => {
      stopAutoTimer();
    };
  }, [emblaApi, isHovering, isInViewport, startAutoTimer, stopAutoTimer]);

  const next = useCallback(() => {
    if (!emblaApi) return;
    pauseThenResumeAutoplay();
    emblaApi.scrollNext();
  }, [emblaApi, pauseThenResumeAutoplay]);

  const prev = useCallback(() => {
    if (!emblaApi) return;
    pauseThenResumeAutoplay();
    emblaApi.scrollPrev();
  }, [emblaApi, pauseThenResumeAutoplay]);

  const goToBaseIndex = useCallback(
    (index) => {
      if (!emblaApi) return;
      pauseThenResumeAutoplay();
      emblaApi.scrollTo(index);
    },
    [emblaApi, pauseThenResumeAutoplay]
  );

  if (!n) return null;

  return (
    <section
      ref={sectionRef}
      className={`w-full ${className}`}
      aria-label="Feature carousel"
    >
      <div className="relative mt-12 w-full">
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
          ref={viewportRef}
          onWheel={pauseThenResumeAutoplay}
          onTouchStart={pauseThenResumeAutoplay}
          onMouseDown={pauseThenResumeAutoplay}
          onMouseEnter={() => {
            setIsHovering(true);
            pauseAutoplay();
          }}
          onMouseLeave={() => {
            setIsHovering(false);
            resumeAutoplay();
          }}
          className="overflow-hidden touch-pan-y"
          style={{
            userSelect: "none",
            WebkitUserSelect: "none",
            WebkitOverflowScrolling: "touch"
          }}
        >
          <div
            className={[
              "flex gap-4 sm:gap-3 lg:gap-6",
              "px-4 sm:px-3 lg:px-8",
              "py-3 pb-6 sm:pb-7",
              "cursor-grab active:cursor-grabbing"
            ].join(" ")}
          >
            {baseCards.map((card, idx) => {
              const isActive = idx === selectedIndex;

              return (
                <div
                  key={card.id ?? idx}
                  className="min-w-0 shrink-0 basis-[92vw] sm:basis-[84vw] md:basis-[66vw] lg:basis-[52vw] xl:basis-[42vw] 2xl:basis-[500px] flex justify-center"
                >
                  <FeatureCard
                    {...card}
                    isActive={isActive}
                    className={[
                      "w-full will-change-transform",
                      "transition-[transform,opacity] duration-300 ease-out",
                      card.className ?? ""
                    ].join(" ")}
                    activeClassName={card.activeClassName ?? activeClassName}
                    inactiveClassName={
                      card.inactiveClassName ?? inactiveClassName
                    }
                  />
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-2 flex justify-center gap-2 sm:gap-3">
          {baseCards.map((card, idx) => (
            <button
              key={`${card.id ?? idx}-dot`}
              type="button"
              onClick={() => goToBaseIndex(idx)}
              aria-label={`Show ${card.title ?? "feature"} card`}
              aria-pressed={selectedIndex === idx}
              className={[
                "h-2.5 rounded-full transition-all duration-200",
                "focus-visible:ring-2 focus-visible:ring-[#11285A] focus-visible:ring-offset-2",
                selectedIndex === idx
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
