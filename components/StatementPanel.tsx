// components/StatementPanel.tsx
"use client";

import { HoverInsight } from "./ResultsLayout";

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

interface Statement {
  id: string;
  participant?: string;
  original_text: string;
  signal_type: string;
  annotation: string;
}

interface Props {
  statements: Statement[];
  collapsed: boolean;
  onToggle: () => void;
  hoverInsight: HoverInsight;
}

export default function StatementPanel({ statements, collapsed, onToggle, hoverInsight }: Props) {
  const hoveredIds = hoverInsight ? new Set(hoverInsight.statementIds) : null;
  const isHovering = hoveredIds !== null;
  const hoverColor = hoverInsight ? HOVER_COLORS[hoverInsight.type] : null;

  if (collapsed) {
    return (
      <div
        className="flex flex-col h-full items-center py-3 cursor-pointer hover:bg-bg-secondary transition-colors"
        onClick={onToggle}
        title="展开语句列表"
      >
        {/* Expand chevron */}
        <div className="w-7 h-7 rounded-lg flex items-center justify-center text-text-muted hover:text-text-primary transition-colors shrink-0">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M5 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        {/* Vertical count */}
        <div className="mt-3 flex flex-col items-center gap-1">
          <span className="text-sm font-semibold text-text-secondary">{statements.length}</span>
          <span
            className="text-[9px] font-mono text-text-muted uppercase tracking-widest"
            style={{ writingMode: "vertical-rl", textOrientation: "mixed" }}
          >
            stmts
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-3 pt-3 pb-2.5 border-b border-border-subtle shrink-0 flex items-center justify-between">
        <div>
          <p className="text-[10px] font-mono text-text-muted uppercase tracking-widest">
            Extracted statements
          </p>
          {(() => {
            const uniqueParticipants = Array.from(new Set(
              statements.filter((s) => s.participant).map((s) => s.participant as string)
            ));
            if (uniqueParticipants.length > 1) {
              return (
                <p className="text-[11px] text-text-muted mt-0.5">
                  从 <span className="text-text-secondary font-medium">{uniqueParticipants.length}</span> 份访谈中提取了{" "}
                  <span className="text-text-secondary font-medium">{statements.length}</span> 条关键语句
                </p>
              );
            }
            return (
              <p className="text-[11px] text-text-muted mt-0.5">
                提取了 <span className="text-text-secondary font-medium">{statements.length}</span> 条关键语句
              </p>
            );
          })()}
        </div>
        {/* Collapse chevron */}
        <button
          onClick={onToggle}
          className="w-6 h-6 flex items-center justify-center text-text-muted hover:text-text-primary rounded transition-colors shrink-0"
          title="收起"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M8 2L4 6l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>

      {/* Scrollable list */}
      <div className="overflow-y-auto flex-1 p-2 space-y-1.5">
        {statements.map((stmt) => {
          const pColor = stmt.participant
            ? (PARTICIPANT_COLORS[stmt.participant] ?? { bg: "#F0EDE8", text: "#5C5248" })
            : null;
          const isHighlighted = !isHovering || hoveredIds!.has(stmt.id);
          const isDimmed = isHovering && !isHighlighted;

          return (
            <div
              key={stmt.id}
              className="bg-white border border-border-subtle rounded-lg p-2.5 transition-all duration-200"
              style={{
                opacity: isDimmed ? 0.3 : 1,
                borderLeftColor: isHovering && isHighlighted ? hoverColor! : undefined,
                borderLeftWidth: isHovering && isHighlighted ? "3px" : undefined,
              }}
            >
              <div className="flex items-center gap-1.5 mb-1.5">
                <span className="font-mono text-[10px] text-text-muted">{stmt.id}</span>
                {pColor && (
                  <span
                    className="text-[9px] font-mono font-semibold px-1.5 py-px rounded-full"
                    style={{ backgroundColor: pColor.bg, color: pColor.text }}
                  >
                    {stmt.participant}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-text-primary leading-snug mb-1.5 line-clamp-3">
                {stmt.original_text}
              </p>
              <span className="inline-block text-[10px] font-mono text-text-muted bg-bg-secondary border border-border-subtle px-1.5 py-px rounded">
                {stmt.signal_type}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
