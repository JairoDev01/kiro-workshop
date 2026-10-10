# Challenge — Backend / API

## Mission

Evolve the Saved Resources API so it can grow beyond a very small dataset.

The common feature already allows users to create and list their own resources.

Your goal is to add **DynamoDB-friendly pagination** and strengthen the API error contract.

## Expected Outcome

When finished:

- `GET /resources` supports pagination;
- the frontend can request and display an additional page;
- the API uses an opaque cursor/token rather than offset pagination;
- invalid inputs produce consistent errors;
- ownership remains isolated per user;
- OpenAPI documents the new contract.

## Definition of Done

The solution is complete when:

- `GET /resources` accepts a reasonable page size;
- there is a maximum page-size limit;
- out-of-range or invalid values are rejected consistently;
- the response may include a cursor/token for continuation;
- the public cursor does not directly expose DynamoDB internals;
- the implementation uses DynamoDB's natural pagination semantics instead of simulating `OFFSET`;
- the cursor cannot bypass authenticated ownership;
- the frontend demonstrates loading the next page;
- Saved Resources errors follow a consistent format;
- OpenAPI documents parameters, responses, and errors;
- tests cover pagination, validation, ownership, and invalid cursors;
- existing create/list behavior continues to work.

## Constraints

Do not replace DynamoDB.

Do not weaken the JWT Authorizer.

Do not expose a raw `LastEvaluatedKey` directly as the public API contract.

Do not introduce a relational database only to gain offset pagination.

Do not redesign the UI beyond what is required to demonstrate pagination.

Do not add caching, queues, or other AWS services without a requirement.

## Decisions You Must Reason About with Kiro

You should decide:

- page-size parameter naming and semantics;
- maximum allowed page size;
- continuation-token representation;
- paginated response shape;
- consistent error format;
- handling of invalid or manipulated tokens;
- preserving ownership during continuation.

OpenAPI must remain the source of truth.

## Stretch Goals

After completing the main challenge, choose **one**:

- introduce a reusable error schema for Saved Resources;
- add more tests for manipulated cursors;
- add explicit ordering compatible with the access pattern;
- make limits configurable rather than hardcoded in handlers.

## Suggested Validation

Create enough resources to require more than one page.

Test:

```text
GET /resources?limit=<value>
→ first page
→ continuation token

GET /resources?limit=<value>&cursor=<token>
→ next page
```

Also verify:

```text
invalid cursor
→ controlled error

invalid limit
→ controlled error
```

With two users:

```text
User A and User B both have resources.

A cursor issued for A must never allow access to B's resources.
```

Also run:

- tests;
- typecheck;
- frontend build;
- `cdk synth`.

## Your Task

1. Inspect the current access pattern.
2. Read Steering and OpenAPI.
3. Design your Kiro prompt.
4. Generate a Spec.
5. Review Requirements, Design, and Tasks.
6. Implement.
7. Validate the real API behavior.
8. Commit.

The goal is to use Kiro to **design an API that fits DynamoDB**, not to disguise DynamoDB as a relational database.
