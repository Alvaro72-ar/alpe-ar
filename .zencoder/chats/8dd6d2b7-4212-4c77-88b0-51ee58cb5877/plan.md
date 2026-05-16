# Spec and build

## Agent Instructions

Ask the user questions when anything is unclear or needs their input. This includes:

- Ambiguous or incomplete requirements
- Technical decisions that affect architecture or user experience
- Trade-offs that require business context

Do not make assumptions on important decisions — get clarification first.

---

## Workflow Steps

### [x] Step: Technical Specification

Assess the task's difficulty, as underestimating it leads to poor outcomes.

- easy: Straightforward implementation, trivial bug fix or feature
- medium: Moderate complexity, some edge cases or caveats to consider
- hard: Complex logic, many caveats, architectural considerations, or high-risk changes

Create a technical specification for the task that is appropriate for the complexity level:

- Review the existing codebase architecture and identify reusable components.
- Define the implementation approach based on established patterns in the project.
- Identify all source code files that will be created or modified.
- Define any necessary data model, API, or interface changes.
- Describe verification steps using the project's test and lint commands.

Save the output to `c:\site-pasta\.zencoder\chats\8dd6d2b7-4212-4c77-88b0-51ee58cb5877/spec.md` with:

- Technical context (language, dependencies)
- Implementation approach
- Source code structure changes
- Data model / API / interface changes
- Verification approach

If the task is complex enough, create a detailed implementation plan based on `c:\site-pasta\.zencoder\chats\8dd6d2b7-4212-4c77-88b0-51ee58cb5877/spec.md`:

- Break down the work into concrete tasks (incrementable, testable milestones)
- Each task should reference relevant contracts and include verification steps
- Replace the Implementation step below with the planned tasks

Rule of thumb for step size: each step should represent a coherent unit of work (e.g., implement a component, add an API endpoint, write tests for a module). Avoid steps that are too granular (single function).

Save to `c:\site-pasta\.zencoder\chats\8dd6d2b7-4212-4c77-88b0-51ee58cb5877/plan.md`. If the feature is trivial and doesn't warrant this breakdown, keep the Implementation step below as is.

---

### [ ] Step: Implementation — Task 1: Fix checkout.html form submission

- Fix the silent error in the `else` branch (add `.catch()` to inner `response.json()`)
- Save order snapshot to `localStorage` key `alpe_last_order` on successful submit
- On success, redirect to `pedido-confirmado.html` instead of showing the hidden div

---

### [ ] Step: Implementation — Task 2: Create pedido-confirmado.html

- New confirmation/dashboard page styled consistently with the rest of the site
- Reads `alpe_last_order` from localStorage to display items, total, and customer info
- Clears `alpe_cart` from localStorage on load
- WhatsApp follow-up button pre-filled with order details
- "Voltar ao Início" link

---

### [ ] Step: Verification

1. Smoke-test full checkout flow in browser
2. Confirm redirect to `pedido-confirmado.html` after submit
3. Confirm cart is cleared (badge = 0)
4. Confirm WhatsApp link is pre-filled correctly
5. Write report to `c:\site-pasta\.zencoder\chats\8dd6d2b7-4212-4c77-88b0-51ee58cb5877/report.md`
