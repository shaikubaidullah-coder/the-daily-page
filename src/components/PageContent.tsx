import React from "react";
import { PageDefinition, PromptItem } from "../data/spreads";
import { InkText, InkState } from "./InkText";

interface PageContentProps {
  page: PageDefinition;
  prompt?: PromptItem;
  inkState?: InkState;
}

export const PageContent: React.FC<PageContentProps> = ({
  page,
  prompt,
  inkState = "hidden",
}) => {
  return (
    <div
      className="page-content"
      style={page.background ? { background: page.background } : undefined}
    >
      {page.elements.map((element, idx) => {
        const baseStyle: React.CSSProperties = {
          left: `${element.x}%`,
          top: `${element.y}%`,
          width: `${element.w}%`,
          zIndex: element.z ?? idx + 1,
        };

        if (element.type === "image") {
          const flip = element.src.includes("/flowers")
            ? " scaleY(-1)"
            : element.src.includes("/sprig")
            ? " scaleX(-1)"
            : "";

          return (
            <img
              key={`${element.src}-${idx}`}
              className={`page-content__image${
                element.hover ? " page-content__image--hoverable" : ""
              }`}
              src={element.src}
              alt=""
              aria-hidden="true"
              draggable={false}
              width={Math.round(3.92 * element.w)}
              height={Math.round(5.12 * element.h)}
              style={{
                ...baseStyle,
                height: `${element.h}%`,
                objectFit: element.fit ?? "fill",
                objectPosition: element.position,
                borderRadius: element.radius,
                clipPath: element.clipPath,
                filter: element.filter,
                opacity: element.opacity,
                // @ts-expect-error CSS variable definition
                "--art-transform": `rotate(${element.rotate ?? 0}deg)${flip}`,
              }}
            />
          );
        }

        const textContent = prompt?.text ?? element.text;
        const textStyle: React.CSSProperties = {
          ...baseStyle,
          fontFamily: element.font,
          fontSize: element.size,
          fontWeight: 700,
          color: element.color,
          textAlign: element.align ?? "left",
          lineHeight: 0.9,
          transform: `rotate(${element.rotate ?? 0}deg)`,
        };

        return (
          <div key={`text-${idx}`}>
            {prompt && (
              <span
                className="page-content__theme"
                style={{
                  left: `${element.x + element.w / 2}%`,
                  top: `calc(${element.y}% - 43px)`,
                  zIndex: element.z,
                }}
              >
                {prompt.category}
              </span>
            )}
            {element.animate === "ink" ? (
              inkState === "hidden" ? null : (
                <InkText
                  text={textContent}
                  state={inkState}
                  className="page-content__text"
                  style={textStyle}
                />
              )
            ) : (
              <p className="page-content__text" style={textStyle}>
                {textContent}
              </p>
            )}
          </div>
        );
      })}

      {page.hoverArt?.zones.map((zone, zIdx) => (
        <span
          key={`hover-zone-${zIdx}`}
          className="page-content__hover-zone"
          aria-hidden="true"
          style={{
            left: zone.x,
            top: zone.y,
            width: zone.w,
            height: zone.h,
          }}
        >
          <img
            src={page.hoverArt!.src}
            alt=""
            draggable={false}
            style={{
              left: -zone.x,
              top: -zone.y,
              transformOrigin: `${zone.x + zone.w / 2}px ${zone.y + zone.h / 2}px`,
            }}
          />
        </span>
      ))}
    </div>
  );
};
