// Manual (SDK-based) backend deploy for restricted workshop sandbox accounts.
//
// WHY THIS EXISTS
// The standard path is `cdk deploy ApiGatewayAuthorizerStack`. On this sandbox
// the WSParticipantRole cannot be used with CDK: CDK bootstrap is blocked
// (no iam:CreateRole, the bootstrap asset bucket is encrypted with a KMS key
// the role can't use, and the cdk-* deploy/publish roles can't be assumed).
//
// However, the role CAN call the service APIs directly:
//   lambda:CreateFunction/UpdateFunctionCode (+ iam:PassRole on an existing role)
//   apigatewayv2:* (api, integration, JWT authorizer, route, stage)
//   lambda:AddPermission, dynamodb:*, iam:PutRolePolicy on existing roles.
//
// So this module reproduces exactly what the CDK stack would create, using
// direct SDK calls, and is fully idempotent (safe to re-run).
//
// EXECUTION ROLE (sandbox trade-off)
// Lambda needs an execution role, but iam:CreateRole is denied. We therefore
// REUSE an existing role in the account (passed via LAMBDA_EXEC_ROLE_ARN, or a
// discovered default) and attach our own clearly-named inline policies when a
// function needs extra permissions (e.g. DynamoDB). This is acceptable ONLY
// because the account is an ephemeral lab sandbox that will be destroyed.

import {
  LambdaClient,
  CreateFunctionCommand,
  UpdateFunctionCodeCommand,
  GetFunctionCommand,
  AddPermissionCommand,
} from '@aws-sdk/client-lambda';
import {
  ApiGatewayV2Client,
  GetApisCommand,
  CreateApiCommand,
  GetAuthorizersCommand,
  CreateAuthorizerCommand,
  GetIntegrationsCommand,
  CreateIntegrationCommand,
  GetRoutesCommand,
  CreateRouteCommand,
  GetStagesCommand,
  CreateStageCommand,
} from '@aws-sdk/client-apigatewayv2';
import {
  IAMClient,
  ListRolesCommand,
  PutRolePolicyCommand,
} from '@aws-sdk/client-iam';
import { resolveRegion } from './aws-clients.mjs';
import * as log from './console.mjs';
import { zipInlineFunction } from './zip.mjs';

const FUNCTION_NAME = 'kiro-essentials-hello-handler';
const API_NAME = 'kiro-essentials-api';
const ROUTE_KEY = 'GET /hello';
const STAGE_NAME = '$default';

// The /hello handler — identical behavior to the inline CDK Lambda.
const HELLO_SOURCE = `
exports.handler = async (event) => {
  try {
    const body = {
      message: "Hola desde el backend protegido",
      data: [
        { id: 1, name: "Elemento 1" },
        { id: 2, name: "Elemento 2" },
        { id: 3, name: "Elemento 3" }
      ],
      timestamp: new Date().toISOString()
    };
    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: "Error interno del servicio" })
    };
  }
};
`.trim();

function lambda() {
  return new LambdaClient({ region: resolveRegion() });
}
function apigw() {
  return new ApiGatewayV2Client({ region: resolveRegion() });
}
function iam() {
  return new IAMClient({ region: resolveRegion() });
}

/**
 * Resolve an existing Lambda execution role ARN to reuse.
 * Preference order:
 *   1. LAMBDA_EXEC_ROLE_ARN (explicit opt-in).
 *   2. A role in the account that trusts lambda.amazonaws.com and already has
 *      basic execution (CloudWatch Logs) — avoids needing to attach logs perms.
 */
async function resolveExecutionRoleArn() {
  const explicit = process.env.LAMBDA_EXEC_ROLE_ARN?.trim();
  if (explicit) {
    log.info(`Using LAMBDA_EXEC_ROLE_ARN: ${explicit}`);
    return explicit;
  }

  log.info('No LAMBDA_EXEC_ROLE_ARN set — discovering a reusable Lambda role...');
  const res = await iam().send(new ListRolesCommand({ MaxItems: 200 }));
  const roles = res.Roles ?? [];
  const trustsLambda = (role) => {
    try {
      const doc = JSON.parse(decodeURIComponent(role.AssumeRolePolicyDocument ?? ''));
      const stmts = Array.isArray(doc.Statement) ? doc.Statement : [doc.Statement];
      return stmts.some((s) => {
        const svc = s?.Principal?.Service;
        return Array.isArray(svc)
          ? svc.includes('lambda.amazonaws.com')
          : svc === 'lambda.amazonaws.com';
      });
    } catch {
      return false;
    }
  };

  const candidate = roles.find(
    (r) => trustsLambda(r) && /HealthCheck|Lambda/i.test(r.RoleName ?? ''),
  );
  if (!candidate) {
    throw new Error(
      'Could not find a reusable Lambda execution role. ' +
        'Set LAMBDA_EXEC_ROLE_ARN to an existing role that trusts lambda.amazonaws.com.',
    );
  }
  log.info(`Reusing existing execution role: ${candidate.RoleName}`);
  return candidate.Arn;
}

/** Attach an inline policy to the (reused) execution role. Idempotent. */
export async function attachInlinePolicy(roleArn, policyName, statements) {
  const roleName = roleArn.split('/').pop();
  await iam().send(
    new PutRolePolicyCommand({
      RoleName: roleName,
      PolicyName: policyName,
      PolicyDocument: JSON.stringify({ Version: '2012-10-17', Statement: statements }),
    }),
  );
  log.ok(`Attached inline policy "${policyName}" to ${roleName}.`);
}

/** Create the Lambda, or update its code if it already exists. */
async function upsertFunction(roleArn) {
  const zip = zipInlineFunction('index.js', HELLO_SOURCE);
  const client = lambda();

  let exists = false;
  try {
    await client.send(new GetFunctionCommand({ FunctionName: FUNCTION_NAME }));
    exists = true;
  } catch (err) {
    if (err?.name !== 'ResourceNotFoundException') throw err;
  }

  if (exists) {
    await client.send(
      new UpdateFunctionCodeCommand({ FunctionName: FUNCTION_NAME, ZipFile: zip }),
    );
    log.ok(`Updated Lambda ${FUNCTION_NAME}.`);
  } else {
    const res = await client.send(
      new CreateFunctionCommand({
        FunctionName: FUNCTION_NAME,
        Runtime: 'nodejs22.x',
        Handler: 'index.handler',
        Role: roleArn,
        Timeout: 30,
        MemorySize: 128,
        Code: { ZipFile: zip },
      }),
    );
    log.ok(`Created Lambda ${res.FunctionArn}.`);
  }

  const { Configuration } = await client.send(
    new GetFunctionCommand({ FunctionName: FUNCTION_NAME }),
  );
  return Configuration.FunctionArn;
}

/** Find an existing HTTP API by name, or create one. */
async function upsertApi() {
  const client = apigw();
  const existing = await client.send(new GetApisCommand({ MaxResults: '500' }));
  const found = (existing.Items ?? []).find((a) => a.Name === API_NAME);
  if (found) {
    log.ok(`Reusing HTTP API ${found.ApiId}.`);
    return { apiId: found.ApiId, apiEndpoint: found.ApiEndpoint };
  }
  const created = await client.send(
    new CreateApiCommand({
      Name: API_NAME,
      ProtocolType: 'HTTP',
      CorsConfiguration: {
        AllowOrigins: ['http://localhost:5173'],
        AllowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
        AllowHeaders: ['Authorization', 'Content-Type'],
      },
    }),
  );
  log.ok(`Created HTTP API ${created.ApiId}.`);
  return { apiId: created.ApiId, apiEndpoint: created.ApiEndpoint };
}

/** Create (or reuse) the Cognito JWT authorizer for the external pool. */
async function upsertAuthorizer(apiId) {
  const client = apigw();
  const region = resolveRegion();
  const userPoolId = process.env.COGNITO_USER_POOL_ID;
  const clientId = process.env.COGNITO_CLIENT_ID;
  if (!userPoolId || !clientId) {
    throw new Error(
      'COGNITO_USER_POOL_ID and COGNITO_CLIENT_ID must be set to configure the JWT authorizer.',
    );
  }
  const issuer = `https://cognito-idp.${region}.amazonaws.com/${userPoolId}`;

  const existing = await client.send(new GetAuthorizersCommand({ ApiId: apiId }));
  const found = (existing.Items ?? []).find((a) => a.Name === 'CognitoAuthorizer');
  if (found) {
    log.ok(`Reusing JWT authorizer ${found.AuthorizerId}.`);
    return found.AuthorizerId;
  }
  const created = await client.send(
    new CreateAuthorizerCommand({
      ApiId: apiId,
      Name: 'CognitoAuthorizer',
      AuthorizerType: 'JWT',
      IdentitySource: ['$request.header.Authorization'],
      JwtConfiguration: { Issuer: issuer, Audience: [clientId] },
    }),
  );
  log.ok(`Created JWT authorizer (issuer ${issuer}).`);
  return created.AuthorizerId;
}

/** Create (or reuse) the AWS_PROXY integration to the Lambda. */
async function upsertIntegration(apiId, functionArn) {
  const client = apigw();
  const existing = await client.send(new GetIntegrationsCommand({ ApiId: apiId }));
  const found = (existing.Items ?? []).find((i) => i.IntegrationUri === functionArn);
  if (found) {
    log.ok(`Reusing integration ${found.IntegrationId}.`);
    return found.IntegrationId;
  }
  const created = await client.send(
    new CreateIntegrationCommand({
      ApiId: apiId,
      IntegrationType: 'AWS_PROXY',
      IntegrationUri: functionArn,
      PayloadFormatVersion: '2.0',
    }),
  );
  log.ok(`Created Lambda integration ${created.IntegrationId}.`);
  return created.IntegrationId;
}

/** Create (or reuse) the GET /hello route protected by the authorizer. */
async function upsertRoute(apiId, integrationId, authorizerId) {
  const client = apigw();
  const existing = await client.send(new GetRoutesCommand({ ApiId: apiId }));
  const found = (existing.Items ?? []).find((r) => r.RouteKey === ROUTE_KEY);
  if (found) {
    log.ok(`Reusing route "${ROUTE_KEY}".`);
    return found.RouteId;
  }
  const created = await client.send(
    new CreateRouteCommand({
      ApiId: apiId,
      RouteKey: ROUTE_KEY,
      Target: `integrations/${integrationId}`,
      AuthorizationType: 'JWT',
      AuthorizerId: authorizerId,
    }),
  );
  log.ok(`Created protected route "${ROUTE_KEY}".`);
  return created.RouteId;
}

/** Ensure the auto-deploy $default stage exists. */
async function ensureStage(apiId) {
  const client = apigw();
  const existing = await client.send(new GetStagesCommand({ ApiId: apiId }));
  const found = (existing.Items ?? []).find((s) => s.StageName === STAGE_NAME);
  if (found) {
    log.ok(`Reusing stage "${STAGE_NAME}".`);
    return;
  }
  await client.send(
    new CreateStageCommand({ ApiId: apiId, StageName: STAGE_NAME, AutoDeploy: true }),
  );
  log.ok(`Created auto-deploy stage "${STAGE_NAME}".`);
}

/** Grant API Gateway permission to invoke the Lambda. Idempotent. */
async function ensureInvokePermission(apiId, accountId) {
  const region = resolveRegion();
  const sourceArn = `arn:aws:execute-api:${region}:${accountId}:${apiId}/*/*/hello`;
  try {
    await lambda().send(
      new AddPermissionCommand({
        FunctionName: FUNCTION_NAME,
        StatementId: 'apigw-invoke-hello',
        Action: 'lambda:InvokeFunction',
        Principal: 'apigateway.amazonaws.com',
        SourceArn: sourceArn,
      }),
    );
    log.ok('Granted API Gateway invoke permission.');
  } catch (err) {
    if (err?.name === 'ResourceConflictException') {
      log.ok('Invoke permission already present.');
      return;
    }
    throw err;
  }
}

/**
 * Deploy the /hello backend end to end via direct SDK calls. Idempotent.
 * Returns the public base URL of the API (e.g. https://abc123.execute-api...).
 */
export async function deployHelloBackend({ accountId }) {
  log.step('🛠️  Deploying /hello backend (manual SDK path)...');

  const roleArn = await resolveExecutionRoleArn();
  const functionArn = await upsertFunction(roleArn);
  const { apiId, apiEndpoint } = await upsertApi();
  const authorizerId = await upsertAuthorizer(apiId);
  const integrationId = await upsertIntegration(apiId, functionArn);
  await upsertRoute(apiId, integrationId, authorizerId);
  await ensureStage(apiId);
  await ensureInvokePermission(apiId, accountId);

  // For the $default stage, the invoke URL is the API endpoint itself.
  const baseUrl = apiEndpoint;
  log.ok(`API base URL: ${baseUrl}`);
  return { apiUrl: baseUrl, functionArn, executionRoleArn: roleArn };
}

export { FUNCTION_NAME, API_NAME };
