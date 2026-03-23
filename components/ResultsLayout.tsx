// components/ResultsLayout.tsx
"use client";

import { useState } from "react";
import StatementPanel from "./StatementPanel";
import AffinityBoard from "./AffinityBoard";
import InsightsPanel from "./InsightsPanel";

interface Statement {
  id: string;
  participant?: string;
  original_text: string;
  signal_type: string;
  annotation: string;
}

interface Framework {
  id: string;
  name: string;
  lens: string;
  themes: Array<{
    theme_name: string;
    description: string;
    statement_ids: string[];
    theme_insight: string;
  }>;
}

interface Insights {
  convergent_signals: Array<{
    signal: string;
    supporting_statement_ids: string[];
    across_frameworks: string[];
    confidence: string;
    explanation: string;
  }>;
  divergent_insights: Array<{
    insight: string;
    source_framework: string;
    why_hidden: string;
    follow_up_question: string;
    supporting_statement_ids: string[];
  }>;
  contradictions: Array<{
    tension: string;
    statement_ids: string[];
    implication: string;
  }>;
  recommendations: {
    deeper_investigation: string[];
    challenged_assumptions: string[];
    most_surprising: string;
  };
  cross_participant_patterns?: {
    shared_across_multiple: Array<{ pattern: string; participants: string[]; strength: string }>;
    unique_to_individual: Array<{ pattern: string; participant: string; why_notable: string }>;
    subgroups: Array<{ group_description: string; participants: string[]; shared_pattern: string }>;
  };
}

interface Props {
  statements: Statement[];
  frameworks: Framework[];
  insights: Insights;
}

export type HoverInsight = {
  statementIds: string[];
  type: "signal" | "blind_spot" | "contradiction";
} | null;

export default function ResultsLayout({ statements, frameworks, insights }: Props) {
  const isMultiParticipant = statements.some((s) => s.participant);
  const [leftCollapsed, setLeftCollapsed] = useState(false);
  const [hoverInsight, setHoverInsight] = useState<HoverInsight>(null);

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Top: 2-column grid — statements + affinity board */}
      <div
        className="min-h-0 overflow-hidden"
        style={{
          flex: "1 1 0",
          display: "grid",
          gridTemplateColumns: leftCollapsed ? "40px 1fr" : "200px 1fr",
          transition: "grid-template-columns 0.2s ease",
        }}
      >
        <div className="border-r border-border-subtle overflow-hidden">
          <StatementPanel
            statements={statements}
            collapsed={leftCollapsed}
            onToggle={() => setLeftCollapsed((v) => !v)}
            hoverInsight={hoverInsight}
          />
        </div>
        <div className="overflow-hidden">
          <AffinityBoard
            frameworks={frameworks}
            statements={statements}
            hoverInsight={hoverInsight}
          />
        </div>
      </div>

      {/* Bottom: full-width insights */}
      <div
        className="shrink-0 border-t border-border-subtle overflow-y-auto"
        style={{ maxHeight: "46%" }}
      >
        <InsightsPanel
          insights={insights}
          isMultiParticipant={isMultiParticipant}
          onInsightHover={setHoverInsight}
          onInsightLeave={() => setHoverInsight(null)}
        />
      </div>
    </div>
  );
}
