// CloudFormation output resolution via the AWS SDK v3.
//
// Replaces the Bash `aws cloudformation describe-stacks --query ...` calls with
// a single SDK round-trip per stack, cached so repeated lookups for the same
// stack don't re-hit the API. Missing stacks/outputs produce short, actionable
// errors instead of raw SDK stack traces.

import { DescribeStacksCommand } from '@aws-sdk/client-cloudformation';
import { cloudFormationClient } from './aws-clients.mjs';

const stackCache = new Map();

/**
 * Fetch a stack's outputs as a key/value map. Throws a friendly error if the
 * stack does not exist (e.g. not deployed yet).
 */
async function getStackOutputs(stackName) {
  if (stackCache.has(stackName)) return stackCache.get(stackName);

  let response;
  try {
    response = await cloudFormationClient().send(
      new DescribeStacksCommand({ StackName: stackName }),
    );
  } catch (err) {
    if (
      err?.name === 'ValidationError' ||
      /does not exist/i.test(err?.message ?? '')
    ) {
      throw new Error(
        `CloudFormation stack "${stackName}" was not found. Deploy the infrastructure first.`,
      );
    }
    throw new Error(
      `Failed to read CloudFormation stack "${stackName}": ${err?.message ?? err}`,
    );
  }

  const stack = response.Stacks?.[0];
  const outputs = {};
  for (const output of stack?.Outputs ?? []) {
    if (output.OutputKey) outputs[output.OutputKey] = output.OutputValue ?? '';
  }
  stackCache.set(stackName, outputs);
  return outputs;
}

/**
 * Resolve a single output value. When `required` is true (default), a missing
 * or empty value throws a friendly error; otherwise an empty string is returned.
 */
export async function getOutput(stackName, key, { required = true } = {}) {
  const outputs = await getStackOutputs(stackName);
  const value = outputs[key];
  if (!value || value === 'None') {
    if (required) {
      throw new Error(
        `Could not resolve "${key}" from stack "${stackName}". Is the stack deployed and the output present?`,
      );
    }
    return '';
  }
  return value;
}

/**
 * Resolve several outputs from one stack at once. `spec` maps result keys to
 * CloudFormation output keys. Pass `required: false` to tolerate missing values
 * (returned as empty strings).
 */
export async function getOutputs(stackName, spec, { required = true } = {}) {
  const result = {};
  for (const [resultKey, outputKey] of Object.entries(spec)) {
    result[resultKey] = await getOutput(stackName, outputKey, { required });
  }
  return result;
}
