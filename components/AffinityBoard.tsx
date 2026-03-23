// components/AffinityBoard.tsx
"use client";

import { useState } from "react";

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
  original_text: string;
  signal_type: string;
  annotation: string;
}

interface Props {
  frameworks: Framework[];
  statements: Statement[];
}

const FRAMEWORK_ACCENTS: Record<string, string> = {
  A: "accent-blue",
  B: "accent-amber",
  C: "accent-green",
};

export default function AffinityBoard({ frameworks, statements }: Props) {
  const [activeFramework, setActiveFramework] = useState("A");

  const statementsMap = new Map(statements.map((s) => [s.id, s]));
  const currentFramework = frameworks.find((f) => f.id === activeFramework);

  return (
    <div>
      {/* Framework Tabs */}
      <div className="flex items-center gap-2 mb-6">
        <span className="text-xs font-mono text-text-muted mr-2 uppercase tracking-wider">
          分类视角
        </span>
        {frameworks.map((fw) => {
          const isActive = fw.id === activeFramework;
          const accent = FRAMEWORK_ACCENTS[fw.id] || "accent-blue";
          return (
            <button
              key={fw.id}
              onClick={() => setActiveFramework(fw.id)}
              className={`
                px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200
                ${
                  isActive
                    ? `bg-${accent}/15 text-${accent} border border-${accent}/30`
                    : "bg-bg-tertiary text-text-muted border border-transparent hover:text-text-secondary hover:bg-bg-hover"
                }
              `}
            >
              <span className="font-mono text-xs mr-1.5 opacity-60">
                {fw.id}
              </span>
              {fw.name}
            </button>
          );
        })}
      </div>

      {/* Framework Lens Description */}
      {currentFramework && (
        <div className="mb-6 px-4 py-3 rounded-lg bg-bg-tertiary/50 border border-border-subtle">
          <p className="text-sm text-text-secondary">
            <span className="font-mono text-xs text-text-muted mr-2">
              分析视角:
            </span>
            {currentFramework.lens}
          </p>
        </div>
      )}

      {/* Theme Groups */}
      {currentFramework && (
        <div className="stagger-children" style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          {currentFramework.themes.map((theme, themeIdx) => (
            <div
              key={themeIdx}
              className="border border-border-subtle rounded-xl overflow-hidden"
              style={{ minWidth: 450, maxWidth: 520 }}
            >
              {/* Theme Header */}
              <div className="bg-bg-tertiary border-b border-border-subtle" style={{ padding: 20 }}>
                <div className="flex items-center justify-between mb-1.5">
                  <h3
                    className="text-text-primary"
                    style={{ fontSize: 17, fontWeight: 600 }}
                  >
                    {theme.theme_name}
                  </h3>
                  <span
                    className="font-mono text-text-muted px-2 py-0.5 rounded-full bg-bg-primary"
                    style={{ fontSize: 13 }}
                  >
                    {theme.statement_ids.length} 条语句
                  </span>
                </div>
                <p className="text-sm text-text-secondary leading-relaxed">
                  {theme.description}
                </p>
              </div>

              {/* Statement Cards */}
              <div className="p-4 flex flex-wrap gap-[10px]">
                {theme.statement_ids.map((sid) => {
                  const stmt = statementsMap.get(sid);
                  if (!stmt) return null;
                  return (
                    <div
                      key={sid}
                      className="bg-bg-primary border border-border-subtle rounded-lg hover:border-border-active transition-colors"
                      style={{ minWidth: 200, maxWidth: 280, padding: "12px 16px" }}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        {/* Respondent badge */}
                        <div
                          className="flex items-center justify-center rounded-full bg-bg-tertiary text-text-muted font-mono flex-shrink-0"
                          style={{ width: 22, height: 22, fontSize: 11 }}
                        >
                          {stmt.id.replace(/\D/g, "")}
                        </div>
                        <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-bg-tertiary text-text-muted">
                          {stmt.signal_type}
                        </span>
                      </div>
                      <p
                        className="text-text-primary overflow-hidden"
                        style={{
                          fontSize: 16,
                          lineHeight: 1.5,
                          display: "-webkit-box",
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: "vertical",
                        }}
                      >
                        &ldquo;{stmt.original_text}&rdquo;
                      </p>
                    </div>
                  );
                })}
              </div>

              {/* Theme Insight */}
              <div className="bg-bg-tertiary/30 border-t border-border-subtle" style={{ padding: "12px 20px" }}>
                <p className="text-text-secondary" style={{ fontSize: 13 }}>
                  <span className="font-mono text-[11px] text-accent-amber mr-2">
                    INSIGHT
                  </span>
                  {theme.theme_insight}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
