import { Action, ActionPanel, Detail, Icon } from "@raycast/api";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { Quiz } from "./utils/validation";
import { evaluateAnswer, markQuestionPlayed, pickRandomQuestion, resetProgress } from "./utils/gameplay";
import { buildQuestionMarkdown } from "./utils/markdown";

export default function QuizPlay(props: { quizId: string }) {
  const { quizId } = props;
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [questionId, setQuestionId] = useState<string | null>(null);
  const [state, setState] = useState<
    | { kind: "loading" }
    | { kind: "question"; selection: string[]; evaluated: boolean; correct: boolean | null }
    | { kind: "finished" }
    | { kind: "error"; message: string }
  >({ kind: "loading" });

  const question = useMemo(() => {
    if (!quiz || !questionId) return null;
    return quiz.questions.find((q) => q.id === questionId) ?? null;
  }, [quiz, questionId]);

  const isMultiple = question?.type === "multiple-choice";

  const loadNextQuestion = useCallback(async () => {
    const { quiz: q, question: nextQ } = await pickRandomQuestion(quizId);
    if (!q) {
      setState({ kind: "error", message: "Quiz not found" });
      return;
    }
    setQuiz(q);
    if (!nextQ) {
      setQuestionId(null);
      setState({ kind: "finished" });
      return;
    }
    setQuestionId(nextQ.id);
    setState({ kind: "question", selection: [], evaluated: false, correct: null });
  }, [quizId]);

  useEffect(() => {
    loadNextQuestion();
  }, [loadNextQuestion]);

  const title = useMemo(() => {
    if (!quiz) return "Loading...";
    if (state.kind === "finished") return `${quiz.title} · Finished`;
    return quiz.title;
  }, [quiz, state.kind]);

  function toggleSelection(key: string) {
    if (state.kind !== "question" || !question) return;
    if (!isMultiple) {
      // single-choice: immediate evaluation
      const correct = evaluateAnswer(question.correctAnswers, [key]).correct;
      setState({ kind: "question", selection: [key], evaluated: true, correct });
      return;
    }
    // multiple-choice: toggle
    const s = new Set(state.selection);
    if (s.has(key)) s.delete(key);
    else s.add(key);
    setState({ kind: "question", selection: Array.from(s), evaluated: false, correct: null });
  }

  async function submitMultiple() {
    if (state.kind !== "question" || !question) return;
    const correct = evaluateAnswer(question.correctAnswers, state.selection).correct;
    setState({ kind: "question", selection: state.selection, evaluated: true, correct });
  }

  async function nextQuestion() {
    if (!question) return;
    await markQuestionPlayed(quizId, question.id);
    await loadNextQuestion();
  }

  async function restart() {
    await resetProgress(quizId);
    await loadNextQuestion();
  }

  if (state.kind === "error") {
    return <Detail navigationTitle={title} markdown={`# Error\n\n${state.message}`} />;
  }

  if (state.kind === "finished") {
    return (
      <Detail
        navigationTitle={title}
        markdown={`# ${quiz?.title ?? "Quiz"}\n\n✅ You have finished this quiz.\n\n`}
        actions={
          <ActionPanel>
            <Action icon={Icon.ArrowClockwise} title="Restart Quiz" onAction={restart} />
            <Action.Push icon={Icon.ArrowLeft} title="Back to Quizzes" target={<div />} />
          </ActionPanel>
        }
      />
    );
  }

  const md = useMemo(() => {
    const builderState = state.kind === "question" ? state : { kind: "loading" as const };
    return buildQuestionMarkdown(quiz, question, builderState);
  }, [quiz, question, state]);

  const actions = (
    <ActionPanel>
      {question?.options.map((o) => (
        <Action
          key={o.key}
          title={isMultiple ? `Toggle ${o.key}` : `Choose ${o.key}`}
          onAction={() => toggleSelection(o.key)}
        />
      ))}
      {isMultiple && state.kind === "question" && !state.evaluated && (
        <Action icon={Icon.Check} title="Submit" onAction={submitMultiple} />
      )}
      {state.kind === "question" && state.evaluated && (
        <Action icon={Icon.Play} title="Next Question" onAction={nextQuestion} />
      )}
    </ActionPanel>
  );

  return <Detail navigationTitle={title} markdown={md} actions={actions} />;
}
