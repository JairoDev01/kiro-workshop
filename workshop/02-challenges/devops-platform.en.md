# Challenge — DevOps / Platform

## Mission

Protect the repository from changes that break the project.

The starter already contains scripts and commands for building, testing, and synthesizing the application.

Your goal is to create a **Continuous Integration workflow with GitHub Actions** that runs validation automatically for relevant changes.

## Expected Outcome

When finished, a Pull Request should automatically prove that the project can:

```text
install dependencies
→ pass typecheck
→ pass tests
→ build frontend
→ synthesize CDK
```

## Definition of Done

The solution is complete when:

- a GitHub Actions workflow is versioned in the repository;
- it runs on Pull Requests;
- it uses `npm ci`;
- it runs typecheck;
- it runs tests;
- it runs the required build;
- it runs `cdk synth`;
- the workflow fails if one of those validations fails;
- no AWS access keys are hardcoded;
- the minimum CI pipeline does not depend on long-lived AWS credentials;
- it uses Node versions and commands compatible with the repository;
- it avoids unnecessarily duplicating logic already available through npm scripts;
- a successful run can be demonstrated in GitHub.

## Constraints

Do not introduce a second build system.

Do not copy secrets into the workflow.

Do not add personal credentials.

Do not make deployment part of the minimum challenge.

Do not add external SaaS tooling when GitHub Actions can satisfy the requirement.

Do not restructure the monorepo only to make CI easier.

## Decisions You Must Reason About with Kiro

You should decide:

- exact workflow triggers;
- Node version;
- npm caching strategy if useful;
- validation order;
- which existing repository commands should be reused;
- whether to split jobs or keep one simple job;
- how to run `cdk synth` without deployment.

Prioritize clarity and fast feedback.

## Stretch Goal

Only after CI works correctly:

### Deployment with GitHub OIDC

Investigate deploying to AWS from GitHub Actions using OIDC federation.

If implemented:

- do not store long-lived AWS access keys;
- define IAM through infrastructure as code where appropriate;
- apply least privilege;
- keep CI and deployment as distinguishable responsibilities.

OIDC deployment is **bonus**, not required to complete this challenge.

## Suggested Validation

Create a branch and Pull Request.

First demonstrate a successful run.

Then temporarily introduce a change that causes one validation to fail and confirm GitHub Actions marks the workflow as failed.

Revert the change afterwards.

Validate:

- install;
- typecheck;
- tests;
- build;
- `cdk synth`.

## Your Task

1. Inspect `package.json`, workspaces, and existing scripts.
2. Review the monorepo structure.
3. Design your Kiro prompt.
4. Generate a Spec.
5. Review Requirements, Design, and Tasks.
6. Implement the workflow.
7. Create a Pull Request.
8. Demonstrate a successful run.
9. Commit.

The goal is to **automate the same guarantees a good engineer would verify before integrating a change**.
