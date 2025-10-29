# Features Document

## Introduction

The raycast-quiz extension is an extension for Raycast to create some quiz in Raycast based on questions contained in a json file.

## Requirements

### Requirement 1 [DONE]

**User Story:** As a user, I want to be able to create a quiz in Raycast by selecting a local JSON file containing questions.

#### Acceptance Criteria

1. WHEN a user chooses "Import Quiz" in the Raycast menu, THEN the system SHALL display a dialog to choose a JSON file.
2. WHEN a user chooses a JSON file, THEN the system SHALL validate the file. IF the file is not valid THEN display a Toast error with the first three validation issues. 
3. WHEN a user chooses a JSON file AND the file is valid THEN the system SHALL register the quiz and start it.

### Requirement 2 [DONE]

**User Story:** As a user, I want to be able to play a quiz in Raycast.

#### Acceptance Criteria

1. WHEN a user chooses "Start quiz" THEN the system SHALL display a list of known quizzes so the user can choose one.
2. WHEN a user chooses a quiz, THEN the system SHALL display a random question from the question set with its possible answers and an indicator if the question is single-choice or multiple-choice.
3. WHEN a user chooses an answer, THEN the system SHALL display if the answer is correct or not. For single-choice, selecting an option evaluates immediately. For multiple-choice, the user can select multiple options and must press Submit to evaluate.
4. WHEN a user chooses an answer, either correct or not, THEN the system SHALL display a button to play another question. 
5. WHEN a user chooses to play another question, THEN the system SHALL display the next random question.
6. WHEN a user finished a quiz by answering all questions, THEN the system SHALL show a completion view with actions "Restart Quiz" and "Back to Quizzes".

### Requirement 3 [DONE]

**User Story:** As a quiz creator, I want to be able to give some insights on why this answer is correct.

#### Acceptance Criteria

1. WHEN a user chooses an answer, either correct or not, THEN the system SHALL display the small explanation of the answer contained in the JSON file.

### Requirement 4 [DONE]

**User Story:** As a user, I want the system to give me feedback if the quiz file is not valid.

#### Acceptance Criteria

1. WHEN a user chooses a JSON file, THEN the system SHALL validate the file and displays an error message if the file is not valid.

### Requirement 5 [DONE]

**User Story:** As a quiz creator, I want to create a quiz with multiple-choice questions.

#### Acceptance Criteria

1. WHEN a user chooses a quiz with a multiple-choice question, THEN the system SHALL display a list of possible answers.
2. WHEN a user chooses an answer, THEN the system SHALL NOT validate it immediately.
3. WHEN a user chooses an answer, THEN the system SHALL display a button to submit the answer.
4. WHEN a user chooses to submit the answer, THEN the system SHALL validate the answer and display if it is correct or not.
