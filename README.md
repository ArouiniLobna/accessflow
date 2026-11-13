[![CI status](https://github.com/ArouiniLobna/accessflow/actions/workflows/ci.yml/badge.svg)](https://github.com/ArouiniLobna/accessflow/actions/workflows/ci.yml)

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

The backend foundation is done. There's no AI in it yet, and that's on purpose: I
wanted the API, data models and tests solid before adding a model on top.

What it can do right now:

- **Load an audit.** It reads axe-core output, checks it's valid, and turns it into
  AccessFlow's own format. Each affected element becomes its own issue with a stable
  ID, so importing the same scan twice gives the same IDs.
- **Triage issues.** It sorts issues into P1 to P4 using a small set of fixed rules,
  and every result says _why_ it got its priority. These are plain rules, not AI.

The sample audit is hand-written to look like real axe-core output. It isn't from a
real site.

## Endpoints

| Method | Path                    | What it does                                                      |
| ------ | ----------------------- | ----------------------------------------------------------------- |
| GET    | `/health`               | Checks the service is up                                          |
| GET    | `/api/v1/audits/sample` | Returns the sample audit, converted into AccessFlow's format      |
| POST   | `/api/v1/triage`        | Takes a list of issues and returns them prioritised, with reasons |

A triage request looks like this:

```json
{
  "issues": [
    {
      "id": "a1b2c3d4e5f6",
      "rule_id": "label",
      "impact": "critical",
      "wcag_criteria": ["1.3.1", "4.1.2"]
    }
  ]
}
```

You can send issues straight from the sample audit endpoint. Extra fields are ignored.

If the request is invalid (an empty list, duplicate IDs, a WCAG criterion that isn't
in the `1.4.3` format), you get a 422 that tells you exactly which field is wrong.

The easiest way to try everything is the interactive docs at `/docs` once the server
is running.

## Running BE locally

You'll need [uv](https://docs.astral.sh/uv/) installed.

```bash
cd backend
uv sync
uv run fastapi dev app/main.py
```

Then open http://127.0.0.1:8000/docs.

## Tests and linting

```bash
uv run pytest
uv run ruff check .
```

## Running the frontend

You'll need Node.js 20.19+ or 22.12+. With the backend running:

```bash
cd frontend
npm install
npm run dev
```

Then open http://localhost:5173. Frontend tests run with `npm test`.

## Keeping the frontend in sync with the API

If you change a backend model or endpoint, regenerate the frontend types:

```bash
cd backend
uv run python -m scripts.export_openapi
cd ../frontend
npm run generate:api
npm run typecheck
```

A backend test fails if `frontend/openapi.json` is out of date.

## How it's organised

Routes only deal with HTTP. The actual logic (converting audits, the triage rules)
lives in plain Python services that don't know HTTP exists, which makes them easy to
test and easy to reuse later. The reasoning behind the bigger choices is in
[docs/decisions.md](docs/decisions.md), and what's done and what's next is in
[docs/roadmap.md](docs/roadmap.md).

## A note on what this isn't

Automated checks can't tell you a site is accessible. They catch a portion of issues,
and AI suggestions can be wrong. AccessFlow is meant to help people review and fix
things faster, not replace manual testing or an accessibility specialist.
