import type { Quiz, QuizQuestion } from "./validation";

export type QuestionState =
  | { kind: "question"; selection: string[]; evaluated: boolean; correct: boolean | null }
  | { kind: "finished" }
  | { kind: "loading" };

export function buildQuestionMarkdown(
  quiz: Quiz | null,
  question: QuizQuestion | null,
  state: QuestionState
): string {
  if (!quiz || !question) return "Loading...";
  const typeLabel = question.type === "single-choice" ? "Single Choice" : "Multiple Choice";
  const lines: string[] = [];
  lines.push(`# ${quiz.title}`);
  lines.push("");
  lines.push(`> ${typeLabel}`);
  lines.push("");
  lines.push(`## ${question.question}`);
  lines.push("");
  // options
  const sel = state.kind === "question" ? state.selection : [];
  for (const opt of question.options) {
    const marker = sel.includes(opt.key) ? "[x]" : "[ ]";
    lines.push(`- ${marker} (${opt.key}) ${opt.text}`);
  }
  if (state.kind === "question" && state.evaluated) {
    lines.push("");
    lines.push(state.correct ? "✅ Correct" : "❌ Incorrect");
    // Requirement 3: show explanation when available after evaluation
    if (question.explanation && question.explanation.trim().length > 0) {
      lines.push("");
      lines.push(`ℹ️ ${question.explanation}`);
    }
  }
  return lines.join("\n");
}
