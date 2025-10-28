import { beforeEach, describe, expect, it } from "vitest";
import { LocalStorage } from "@raycast/api";
import { storeQuiz } from "../src/utils/storage";
import type { Quiz } from "../src/utils/validation";
import {
  evaluateAnswer,
  getProgress,
  getQuizzesWithRemainingCounts,
  getStoredQuiz,
  markQuestionPlayed,
  pickRandomQuestion,
  resetProgress,
} from "../src/utils/gameplay";

function makeQuiz(id: string): Quiz {
  return {
    quizId: id,
    title: `Quiz ${id}`,
    questions: [
      {
        id: "q1",
        question: "Q1?",
        type: "single-choice",
        options: [
          { key: "A", text: "A" },
          { key: "B", text: "B" },
        ],
        correctAnswers: ["A"],
      },
      {
        id: "q2",
        question: "Q2?",
        type: "multiple-choice",
        options: [
          { key: "A", text: "A" },
          { key: "B", text: "B" },
          { key: "C", text: "C" },
        ],
        correctAnswers: ["A", "C"],
      },
      {
        id: "q3",
        question: "Q3?",
        type: "single-choice",
        options: [
          { key: "A", text: "A" },
          { key: "B", text: "B" },
        ],
        correctAnswers: ["B"],
      },
    ],
  };
}

beforeEach(async () => {
  await LocalStorage.clear();
});

describe("gameplay utils", () => {
  it("stores and retrieves quiz, manages progress and picking deterministically", async () => {
    const quiz = makeQuiz("g1");
    await storeQuiz(quiz);

    const stored = await getStoredQuiz("g1");
    expect(stored?.title).toBe("Quiz g1");

    const prog = await getProgress("g1");
    expect(prog.remainingQuestions).toEqual(["q1", "q2", "q3"]);

    // deterministic RNG: choose index 1 (q2)
    const rng = () => 0.5; // with length=3, floor(0.5*3)=1
    const { question, remaining } = await pickRandomQuestion("g1", rng);
    expect(remaining).toBe(3);
    expect(question?.id).toBe("q2");

    // evaluate multiple-choice
    expect(evaluateAnswer(["A", "C"], ["C", "A"]).correct).toBe(true);
    expect(evaluateAnswer(["A", "C"], ["A"]).correct).toBe(false);
    expect(evaluateAnswer(["A", "C"], ["A", "B"]).correct).toBe(false);

    // mark played removes from remaining
    const updated = await markQuestionPlayed("g1", "q2");
    expect(updated.remainingQuestions).toEqual(["q1", "q3"]);

    // picking with rng selecting index 1 again should pick q3 now
    const { question: qNext } = await pickRandomQuestion("g1", rng);
    expect(qNext?.id).toBe("q3");

    // completion state
    await markQuestionPlayed("g1", "q3");
    await markQuestionPlayed("g1", "q1");
    const { question: none, remaining: rem0 } = await pickRandomQuestion("g1", rng);
    expect(none).toBeNull();
    expect(rem0).toBe(0);

    // reset progress fills again
    await resetProgress("g1");
    const prog2 = await getProgress("g1");
    expect(prog2.remainingQuestions).toEqual(["q1", "q2", "q3"]);
  });

  it("getQuizzesWithRemainingCounts derives remaining from progress", async () => {
    const quiz = makeQuiz("g2");
    await storeQuiz(quiz);
    // play one question
    await markQuestionPlayed("g2", "q1");

    const list = await getQuizzesWithRemainingCounts();
    const item = list.find((i) => i.quizId === "g2");
    expect(item?.remaining).toBe(2);
  });
});
