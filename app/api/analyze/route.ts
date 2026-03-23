// app/api/analyze/route.ts
import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { STAGE_1_PROMPT, STAGE_2_PROMPT, STAGE_3_PROMPT } from "@/lib/prompts";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

function cleanJSON(text: string): string {
  // Strip markdown code fences if model wraps output
  let cleaned = text.trim();
  if (cleaned.startsWith("```json")) {
    cleaned = cleaned.slice(7);
  } else if (cleaned.startsWith("```")) {
    cleaned = cleaned.slice(3);
  }
  if (cleaned.endsWith("```")) {
    cleaned = cleaned.slice(0, -3);
  }
  return cleaned.trim();
}

async function callClaude(
  systemPrompt: string,
  userMessage: string
): Promise<string> {
  const response = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 4096,
    system: systemPrompt,
    messages: [{ role: "user", content: userMessage }],
  });

  const textBlock = response.content.find((block) => block.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new Error("No text response from Claude");
  }
  return textBlock.text;
}

export async function POST(request: NextRequest) {
  try {
    const { transcript } = await request.json();

    if (!transcript || transcript.trim().length < 50) {
      return NextResponse.json(
        { error: "请输入至少50字的访谈逐字稿" },
        { status: 400 }
      );
    }

    // === Stage 1: Extract statements ===
    const stage1Raw = await callClaude(
      STAGE_1_PROMPT,
      `以下是访谈逐字稿：\n\n${transcript}`
    );
    const statements = JSON.parse(cleanJSON(stage1Raw));

    // === Stage 2: Multi-framework classification ===
    const stage2Raw = await callClaude(
      STAGE_2_PROMPT,
      `以下是从访谈中提取的语句列表：\n\n${JSON.stringify(statements, null, 2)}`
    );
    const classification = JSON.parse(cleanJSON(stage2Raw));

    // === Stage 3: Cross-framework insights ===
    const stage3Raw = await callClaude(
      STAGE_3_PROMPT,
      `以下是原始语句列表：\n${JSON.stringify(statements, null, 2)}\n\n以下是三种分类框架的结果：\n${JSON.stringify(classification, null, 2)}`
    );
    const insights = JSON.parse(cleanJSON(stage3Raw));

    return NextResponse.json({
      statements,
      classification,
      insights,
    });
  } catch (error: unknown) {
    console.error("Analysis error:", error);
    const message =
      error instanceof Error ? error.message : "分析过程中出错，请重试";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
