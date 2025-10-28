import { storeQuiz, getQuizzesIndex } from "../src/utils/storage";
import type { Quiz } from "../src/utils/validation";
import { LocalStorage } from "@raycast/api";

function makeQuiz(id: string, questionCount = 2): Quiz {
  return {
    quizId: id,
    title: `Title ${id}`,
    questions: Array.from({ length: questionCount }).map((_, i) => ({
      id: `q${i + 1}`,
      question: `Q${i + 1}?`,
      type: i % 2 === 0 ? "single-choice" : "multiple-choice",
      options: [
        { key: "A", text: "A" },
        { key: "B", text: "B" },
      ],
      correctAnswers: ["A"],
    })),
  };
}

beforeEach(async () => {
  await LocalStorage.clear();
});

describe("storage: storeQuiz", () => {
  it("stores quiz, seeds progress, and updates index", async () => {
    const quiz = makeQuiz("quiz-1", 3);
    await storeQuiz(quiz);

    const quizRaw = await LocalStorage.getItem<string>(`quiz:${quiz.quizId}`);
    expect(quizRaw).toBeTruthy();

    const progressRaw = await LocalStorage.getItem<string>(`progress:${quiz.quizId}`);
    expect(progressRaw).toBeTruthy();
    const progress = JSON.parse(progressRaw!) as { remainingQuestions: string[] };
    expect(progress.remainingQuestions).toEqual(["q1", "q2", "q3"]);

    const index = await getQuizzesIndex();
    expect(index).toHaveLength(1);
    expect(index[0]).toMatchObject({ quizId: quiz.quizId, title: quiz.title });
    expect(typeof index[0].lastUpdatedAt).toBe("number");
  });

  it("re-importing same quizId replaces quiz, resets progress and updates index timestamp", async () => {
    const quizV1 = makeQuiz("quiz-1", 2);
    await storeQuiz(quizV1);
    const index1 = await getQuizzesIndex();
    const ts1 = index1[0].lastUpdatedAt;

    // Simulate playing one question by mutating progress
    await LocalStorage.setItem(`progress:${quizV1.quizId}`, JSON.stringify({ remainingQuestions: ["q2"] }));

    // Import new version with different questions
    const quizV2 = makeQuiz("quiz-1", 4);
    await new Promise((r) => setTimeout(r, 1100)); // ensure timestamp difference in seconds
    await storeQuiz(quizV2);

    const stored = JSON.parse((await LocalStorage.getItem<string>(`quiz:${quizV2.quizId}`))!) as Quiz;
    expect(stored.questions).toHaveLength(4);

    const progressRaw2 = await LocalStorage.getItem<string>(`progress:${quizV2.quizId}`);
    const progress2 = JSON.parse(progressRaw2!) as { remainingQuestions: string[] };
    expect(progress2.remainingQuestions).toEqual(["q1", "q2", "q3", "q4"]);

    const index2 = await getQuizzesIndex();
    expect(index2).toHaveLength(1);
    expect(index2[0].lastUpdatedAt).toBeGreaterThanOrEqual(ts1);
  });

  it("getQuizzesIndex returns empty if not set or corrupted", async () => {
    const index = await getQuizzesIndex();
    expect(index).toEqual([]);

    await LocalStorage.setItem("quizzesIndex", "not-json");
    const index2 = await getQuizzesIndex();
    expect(index2).toEqual([]);
  });
});
