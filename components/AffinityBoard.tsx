// components/AffinityBoard.tsx
"use client";

import { useState } from "react";
import StickyNote from "./StickyNote";
import { HoverInsight } from "./ResultsLayout";

const THEME_COLORS = [
  { bg: "#FAECE7", text: "#4A1B0C" }, // Coral
  { bg: "#E1F5EE", text: "#04342C" }, // Teal
  { bg: "#EEEDFE", text: "#26215C" }, // Purple
  { bg: "#E6F1FB", text: "#042C53" }, // Blue
  { bg: "#FAEEDA", text: "#412402" }, // Amber
  { bg: "#FBEAF0", text: "#4B1528" }, // Pink
  { bg: "#EAF3DE", text: "#173404" }, // Green
];

const PARTICIPANT_COLORS: Record<string, { bg: string; text: string }> = {
  P1: { bg: "#E6F1FB", text: "#0C447C" },
  P2: { bg: "#E1F5EE", text: "#085041" },
  P3: { bg: "#FAEEDA", text: "#633806" },
  P4: { bg: "#EEEDFE", text: "#3C3489" },
  P5: { bg: "#FBEAF0", text: "#72243E" },
};

const HOVER_COLORS = {
  signal: "#0F6E56",
  blind_spot: "#993C1D",
  contradiction: "#854F0B",
};

interface Theme {
  theme_name: string;
  description: string;
  statement_ids: string[];
  theme_insight: string;
}

interface Framework {
  id: string;
  name: string;
  lens: string;
  themes: Theme[];
}

interface Statement {
  id: string;
  participant?: string;
  original_text: string;
  signal_type: string;
  annotation: string;
}

interface Props {
  frameworks: Framework[];
  statements: Statement[];
  hoverInsight: HoverInsight;
}

type AnimPhase = "idle" | "fadeOut" | "reset" | "fadeIn";

export default function AffinityBoard({ frameworks, statements, hoverInsight }: Props) {
  const [activeFramework, setActiveFramework] = useState("A");
  const [displayedFramework, setDisplayedFramework] = useState("A");
  const [animPhase, setAnimPhase] = useState<AnimPhase>("idle");

  const statementsMap = new Map(statements.map((s) => [s.id, s]));
  const currentFramework = frameworks.find((f) => f.id === displayedFramework);

  // Derive unique participants for legend
  const participantSet = new Set(
    statements.filter((s) => s.participant).map((s) => s.participant as string)
  );
  const participants = Array.from(participantSet).sort();

  // Hover state derived values
  const hoveredIds = hoverInsight ? new Set(hoverInsight.statementIds) : null;
  const isHovering = hoveredIds !== null;
  const hoverColor = hoverInsight ? HOVER_COLORS[hoverInsight.type] : null;

  const handleTabClick = (targetId: string) => {
    if (animPhase !== "idle" || targetId === activeFramework) return;
    setActiveFramework(targetId);
    setAnimPhase("fadeOut");
    setTimeout(() => {
      setDisplayedFramework(targetId);
      setAnimPhase("reset");
      setTimeout(() => {
        setAnimPhase("fadeIn");
        setTimeout(() => setAnimPhase("idle"), 150);
      }, 16);
    }, 150);
  };

  const contentStyle: React.CSSProperties = (() => {
    switch (animPhase) {
      case "fadeOut":
        return { opacity: 0, transform: "translateY(8px)", transition: "opacity 150ms ease, transform 150ms ease" };
      case "reset":
        return { opacity: 0, transform: "translateY(-6px)", transition: "none" };
      case "fadeIn":
        return { opacity: 1, transform: "translateY(0)", transition: "opacity 150ms ease, transform 150ms ease" };
      default:
        return { opacity: 1, transform: "translateY(0)", transition: "opacity 150ms ease, transform 150ms ease" };
    }
  })();

  return (
    <div className="flex flex-col h-full">
      {/* Framework tabs + lens description */}
      <div className="px-4 pt-3 pb-2.5 border-b border-border-subtle shrink-0">
        <div className="flex items-center gap-1.5 flex-wrap">
          {frameworks.map((fw) => (
            <button
              key={fw.id}
              onClick={() => handleTabClick(fw.id)}
              disabled={animPhase !== "idle"}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all duration-150 ${
                fw.id === activeFramework
                  ? "bg-text-primary text-bg-primary"
                  : "bg-bg-secondary text-text-muted border border-border-subtle hover:text-text-secondary"
              }`}
            >
              <span className="font-mono opacity-60 mr-0.5">{fw.id}</span>
              {fw.name}
            </button>
          ))}
        </div>
        {currentFramework && (
          <p className="text-[11px] text-text-muted mt-1.5 leading-snug">
            {currentFramework.lens}
          </p>
        )}
      </div>

      {/* Theme groups */}
      {currentFramework && (
        <div className="flex-1 p-4 overflow-hidden" style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ ...contentStyle, flex: "1 1 0", minHeight: 0, overflowY: "auto", overflowX: "hidden" }}>
            <div style={{ display: "flex", overflowX: "auto", gap: "20px", paddingBottom: "12px", scrollbarWidth: "thin" }}>
              {currentFramework.themes.map((theme, idx) => {
                const color = THEME_COLORS[idx % THEME_COLORS.length];
                // Theme is highlighted if any of its statements are in the hover set
                const themeHasHighlight =
                  isHovering && theme.statement_ids.some((id) => hoveredIds!.has(id));

                return (
                  <div key={idx} style={{ minWidth: "360px", maxWidth: "420px", flexShrink: 0 }}>
                    {/* Theme header */}
                    {(() => {
                      // Derive unique participants for this theme
                      const themeParticipants = Array.from(new Set(
                        theme.statement_ids
                          .map((sid) => statementsMap.get(sid)?.participant)
                          .filter((p): p is string => !!p)
                      )).sort();
                      const isAll = themeParticipants.length > 1 && themeParticipants.length === participants.length;

                      return (
                        <div
                          className="flex items-center justify-between mb-2 transition-all duration-200"
                          style={
                            themeHasHighlight
                              ? { borderLeft: `3px solid ${hoverColor}`, paddingLeft: "6px" }
                              : { borderLeft: "3px solid transparent", paddingLeft: "6px" }
                          }
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <span
                              className="w-2 h-2 rounded-full shrink-0"
                              style={{ backgroundColor: color.text }}
                            />
                            <span className="font-semibold text-text-primary truncate" style={{ fontSize: "15px" }}>
                              {theme.theme_name}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0 ml-2">
                            {/* Participant stacked avatars */}
                            {themeParticipants.length > 0 && (
                              <div className="flex items-center">
                                {themeParticipants.map((p, i) => {
                                  const c = PARTICIPANT_COLORS[p] ?? { bg: "#F0EDE8", text: "#5C5248" };
                                  return (
                                    <span
                                      key={p}
                                      style={{
                                        width: "18px",
                                        height: "18px",
                                        borderRadius: "50%",
                                        backgroundColor: c.bg,
                                        color: c.text,
                                        fontSize: "9px",
                                        fontFamily: "monospace",
                                        fontWeight: 700,
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        marginLeft: i === 0 ? 0 : "-4px",
                                        border: "1.5px solid white",
                                        position: "relative",
                                        zIndex: themeParticipants.length - i,
                                      }}
                                    >
                                      {p.replace("P", "")}
                                    </span>
                                  );
                                })}
                                {isAll && (
                                  <span
                                    className="ml-1.5 text-[9px] font-mono font-semibold px-1.5 py-px rounded-full"
                                    style={{ backgroundColor: "#EAF3DE", color: "#3B6D11" }}
                                  >
                                    ALL
                                  </span>
                                )}
                              </div>
                            )}
                            <span className="font-mono text-text-muted" style={{ fontSize: "12px" }}>
                              · {theme.statement_ids.length}
                            </span>
                          </div>
                        </div>
                      );
                    })()}

                    {/* Sticky notes */}
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                      {theme.statement_ids.map((sid) => {
                        const stmt = statementsMap.get(sid);
                        if (!stmt) return null;
                        const isHighlighted = !isHovering || hoveredIds!.has(sid);
                        return (
                          <StickyNote
                            key={sid}
                            text={stmt.original_text}
                            themeColor={color}
                            participant={stmt.participant}
                            signalType={stmt.signal_type}
                            dim={isHovering && !isHighlighted}
                            highlightColor={isHovering && isHighlighted ? hoverColor! : undefined}
                          />
                        );
                      })}
                    </div>

                    {/* Theme insight */}
                    <p className="text-text-muted mt-2 leading-snug italic" style={{ fontSize: "12px" }}>
                      {theme.theme_insight}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Participant legend */}
          {participants.length > 0 && (
            <div className="mt-6 pt-4 border-t border-border-subtle">
              <div className="flex items-center gap-4 flex-wrap">
                {participants.map((p) => {
                  const c = PARTICIPANT_COLORS[p] ?? { bg: "#F0EDE8", text: "#5C5248" };
                  const num = p.replace("P", "");
                  return (
                    <div key={p} className="flex items-center gap-1.5">
                      <span
                        className="w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-mono font-bold shrink-0"
                        style={{ backgroundColor: c.bg, color: c.text }}
                      >
                        {num}
                      </span>
                      <span className="text-[11px] text-text-muted">
                        Participant {num}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
