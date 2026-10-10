# Validation — Saved Resources

Use this checklist after implementing the Spec and before moving on to the challenges.

It does not prescribe one specific implementation. It verifies that the vertical slice meets the workshop goal.

## 1. Starter and Regression

- [ ] The application still starts correctly.
- [ ] Cognito Managed Login still works.
- [ ] The authentication callback still works.
- [ ] Logout still works.
- [ ] The user menu is still available.
- [ ] The protected `GET /hello` request still works.
- [ ] No new authentication UI was introduced inside React.

## 2. Create Resources

- [ ] There is a clear UI to enter `title`.
- [ ] There is a clear UI to enter `url`.
- [ ] The user can save a valid resource.
- [ ] A new resource receives a backend-generated `resourceId`.
- [ ] A new resource receives a backend-generated `createdAt`.
- [ ] The frontend does not send an authoritative `ownerUserId`.
- [ ] The newly created resource appears in the user experience.

Suggested test:

```text
Title: AWS Lambda Best Practices
URL: https://docs.aws.amazon.com/lambda/
```

## 3. Input Validation

- [ ] An empty title is rejected.
- [ ] A title containing only whitespace is rejected.
- [ ] An invalid URL is rejected.
- [ ] A URL using a disallowed scheme is rejected unless it is `http` or `https`.
- [ ] Errors are understandable to the user.
- [ ] The backend validates the data; validation does not exist only in the frontend.

## 4. List Resources

- [ ] `GET /resources` works for an authenticated user.
- [ ] A user with no resources receives a valid response.
- [ ] The UI renders an appropriate empty state.
- [ ] A user with resources can view them.
- [ ] Data survives an application refresh/reload.

## 5. Ownership

This is one of the most important parts of the vertical slice.

- [ ] The backend derives the user from the validated JWT.
- [ ] The frontend request does not control resource ownership.
- [ ] DynamoDB access patterns support querying resources by owner.
- [ ] One user never receives another user's resources.

If two Cognito users are available, test:

```text
User A → creates Resource A
User B → creates Resource B
```

Expected result:

```text
User A → sees only Resource A
User B → sees only Resource B
```

## 6. DynamoDB

- [ ] Resources are actually stored in DynamoDB.
- [ ] The table is defined through CDK.
- [ ] The key structure supports the MVP access pattern.
- [ ] No indexes or extra tables were added without a requirement.
- [ ] Expected stack deployment behavior does not depend on hidden manual steps.

## 7. API and OpenAPI

- [ ] `POST /resources` exists.
- [ ] `GET /resources` exists.
- [ ] Both routes are protected by the existing authentication mechanism.
- [ ] OpenAPI documents both routes.
- [ ] OpenAPI documents relevant requests and responses.
- [ ] OpenAPI reflects authentication and important errors.
- [ ] Implementation and contract do not contradict each other.

## 8. Backend

- [ ] Saved Resources logic lives in the backend application workspace.
- [ ] Business logic was not implemented as inline Lambda code inside CDK.
- [ ] Handlers have reasonably focused responsibilities.
- [ ] Critical validation happens server-side.
- [ ] Expected errors are handled consistently.

## 9. IAM and Infrastructure

- [ ] New infrastructure is defined through CDK.
- [ ] Lambda functions have only the DynamoDB permissions they need.
- [ ] No unnecessary AWS services were introduced.
- [ ] Stack dependencies remain simple and understandable.
- [ ] `cdk synth` succeeds.

## 10. Frontend

- [ ] A loading state exists.
- [ ] An empty state exists.
- [ ] A success state exists.
- [ ] An error state exists.
- [ ] The UI preserves the starter's visual language.
- [ ] No unnecessary sidebar was added.
- [ ] The experience works reasonably on a small viewport.
- [ ] Primary actions are keyboard accessible.

## 11. Tests and Build

Run the repository's available validation commands for:

- [ ] tests;
- [ ] typecheck;
- [ ] frontend build;
- [ ] CDK synth.

Fix any failures before continuing.

## 12. Scope Check

Confirm that the common feature has NOT introduced:

- [ ] editing;
- [ ] deletion;
- [ ] categories;
- [ ] tags;
- [ ] search;
- [ ] filters;
- [ ] pagination;
- [ ] favorites;
- [ ] sharing;
- [ ] public resources;
- [ ] URL previews.

Those capabilities are reserved for later challenges.

## 13. Checkpoint

When everything above is correct:

```bash
git status
git add .
git commit -m "feat: add saved resources"
```

Your branch now represents the common workshop checkpoint.

Continue with:

```text
workshop/02-challenges/README.en.md
```
