# raycast-quizz

This repository follows a strict TDD workflow and is anchored to the specs located in `specs/`.

- Features: `specs/features.md`
- Technical requirements: `specs/requirements.md`
- Project guidelines (TDD + Yarn-only): `.junie/guidelines.md`

Tooling
- Package manager: Yarn only. Do not use npm or pnpm.
- Install deps: `yarn install`
- Lint: `yarn lint` / `yarn fix-lint`
- Develop: `yarn dev`
- Build: `yarn build`
- Publish to Raycast Store: `yarn publish` (runs `yarn dlx @raycast/api@latest publish`)