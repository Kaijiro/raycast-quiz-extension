import { parseQuizJson, validateQuizStructure, Quiz } from "../src/utils/validation";

describe("parseQuizJson", () => {
  it("returns error for invalid JSON", () => {
    const { errors } = parseQuizJson("{ invalid }");
    expect(errors).toHaveLength(1);
    expect(errors[0]).toMatch(/not valid JSON/i);
  });

  it("parses valid JSON", () => {
    const { quiz, errors } = parseQuizJson('{"a":1}');
    expect(errors).toHaveLength(0);
    expect(quiz).toEqual({ a: 1 });
  });
});

function validQuiz(): Quiz {
  return {
    quizId: "js-basics",
    title: "JavaScript Basics",
    description: "desc",
    questions: [
      {
        id: "q1",
        question: "Which are truthy?",
        type: "multiple-choice",
        options: [
          { key: "A", text: "0" },
          { key: "B", text: '"0"' },
          { key: "C", text: "[]" },
        ],
        correctAnswers: ["B", "C"],
        explanation: "Because...",
      },
      {
        id: "q2",
        question: "Pick one",
        type: "single-choice",
        options: [
          { key: "A", text: "A" },
          { key: "B", text: "B" },
        ],
        correctAnswers: ["A"],
      },
    ],
  };
}

describe("validateQuizStructure", () => {
  it("accepts a valid quiz", () => {
    const q = validQuiz();
    const { errors } = validateQuizStructure(q);
    expect(errors).toHaveLength(0);
  });

  it("requires quizId, title, questions", () => {
    const { errors } = validateQuizStructure({});
    expect(errors).toEqual(
      expect.arrayContaining([
        "`quizId` must be a non-empty string",
        "`title` must be a non-empty string",
        "`questions` must be an array",
      ])
    );
  });

  it("requires non-empty questions array", () => {
    const { errors } = validateQuizStructure({ quizId: "x", title: "t", questions: [] });
    expect(errors).toContain("`questions` must be a non-empty array");
  });

  it("enforces unique question ids", () => {
    const q = validQuiz();
    // duplicate id
    q.questions[1].id = "q1";
    const { errors } = validateQuizStructure(q);
    expect(errors).toEqual(expect.arrayContaining([expect.stringMatching(/id must be unique/i)]));
  });

  it("enforces non-empty option keys and texts and uniqueness", () => {
    const q = validQuiz();
    q.questions[0].options = [
      { key: "A", text: "one" },
      { key: "A", text: "dup" }, // duplicate
      { key: "", text: "empty" }, // empty key
    ];
    const { errors } = validateQuizStructure(q);
    expect(errors).toEqual(expect.arrayContaining([
      expect.stringMatching(/key must be unique/i),
      expect.stringMatching(/key must be a non-empty string/i),
    ]));
  });

  it("requires correctAnswers non-empty and keys exist with no duplicates", () => {
    const q = validQuiz();
    q.questions[0].correctAnswers = ["B", "B", "Z"]; // duplicate + unknown
    const { errors } = validateQuizStructure(q);
    expect(errors).toEqual(expect.arrayContaining([
      expect.stringMatching(/must not contain duplicates/i),
      expect.stringMatching(/contains unknown key/i),
    ]));
  });

  it("enforces single-choice has exactly one correct answer", () => {
    const q = validQuiz();
    const sc = q.questions[1];
    sc.type = "single-choice";
    sc.correctAnswers = ["A", "B"];
    const { errors } = validateQuizStructure(q);
    expect(errors).toEqual(expect.arrayContaining([
      expect.stringMatching(/exactly one element for single-choice/i),
    ]));
  });

  it("enforces multiple-choice has more than one correct answer", () => {
    const q = validQuiz();
    const mc = q.questions[0];
    mc.type = "multiple-choice";
    mc.correctAnswers = ["B"]; // only one
    const { errors } = validateQuizStructure(q);
    expect(errors).toEqual(expect.arrayContaining([
      expect.stringMatching(/more than one element for multiple-choice/i),
    ]));
  });
});
