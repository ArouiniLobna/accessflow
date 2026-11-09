# AccessFlow AI

Accessibility scanners like axe-core are great at finding problems, but the hard part
comes after: working out what each issue means for real users, how to fix it properly
in _your_ codebase, and turning it into tickets someone will actually pick up.

AccessFlow is my attempt at that "after" part. You give it an audit, it helps you
understand and prioritise the findings, suggests fixes that fit your own design system,
and drafts the work. Nothing gets created without a person approving it first.

I'm a frontend engineer who has spent a lot of time on design systems and accessibility,
and I'm building this to grow into full-stack AI engineering. So it's a real product
idea and also a learning project, built in small steps.

## Where it's at

Right now it's just the backend foundation: a FastAPI service with no AI in it yet.
That's on purpose. I want the API, data models and tests solid before adding an LLM.

## Running it locally

You'll need [uv](https://docs.astral.sh/uv/) installed.

```bash
cd backend
uv sync
uv run fastapi dev app/main.py
```

Then open http://127.0.0.1:8000/docs to try the endpoints.

## Tests and linting

```bash
uv run pytest
uv run ruff check .
```

## A note on what this isn't

Automated checks can't tell you a site is accessible. They catch a portion of issues,
and AI suggestions can be wrong. AccessFlow is meant to help people review and fix
things faster, not replace manual testing or an accessibility specialist.
