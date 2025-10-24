# Technical Requirements

## Introduction

This document describes the technical requirements of the raycast-quiz extension.

## Technical Stack

- Raycast ecosystem ([raycast-api](https://www.npmjs.com/package/@raycast/api))
- React Components
- TypeScript

## Available Raycast Commands

- Import quiz
  - View: None, directly opens the file dialog
  - Description: Opens a file dialog to select a JSON file containing a quiz.
  - When a file is selected, the quiz is registered and started.
- Start quiz
  - View: List + Action Panel
  - Description: Displays a list of known quizzes and the number of remaining questions so the user can choose one.
  - Actions : Start, Delete, Reset Progress
  - When a quiz is selected, the quiz is started.

## Questions schema

### Format for the JSON file

The JSON file that will be used to create the quiz will conform to the following schema:
```json
{
  "quizId": "string (must be unique across all quizzes)",
  "title": "string (required)",
  "description": "string (optional)",
  "questions": [
    {
      "id": "string (unique within the file)",
      "question": "Question Text ?",
      "type": "single-choice|multiple-choice",
      "options": [
        {
          "key": "string (unique in this question)",
          "text": "Answer Text"
        }
      ],
      "correctAnswers": [
        "string (key of the correct answer)"
      ],
      "explanation": "string (markdown, optional)"
    }
  ]
}
```

### Validation rules to implement

When ingesting a quiz file, the following must be checked :
- The file must be a valid JSON file
- The file must contain a `quizId` property, a non-empty string. If the quizId is already known, the quiz must be atomically replaced by the new one and progress must be reset.
- The file must contain a `title` property, a non-empty string.
- The file must contain a `questions` property.
- The `questions` property must be a non-empty array.
- Each question must contain an `id` property, which must be non-empty and unique within the file.
- Each question must contain a `question` property.
- Each question must contain a `type` property.
  - If the type is `single-choice`, the `correctAnswers` property must be a non-empty array of one element.
  - If the type is `multiple-choice`, the `correctAnswers` property must be a non-empty array of more than one element.
- Each question must contain an `options` property.
- The `options` property must be a non-empty array.
- Each option must contain a `key` property, which must be non-empty and unique within the question.
- Each option must contain a `text` property, a non-empty string.
- Each question must contain a `correctAnswers` property.
- The `correctAnswers` property must be a non-empty array.
  - Each `correctAnswers` value must be a key of the `options` property.
  - The `correctAnswers` array must not contain duplicate values.

### Example of a valid quiz file

```json
{
  "quizId": "js-basics",
  "title": "JavaScript Basics",
  "questions": [
    {
      "id": "q1",
      "question": "Which of these are truthy values?",
      "type": "multiple-choice",
      "options": [
        { "key": "A", "text": "0" },
        { "key": "B", "text": "\"0\"" },
        { "key": "C", "text": "[]" }
      ],
      "correctAnswers": ["B", "C"],
      "explanation": "`\"0\"` and `[]` are truthy in JS; `0` is falsy."
    }
  ]
}
```

## Other technical requirements

### Local storage

The extension will have to store the list of known quizzes and their content. This will be done via the [Raycast API](https://www.raycast.com/api) `LocalStorage` API.
The local storage format will be the following :

```json
{
  "quizzesIndex": [
    {
      "quizId": "quizId",
      "title": "quizTitle",
      "lastUpdatedAt": 1690000000  // Epoch timestamp
    }
  ],
  "progress:<quizId>": {
    "remainingQuestions": ["questionId1", "questionId2"]
  },
  "quiz:<quizId>": {
    "quizId": "quizId",
    "title": "quizTitle",
    "description": "quizDescription",
    "questions": [...]
  }
}
```

Initialize the `progress:<quizId>.remainingQuestions` property with the list of question ids of the quiz on the import.
On each played question, update the `progress:<quizId>.remainingQuestions` property by removing the played question id.
When `remainingQuestions` is empty, display the completion view. Reset progress only when the user chooses to restart the quiz. 
Reset is done by setting `progress:<quizId>.remainingQuestions` to the list of question ids of the quiz on the import. 
If a quiz with the same `quizId` is imported :
- The quiz is atomically replaced by the new one.
- The `progress:<quizId>.remainingQuestions` property is reset.
- The `lastUpdatedAt` property is updated.

### Question picking

Questions must always be picked randomly from the list of `remainingQuestions`.

### Interaction with the user

#### In quiz interaction

- When a quiz is started → navigate to a Detail view showing the current question.
- Single-choice: Selecting an option evaluates immediately and shows Correct/Incorrect plus the explanation (if present) and a Next Question action.
- Multiple-choice: Allow selecting multiple options and add a Submit action; upon submit, show correctness and explanation; offer Next Question.

#### Quiz selection

- Empty state: If no quizzes are saved, the Start Quiz list shows an empty state with an Import Quiz action.

#### Shortcuts

- Import Quiz : none
- Start Quiz (on selected quiz) : `Enter`
- Delete Quiz (on selected quiz) : `cmd+backspace`
- Reset Progress (on selected quiz) : `cmd+r` (with user confirmation)

#### Checking if an answer is correct

Checking if an answer is correct is done by comparing the answer key to the correct answer keys, independently of the order of the answers.

#### When a quiz is finished

When `remainingQuestions` is empty, the quiz is finished. 
Display a message that tells the user that the quiz is finished and buttons to "Restart Quiz" (re-seed `remainingQuestions` with all questions IDs) and "Back to Quizzes".
