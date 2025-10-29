import { LocalStorage } from "@raycast/api";
import type { Quiz } from "./validation";

export type Progress = { remainingQuestions: string[] };

export async function getStoredQuiz(quizId: string): Promise<Quiz | null> {
  const raw = await LocalStorage.getItem<string>(`quiz:${quizId}`);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as Quiz;
  } catch {
    return null;
  }
}

export async function getProgress(quizId: string): Promise<Progress> {
  const raw = await LocalStorage.getItem<string>(`progress:${quizId}`);
  if (!raw) return { remainingQuestions: [] };
  try {
    const p = JSON.parse(raw) as Progress;
    if (!p || !Array.isArray(p.remainingQuestions)) return { remainingQuestions: [] };
    return { remainingQuestions: [...p.remainingQuestions] };
  } catch {
    return { remainingQuestions: [] };
  }
}

export async function setProgress(quizId: string, progress: Progress): Promise<void> {
  await LocalStorage.setItem(`progress:${quizId}`, JSON.stringify(progress));
}

export async function resetProgress(quizId: string): Promise<void> {
  const quiz = await getStoredQuiz(quizId);
  if (!quiz) return;
  const remainingQuestions = quiz.questions.map((q) => q.id);
  await setProgress(quizId, { remainingQuestions });
}

export function pickIndexRandomly(length: number, rng: () => number = Math.random): number {
  if (length <= 0) return -1;
  const r = rng();
  const idx = Math.floor(r * length);
  return Math.min(Math.max(idx, 0), length - 1);
}

export async function pickRandomQuestion(quizId: string, rng: () => number = Math.random) {
  const quiz = await getStoredQuiz(quizId);
  if (!quiz) return { quiz: null as Quiz | null, question: null as null, remaining: 0 };
  const progress = await getProgress(quizId);
  if (progress.remainingQuestions.length === 0) return { quiz, question: null as null, remaining: 0 };
  const idx = pickIndexRandomly(progress.remainingQuestions.length, rng);
  const qid = progress.remainingQuestions[idx];
  const question = quiz.questions.find((q) => q.id === qid) ?? null;
  const remaining = progress.remainingQuestions.length;
  return { quiz, question, remaining };
}

export type AnswerEvaluation = { correct: boolean };

export function evaluateAnswer(
  correctAnswers: string[],
  selected: string[]
): AnswerEvaluation {
  // compare sets, order independent, and ensure no extras/missing
  const selectedSet = new Set(selected);
  const correctSet = new Set(correctAnswers);
  if (selectedSet.size !== correctSet.size) return { correct: false };
  for (const a of selectedSet) {
    if (!correctSet.has(a)) return { correct: false };
  }
  return { correct: true };
}

export async function markQuestionPlayed(quizId: string, questionId: string): Promise<Progress> {
  const progress = await getProgress(quizId);
  const remainingQuestions = progress.remainingQuestions.filter((id) => id !== questionId);
  const updated = { remainingQuestions };
  await setProgress(quizId, updated);
  return updated;
}

export type QuizRemaining = { quizId: string; title: string; remaining: number; lastUpdatedAt?: number };
export type QuizIndexBase = { quizId: string; title: string; lastUpdatedAt?: number };

export async function getQuizzesWithRemainingCounts(): Promise<QuizRemaining[]> {
  // Read index for base list
  const indexRaw = await LocalStorage.getItem<string>("quizzesIndex");
  let index: QuizIndexBase[] = [];
  if (indexRaw) {
    try {
      index = JSON.parse(indexRaw) as QuizIndexBase[];
    } catch {
      index = [];
    }
  }
  const result: QuizRemaining[] = [];
  for (const it of index) {
    const p = await getProgress(it.quizId);
    result.push({ quizId: it.quizId, title: it.title, remaining: p.remainingQuestions.length, lastUpdatedAt: it.lastUpdatedAt });
  }
  return result;
}
