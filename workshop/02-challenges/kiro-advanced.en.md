# Challenge — Kiro Advanced

## Mission

Use Kiro automation capabilities to reduce repetitive validation during development.

The repository already uses Steering and Specs.

Your goal is to add **automated guardrails** that provide useful feedback while developers work with Kiro.

## Important

Available capabilities may vary depending on the installed Kiro version.

Before designing the solution:

- inspect which Hooks/automation mechanisms your version actually supports;
- do not invent syntax, triggers, or capabilities;
- base the solution on features available in the environment.

## Expected Outcome

When finished, the project should contain at least **two useful automations**.

One should validate application changes, for example:

- relevant tests;
- typecheck;
- another equivalent validation.

The second should protect a different boundary, for example:

- API/OpenAPI;
- infrastructure/CDK;
- Spec/Task-related validation;
- another useful repository rule.

## Definition of Done

The solution is complete when:

- at least two automated guardrails exist;
- each has a different purpose;
- triggers are clearly defined;
- validations produce understandable feedback;
- failures are visible to the developer;
- unrelated files are not unexpectedly modified;
- secrets are not exposed;
- existing scripts/commands are reused when reasonable;
- automation is documented;
- at least one successful and one failing scenario can be demonstrated.

## Constraints

Do not invent unsupported Kiro features.

Do not duplicate a full CI pipeline inside Kiro.

Do not automatically run destructive deployments as part of a local guardrail.

Do not add automation that silently modifies code without a clear purpose.

Do not make every developer action trigger a slow validation.

Prefer fast, useful feedback.

## Decisions You Must Reason About with Kiro

You should decide:

- which events deserve automation;
- which validations provide high value at low cost;
- what belongs in CI rather than local automation;
- how to avoid loops or excessive execution;
- which output actually helps the developer;
- how to document behavior for future users of the starter.

## Guardrail Ideas

These are examples, not requirements:

```text
TypeScript change
→ run typecheck or relevant tests

OpenAPI change
→ validate contract

CDK change
→ run synth

Spec task completion
→ run a short validation
```

Choose automations that fit the current repository.

## Stretch Goal

Design a third guardrail that improves the Spec workflow or commit preparation.

It should remain fast, understandable, and reusable.

## Suggested Validation

For each automation:

1. demonstrate a passing scenario;
2. temporarily introduce a failure;
3. demonstrate the feedback;
4. fix the failure;
5. confirm it passes again.

Document:

- trigger;
- command/action;
- purpose;
- expected feedback.

## Your Task

1. Inspect the actual Kiro capabilities available.
2. Review Steering and existing scripts.
3. Identify two places where automation adds value.
4. Design your prompt.
5. If the change is significant enough, use a Spec before implementation.
6. Implement the guardrails.
7. Demonstrate automated feedback.
8. Document the result.
9. Commit.

The goal is to **use Kiro to improve the engineering workflow**, not only to generate code.
