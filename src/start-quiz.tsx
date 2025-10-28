import { Action, ActionPanel, Icon, List } from "@raycast/api";
import { useEffect, useState } from "react";
import { getQuizzesWithRemainingCounts, resetProgress } from "./utils/gameplay";
import { deleteQuiz } from "./utils/storage";
import QuizPlay from "./quiz-play";

type Props = {
  arguments: { quizId?: string };
};

export default function StartQuiz(props: Props) {
  const quizId = props.arguments?.quizId;

  if (quizId) {
    return <QuizPlay quizId={quizId} />;
  }

  return <QuizzesList />;
}

function QuizzesList() {
  const [items, setItems] = useState<Awaited<ReturnType<typeof getQuizzesWithRemainingCounts>>>([]);
  const [loading, setLoading] = useState(true);

  async function reload() {
    setLoading(true);
    const list = await getQuizzesWithRemainingCounts();
    // sort by lastUpdated desc
    list.sort((a, b) => (b.lastUpdatedAt ?? 0) - (a.lastUpdatedAt ?? 0));
    setItems(list);
    setLoading(false);
  }

  useEffect(() => {
    reload();
  }, []);

  return (
    <List isLoading={loading} searchBarPlaceholder="Search quizzes" searchBarAccessory={undefined}>
      {items.length === 0 ? (
        <List.EmptyView
          title="No quizzes yet"
          description="Use Import Quiz to add one."
          icon={Icon.QuestionMarkCircle}
        />
      ) : (
        items.map((q) => (
          <List.Item
            key={q.quizId}
            title={q.title}
            accessories={[{ tag: `${q.remaining} remaining` }]}
            actions={
              <ActionPanel>
                <Action.Push title="Start" icon={Icon.Play} target={<QuizPlay quizId={q.quizId} />} />
                <Action
                  title="Reset Progress"
                  shortcut={{ modifiers: ["cmd"], key: "r" }}
                  onAction={async () => {
                    await resetProgress(q.quizId);
                    await reload();
                  }}
                />
                <Action
                  title="Delete Quiz"
                  style={Action.Style.Destructive}
                  shortcut={{ modifiers: ["cmd"], key: "backspace" }}
                  onAction={async () => {
                    await deleteQuiz(q.quizId);
                    await reload();
                  }}
                />
              </ActionPanel>
            }
          />
        ))
      )}
    </List>
  );
}
