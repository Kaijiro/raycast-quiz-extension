import { LocalStorage } from "@raycast/api";
import type { Quiz } from "./validation";

export type QuizIndexItem = {
  quizId: string;
  title: string;
  lastUpdatedAt: number; // epoch seconds
};

const INDEX_KEY = "quizzesIndex";

export async function getQuizzesIndex(): Promise<QuizIndexItem[]> {
  const raw = await LocalStorage.getItem<string>(INDEX_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as QuizIndexItem[];
  } catch {
    return [];
  }
}

export async function setQuizzesIndex(index: QuizIndexItem[]): Promise<void> {
  await LocalStorage.setItem(INDEX_KEY, JSON.stringify(index));
}

export async function storeQuiz(quiz: Quiz): Promise<void> {
  const now = Math.floor(Date.now() / 1000);
  const quizKey = `quiz:${quiz.quizId}`;
  const progressKey = `progress:${quiz.quizId}`;

  // atomically replace quiz and reset progress
  await LocalStorage.setItem(quizKey, JSON.stringify(quiz));
  const remainingQuestions = quiz.questions.map((q) => q.id);
  await LocalStorage.setItem(progressKey, JSON.stringify({ remainingQuestions }));

  // update index
  const index = await getQuizzesIndex();
  const idx = index.findIndex((i) => i.quizId === quiz.quizId);
  const item: QuizIndexItem = { quizId: quiz.quizId, title: quiz.title, lastUpdatedAt: now };
  if (idx >= 0) index[idx] = item;
  else index.push(item);
  await setQuizzesIndex(index);
}

export async function deleteQuiz(quizId: string): Promise<void> {
  // remove quiz and its progress, and update index
  await LocalStorage.removeItem(`quiz:${quizId}`);
  await LocalStorage.removeItem(`progress:${quizId}`);
  const index = await getQuizzesIndex();
  const next = index.filter((i) => i.quizId !== quizId);
  await setQuizzesIndex(next);
}
