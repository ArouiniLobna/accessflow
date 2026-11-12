# Learning log

Notes on what I built, what I learned and what tripped me up. Mostly for me, but
also an honest record of how this project came together.

---

## Milestone 1: API foundation

### What I built

A FastAPI backend that loads an axe-core accessibility audit, converts it into
AccessFlow's own format, and prioritises the issues with a set of fixed rules. Three
endpoints, all tested, including the ways they can fail.

### What clicked

**Pydantic checks real data, not just types.** As a TypeScript developer I'm used to
types disappearing once the code runs. To test this, I changed the health endpoint to
return "healthy" when the model only allowed "ok". The server returned a 500. That
was the moment it made sense: Pydantic checks the actual values every time, which is
exactly what I'll need when an LLM starts returning data I can't fully trust.

**Who caused the error decides the status code.** If the client sends bad data, it's
a 422. If our own code or data is broken, it's a 500, and the message shouldn't leak
internal details like file paths. I added a test that checks the path never shows up
in the error response.

**Routes should be boring.** Keeping logic in services that don't know about HTTP
made them much easier to test, and they'll be reusable later as tools for the agent.

**Dependency injection works like Angular providers.** FastAPI's `Depends` and
`dependency_overrides` felt familiar. I used them to swap in a missing file in a test
without touching the real one.

**IDs should be stable, not random.** Building issue IDs from the page, rule and
element means importing the same scan twice gives the same IDs. That will matter
when comparing scans and when making sure the agent never creates the same GitHub
issue twice.

### What tripped me up

- **`ModuleNotFoundError: No module named 'app'`.** I'd put the tests folder inside
  `app/` and ran pytest from the wrong folder, so it never read my config. Lesson:
  check the `rootdir` and `configfile` lines in pytest's output first.
- **A test that tested the wrong thing.** I wrote a test for a "minor" issue but
  didn't actually set the impact, so it used the helper's default of "serious". The
  test ID said "minor", but the data didn't. Lesson: always pass the values the test
  is about.
- **An explanation that wasn't true.** The triage reasons said an issue was "lowered
  one level" even when it was already the lowest priority and nothing changed. All
  the tests passed, but the message was wrong. For a tool that's meant to be
  trustworthy, that's a real bug. I wrote a failing test first, then fixed it.

### Decisions I made

All written up with reasons in decisions.md: one issue per affected element, our own
API format separate from axe's, stable IDs, rule-based triage instead of AI, input
limits on triage, and POST returning 200 for triage.

### What I'd do differently

Write the expected value of a test by working it out from the rules _before_ running
the code, every time. I caught myself a couple of times wanting to just copy whatever
the code printed.
