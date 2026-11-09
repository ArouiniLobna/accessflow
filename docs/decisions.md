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
