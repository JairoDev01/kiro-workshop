# Challenge — Feature Builder

## Mission

Evolve Saved Resources from a create/list experience into a basic resource management experience.

The application already allows users to create resources and retrieve only the resources they own.

Your goal is to allow users to **edit and delete their own resources** without breaking ownership or the existing experience.

## Expected Outcome

When finished, an authenticated user must be able to:

- edit the `title` and `url` of one of their resources;
- delete one of their resources;
- receive clear feedback when an operation succeeds;
- receive clear feedback when an operation fails;
- continue seeing only their own resources.

## Definition of Done

The solution is complete when:

- there is a clear way to start editing a resource;
- the user can modify `title` and `url`;
- the same validation rules from the common feature still apply;
- there is an explicit action to delete a resource;
- deletion includes an interaction that reduces accidental deletion;
- the frontend reflects changes without manual data manipulation;
- the backend validates ownership before updating or deleting;
- one user cannot edit or delete another user's resources;
- OpenAPI reflects the new behaviors;
- focused tests cover editing, deletion, validation, and ownership;
- the existing create/list experience continues to work.

## Constraints

Preserve the existing architecture.

Do not change:

- Cognito Managed Login;
- Authorization Code + PKCE;
- API Gateway JWT Authorizer;
- DynamoDB persistence;
- CloudFront/S3;
- AWS CDK as IaC.

Do not trust an `ownerUserId` sent by the frontend.

Do not add a new navigation module only for this feature.

Do not turn the challenge into a complete application redesign.

## Decisions You Must Reason About with Kiro

There is no single correct implementation.

Among other things, you should decide:

- how updates should be represented in the API;
- how editing should work in the frontend;
- how deletion should be confirmed;
- which backend errors should exist;
- how to preserve consistency with the current UI.

Kiro must inspect the repository and Steering before proposing the solution.

## Stretch Goals

Only after completing the main challenge, choose **one**:

- add categories;
- add category filtering;
- add client-side search over already loaded resources;
- improve the editing experience with inline validation.

Do not try to complete every stretch goal.

## Suggested Validation

Test at least:

```text
User A
→ creates Resource A
→ edits Resource A
→ sees the changes
→ deletes Resource A
→ Resource A disappears
```

And, if two users are available:

```text
User A → owns Resource A
User B → owns Resource B

User A cannot modify or delete Resource B.
```

Also verify:

- tests;
- typecheck;
- frontend build;
- `cdk synth`;
- regression of `GET /hello`.

## Your Task

1. Read Steering and inspect the current repository state.
2. Design the prompt you will give Kiro.
3. Create a Spec.
4. Review `requirements.md`, `design.md`, and `tasks.md`.
5. Adjust the Spec if necessary.
6. Implement.
7. Validate.
8. Commit your solution.

The goal is not to copy one specific implementation.

The goal is to **guide Kiro to evolve a real feature without breaking the rules of the existing system**.
