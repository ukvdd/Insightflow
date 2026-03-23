// components/StickyNote.tsx
"use client";

import { useState, useRef } from "react";

const PARTICIPANT_COLORS: Record<string, { bg: string; text: string }> = {
  P1: { bg: "#E6F1FB", text: "#0C447C" },
  P2: { bg: "#E1F5EE", text: "#085041" },
  P3: { bg: "#FAEEDA", text: "#633806" },
  P4: { bg: "#EEEDFE", text: "#3C3489" },
  P5: { bg: "#FBEAF0", text: "#72243E" },
};

interface StickyNoteProps {
  text: string;
  themeColor: { bg: string; text: string };
  participant?: string;
  signalType?: string;
  dim?: boolean;
  highlightColor?: string;
}

export default function StickyNote({
  text,
  themeColor,
  participant,
  signalType,
  dim,
  highlightColor,
}: StickyNoteProps) {
  const [hovered, setHovered] = useState(false);
  const [tooltipStyle, setTooltipStyle] = useState<React.CSSProperties>({});
  const ref = useRef<HTMLDivElement>(null);

  const pColor = participant
    ? (PARTICIPANT_COLORS[participant] ?? { bg: "#F0EDE8", text: "#5C5248" })
    : null;

  const handleMouseEnter = () => {
    if (ref.current) {
      const rect = ref.current.getBoundingClientRect();
      const spaceAbove = rect.top > 120;
      setTooltipStyle({
        position: "fixed",
        left: Math.min(rect.left, window.innerWidth - 224),
        ...(spaceAbove
          ? { top: rect.top - 8, transform: "translateY(-100%)" }
          : { top: rect.bottom + 8 }),
        zIndex: 9999,
      });
    }
    setHovered(true);
  };

  return (
    <>
      <div
        ref={ref}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={() => setHovered(false)}
        style={{
          backgroundColor: themeColor.bg,
          color: themeColor.text,
          padding: "8px 12px",
          borderRadius: "6px",
          fontSize: "14px",
          lineHeight: "1.5",
          position: "relative",
          maxWidth: "200px",
          minWidth: "150px",
          cursor: "default",
          opacity: dim ? 0.25 : 1,
          boxShadow: highlightColor ? `0 0 0 2px ${highlightColor}` : undefined,
          transition: "opacity 0.2s ease, box-shadow 0.2s ease",
        }}
      >
        {pColor && (
          <span
            style={{
              position: "absolute",
              top: "4px",
              right: "4px",
              width: "20px",
              height: "20px",
              borderRadius: "50%",
              backgroundColor: pColor.bg,
              color: pColor.text,
              fontSize: "9px",
              fontFamily: "monospace",
              fontWeight: "700",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            {participant?.replace("P", "")}
          </span>
        )}
        <span
          style={{
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            paddingRight: pColor ? "22px" : undefined,
          }}
        >
          {text}
        </span>
      </div>

      {/* Fixed-position tooltip — renders outside scroll containers */}
      {hovered && (
        <div
          style={tooltipStyle}
          className="w-52 bg-white border border-border-subtle rounded-xl shadow-lg p-3 pointer-events-none"
        >
          <p className="text-[12px] text-text-primary leading-snug mb-2">{text}</p>
          <div className="flex items-center gap-1.5 flex-wrap">
            {pColor && participant && (
              <span
                className="text-[10px] font-mono font-semibold px-1.5 py-px rounded-full"
                style={{ backgroundColor: pColor.bg, color: pColor.text }}
              >
                {participant}
              </span>
            )}
            {signalType && (
              <span className="text-[10px] font-mono text-text-muted bg-bg-secondary border border-border-subtle px-1.5 py-px rounded">
                {signalType}
              </span>
            )}
          </div>
        </div>
      )}
    </>
  );
}
