import { describe, it, expect } from "vitest";
import { buildQuestionMarkdown, type QuestionState } from "../src/utils/markdown";
import type { Quiz, QuizQuestion } from "../src/utils/validation";
import { isMultipleChoice, shouldShowNext, shouldShowSubmit } from "../src/utils/ui";

const quiz: Quiz = {
  quizId: "mc",
  title: "MC Quiz",
  questions: [],
};

const question: QuizQuestion = {
  id: "q1",
  question: "Pick all that apply",
  type: "multiple-choice",
  options: [
    { key: "A", text: "Alpha" },
    { key: "B", text: "Beta" },
    { key: "C", text: "Gamma" },
  ],
  correctAnswers: ["A", "C"],
  explanation: "Because A and C are correct.",
};

describe("multiple-choice UI flow", () => {
  it("does not auto-validate and shows Submit until evaluated", () => {
    const state: QuestionState = { kind: "question", selection: ["A"], evaluated: false, correct: null };
    const md = buildQuestionMarkdown(quiz, question, state);
    expect(isMultipleChoice(question)).toBe(true);
    // shows options with selection marker
    expect(md).toMatch(/- \[x\] \(A\) Alpha/);
    expect(md).toMatch(/- \[ \] \(B\) Beta/);
    // no correctness or explanation before evaluation
    expect(md).not.toMatch(/✅ Correct|❌ Incorrect|ℹ️/);

    // actions visibility logic
    expect(shouldShowSubmit(question, state)).toBe(true);
    expect(shouldShowNext(state)).toBe(false);
  });

  it("after submit (evaluated), shows correctness, explanation and Next, hides Submit", () => {
    const state: QuestionState = { kind: "question", selection: ["A", "C"], evaluated: true, correct: true };
    const md = buildQuestionMarkdown(quiz, question, state);
    expect(md).toMatch(/✅ Correct/);
    expect(md).toMatch(/ℹ️ Because A and C are correct\./);

    expect(shouldShowSubmit(question, state)).toBe(false);
    expect(shouldShowNext(state)).toBe(true);
  });
});
