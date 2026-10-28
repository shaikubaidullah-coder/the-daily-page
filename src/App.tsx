import React, { useState, useRef, useEffect } from "react";
import { JournalRoot, JournalRootHandle } from "./components/JournalRoot";
import { ALL_PROMPTS } from "./data/spreads";

export const App: React.FC = () => {
  const [stageDimensions, setStageDimensions] = useState({
    scale: 1,
    width: 1440,
    height: 874,
  });
  const [mobileView, setMobileView] = useState<"cover" | "today">("cover");
  const [isMobile, setIsMobile] = useState(false);
  const [currentSpread, setCurrentSpread] = useState(0);
  const journalRef = useRef<JournalRootHandle>(null);

  const [camera, setCamera] = useState({
    scaleX: 376 / 392,
    scaleY: 1,
    coverX: 13 - (376 / 392) * 14,
    todayX: -((376 / 392) * 406),
    top: 208,
  });

  useEffect(() => {
    const handleResize = () => {
      const scale = Math.min(
        window.innerWidth / 1440,
        window.innerHeight / 874
      );
      const t = Math.max(0.5, Math.min(1, (window.innerHeight - 350) / 512));
      const r = Math.max(
        0.5,
        Math.min(376 / 392, (window.innerWidth - 26) / 392, t)
      );
      const n = (window.innerWidth - 392 * r) / 2;
      const o = Math.max(window.innerHeight / 2 - 256 * t + 35, 132 + 84 * t);

      setCamera({
        scaleX: r,
        scaleY: t,
        coverX: n - 14 * r,
        todayX: Math.max(0, n - 13) - 406 * r,
        top: o - 8 * t,
      });

      setIsMobile(window.matchMedia("(max-width: 767px)").matches);
      setStageDimensions({
        scale,
        width: window.innerWidth / scale,
        height: window.innerHeight / scale,
      });
    };

    handleResize();
    window.addEventListener("resize", handleResize, { passive: true });
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <main className="viewport" aria-label="The daily page journal">
      <div
        className={`stage${mobileView === "today" ? " stage--today" : ""}`}
        style={{
          // @ts-expect-error CSS variables definition
          "--stage-scale": stageDimensions.scale,
          "--stage-width": `${stageDimensions.width}px`,
          "--stage-height": `${stageDimensions.height}px`,
        }}
      >
        {/* Masthead Header */}
        <header className="masthead">
          <h1>the  daily  page</h1>
        </header>

        {/* Top Lace Border */}
        <div className="lace-strip lace-strip--top" aria-hidden="true" />

        {/* Dynamic Journal Camera (Desktop Contents / Mobile Panning) */}
        <div
          className="journal-camera"
          style={{
            // @ts-expect-error CSS variables definition
            "--camera-cover-x": `${camera.coverX}px`,
            "--camera-today-x": `${camera.todayX}px`,
            "--camera-top": `${camera.top}px`,
            "--camera-scale-x": camera.scaleX,
            "--camera-scale-y": camera.scaleY,
          }}
        >
          {/* Hanging Ribbon Bookmark */}
          <img
            className="ribbon-bookmark"
            src="/assets/bookmark.png"
            alt=""
            aria-hidden="true"
            width={51}
            height={85}
            draggable={false}
          />

          {/* Book Placement Wrapper */}
          <div className="journal-placement">
            <JournalRoot
              ref={journalRef}
              isMobile={isMobile}
              mobileView={mobileView}
              onMobileViewChange={setMobileView}
              onSpreadChange={setCurrentSpread}
            />
          </div>

          {/* Antique Wooden Clipboard Clip */}
          <img
            className="clipboard-clip"
            src="/assets/clip.png"
            alt=""
            aria-hidden="true"
            width={180}
            height={98}
            draggable={false}
          />
        </div>

        {/* Bottom Inverted Lace Border */}
        <div className="lace-strip lace-strip--bottom" aria-hidden="true" />

        {/* Mobile View Toggle Tabs */}
        <div
          className="mobile-journal-tabs"
          role="tablist"
          aria-label="Journal view"
        >
          <button
            type="button"
            role="tab"
            aria-selected={mobileView === "cover"}
            onClick={() => setMobileView("cover")}
            data-testid="button-mobile-cover"
          >
            Cover
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={mobileView === "today"}
            onClick={() => setMobileView("today")}
            data-testid="button-mobile-today"
          >
            Today's Page
          </button>
        </div>

        {/* Mobile Navigation Arrows */}
        <div className="mobile-page-arrows" aria-label="Turn pages">
          <button
            type="button"
            aria-label="Previous page"
            aria-disabled={currentSpread === 0}
            disabled={currentSpread === 0}
            onClick={() => journalRef.current?.back()}
            data-testid="button-mobile-previous"
          >
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="m14.5 5.5-6.5 6.5 6.5 6.5" />
            </svg>
          </button>
          <button
            type="button"
            aria-label="Next page"
            aria-disabled={currentSpread === ALL_PROMPTS.length - 1}
            disabled={currentSpread === ALL_PROMPTS.length - 1}
            onClick={() => journalRef.current?.forward()}
            data-testid="button-mobile-next"
          >
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="m9.5 5.5 6.5 6.5-6.5 6.5" />
            </svg>
          </button>
        </div>

        {/* Colophon Footer */}
        <footer className="colophon">
          <span>curated & built by</span>
          <a
            href="https://github.com/shaikubaidullah"
            target="_blank"
            rel="noopener noreferrer"
            data-testid="link-creator"
          >
            Shaik Ubaidullah
          </a>
          <span>• the daily page</span>
        </footer>
      </div>
    </main>
  );
};

export default App;
