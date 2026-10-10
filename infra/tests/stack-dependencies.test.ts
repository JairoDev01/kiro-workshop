import { App } from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { describe, it, expect, beforeAll } from 'vitest';
import { FrontendHostingStack } from '../lib/stacks/frontend-hosting-stack';
import { AuthStack } from '../lib/stacks/auth-stack';
import { ApiGatewayStack } from '../lib/stacks/api-gateway-stack';

describe('Stack Dependencies Integration', () => {
  let app: App;
  let frontendHostingStack: FrontendHostingStack;
  let authStack: AuthStack;
  let apiGatewayStack: ApiGatewayStack;
  let authTemplate: Template;
  let apiTemplate: Template;

  beforeAll(() => {
    app = new App();

    frontendHostingStack = new FrontendHostingStack(app, 'FrontendHostingStack', {});

    authStack = new AuthStack(app, 'AuthStack', {
      callbackUrls: ['http://localhost:5173/callback'],
      logoutUrls: ['http://localhost:5173/login'],
      allowedOrigins: ['http://localhost:5173'],
      domainPrefix: 'kiro-essentials-dev',
      frontendDomain: frontendHostingStack.distributionDomainName,
    });
    authStack.addDependency(frontendHostingStack);

    apiGatewayStack = new ApiGatewayStack(app, 'ApiGatewayAuthorizerStack', {
      userPoolId: authStack.userPool.userPoolId,
      userPoolClientId: authStack.userPoolClient.userPoolClientId,
      allowedOrigins: authStack.allowedOrigins,
    });
    apiGatewayStack.addDependency(authStack);

    authTemplate = Template.fromStack(authStack);
    apiTemplate = Template.fromStack(apiGatewayStack);
  });

  /**
   * Validates: Requirements 5.4, 14.4
   * If there were circular dependencies, Template.fromStack would throw during beforeAll.
   */
  it('full app synth succeeds without circular dependencies', () => {
    expect(authTemplate).toBeDefined();
    expect(apiTemplate).toBeDefined();
  });

  /**
   * Validates: Requirements 15.1
   * All existing stack names are preserved and the new FrontendHostingStack is present.
   */
  it('all expected stack names are present in the app', () => {
    const stackNames = app.node.children
      .filter((child) => 'templateOptions' in child)
      .map((child) => child.node.id);

    expect(stackNames).toContain('FrontendHostingStack');
    expect(stackNames).toContain('AuthStack');
    expect(stackNames).toContain('ApiGatewayAuthorizerStack');
  });

  /**
   * Validates: Requirements 8.1, 8.2
   * AuthStack outputs UserPoolId, UserPoolClientId, and CognitoDomain are present.
   */
  describe('AuthStack outputs', () => {
    it('exports UserPoolId', () => {
      authTemplate.hasOutput('UserPoolId', {});
    });

    it('exports UserPoolClientId', () => {
      authTemplate.hasOutput('UserPoolClientId', {});
    });

    it('exports CognitoDomain', () => {
      authTemplate.hasOutput('CognitoDomain', {});
    });
  });

  /**
   * Validates: Requirement 9.1
   * ApiGatewayAuthorizerStack exports ApiUrl output.
   */
  it('ApiGatewayAuthorizerStack exports ApiUrl output', () => {
    apiTemplate.hasOutput('ApiUrl', {});
  });

  /**
   * Validates: Requirements 8.3, 8.4, 8.6
   * Cognito callback URLs contain both localhost and CloudFront entries.
   */
  it('Cognito callback URLs contain both localhost and CloudFront entries', () => {
    const clients = authTemplate.findResources('AWS::Cognito::UserPoolClient');
    const clientProps = Object.values(clients)[0].Properties;
    const callbackUrls = clientProps.CallbackURLs;

    // Localhost entry is present as a literal string
    expect(callbackUrls).toContain('http://localhost:5173/callback');

    // CloudFront entry exists (more than just localhost)
    expect(callbackUrls.length).toBeGreaterThan(1);

    // Verify the CloudFront entry is a token expression (Fn::Join constructing the URL)
    const cloudFrontEntry = callbackUrls.find(
      (url: any) => typeof url === 'object' && url['Fn::Join'] !== undefined,
    );
    expect(cloudFrontEntry).toBeDefined();
  });

  /**
   * Validates: Requirements 8.3, 8.4
   * Cognito logout URLs contain both localhost and CloudFront entries.
   */
  it('Cognito logout URLs contain both localhost and CloudFront entries', () => {
    const clients = authTemplate.findResources('AWS::Cognito::UserPoolClient');
    const clientProps = Object.values(clients)[0].Properties;
    const logoutUrls = clientProps.LogoutURLs;

    // Localhost entry is present as a literal string
    expect(logoutUrls).toContain('http://localhost:5173/login');

    // CloudFront entry exists (more than just localhost)
    expect(logoutUrls.length).toBeGreaterThan(1);

    // Verify the CloudFront entry is a token expression (Fn::Join constructing the URL)
    const cloudFrontEntry = logoutUrls.find(
      (url: any) => typeof url === 'object' && url['Fn::Join'] !== undefined,
    );
    expect(cloudFrontEntry).toBeDefined();
  });

  /**
   * Validates: Requirements 9.1, 9.2, 12.3, 12.4
   * CORS allowOrigins contains both localhost and CloudFront entries.
   */
  it('CORS allowOrigins contains both localhost and CloudFront entries', () => {
    const apis = apiTemplate.findResources('AWS::ApiGatewayV2::Api');
    const apiProps = Object.values(apis)[0].Properties;
    const allowOrigins = apiProps.CorsConfiguration.AllowOrigins;

    // Localhost entry is present as a literal string
    expect(allowOrigins).toContain('http://localhost:5173');

    // CloudFront entry exists (more than just localhost)
    expect(allowOrigins.length).toBeGreaterThan(1);
  });

  /**
   * Validates: Requirement 9.3
   * CORS allowOrigins does not contain wildcard '*'.
   */
  it('CORS allowOrigins does not contain wildcard', () => {
    const apis = apiTemplate.findResources('AWS::ApiGatewayV2::Api');
    const apiProps = Object.values(apis)[0].Properties;
    const allowOrigins = apiProps.CorsConfiguration.AllowOrigins;

    expect(allowOrigins).not.toContain('*');
  });
});
