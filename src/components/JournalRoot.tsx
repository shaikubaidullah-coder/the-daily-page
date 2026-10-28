import React, {
  forwardRef,
  useState,
  useRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
} from "react";
import { flushSync } from "react-dom";
import {
  BASE_SPREADS,
  ALL_PROMPTS,
  PromptItem,
  SpreadTemplate,
} from "../data/spreads";
import { PageContent } from "./PageContent";
import { InkState } from "./InkText";

export interface JournalRootHandle {
  forward: () => void;
  back: () => void;
}

interface JournalRootProps {
  isMobile: boolean;
  mobileView: "cover" | "today";
  onMobileViewChange: (view: "cover" | "today") => void;
  onSpreadChange: (index: number) => void;
}

const TOTAL_PROMPTS = ALL_PROMPTS.length;
const LEAVES_COUNT = TOTAL_PROMPTS + 2;

function wrapIndex(idx: number): number {
  return (idx - 1 + TOTAL_PROMPTS) % TOTAL_PROMPTS;
}

function calculateDynamicLight(val: number): number {
  return Math.min(
    1,
    Math.max(0, (0.3 + 0.574 - (0.3 + 0.7 * Math.max(val, 0))) * 0.8)
  );
}

function isLeafVisible(leafIdx: number, activeIdx: number): boolean {
  return (
    2 >=
    Math.min(
      Math.abs(leafIdx - activeIdx),
      Math.abs(leafIdx - activeIdx - TOTAL_PROMPTS),
      Math.abs(leafIdx - activeIdx + TOTAL_PROMPTS)
    )
  );
}

export const JournalRoot = forwardRef<JournalRootHandle, JournalRootProps>(
  ({ isMobile, mobileView, onMobileViewChange, onSpreadChange }, ref) => {
    const [currentSpread, setCurrentSpread] = useState(0);
    const [activeFlippingLeaf, setActiveFlippingLeaf] = useState<number | null>(null);
    const [promptsList, setPromptsList] = useState<PromptItem[]>([]);
    const [templatesMapping, setTemplatesMapping] = useState<number[]>(() =>
      Array.from({ length: TOTAL_PROMPTS }, (_, idx) => idx % BASE_SPREADS.length)
    );
    const [inkStates, setInkStates] = useState<InkState[]>(() =>
      Array.from({ length: TOTAL_PROMPTS }, () => "hidden")
    );

    const mappedSpreads = useMemo<SpreadTemplate[]>(
      () =>
        templatesMapping.map((tmplIdx, idx) => ({
          ...BASE_SPREADS[tmplIdx],
          id: `${idx}-${BASE_SPREADS[tmplIdx].id}`,
        })),
      [templatesMapping]
    );

    const leafRotationsRef = useRef<number[]>(
      Array.from({ length: LEAVES_COUNT }, (_, idx) => 180 * (idx === 0 ? 1 : 0))
    );
    const leafAnimationsRef = useRef<
      ({ from: number; to: number; start: number; duration: number } | null)[]
    >(Array.from({ length: LEAVES_COUNT }, () => null));

    const leafDomsRef = useRef<(HTMLDivElement | null)[]>([]);
    const frontLightsRef = useRef<(HTMLDivElement | null)[]>([]);
    const backLightsRef = useRef<(HTMLDivElement | null)[]>([]);
    const castShadowRef = useRef<HTMLDivElement | null>(null);

    const animFrameRef = useRef<number>(0);
    const activeLeafIdxRef = useRef<number | null>(null);
    const currentIndexRef = useRef<number>(1);
    const mobilePropsRef = useRef({ isMobile, mobileView });
    mobilePropsRef.current = { isMobile, mobileView };

    const wasMobileRef = useRef<boolean>(isMobile);
    const touchStartRef = useRef<{ id: number; x: number; y: number } | null>(null);
    const lastTouchTimeRef = useRef<number>(0);
    const nextWriteTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const timeoutsSetRef = useRef<Set<ReturnType<typeof setTimeout>>>(new Set());

    const safeTimeout = useCallback((fn: () => void, delayMs: number) => {
      const id = setTimeout(() => {
        timeoutsSetRef.current.delete(id);
        fn();
      }, delayMs);
      timeoutsSetRef.current.add(id);
      return id;
    }, []);

    const setLeafRestPosition = useCallback((leafIdx: number, deg: number) => {
      leafRotationsRef.current[leafIdx] = deg;
      leafAnimationsRef.current[leafIdx] = null;
      const leaf = leafDomsRef.current[leafIdx];
      if (leaf) {
        leaf.style.transform = `rotateY(${-deg}deg)`;
        leaf.style.zIndex =
          deg >= 179.999 ? String(leafIdx + 1) : String(LEAVES_COUNT - leafIdx);
        leaf.style.willChange = "";
      }
      if (frontLightsRef.current[leafIdx]) {
        frontLightsRef.current[leafIdx]!.style.opacity = "0";
      }
      if (backLightsRef.current[leafIdx]) {
        backLightsRef.current[leafIdx]!.style.opacity = "0";
      }
    }, []);

    const updatePhysicsLightingAndShadow = useCallback(
      (leafIdx: number, deg: number) => {
        const rad = (deg * Math.PI) / 180;
        const sin = Math.max(0, Math.sin(rad));
        const cos = Math.cos(rad);
        const leaf = leafDomsRef.current[leafIdx];
        if (leaf) {
          leaf.style.transform = `rotateY(${-deg}deg)`;
        }
        if (frontLightsRef.current[leafIdx]) {
          frontLightsRef.current[leafIdx]!.style.opacity = String(
            calculateDynamicLight(0.45 * sin + 0.82 * cos)
          );
        }
        if (backLightsRef.current[leafIdx]) {
          backLightsRef.current[leafIdx]!.style.opacity = String(
            calculateDynamicLight(-0.45 * sin - 0.82 * cos)
          );
        }
        const shadow = castShadowRef.current;
        if (shadow) {
          const proj = cos + 0.55 * sin;
          shadow.style.transform = `translate3d(${Math.min(
            0,
            392 * proj
          )}px, ${168.56 * sin * 0.55}px, 0) scaleX(${Math.max(
            0.001,
            Math.abs(proj)
          )})`;
          shadow.style.opacity = String(0.2 * Math.pow(sin, 0.6));
        }
      },
      []
    );

    const animationLoop = useCallback(
      (time: number) => {
        const activeIdx = activeLeafIdxRef.current;
        let isStillRunning = false;

        if (activeIdx !== null) {
          const anim = leafAnimationsRef.current[activeIdx];
          if (anim) {
            const rawProgress = Math.min(1, (time - anim.start) / anim.duration);
            const easedProgress =
              rawProgress < 0.5
                ? 4 * rawProgress * rawProgress * rawProgress
                : 1 - Math.pow(-2 * rawProgress + 2, 3) / 2;

            leafRotationsRef.current[activeIdx] =
              anim.from + (anim.to - anim.from) * easedProgress;

            updatePhysicsLightingAndShadow(
              activeIdx,
              leafRotationsRef.current[activeIdx]
            );

            if (rawProgress >= 1) {
              setLeafRestPosition(activeIdx, anim.to);
              activeLeafIdxRef.current = null;
              if (castShadowRef.current) {
                castShadowRef.current.style.opacity = "0";
              }
            } else {
              isStillRunning = true;
            }
          }
        }

        if (!isStillRunning) {
          if (currentIndexRef.current === 0 || currentIndexRef.current === TOTAL_PROMPTS + 1) {
            const wrapped = currentIndexRef.current === 0 ? TOTAL_PROMPTS : 1;
            currentIndexRef.current = wrapped;
            leafRotationsRef.current.forEach((_, idx) =>
              setLeafRestPosition(idx, 180 * (idx < wrapped ? 1 : 0))
            );
          }
          setActiveFlippingLeaf(null);
          nextWriteTimeoutRef.current = safeTimeout(() => {
            setInkStates((prev) =>
              prev.map((state, idx) =>
                idx === wrapIndex(currentIndexRef.current)
                  ? mobilePropsRef.current.isMobile &&
                    mobilePropsRef.current.mobileView !== "today"
                    ? "hidden"
                    : "writing"
                  : state
              )
            );
            nextWriteTimeoutRef.current = null;
          }, 0);
        }

        animFrameRef.current = isStillRunning
          ? requestAnimationFrame(animationLoop)
          : 0;
      },
      [safeTimeout, setLeafRestPosition, updatePhysicsLightingAndShadow]
    );

    const turnToSpread = useCallback(
      (targetIdx: number) => {
        if (
          targetIdx < 0 ||
          targetIdx > TOTAL_PROMPTS + 1 ||
          targetIdx === currentIndexRef.current
        ) {
          return;
        }

        const fromIdx = currentIndexRef.current;
        const fromSpread = wrapIndex(fromIdx);
        const toSpread = wrapIndex(targetIdx);
        const prefersReducedMotion = window.matchMedia(
          "(prefers-reduced-motion: reduce)"
        ).matches;

        if (nextWriteTimeoutRef.current !== null) {
          clearTimeout(nextWriteTimeoutRef.current);
          timeoutsSetRef.current.delete(nextWriteTimeoutRef.current);
          nextWriteTimeoutRef.current = null;
        }

        currentIndexRef.current = prefersReducedMotion
          ? targetIdx === 0
            ? TOTAL_PROMPTS
            : targetIdx === TOTAL_PROMPTS + 1
            ? 1
            : targetIdx
          : targetIdx;

        flushSync(() => {
          setCurrentSpread(toSpread);
          setActiveFlippingLeaf(prefersReducedMotion ? null : fromIdx);
        });

        onSpreadChange(toSpread);

        if (prefersReducedMotion) {
          cancelAnimationFrame(animFrameRef.current);
          animFrameRef.current = 0;
          activeLeafIdxRef.current = null;
          leafRotationsRef.current.forEach((_, idx) =>
            setLeafRestPosition(idx, 180 * (idx < currentIndexRef.current ? 1 : 0))
          );
          if (castShadowRef.current) {
            castShadowRef.current.style.opacity = "0";
          }
          setInkStates((prev) =>
            prev.map((state, idx) =>
              idx === toSpread
                ? mobilePropsRef.current.isMobile &&
                  mobilePropsRef.current.mobileView !== "today"
                  ? "hidden"
                  : "writing"
                : idx === fromSpread
                ? "hidden"
                : state
            )
          );
          return;
        }

        // Ink absorption for the turning page
        setInkStates((prev) =>
          prev.map((state, idx) =>
            idx === fromSpread
              ? state === "writing" || state === "shown"
                ? "absorbing"
                : "hidden"
              : idx === toSpread
              ? "hidden"
              : state
          )
        );

        const now = performance.now();
        safeTimeout(() => {
          if (wrapIndex(currentIndexRef.current) !== fromSpread) {
            setInkStates((prev) =>
              prev.map((state, idx) => (idx === fromSpread ? "hidden" : state))
            );
          }
        }, 1080);

        const flippingLeafIdx = Math.min(fromIdx, targetIdx);
        if (
          activeLeafIdxRef.current !== null &&
          activeLeafIdxRef.current !== flippingLeafIdx
        ) {
          const prevLeaf = activeLeafIdxRef.current;
          setLeafRestPosition(prevLeaf, 180 * (prevLeaf < fromIdx ? 1 : 0));
        }

        activeLeafIdxRef.current = flippingLeafIdx;
        const currentRot = leafRotationsRef.current[flippingLeafIdx];
        const targetRot = 180 * (flippingLeafIdx < targetIdx ? 1 : 0);

        leafAnimationsRef.current[flippingLeafIdx] = {
          from: currentRot,
          to: targetRot,
          start: now,
          duration: 1080,
        };

        const leafDom = leafDomsRef.current[flippingLeafIdx];
        if (leafDom) {
          leafDom.style.zIndex = String(200 + flippingLeafIdx);
          leafDom.style.willChange = "transform";
        }

        if (!animFrameRef.current) {
          animFrameRef.current = requestAnimationFrame(animationLoop);
        }
      },
      [animationLoop, onSpreadChange, safeTimeout, setLeafRestPosition]
    );

    const stepPage = useCallback(
      (dir: number) => {
        if (
          !isMobile ||
          (currentIndexRef.current !== 1 || dir >= 0) &&
          (currentIndexRef.current !== TOTAL_PROMPTS || dir <= 0)
        ) {
          if (
            (currentIndexRef.current === 0 && dir < 0) ||
            (currentIndexRef.current === TOTAL_PROMPTS + 1 && dir > 0)
          ) {
            const wrapped = currentIndexRef.current === 0 ? TOTAL_PROMPTS : 1;
            currentIndexRef.current = wrapped;
            activeLeafIdxRef.current = null;
            leafRotationsRef.current.forEach((_, idx) =>
              setLeafRestPosition(idx, 180 * (idx < wrapped ? 1 : 0))
            );
            if (castShadowRef.current) {
              castShadowRef.current.style.opacity = "0";
            }
          }
          turnToSpread(currentIndexRef.current + dir);
        }
      },
      [isMobile, setLeafRestPosition, turnToSpread]
    );

    const forward = useCallback(() => stepPage(1), [stepPage]);
    const back = useCallback(() => stepPage(-1), [stepPage]);

    useImperativeHandle(ref, () => ({ forward, back }), [forward, back]);

    // Global keyboard navigation
    useEffect(() => {
      const handleGlobalKeyDown = (e: KeyboardEvent) => {
        const target = e.target as HTMLElement | null;
        if (
          target &&
          (target.tagName === "INPUT" ||
            target.tagName === "TEXTAREA" ||
            target.isContentEditable)
        ) {
          return;
        }
        if (e.key === "ArrowRight") {
          e.preventDefault();
          forward();
        } else if (e.key === "ArrowLeft") {
          e.preventDefault();
          back();
        }
      };

      window.addEventListener("keydown", handleGlobalKeyDown);
      return () => window.removeEventListener("keydown", handleGlobalKeyDown);
    }, [forward, back]);

    useEffect(() => {
      return () => {
        cancelAnimationFrame(animFrameRef.current);
        timeoutsSetRef.current.forEach(clearTimeout);
        timeoutsSetRef.current.clear();
      };
    }, []);

    // Shuffle / cycle prompts and templates on initial mount
    useEffect(() => {
      // Deterministic spread order matching original reference collection
      setPromptsList([...ALL_PROMPTS]);
      const tmplOrder: number[] = [];
      while (tmplOrder.length < TOTAL_PROMPTS) {
        tmplOrder.push(...BASE_SPREADS.map((_, i) => i));
      }
      setTemplatesMapping(tmplOrder.slice(0, TOTAL_PROMPTS));
    }, []);

    // Initial ink write effect
    useEffect(() => {
      let isSubscribed = true;
      const triggerInitialWrite = () => {
        if (!isSubscribed) return;
        safeTimeout(() => {
          if (
            currentIndexRef.current === 1 &&
            (!mobilePropsRef.current.isMobile ||
              mobilePropsRef.current.mobileView === "today")
          ) {
            setInkStates((prev) =>
              prev.map((state, idx) => (idx === 0 ? "writing" : state))
            );
          }
        }, 400);
      };

      if (document.fonts) {
        document.fonts.ready.then(triggerInitialWrite);
      } else {
        triggerInitialWrite();
      }

      return () => {
        isSubscribed = false;
      };
    }, [safeTimeout]);

    // Update ink when switching between mobile tabs (Cover <-> Today)
    useEffect(() => {
      const switchedToDesktop = wasMobileRef.current && !isMobile;
      wasMobileRef.current = isMobile;
      if (!isMobile && !switchedToDesktop) return;

      const activeSpread = wrapIndex(currentIndexRef.current);
      const isTodayActive = !isMobile || mobileView === "today";
      const isAnimating = leafAnimationsRef.current.some(Boolean);

      setInkStates((prev) =>
        prev.map((state, idx) => {
          if (idx !== activeSpread) return state;
          if (isTodayActive) {
            return isAnimating || state === "shown" || state === "writing"
              ? state
              : "writing";
          }
          return state === "writing" || state === "shown" ? "absorbing" : "hidden";
        })
      );
    }, [isMobile, mobileView]);

    const handlePointerDown = (e: React.PointerEvent) => {
      if (isMobile && e.pointerType !== "mouse") {
        touchStartRef.current = {
          id: e.pointerId,
          x: e.clientX,
          y: e.clientY,
        };
      }
    };

    const handlePointerUp = (e: React.PointerEvent) => {
      const start = touchStartRef.current;
      if (!isMobile || !start || start.id !== e.pointerId) return;
      touchStartRef.current = null;
      const dx = e.clientX - start.x;
      const dy = e.clientY - start.y;
      if (Math.hypot(dx, dy) >= 10) {
        lastTouchTimeRef.current = performance.now();
        if (Math.abs(dx) > 1.2 * Math.abs(dy)) {
          onMobileViewChange(dx < 0 ? "today" : "cover");
        }
      }
    };

    const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
      if (isMobile && performance.now() - lastTouchTimeRef.current < 800) {
        lastTouchTimeRef.current = 0;
        return;
      }
      const rect = e.currentTarget.getBoundingClientRect();
      if (e.clientX < rect.left + rect.width / 2) {
        back();
      } else {
        forward();
      }
      e.currentTarget.focus();
    };

    return (
      <div className="journal-root">
        <div
          className="journal-book"
          tabIndex={0}
          role="group"
          aria-label={`Journal, spread ${currentSpread + 1} of ${TOTAL_PROMPTS}. Use left and right arrow keys to turn pages.`}
          onKeyDown={(e) => {
            if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
              e.preventDefault();
              if (e.key === "ArrowRight") forward();
              else back();
            }
          }}
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp}
          onPointerCancel={() => {
            touchStartRef.current = null;
          }}
          onClick={handleClick}
        >
          {/* Base resting pages */}
          <div className="journal-pages">
            <div className="journal-page journal-page-left journal-rest">
              <PageContent
                page={mappedSpreads[TOTAL_PROMPTS - 1]?.left || BASE_SPREADS[0].left}
              />
            </div>
            <div className="journal-page journal-page-right journal-rest" />
            <div className="journal-shadow-clip">
              <div className="journal-cast-shadow" ref={castShadowRef} />
            </div>
          </div>

          {/* 3D Flipping Leaves */}
          <div className="journal-turning">
            {Array.from({ length: LEAVES_COUNT }, (_, idx) => idx)
              .reverse()
              .map((leafIdx) => {
                const isCurOrNear =
                  isLeafVisible(leafIdx, currentIndexRef.current) ||
                  3 >=
                    Math.min(
                      Math.abs(leafIdx - currentIndexRef.current),
                      Math.abs(leafIdx - currentIndexRef.current - TOTAL_PROMPTS),
                      Math.abs(leafIdx - currentIndexRef.current + TOTAL_PROMPTS)
                    );

                const spreadIdx = wrapIndex(leafIdx);
                const nextSpreadIdx = wrapIndex(leafIdx + 1);

                return (
                  <div
                    key={`${leafIdx}-${mappedSpreads[spreadIdx]?.id || leafIdx}`}
                    className={`journal-leaf${
                      !isCurOrNear ? " journal-leaf--occluded" : ""
                    }`}
                    ref={(el) => {
                      leafDomsRef.current[leafIdx] = el;
                    }}
                    style={{
                      zIndex: leafIdx === 0 ? 1 : LEAVES_COUNT - leafIdx,
                      transform: leafIdx === 0 ? "rotateY(-180deg)" : undefined,
                    }}
                  >
                    {isLeafVisible(leafIdx, currentIndexRef.current) ? (
                      <>
                        {/* Front Face: Right page of current spread */}
                        <div className="journal-page journal-page-right journal-face journal-front">
                          <PageContent
                            page={mappedSpreads[spreadIdx]?.right || BASE_SPREADS[0].right}
                            prompt={promptsList[spreadIdx]}
                            inkState={
                              leafIdx === currentIndexRef.current ||
                              leafIdx === activeFlippingLeaf
                                ? inkStates[spreadIdx]
                                : "hidden"
                            }
                          />
                          <div
                            className="journal-dynamic-light"
                            ref={(el) => {
                              frontLightsRef.current[leafIdx] = el;
                            }}
                          />
                        </div>

                        {/* Back Face: Left page of next spread */}
                        <div className="journal-page journal-page-left journal-face journal-back">
                          <PageContent
                            page={
                              mappedSpreads[nextSpreadIdx]?.left || BASE_SPREADS[0].left
                            }
                          />
                          <div
                            className="journal-dynamic-light"
                            ref={(el) => {
                              backLightsRef.current[leafIdx] = el;
                            }}
                          />
                        </div>
                      </>
                    ) : (
                      <div
                        className={`journal-page journal-paper-only ${
                          leafIdx < currentIndexRef.current
                            ? "journal-page-left journal-back"
                            : "journal-page-right"
                        }`}
                      />
                    )}
                  </div>
                );
              })}
          </div>

          <div className="journal-spine" aria-hidden="true" />
        </div>

        {/* Previous Page Desktop Arrow Button */}
        <button
          type="button"
          className="page-turn-button page-turn-button--previous"
          aria-label="Previous page"
          onClick={(e) => {
            e.stopPropagation();
            back();
          }}
        >
          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="m14.5 5.5-6.5 6.5 6.5 6.5" />
          </svg>
        </button>

        {/* Next Page Desktop Arrow Button */}
        <button
          type="button"
          className="page-turn-button page-turn-button--next"
          aria-label="Next page"
          onClick={(e) => {
            e.stopPropagation();
            forward();
          }}
        >
          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="m9.5 5.5 6.5 6.5-6.5 6.5" />
          </svg>
        </button>
      </div>
    );
  }
);

JournalRoot.displayName = "JournalRoot";
