import type { QuizQuestion } from "./validation";
import type { QuestionState } from "./markdown";

export function isMultipleChoice(question: QuizQuestion | null | undefined): boolean {
  return question?.type === "multiple-choice";
}

export function shouldShowSubmit(question: QuizQuestion | null, state: QuestionState): boolean {
  return isMultipleChoice(question) && state.kind === "question" && !state.evaluated;
}

export function shouldShowNext(state: QuestionState): boolean {
  return state.kind === "question" && state.evaluated;
}
