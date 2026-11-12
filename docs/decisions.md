# Decisions

A running record of the choices I've made on this project and why, so future me
(or anyone reading the code) doesn't have to guess.

---

## Using uv to manage Python

I needed a setup that works the same on any machine and later in CI. uv handles the
virtual environment, dependencies and Python version in one place, and the lockfile
means everyone installs exactly the same versions. The trade-off is that anyone
running the project needs uv installed, which is a quick one-line install.

## No database, LLM or cloud services to start with

The first milestone is about getting the API right: clear endpoints, validation,
errors and tests. Adding a database or a model now would just give me more things to
debug before the basics work. Sample audit data lives in JSON files for now, and
everything runs locally for free. I'll add persistence and AI when a feature actually
needs them.

## What makes this different: fixes that fit your design system

Before starting, I looked at what already exists. Deque (the team behind axe-core) has
AI tools for accessibility guidance and remediation, and GitHub has written about
using AI to triage their own accessibility feedback. Both are impressive, and both
confirm the problem is real.

Where I think there's room is in the fix suggestions. Generic advice like "add an
aria-label" is fine, but on a team with a design system, the right fix is usually
"use our Button component with the label prop." So when retrieval comes in later,
AccessFlow will draw on the team's own component docs as well as general
accessibility guidance. Until then, nothing in the early milestones changes.

## One issue per affected element

axe groups results by rule, so "form elements must have labels" can cover several
inputs at once. I split these into one issue per element, because that's how review
and fixing actually happen: someone might confirm one input is broken and dismiss
another as a false positive, and each fix is usually a separate change. Grouping
by rule is easy to add back in the UI; splitting grouped data apart later is not.

## Our own API shape, not axe's

Scanner evidence is copied into AccessFlow's own models rather than passed straight
through. If axe changes its output format, only the import code needs updating, and
the API and frontend stay the same.

## IDs that don't change between imports

Issue IDs are built from the page, the rule and the element's selector, so importing
the same scan twice gives the same IDs. This will matter later when comparing scans
and when making sure the same GitHub issue never gets created twice.

## Routes translate, services decide

Route handlers stay thin: they get their inputs, call a service, and turn the result
into an HTTP response. Services don't know HTTP exists. That keeps the logic testable
without a server, and it means the same code can be called from somewhere else later,
like an agent tool.

## Errors are safe by default

When something fails on our side, the client gets a short, generic message and a 500.
File paths and stack traces stay in the server logs. There's a test that checks the
error response never contains the file path.

## Triage uses rules, not AI

Prioritising issues is something a team needs to be able to trust and check, so it
runs on a small set of fixed rules rather than a model. axe's impact level sets the
starting priority, issues that aren't tied to a WCAG success criterion drop one level,
and every result lists the reasons it got its priority. If the scanner didn't report
an impact, the issue lands in the middle and is flagged for manual review, rather
than being quietly ranked lowest.

I kept the rules short on purpose. Weighting by WCAG level or by how many elements are
affected might make sense later, but I'd rather add those once there's a real reason
than guess at a policy now. AI will come in for explanations and fix suggestions,
where language and judgement actually help.

## Limits on what clients can send

Triage requests are capped: at least one issue, at most 500, with length limits on
IDs and a format check on WCAG criteria. Nothing else in the stack limits request
size yet, and these values end up in explanations and, later, in prompts and GitHub
issues, so it's worth stopping bad input at the door.

## Triage is a POST that returns 200

Triage takes a list of issues in the request body, so it's a POST: GET requests
shouldn't carry a body, and the input is too big for a query string. It returns 200
rather than 201 because nothing is stored. It's a calculation, and the same input
always gives the same result, which also means it's safe to retry.

Bad input never reaches the triage code. The request models define what's valid,
FastAPI returns a 422 listing every problem with its exact location, and the tests
check the error type and location rather than the wording.

## React and TypeScript for the frontend

I picked React with TypeScript. It's what I've used most recently, it's what most AI
product teams use, and it lets me spend my learning time on the backend and AI side
rather than relearning a framework.

## A dev proxy instead of CORS

In development the frontend and backend run on different ports, which the browser
treats as different sites. Instead of loosening the backend's CORS settings just for
local work, Vite forwards API requests to the backend, so the browser only ever talks
to one origin. The frontend uses relative URLs, which also matches how it will work
if both are served from one domain later.

## Frontend types are generated from the backend

The Pydantic models are the API contract, so the frontend shouldn't have its own
hand-written copies that can drift. A small script exports FastAPI's OpenAPI schema
to `frontend/openapi.json`, and openapi-typescript turns it into TypeScript types.
If the backend changes in a way that breaks the frontend, it shows up as a type
error instead of a runtime bug.

I'm generating types only, not a full API client. The fetch functions stay small and
written by hand, which keeps them easy to read and explain. Both the schema and the
generated types are committed, so contract changes show up in pull requests, and a
backend test fails if the committed schema is out of date.

## TanStack Query for server data

The summary, issue list and detail view all need the same audit, and errors need a
retry. I'd already written one request by hand with useEffect and an AbortController,
and saw how many details it needs to get right. TanStack Query handles caching,
sharing one request between components, cancellation and retries, much like Apollo
does for GraphQL. There's no global state library: server data lives in the query
cache and UI state stays in components.

## Loading states are announced, not just shown

Each section has one status message that's always on the page and changes text as
data loads, fails or retries, so screen reader users hear what happened. An empty
audit doesn't just say "no issues": it says automated checks can't catch everything,
because that's exactly when someone might wrongly assume their page is accessible.

## Imported URLs are shown as text

The audited page URL comes from an imported file, so it's displayed as plain text
rather than a link. A link built from untrusted data could run code if it used a
`javascript:` URL. If it needs to be clickable later, it'll be checked first.

## The issue list is a real data table

Issues are shown in a proper HTML table: a caption that names it, column headers, and
the issue title as each row's header, so screen reader users always hear which issue
a cell belongs to. Impact is always written as a word, never shown only by colour.
The table sits in a focusable, named region so keyboard users can scroll it when it's
wider than the screen.

Issues are listed most severe first. Issues without a reported impact go between
moderate and minor, the same reasoning as the triage rules: don't bury them, don't
inflate them. The list doesn't announce loading or errors itself, because the audit
summary already does, and hearing everything twice would be worse.
