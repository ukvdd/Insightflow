// components/StatementCard.tsx
"use client";

const SIGNAL_COLORS: Record<string, string> = {
  pain_point: "bg-accent-rose/15 text-accent-rose border-accent-rose/20",
  behavior: "bg-accent-blue/15 text-accent-blue border-accent-blue/20",
  emotion: "bg-accent-amber/15 text-accent-amber border-accent-amber/20",
  unmet_need: "bg-accent-green/15 text-accent-green border-accent-green/20",
  workaround: "bg-purple-100 text-purple-700 border-purple-200",
  mental_model: "bg-cyan-100 text-cyan-700 border-cyan-200",
  contradiction: "bg-orange-100 text-orange-700 border-orange-200",
};

interface Statement {
  id: string;
  original_text: string;
  signal_type: string;
  annotation: string;
}

export default function StatementCard({ statement }: { statement: Statement }) {
  const colorClass =
    SIGNAL_COLORS[statement.signal_type] ||
    "bg-text-muted/15 text-text-muted border-text-muted/20";

  return (
    <div className="bg-bg-secondary border border-border-subtle rounded-xl p-4 hover:border-border-active transition-colors duration-200">
      <div className="flex items-start justify-between gap-3 mb-3">
        <span className="font-mono text-xs text-text-muted">
          {statement.id}
        </span>
        <span
          className={`text-[11px] font-mono px-2.5 py-1 rounded-full border ${colorClass}`}
        >
          {statement.signal_type}
        </span>
      </div>
      <p className="text-sm text-text-primary leading-relaxed mb-3">
        &ldquo;{statement.original_text}&rdquo;
      </p>
      <p className="text-xs text-text-muted leading-relaxed">
        {statement.annotation}
      </p>
    </div>
  );
}
