# AGENTS.md

## Purpose

This repository is maintained with the help of coding agents (for example Codex).
The goal is to make safe, reviewable, minimal, high-quality changes that fit the
existing architecture and coding style.

Agents working in this repo must optimize for:
- correctness
- minimal diffs
- preserving existing behavior
- reuse of existing project patterns
- reviewability
- security
- no unnecessary dependencies
- no unnecessary refactors

---

## Core Principles

### 1) Make the smallest correct change
Prefer the narrowest possible fix that fully resolves the issue.

Do:
- patch the affected file or function directly when possible
- preserve current behavior unless a change is required to fix the issue
- keep diffs small and easy to review

Do not:
- refactor unrelated code
- rename files/functions unnecessarily
- reformat large sections of code without a reason
- “clean up” surrounding code unless explicitly requested

---

### 2) Reuse existing patterns before inventing new ones
Before implementing anything, search the codebase for an existing pattern.

Always check for existing:
- middleware
- utilities/helpers
- validation patterns
- query construction patterns
- error-handling conventions
- logging conventions
- auth/authorization flows
- rate limiters
- styling/component patterns
- API response conventions

If a project-native solution already exists, reuse it.

Do not introduce a second pattern for the same problem unless explicitly asked.

---

### 3) Do not add dependencies unless explicitly requested
Assume **no new dependencies should be added** unless the user clearly asks for it.

Before adding any package:
1. verify the same problem cannot be solved using:
   - existing repo code
   - platform/library built-ins
   - framework-native features
2. explain why a new dependency is necessary
3. keep dependency additions isolated and justified

Default rule:
- prefer built-in Node / framework capabilities
- prefer existing installed packages
- avoid dependency churn

---

### 4) Preserve architecture and stack choices
Work within the current architecture unless explicitly told to redesign it.

Examples:
- preserve the current auth framework
- preserve the existing routing/controller/service structure
- preserve current state management
- preserve the current UI library choices
- preserve current API contracts unless asked otherwise

Do not silently migrate patterns, frameworks, or file organization.

---

### 5) Security fixes must be CodeQL-friendly
When addressing security issues, do not only make the code logically safer.
Make the fix explicit enough for static analysis tools to verify.

For request-derived data:
- treat `req.params`, `req.query`, `req.body`, `req.headers`, `req.cookies`, and uploaded file metadata as untrusted
- validate identifiers explicitly before use
- build explicit local safe objects near the sink
- prefer allowlisting fields over copying whole request objects
- avoid passing raw request-derived objects directly into DB/file/system operations

Prefer:
- explicit `safeFilter`
- explicit `safeUpdate`
- explicit validated IDs
- explicit safe path reconstruction from trusted bases

Avoid:
- `Model.findOne(req.query)`
- `Model.findById(req.params.id)`
- `const update = { ...req.body }`
- generic sanitization that static analysis tools cannot prove safe

---

## Change Strategy

### 6) Investigate first, patch second
Before modifying code:
1. inspect the relevant file(s)
2. inspect surrounding code
3. search for existing related implementations
4. identify the smallest safe fix
5. only then patch

For multi-file tasks:
- determine whether the issue is local or systemic
- do not apply broad changes until confirming they are necessary

---

### 7) Fix root causes, not only symptoms
Do not patch only the visible failing line if the real issue is repeated nearby.

When working in a file:
- check for the same pattern elsewhere in the same file
- fix related occurrences when clearly applicable
- keep scope controlled and relevant

Do not do repo-wide rewrites unless explicitly asked.

---

### 8) Prefer explicitness over cleverness
Write code that is easy for maintainers to understand and review.

Prefer:
- local variables with descriptive names
- direct validation
- explicit allowlists
- straightforward control flow

Avoid:
- overly abstract helper layers
- clever one-liners
- unnecessary indirection
- generic utility creation for one small fix unless repeated use clearly justifies it

---

## Testing and Validation

### 9) Validate your changes
After changes, verify as much as possible with the tools already available.

Where applicable:
- run targeted tests first
- run lint/typecheck if relevant
- validate the changed flow manually in code
- ensure imports and exports are correct
- ensure no dead code or unused variables were introduced

If full validation is not possible, clearly say what was checked and what was not.

---

### 10) Do not claim success without verification
Never state that something is fixed unless you have validated it in some reasonable way.

Use precise wording:
- “I updated X to do Y”
- “I verified the code compiles in the changed area”
- “I did not run integration tests”
- “This should resolve the static-analysis issue because…”

Avoid unsupported claims like:
- “fully fixed” unless confirmed
- “production ready” unless actually validated
- “all issues resolved” unless verified

---

## Scope Control

### 11) Respect the requested scope
If asked to do one of the following:
- fix a bug
- resolve a CodeQL alert
- patch a route
- improve a component
- update a page

then stay on scope.

Do not also:
- refactor unrelated modules
- upgrade packages
- change architecture
- rename files
- restyle unrelated UI
- rewrite surrounding code

---

### 12) Keep PRs review-friendly
Favor changes that are easy to review and easy to revert.

Prefer:
- minimal diff
- isolated edits
- low-risk changes
- preserving file structure
- small focused helpers only when justified

Avoid:
- large formatting-only diffs
- mixing security fixes with cleanup
- mixing bug fixes with stylistic changes
- broad search/replace changes unless explicitly requested

---

## Code Style and Patterns

### 13) Match the existing code style
Follow the existing style in the touched file unless explicitly instructed otherwise.

Match existing:
- module syntax
- import ordering style
- semicolon usage
- quote style
- async/await patterns
- error handling conventions
- naming conventions

Do not reformat an entire file just because you touched one section.

---

### 14) Keep interfaces stable
Do not change public interfaces unless required.

Examples:
- route inputs/outputs
- API response shapes
- function signatures used across files
- props contracts
- database schema behavior

If an interface change is necessary:
- keep it minimal
- update all impacted callers
- call out the change explicitly

---

### 15) Comments should add value
Do not add obvious comments.

Good comments:
- explain why a security guard exists
- explain a non-obvious constraint
- explain compatibility behavior
- explain why a local workaround is needed

Bad comments:
- narrate obvious code
- restate variable names
- add noise

---

## Security and Safety Guidance

### 16) For DB queries
Never pass request-derived values directly into database filters/updates without explicit validation and shaping.

Prefer:
- validated identifier variables
- local `safeFilter`
- local `safeUpdate`
- allowlisted fields only

Avoid:
- spreading `req.body` or `req.query` into query/update objects
- dynamic operators from request input
- broad generic query passthroughs

---

### 17) For file paths
Treat file paths from requests, uploads, params, query strings, and stored records as untrusted.

Prefer:
- trusted base directory
- `path.basename()` or controlled relative path extraction where appropriate
- `path.resolve()` / `path.join()` from trusted base
- explicit containment checks

Avoid:
- passing `req.file.path` directly into fs operations
- trusting user-supplied or upload-supplied path fragments
- using unresolved relative paths in sensitive operations

---

### 18) For auth, admin, and rate limiting
Preserve the current security model.

Before changing route protection:
- inspect existing middleware patterns
- apply the correct existing middleware in the same style
- avoid adding duplicate middleware
- maintain current middleware order unless a fix requires adjustment

Do not introduce a new auth or rate-limiting pattern unless explicitly asked.

---

### 19) For user-controlled strings and formatting
Do not use user-controlled values as:
- format strings
- template selectors
- dynamic code
- raw HTML without the project’s approved handling
- dynamic query operators

Use fixed format strings and pass user data as values.

---

### 20) For prototype pollution risks
Do not write user-controlled keys directly into plain objects without guarding dangerous keys.

Guard against keys such as:
- `__proto__`
- `prototype`
- `constructor`

Prefer safe object construction patterns already used in the repo.

---

## Workflow Expectations for Agents

### 21) When asked to fix a reported alert or bug
Default process:
1. inspect the exact location
2. inspect the surrounding function/file
3. search for similar patterns in the same file
4. search for an existing project-native fix pattern
5. implement the smallest correct change
6. validate the change where possible
7. summarize:
   - what changed
   - why
   - what was validated
   - any limitations

---

### 22) When asked to create a plan
If asked for a plan:
- break the work into phases
- identify dependencies and risks
- preserve minimal-change principles
- do not assume broad refactors unless requested

---

### 23) When unsure
If ambiguity remains after reviewing the codebase:
- prefer the least invasive option
- prefer consistency with existing code
- avoid speculative architectural changes

If a decision materially affects behavior, clearly note the assumption in the summary.

---

## What to Avoid

Agents should avoid:
- adding dependencies without explicit approval
- broad refactors when a local fix is enough
- introducing new architectural patterns unnecessarily
- silent behavior changes
- security fixes that only “look sanitized” but still pass raw user input to sinks
- changing formatting across large files without need
- making multiple categories of changes in one patch unless requested
- claiming validation that did not happen

---

## Preferred Output Style for Agent Work

When presenting results, include:

1. What was changed
2. Why it was changed
3. Whether an existing repo pattern was reused
4. What validation was performed
5. Any remaining uncertainty or follow-up items

Keep the explanation concise and factual.

---

## Repo-Specific Preferences

Unless explicitly requested otherwise, assume the following preferences apply across this repository:

- prefer minimal diffs
- prefer local fixes over broad rewrites
- prefer existing helpers/utilities over new abstractions
- prefer no new dependencies
- prefer explicit, review-friendly security fixes
- prefer keeping route/controller signatures stable
- prefer static-analysis-friendly implementations
- prefer consistency over cleverness

If a task conflicts with these preferences, follow the explicit user request.