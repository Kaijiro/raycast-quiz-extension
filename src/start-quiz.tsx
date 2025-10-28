import { Detail, LocalStorage } from "@raycast/api";
import { useEffect, useState } from "react";

type Props = {
  arguments: { quizId?: string };
};

export default function StartQuiz(props: Props) {
  const quizId = props.arguments?.quizId;
  const [title, setTitle] = useState<string>("Starting quiz...");
  const [markdown, setMarkdown] = useState<string>("Loading quiz...");

  useEffect(() => {
    async function load() {
      if (!quizId) {
        setTitle("Start Quiz");
        setMarkdown("No quiz selected. Use Import Quiz to add a quiz.");
        return;
      }
      const raw = await LocalStorage.getItem<string>(`quiz:${quizId}`);
      if (!raw) {
        setTitle("Quiz Not Found");
        setMarkdown(`No quiz found for id: ${quizId}`);
        return;
      }
      try {
        const quiz = JSON.parse(raw) as { title: string; questions?: { id: string }[] };
        // Ensure progress exists; if missing or invalid, reseed from quiz
        const progressKey = `progress:${quizId}`;
        const progressRaw = await LocalStorage.getItem<string>(progressKey);
        let reseeded = false;
        if (!progressRaw) {
          const remainingQuestions = (quiz.questions ?? []).map((q) => q.id);
          await LocalStorage.setItem(progressKey, JSON.stringify({ remainingQuestions }));
          reseeded = true;
        } else {
          try {
            const parsed = JSON.parse(progressRaw) as { remainingQuestions?: string[] };
            if (!parsed || !Array.isArray(parsed.remainingQuestions)) {
              const remainingQuestions = (quiz.questions ?? []).map((q) => q.id);
              await LocalStorage.setItem(progressKey, JSON.stringify({ remainingQuestions }));
              reseeded = true;
            }
          } catch {
            const remainingQuestions = (quiz.questions ?? []).map((q) => q.id);
            await LocalStorage.setItem(progressKey, JSON.stringify({ remainingQuestions }));
            reseeded = true;
          }
        }

        setTitle(quiz.title);
        setMarkdown(
          reseeded
            ? `Quiz \`${quiz.title}\` ready. Progress was missing/corrupted and has been reset. (Gameplay to be implemented)`
            : `Quiz \`${quiz.title}\` imported and ready. (Gameplay to be implemented)`
        );
      } catch {
        setTitle("Quiz Error");
        setMarkdown("Stored quiz is corrupted.");
      }
    }
    load();
  }, [quizId]);

  return <Detail navigationTitle={title} markdown={markdown} />;
}
