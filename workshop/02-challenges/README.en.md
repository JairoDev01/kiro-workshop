# Challenges — Choose Your Path

At this point in the workshop, everyone should have completed and validated the common Saved Resources feature.

The workflow now changes.

During the first part, you received a complete prompt and walked through the Kiro workflow together.

In this section, you will receive a problem, constraints, and a Definition of Done.

Your first task is to decide **how to guide Kiro**.

## Before You Start

Make sure Saved Resources is working and that you created a commit.

For example:

```bash
git status
```

Your current branch should represent the common workshop checkpoint.

Do not return to `main`.

## Choose a Challenge

Available challenges:

### Feature Builder

File:

```text
feature-builder.en.md
```

Main goal:

> Evolve Saved Resources to support editing and deletion.

### Backend / API

File:

```text
backend-api.en.md
```

Main goal:

> Add DynamoDB-friendly pagination and strengthen the API error contract.

### Cloud / Infrastructure

File:

```text
cloud-infrastructure.en.md
```

Main goal:

> Add useful observability with CloudWatch and AWS CDK.

### DevOps / Platform

File:

```text
devops-platform.en.md
```

Main goal:

> Create Continuous Integration with GitHub Actions.

### Kiro Advanced

File:

```text
kiro-advanced.en.md
```

Main goal:

> Create useful guardrails and automation with actual Kiro capabilities.

## Create Your Branch

From the branch where Saved Resources is complete, create a new branch for your selected challenge.

Examples:

```bash
git switch -c challenge/feature
```

```bash
git switch -c challenge/backend
```

```bash
git switch -c challenge/cloud
```

```bash
git switch -c challenge/devops
```

```bash
git switch -c challenge/kiro-advanced
```

You do not need to create all of them.

Choose one.

## What Changes from the Common Feature

During the common feature you received:

```text
Requirement
+
Complete prompt
```

During the challenges you receive:

```text
Mission
+
Definition of Done
+
Constraints
+
Stretch Goals
```

You now have to turn that context into effective instructions for Kiro.

## Recommended Workflow

Keep the same engineering process:

```text
Problem
→ Steering
→ Your prompt
→ Spec
→ Requirements
→ Design
→ Tasks
→ Implementation
→ Validation
```

Do not start with:

```text
"Implement this..."
```

First give Kiro enough context to reason about the change.

## Review What Kiro Proposes

Question decisions that:

- add unnecessary complexity;
- change architecture without a requirement;
- ignore Steering;
- ignore existing patterns;
- weaken security or ownership;
- introduce unnecessary services;
- expand scope without justification.

Kiro can propose.

You remain responsible for accepting, modifying, or rejecting the proposal.

## Stretch Goals

Each challenge contains optional goals.

They are not required to complete the challenge.

Complete the main Definition of Done first.

If time remains, choose one.

## There Is No Single Correct Solution

Two participants may solve the same challenge differently and both solutions can be valid.

You should be able to explain:

- what problem you solved;
- what context you gave Kiro;
- which decisions Kiro proposed;
- which ones you accepted or changed;
- how you validated the result.

The challenge is not to generate more code.

The challenge is to **guide Kiro inside a real system**.
