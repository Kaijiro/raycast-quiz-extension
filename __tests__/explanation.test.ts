import { describe, it, expect } from "vitest";
import type { Quiz } from "../src/utils/validation";
import { buildQuestionMarkdown } from "../src/utils/markdown";

function makeQuizWithExplanation(): Quiz {
  return {
    quizId: "exp-1",
    title: "Explained Quiz",
    questions: [
      {
        id: "q1",
        question: "What is 2+2?",
        type: "single-choice",
        options: [
          { key: "A", text: "3" },
          { key: "B", text: "4" },
        ],
        correctAnswers: ["B"],
        explanation: "2 and 2 add up to 4.",
      },
    ],
  };
}

describe("Requirement 3: show explanation after evaluation", () => {
  it("includes the explanation in the markdown when evaluated", () => {
    const quiz = makeQuizWithExplanation();
    const question = quiz.questions[0];

    // Before evaluation, no explanation line
    const mdBefore = buildQuestionMarkdown(quiz, question, {
      kind: "question",
      selection: ["B"],
      evaluated: false,
      correct: null,
    });
    expect(mdBefore).not.toContain("2 and 2 add up to 4.");

    // After evaluation, explanation should be shown regardless of correctness
    const mdAfterCorrect = buildQuestionMarkdown(quiz, question, {
      kind: "question",
      selection: ["B"],
      evaluated: true,
      correct: true,
    });
    expect(mdAfterCorrect).toContain("2 and 2 add up to 4.");

    const mdAfterIncorrect = buildQuestionMarkdown(quiz, question, {
      kind: "question",
      selection: ["A"],
      evaluated: true,
      correct: false,
    });
    expect(mdAfterIncorrect).toContain("2 and 2 add up to 4.");
  });
});
