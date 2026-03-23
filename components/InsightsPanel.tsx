// components/InsightsPanel.tsx
"use client";

import { useState } from "react";
import { HoverInsight } from "./ResultsLayout";

interface ConvergentSignal {
  signal: string;
  supporting_statement_ids: string[];
  across_frameworks: string[];
  confidence: string;
  explanation: string;
}

interface DivergentInsight {
  insight: string;
  source_framework: string;
  why_hidden: string;
  follow_up_question: string;
  supporting_statement_ids: string[];
}

interface Contradiction {
  tension: string;
  statement_ids: string[];
  implication: string;
}

interface CrossParticipantPatterns {
  shared_across_multiple: Array<{ pattern: string; participants: string[]; strength: string }>;
  unique_to_individual: Array<{ pattern: string; participant: string; why_notable: string }>;
  subgroups: Array<{ group_description: string; participants: string[]; shared_pattern: string }>;
}

interface Insights {
  convergent_signals: ConvergentSignal[];
  divergent_insights: DivergentInsight[];
  contradictions: Contradiction[];
  recommendations: {
    deeper_investigation: string[];
    challenged_assumptions: string[];
    most_surprising: string;
  };
  cross_participant_patterns?: CrossParticipantPatterns;
}

const PARTICIPANT_COLORS: Record<string, { bg: string; text: string }> = {
  P1: { bg: "#E6F1FB", text: "#0C447C" },
  P2: { bg: "#E1F5EE", text: "#085041" },
  P3: { bg: "#FAEEDA", text: "#633806" },
  P4: { bg: "#EEEDFE", text: "#3C3489" },
  P5: { bg: "#FBEAF0", text: "#72243E" },
};

type InsightType = "signal" | "blind_spot" | "contradiction" | "participant";

const CARD_CONFIG: Record<InsightType, {
  border: string;
  tagBg: string;
  tagText: string;
  label: string;
}> = {
  signal: { border: "#0F6E56", tagBg: "#EAF3DE", tagText: "#3B6D11", label: "强信号" },
  blind_spot: { border: "#993C1D", tagBg: "#FAECE7", tagText: "#993C1D", label: "盲区" },
  contradiction: { border: "#854F0B", tagBg: "#FAEEDA", tagText: "#854F0B", label: "矛盾" },
  participant: { border: "#185FA5", tagBg: "#E6F1FB", tagText: "#185FA5", label: "受访者对比" },
};

function InsightCard({
  type,
  mainText,
  subText,
  statementIds,
  extra,
  onHover,
  onLeave,
}: {
  type: InsightType;
  mainText: string;
  subText: string;
  statementIds: string[];
  extra?: React.ReactNode;
  onHover: () => void;
  onLeave: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  const cfg = CARD_CONFIG[type];

  return (
    <div
      onMouseEnter={() => { setHovered(true); onHover(); }}
      onMouseLeave={() => { setHovered(false); onLeave(); }}
      style={{
        border: `1px solid ${hovered ? cfg.border : "#E7E0D7"}`,
        borderLeft: `3px solid ${cfg.border}`,
        borderRadius: "0 8px 8px 0",
        padding: "16px 20px",
        backgroundColor: hovered ? "#FAFAF9" : "white",
        transition: "background-color 0.15s ease, border-color 0.15s ease",
        cursor: "default",
        display: "flex",
        flexDirection: "column",
        gap: "8px",
      }}
    >
      {/* Type badge */}
      <span
        style={{
          display: "inline-block",
          alignSelf: "flex-start",
          backgroundColor: cfg.tagBg,
          color: cfg.tagText,
          fontSize: "12px",
          fontWeight: 500,
          padding: "3px 10px",
          borderRadius: "12px",
          lineHeight: "1.4",
        }}
      >
        {cfg.label}
      </span>

      {/* Main text */}
      <p style={{ fontSize: "14px", fontWeight: 500, lineHeight: "1.6", color: "#1C1917", margin: 0 }}>
        {mainText}
      </p>

      {/* Sub text */}
      <p style={{ fontSize: "13px", lineHeight: "1.5", color: "#57534E", margin: 0 }}>
        {subText}
      </p>

      {/* Extra content */}
      {extra}

      {/* Statement ID chips */}
      {statementIds.length > 0 && (
        <div style={{ display: "flex", gap: "4px", flexWrap: "wrap", marginTop: "2px" }}>
          {statementIds.slice(0, 6).map((sid) => (
            <span
              key={sid}
              style={{
                fontSize: "10px",
                fontFamily: "monospace",
                color: "#A8A29E",
                backgroundColor: "#F2EDE7",
                border: "1px solid #E7E0D7",
                padding: "1px 6px",
                borderRadius: "4px",
              }}
            >
              {sid}
            </span>
          ))}
          {statementIds.length > 6 && (
            <span style={{ fontSize: "10px", fontFamily: "monospace", color: "#A8A29E", padding: "1px 4px" }}>
              +{statementIds.length - 6}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

const INITIAL_SHOW = 4;

export default function InsightsPanel({
  insights,
  isMultiParticipant = false,
  onInsightHover,
  onInsightLeave,
}: {
  insights: Insights;
  isMultiParticipant?: boolean;
  onInsightHover: (h: HoverInsight) => void;
  onInsightLeave: () => void;
}) {
  const [showAll, setShowAll] = useState(false);

  const cpp = insights.cross_participant_patterns;
  const hasCpp =
    isMultiParticipant &&
    cpp &&
    (cpp.shared_across_multiple.length > 0 || cpp.unique_to_individual.length > 0);

  // Flatten all insights in priority order: signals → blind spots → contradictions → participants
  type FlatInsight =
    | { type: "signal"; data: ConvergentSignal; key: string }
    | { type: "blind_spot"; data: DivergentInsight; key: string }
    | { type: "contradiction"; data: Contradiction; key: string }
    | { type: "participant"; data: { pattern: string; participants: string[]; strength?: string; participant?: string; why_notable?: string }; key: string };

  const allInsights: FlatInsight[] = [
    ...insights.convergent_signals.map((d, i) => ({ type: "signal" as const, data: d, key: `sig-${i}` })),
    ...insights.divergent_insights.map((d, i) => ({ type: "blind_spot" as const, data: d, key: `div-${i}` })),
    ...insights.contradictions.map((d, i) => ({ type: "contradiction" as const, data: d, key: `con-${i}` })),
    ...(hasCpp && cpp
      ? [
          ...cpp.shared_across_multiple.map((d, i) => ({ type: "participant" as const, data: d, key: `cpp-s-${i}` })),
          ...cpp.unique_to_individual.map((d, i) => ({
            type: "participant" as const,
            data: { pattern: d.pattern, participants: [d.participant], participant: d.participant, why_notable: d.why_notable },
            key: `cpp-u-${i}`,
          })),
        ]
      : []),
  ];

  const totalCount = allInsights.length;
  const visibleInsights = showAll ? allInsights : allInsights.slice(0, INITIAL_SHOW);
  const hiddenCount = totalCount - INITIAL_SHOW;

  return (
    <div className="px-6 py-5">
      {/* Section header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <h2 style={{ fontSize: "16px", fontWeight: 500, color: "#1C1917", margin: 0 }}>
            Key insights
          </h2>
          <span
            className="font-mono text-text-muted"
            style={{ fontSize: "12px" }}
          >
            {totalCount} 条
          </span>
        </div>

      </div>

      {/* Insights grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: "12px",
        }}
      >
        {visibleInsights.map((item) => {
          if (item.type === "signal") {
            return (
              <InsightCard
                key={item.key}
                type="signal"
                mainText={item.data.signal}
                subText={item.data.explanation}
                statementIds={item.data.supporting_statement_ids}
                extra={
                  <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                    <span
                      style={{
                        fontSize: "11px",
                        fontFamily: "monospace",
                        color: CARD_CONFIG.signal.tagText,
                        backgroundColor: CARD_CONFIG.signal.tagBg,
                        padding: "2px 8px",
                        borderRadius: "6px",
                      }}
                    >
                      {item.data.confidence}
                    </span>
                    <span style={{ fontSize: "11px", fontFamily: "monospace", color: "#A8A29E" }}>
                      {item.data.across_frameworks.join(" · ")}
                    </span>
                  </div>
                }
                onHover={() => onInsightHover({ statementIds: item.data.supporting_statement_ids, type: "signal" })}
                onLeave={onInsightLeave}
              />
            );
          }
          if (item.type === "blind_spot") {
            return (
              <InsightCard
                key={item.key}
                type="blind_spot"
                mainText={item.data.insight}
                subText={item.data.why_hidden}
                statementIds={item.data.supporting_statement_ids}
                extra={
                  <div
                    style={{
                      backgroundColor: CARD_CONFIG.blind_spot.tagBg,
                      borderRadius: "6px",
                      padding: "8px 10px",
                    }}
                  >
                    <p style={{ fontSize: "12px", color: CARD_CONFIG.blind_spot.tagText, margin: 0, lineHeight: "1.4" }}>
                      <span style={{ fontFamily: "monospace", fontWeight: 700, marginRight: "4px" }}>?</span>
                      {item.data.follow_up_question}
                    </p>
                  </div>
                }
                onHover={() => onInsightHover({ statementIds: item.data.supporting_statement_ids, type: "blind_spot" })}
                onLeave={onInsightLeave}
              />
            );
          }
          if (item.type === "contradiction") {
            return (
              <InsightCard
                key={item.key}
                type="contradiction"
                mainText={item.data.tension}
                subText={item.data.implication}
                statementIds={item.data.statement_ids}
                onHover={() => onInsightHover({ statementIds: item.data.statement_ids, type: "contradiction" })}
                onLeave={onInsightLeave}
              />
            );
          }
          if (item.type === "participant") {
            const participantList = item.data.participants ?? [];
            return (
              <InsightCard
                key={item.key}
                type="participant"
                mainText={item.data.pattern}
                subText={item.data.why_notable ?? item.data.strength ?? ""}
                statementIds={[]}
                extra={
                  <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                    {participantList.map((p) => {
                      const c = PARTICIPANT_COLORS[p] ?? { bg: "#F0EDE8", text: "#5C5248" };
                      return (
                        <span
                          key={p}
                          style={{
                            fontSize: "11px",
                            fontFamily: "monospace",
                            fontWeight: 700,
                            backgroundColor: c.bg,
                            color: c.text,
                            padding: "2px 8px",
                            borderRadius: "12px",
                          }}
                        >
                          {p}
                        </span>
                      );
                    })}
                  </div>
                }
                onHover={() => onInsightHover({ statementIds: [], type: "signal" })}
                onLeave={onInsightLeave}
              />
            );
          }
          return null;
        })}
      </div>

      {/* Show all / collapse toggle */}
      {totalCount > INITIAL_SHOW && (
        <div className="mt-4">
          <button
            onClick={() => setShowAll((v) => !v)}
            style={{
              fontSize: "13px",
              color: "#A8A29E",
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: 0,
            }}
            className="hover:text-text-secondary transition-colors"
          >
            {showAll ? "收起" : `显示全部 ${totalCount} 条洞察`}
          </button>
        </div>
      )}
    </div>
  );
}
