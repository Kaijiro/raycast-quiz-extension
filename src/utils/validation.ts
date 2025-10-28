export type QuizOption = { key: string; text: string };
export type QuizQuestion = {
  id: string;
  question: string;
  type: "single-choice" | "multiple-choice";
  options: QuizOption[];
  correctAnswers: string[];
  explanation?: string;
};
export type Quiz = {
  quizId: string;
  title: string;
  description?: string;
  questions: QuizQuestion[];
};

export function parseQuizJson(content: string): { quiz?: unknown; errors: string[] } {
  try {
    const parsed = JSON.parse(content);
    return { quiz: parsed, errors: [] };
  } catch (e) {
    return { errors: ["File is not valid JSON"] };
  }
}

export function validateQuizStructure(quiz: unknown): { errors: string[] } {
  const errors: string[] = [];
  const q = quiz as Partial<Quiz> | undefined;
  if (!q || typeof q !== "object") {
    return { errors: ["Root must be an object"] };
  }
  // quizId
  if (typeof q.quizId !== "string" || q.quizId.trim().length === 0) {
    errors.push("`quizId` must be a non-empty string");
  }
  // title
  if (typeof q.title !== "string" || q.title.trim().length === 0) {
    errors.push("`title` must be a non-empty string");
  }
  // questions
  if (!Array.isArray(q.questions)) {
    errors.push("`questions` must be an array");
  } else if (q.questions.length === 0) {
    errors.push("`questions` must be a non-empty array");
  } else {
    const ids = new Set<string>();
    for (let i = 0; i < q.questions.length; i++) {
      const qu = q.questions[i] as Partial<QuizQuestion> | undefined;
      const prefix = `questions[${i}]`;
      if (!qu || typeof qu !== "object") {
        errors.push(`${prefix} must be an object`);
        continue;
      }
      if (typeof qu.id !== "string" || qu.id.trim().length === 0) {
        errors.push(`${prefix}.id must be a non-empty string`);
      } else {
        if (ids.has(qu.id)) {
          errors.push(`${prefix}.id must be unique within the quiz`);
        }
        ids.add(qu.id);
      }
      if (typeof qu.question !== "string" || qu.question.trim().length === 0) {
        errors.push(`${prefix}.question must be a non-empty string`);
      }
      if (qu.type !== "single-choice" && qu.type !== "multiple-choice") {
        errors.push(
          `${prefix}.type must be either \"single-choice\" or \"multiple-choice\"`
        );
      }
      if (!Array.isArray(qu.options) || qu.options.length === 0) {
        errors.push(`${prefix}.options must be a non-empty array`);
      } else {
        const keys = new Set<string>();
        for (let j = 0; j < qu.options.length; j++) {
          const opt = qu.options[j] as Partial<QuizOption> | undefined;
          const op = `${prefix}.options[${j}]`;
          if (!opt || typeof opt !== "object") {
            errors.push(`${op} must be an object`);
            continue;
          }
          if (typeof opt.key !== "string" || opt.key.trim().length === 0) {
            errors.push(`${op}.key must be a non-empty string`);
          } else {
            if (keys.has(opt.key)) {
              errors.push(`${op}.key must be unique within the question`);
            }
            keys.add(opt.key);
          }
          if (typeof opt.text !== "string" || opt.text.trim().length === 0) {
            errors.push(`${op}.text must be a non-empty string`);
          }
        }
      }
      if (!Array.isArray(qu.correctAnswers) || qu.correctAnswers.length === 0) {
        errors.push(`${prefix}.correctAnswers must be a non-empty array`);
      } else {
        // must be keys from options and no duplicates
        const set = new Set<string>();
        for (let k = 0; k < qu.correctAnswers.length; k++) {
          const key = qu.correctAnswers[k];
          if (typeof key !== "string" || key.trim().length === 0) {
            errors.push(`${prefix}.correctAnswers[${k}] must be a non-empty string`);
            continue;
          }
          if (set.has(key)) {
            errors.push(`${prefix}.correctAnswers must not contain duplicates`);
          }
          set.add(key);
        }
        // check existence in options
        if (Array.isArray(qu.options)) {
          const optionKeys = new Set(qu.options.map((o) => (o as QuizOption).key));
          for (const key of set) {
            if (!optionKeys.has(key)) {
              errors.push(`${prefix}.correctAnswers contains unknown key: ${key}`);
            }
          }
        }
      }
      // check single vs multiple
      if (qu.type === "single-choice") {
        if (!Array.isArray(qu.correctAnswers) || qu.correctAnswers.length !== 1) {
          errors.push(`${prefix}.correctAnswers must have exactly one element for single-choice`);
        }
      }
      if (qu.type === "multiple-choice") {
        if (!Array.isArray(qu.correctAnswers) || qu.correctAnswers.length < 2) {
          errors.push(`${prefix}.correctAnswers must have more than one element for multiple-choice`);
        }
      }
    }
  }
  return { errors };
}
