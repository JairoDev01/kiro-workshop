# Challenge — Cloud / Infrastructure

## Mission

Make the application observable.

Saved Resources already works, but an operator should be able to answer basic questions about system health without manually inspecting every AWS resource.

Your goal is to add **useful observability with AWS CloudWatch and CDK**.

## Expected Outcome

When finished, the infrastructure should help answer questions such as:

- Is the API receiving traffic?
- Are errors increasing?
- Are Lambda functions failing?
- Is backend latency changing?
- Is there a condition that should trigger an alarm?

## Definition of Done

The solution is complete when:

- all new observability is defined through AWS CDK;
- there is an explicit, reasonable log-retention policy where applicable;
- at least one useful CloudWatch Dashboard exists;
- the dashboard includes relevant API and/or Saved Resources Lambda metrics;
- at least two meaningful alarms exist;
- alarms represent real operational conditions rather than arbitrary metrics;
- `cdk synth` succeeds;
- deployment does not require manually creating CloudWatch resources;
- Saved Resources behavior does not change;
- existing authentication does not change.

## Suggested Signals

You do not have to use exactly these metrics, but valid examples include:

- API request count;
- API 4xx / 5xx;
- Lambda errors;
- Lambda duration;
- Lambda throttles.

Choose signals that help diagnose the system.

## Constraints

Do not add AWS services only to increase complexity.

Do not change:

- Cognito;
- ownership;
- DynamoDB access patterns;
- product functionality.

Do not create dashboards or alarms manually in the AWS Console as part of the final solution.

Do not turn the challenge into a full observability platform.

## Decisions You Must Reason About with Kiro

You should decide:

- which metrics are most useful;
- which thresholds make sense for a workshop;
- how to avoid completely useless alarms in a low-traffic environment;
- how to organize dashboards/alarms in the existing CDK structure;
- what log retention is reasonable;
- how to keep the infrastructure simple.

## Stretch Goals

After completing the main challenge, choose **one**:

- add a custom metric for a concrete use case;
- add tracing if architecture and time justify it;
- add a clearer latency view;
- add a composite alarm or another useful operational signal.

Do not add tracing or additional services before completing the core metrics, dashboard, and alarms.

## Suggested Validation

After deployment:

1. generate traffic using the application;
2. create some resources;
3. safely trigger a validation failure;
4. open the dashboard;
5. verify that the metrics are meaningful.

Also inspect:

- CloudWatch Dashboard;
- CloudWatch Alarms;
- log groups;
- retention;
- `cdk synth`;
- existing tests.

## Your Task

1. Inspect the current CDK infrastructure.
2. Identify missing operational signals.
3. Design your Kiro prompt.
4. Generate a Spec.
5. Review the design before implementation.
6. Implement through CDK.
7. Deploy.
8. Demonstrate working observability.
9. Commit.

The goal is to **make the system operable**, not to make the architecture diagram larger.
