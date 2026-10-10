# Common Feature — Saved Resources

All participants will first build the same functional vertical slice.

The purpose of this part of the workshop is to take one feature end-to-end using Kiro inside an existing AWS application.

## Goal

An authenticated user must be able to save a resource using a title and URL and retrieve only the resources that belong to them.

The implementation must evolve the existing starter without replacing its accepted architecture.

## Before You Start

Start from `main` and create a working branch for the common feature:

```bash
git switch main
git pull
git switch -c workshop/common-resources
```

Everyone may use the same local branch name to make the workshop easier to follow.

Also verify that the starter works correctly before continuing.

## Materials in This Section

```text
01-common-feature/
├── README.es.md
├── README.en.md
├── prompt.es.md
├── prompt.en.md
├── validation.es.md
└── validation.en.md
```

For the English path, you will primarily use:

- `prompt.en.md`
- `validation.en.md`

The Spanish versions are available as an alternative reference.

## Workflow

Open:

```text
workshop/01-common-feature/prompt.en.md
```

and use it with Kiro to create the Spec.

The expected flow is:

```text
Existing repository
→ Steering
→ Prompt
→ Spec
→ Requirements
→ Design
→ Tasks
→ Implementation
→ Validation
```

## Do Not Implement Yet

When Kiro generates the Spec, stop.

First review:

1. `requirements.md`
2. `design.md`
3. `tasks.md`

Before approving implementation, make sure you understand:

- what behavior Kiro proposes;
- which parts of the system will change;
- which architecture decisions are being proposed;
- how authentication and ownership will be preserved;
- how OpenAPI will evolve;
- what infrastructure will be added;
- which tests are required.

The goal is to review and reason about the proposal, not automatically accept everything that was generated.

## What You Will Learn

The common feature is designed to touch several real application layers without introducing a complex business domain.

During the exercise you will work with:

- React;
- Cognito;
- API Gateway;
- JWT Authorizer;
- Lambda;
- DynamoDB;
- AWS CDK;
- OpenAPI;
- testing;
- authorization based on authenticated identity.

The goal is not only to make Saved Resources work.

The goal is to observe how Kiro uses Steering, architecture, and existing code to propose a coherent solution.

## Implementation

Once you have reviewed and accepted:

```text
requirements.md
design.md
tasks.md
```

continue with implementation using Kiro.

Do not expand the scope beyond the approved Spec.

## Validation

When implementation is complete, open:

```text
workshop/01-common-feature/validation.en.md
```

and verify the result before continuing.

Validation covers areas such as:

- starter regression;
- resource creation;
- validation;
- persistence;
- ownership;
- API/OpenAPI;
- DynamoDB;
- IAM/CDK;
- frontend;
- tests;
- scope.

## Create the Checkpoint

When the feature works and has been validated:

```bash
git status
git add .
git commit -m "feat: add saved resources"
```

That commit becomes your common checkpoint for the next block.

## Next Step

Continue with:

```text
workshop/02-challenges/README.en.md
```

Do not return to `main`.

Your challenge should branch from the common feature you just completed.
