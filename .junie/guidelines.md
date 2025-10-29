# Project Guidelines

These guidelines define how we work on this repository. They are designed to enforce a Test-Driven Development (TDD) workflow, anchor all changes to the specs, and ensure we only use Yarn as the package manager.

## Golden Rules
- Source of truth: All work must be derived from the specs in `specs/` (features and requirements). When in doubt, open an issue or propose a spec change before coding.
- TDD: Write a failing test/spec first, then implement the minimal code to pass it, and finally refactor safely.
- Yarn-only: Use Yarn for all dependency and script operations. Do not use npm or pnpm. See "Tooling" below.

## Workflow
1. Pre-requisites
   - Checkout on the `main` branch and pull the latest changes.
   - Create a new branch for your feature or fix with the following naming convention: `feature/<name>` or `fix/<name>`.
2. Discover requirement
   - Identify the exact acceptance criteria in `specs/features.md` and the relevant constraints in `specs/requirements.md`.
3. Write/extend tests
   - Add or update tests that capture the acceptance criteria and edge cases.
   - Keep tests small, deterministic, and independent.
4. Run tests to see them fail (red)
   - Ensure the new/updated tests fail for the right reason.
5. Implement the minimum code (green)
   - Implement only what’s necessary to pass the failing test(s).
6. Refactor
   - Improve code quality while keeping tests green (naming, structure, duplication removal, import optimization).
7. After your work is done
    - Commit your changes with a concise and descriptive commit message.
    - Mark your task as `[DONE]` in the specs/features.md.
    - Push your branch to the remote repository.
    - Open a pull request.

## Tests
- Test files must be kept under a dedicated `__tests__` directory. Use `.test.ts`/`.test.tsx` suffix.
- Prefer testing logic in isolation. For Raycast UI, extract logic into pure functions where possible and test them directly.
- Tests are run with `yarn test`.
- Cover:
  - Validation of quiz schema and all rules in `specs/requirements.md`.
  - LocalStorage interactions (quizzes index, quiz content, progress updates, reset behavior).
  - Random question picking behavior (mock randomness to make deterministic tests).
  - Interaction flows from `specs/features.md` (import, start, play, finish, restart).

## Branching & PRs
- Small, focused branches per feature or bug.
- Reference the spec section(s) you implemented in the PR description.
- Ensure CI (tests, lint) is green before requesting review.

## Coding Standards
- TypeScript, React components for Raycast.
- Keep functions small and pure where possible.
- Strong typing (avoid `any`).
- ESLint + Prettier must pass (`yarn lint` or `yarn fix-lint`).

## Tooling
- Package manager: Yarn only. Examples:
  - Install: `yarn install`
  - Add dependency: `yarn add <pkg>` / dev dependency: `yarn add -D <pkg>`
  - Run scripts: `yarn <script>`
  - One-off executables: `yarn dlx <package> [args]`
- Do not commit `package-lock.json`. A `yarn.lock` is already present and authoritative.

## Decision Log
- If you need to deviate from these guidelines or the specs, note the reason and the decision in the PR description and, when appropriate, propose a spec update in `specs/`.
