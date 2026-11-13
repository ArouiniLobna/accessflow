# Roadmap

Where the project is, what's next, and what each step has actually shown I can do.
I only mark a skill as progressing when there's code and tests in the repo to back
it up.

## Now

**Milestone 1, the API foundation, is finished.** Next up is deciding on the frontend
stack and starting Phase 2.

## Milestone 1: API foundation (done)

- [x] Project setup with uv, pytest and Ruff
- [x] Health check endpoint
- [x] Models for raw axe-core output, plus a sample audit
- [x] AccessFlow's own audit and issue models, separate from axe's
- [x] Converting axe reports into audits, one issue per affected element, stable IDs
- [x] Sample audit endpoint, with a safe error if the data can't be loaded
- [x] Rule-based triage with a reason for every priority
- [x] Triage endpoint with input limits and clear 422 errors
- [x] Tests for the rules and for the API, including the error cases

## Coming up

1. **Phase 2: frontend.** An accessible UI for browsing an audit and triaging issues.
   React + TypeScript is the default, but I want to weigh it against Angular first.
2. **CI.** Run tests and linting on every push with GitHub Actions.
3. **Phase 3: first LLM integration**, with a mock provider so everything still runs
   and tests for free.

Later: retrieval over design-system docs, the agent workflow with approval steps,
evaluation, and deployment to Azure.

## Known gaps

Things I know aren't there yet, so nobody has to discover them:

- The sample audit is hand-written. It isn't from scanning a real page.
- There's no way to upload your own audit yet, only the sample.
- Nothing is saved, so review status can't be changed and kept.
- No CI yet, so tests only run when I run them.
- Triage rules don't consider WCAG level (A vs AA) or how many elements are affected.
  That's deliberate for now; see decisions.md.

## Skills so far

| Skill                | Where I started      | Where I am now                                            | Evidence                         |
| -------------------- | -------------------- | --------------------------------------------------------- | -------------------------------- |
| Python               | Foundational         | Building tested application code                          | Services, models, pytest suite   |
| FastAPI              | Course finished      | Routers, dependency injection, validation, error handling | Three endpoints with API tests   |
| Backend architecture | Developing           | Routes and services separated                             | Services have no FastAPI imports |
| API design           | Frontend consumer    | Designing contracts and error responses                   | Status code choices, 422 tests   |
| Accessibility        | Practical experience | Applying it to product rules                              | Triage rules, WCAG parsing       |
| LLM integration      | Early adapter        | Not started                                               | —                                |
| RAG                  | Early adapter        | Not started                                               | —                                |
| Agentic workflows    | To learn             | Not started                                               | —                                |
| AI evaluation        | To learn             | Not started                                               | —                                |
| Azure                | To learn             | Not started                                               | —                                |

- Going back from an issue to the list puts focus on the page heading, not on the
  issue you came from.
- A production host will need to serve index.html for addresses like /issues/abc,
  or reloading a detail page will give a 404.
