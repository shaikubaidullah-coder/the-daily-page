import React, { useId, useState, useRef, useEffect } from "react";

export type InkState = "hidden" | "writing" | "shown" | "absorbing";

interface InkTextProps {
  text: string;
  state: InkState;
  onDone?: () => void;
  className?: string;
  style?: React.CSSProperties;
}

const DURATIONS = {
  writing: 1800,
  absorbing: 1300,
};

const RANDOM_FACTORS = {
  writing: 180,
  absorbing: 350,
};

export const InkText: React.FC<InkTextProps> = ({
  text,
  state,
  onDone,
  className,
  style,
}) => {
  const filterId = useId();
  const [internalState, setInternalState] = useState<InkState>("hidden");
  const charRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const feFuncARef = useRef<SVGFEFuncAElement | null>(null);
  const feDisplacementRef = useRef<SVGFEDisplacementMapElement | null>(null);
  const onDoneRef = useRef(onDone);
  onDoneRef.current = onDone;

  useEffect(() => {
    let canceled = false;
    let animFrame = 0;

    const setFilterProgress = (progress: number) => {
      feFuncARef.current?.setAttribute("intercept", String(-4.8 + 4.6 * progress));
      feDisplacementRef.current?.setAttribute("scale", String(0.8 + 0.8 * (1 - progress)));
    };

    if (state === "hidden" || state === "shown") {
      setInternalState(state);
      setFilterProgress(state === "shown" || window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 1 : 0);
      return;
    }

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setInternalState(state === "writing" ? "shown" : "hidden");
      setFilterProgress(1);
      onDoneRef.current?.();
      return;
    }

    const runAnimation = async () => {
      let startTime: number | null = null;
      if (document.fonts) {
        await document.fonts.ready;
      }
      if (canceled) return;

      const spans = charRefs.current.filter((el): el is HTMLSpanElement => Boolean(el));
      if (!spans.length) {
        onDoneRef.current?.();
        return;
      }

      const duration = DURATIONS[state];
      const randomFactor = RANDOM_FACTORS[state];
      const containerRect = spans[0].closest(".ink-text")?.getBoundingClientRect() ?? { left: 0, top: 0 };

      const charPositions = spans.map((span) => {
        const rect = span.getBoundingClientRect();
        return {
          x: rect.left + rect.width / 2 - containerRect.left,
          y: rect.top + rect.height / 2 - containerRect.top,
        };
      });

      const numCenters = Math.min(spans.length, 5 + Math.floor(3 * Math.random()));
      const centers = Array.from({ length: numCenters }, (_, idx) => ({
        ...charPositions[Math.floor(Math.random() * charPositions.length)],
        offset: state === "writing" ? (idx === 0 ? 0 : 0.12 * Math.random() * duration) : 0.35 * Math.random() * duration,
      }));

      let maxDelay = 0;
      spans.forEach((span, idx) => {
        const pos = charPositions[idx];
        const distMin = Math.min(
          ...centers.map((c) => c.offset + (Math.hypot(pos.x - c.x, pos.y - c.y) * duration) / 260)
        );
        const delay = distMin + Math.random() * randomFactor;
        span.style.animationDelay = `${delay}ms`;
        maxDelay = Math.max(delay, maxDelay);
      });

      const totalTime = maxDelay + duration;
      setFilterProgress(state === "writing" ? 0.15 : 1);
      setInternalState(state);

      const loop = (time: number) => {
        if (canceled) return;
        if (startTime === null) startTime = time;
        const progress = Math.min(1, (time - startTime) / totalTime);

        const filterVal =
          state === "writing"
            ? 0.15 + 0.85 * (1 - Math.pow(1 - progress, 2.2))
            : 1 - progress * progress * (3 - 2 * progress) * 0.9;

        setFilterProgress(filterVal);

        if (progress < 1) {
          animFrame = requestAnimationFrame(loop);
        } else {
          setInternalState(state === "writing" ? "shown" : "hidden");
          onDoneRef.current?.();
        }
      };

      animFrame = requestAnimationFrame(loop);
    };

    runAnimation();

    return () => {
      canceled = true;
      cancelAnimationFrame(animFrame);
    };
  }, [state, text]);

  let globalCharIdx = 0;
  const words = text.split(/\s+/);

  return (
    <>
      <svg width="0" height="0" aria-hidden="true" className="ink-text__svg">
        <filter id={filterId} x="-5%" y="-10%" width="110%" height="120%">
          <feTurbulence type="fractalNoise" baseFrequency="0.045 0.07" numOctaves={3} seed={11} result="noise" />
          <feColorMatrix in="noise" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  1 0 0 0 0" result="na" />
          <feComponentTransfer in="na" result="mask">
            <feFuncA ref={feFuncARef} type="linear" slope={6} intercept={-4.8} />
          </feComponentTransfer>
          <feComposite in="SourceGraphic" in2="mask" operator="in" result="eroded" />
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={2} seed={3} result="grain" />
          <feDisplacementMap
            ref={feDisplacementRef}
            in="eroded"
            in2="grain"
            scale={1.6}
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>
      </svg>
      <p
        role="text"
        aria-label={text}
        className={`${className ?? ""} ink-text ink-text--${internalState}`}
        style={{ ...style, filter: `url(#${filterId})` }}
      >
        {words.map((word, wordIdx) => (
          <span key={wordIdx} aria-hidden="true">
            <span className="ink-text__word">
              {Array.from(word).map((char, charIdx) => {
                const currentIdx = globalCharIdx++;
                return (
                  <span
                    key={charIdx}
                    ref={(el) => {
                      charRefs.current[currentIdx] = el;
                    }}
                    className="ink-text__char"
                  >
                    {char}
                  </span>
                );
              })}
            </span>
            {wordIdx < words.length - 1 ? " " : null}
          </span>
        ))}
      </p>
    </>
  );
};
