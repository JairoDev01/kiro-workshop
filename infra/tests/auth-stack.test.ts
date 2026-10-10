import { App } from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { describe, it, expect, beforeAll } from 'vitest';
import { FrontendHostingStack } from '../lib/stacks/frontend-hosting-stack';
import { AuthStack } from '../lib/stacks/auth-stack';

describe('AuthStack Managed Login Configuration', () => {
  let app: App;
  let authTemplate: Template;

  beforeAll(() => {
    app = new App();

    const frontendHostingStack = new FrontendHostingStack(app, 'FrontendHostingStack', {});

    const authStack = new AuthStack(app, 'AuthStack', {
      callbackUrls: ['http://localhost:5173/callback'],
      logoutUrls: ['http://localhost:5173/login'],
      allowedOrigins: ['http://localhost:5173'],
      domainPrefix: 'kiro-essentials-dev',
      frontendDomain: frontendHostingStack.distributionDomainName,
    });

    authTemplate = Template.fromStack(authStack);
  });

  /**
   * Validates: Requirement FR-1.1
   * UserPool must be on the ESSENTIALS tier to enable Managed Login.
   */
  it('UserPool has ESSENTIALS tier', () => {
    const pools = authTemplate.findResources('AWS::Cognito::UserPool');
    const poolProps = Object.values(pools)[0].Properties;
    expect(poolProps.UserPoolTier).toBe('ESSENTIALS');
  });

  /**
   * Validates: Requirement FR-2.1
   * UserPoolDomain must use Managed Login v2.
   */
  it('UserPoolDomain has ManagedLoginVersion 2', () => {
    authTemplate.hasResourceProperties('AWS::Cognito::UserPoolDomain', {
      ManagedLoginVersion: 2,
    });
  });

  /**
   * Validates: Requirements FR-3.1, FR-3.2
   * A ManagedLoginBranding resource exists with Cognito-provided default values.
   */
  it('ManagedLoginBranding resource exists with UseCognitoProvidedValues', () => {
    authTemplate.hasResourceProperties('AWS::Cognito::ManagedLoginBranding', {
      UseCognitoProvidedValues: true,
    });
  });

  /**
   * Validates: Requirement FR-4.1
   * UserPoolClient retains Authorization Code Grant.
   */
  it('UserPoolClient has Authorization Code Grant', () => {
    const clients = authTemplate.findResources('AWS::Cognito::UserPoolClient');
    const clientProps = Object.values(clients)[0].Properties;
    expect(clientProps.AllowedOAuthFlows).toContain('code');
  });

  /**
   * Validates: Requirement FR-4.3
   * UserPoolClient must remain public (no client secret).
   */
  it('UserPoolClient has no client secret', () => {
    const clients = authTemplate.findResources('AWS::Cognito::UserPoolClient');
    const clientProps = Object.values(clients)[0].Properties;
    expect(clientProps.GenerateSecret).toBe(false);
  });

  /**
   * Validates: Requirement FR-4.4
   * Callback URLs contain both localhost and CloudFront entries.
   */
  it('Callback URLs contain both localhost and CloudFront entries', () => {
    const clients = authTemplate.findResources('AWS::Cognito::UserPoolClient');
    const clientProps = Object.values(clients)[0].Properties;
    const callbackUrls = clientProps.CallbackURLs;

    expect(callbackUrls).toContain('http://localhost:5173/callback');
    expect(callbackUrls.length).toBeGreaterThan(1);

    const cloudFrontEntry = callbackUrls.find(
      (url: any) => typeof url === 'object' && url['Fn::Join'] !== undefined,
    );
    expect(cloudFrontEntry).toBeDefined();
  });

  /**
   * Validates: Requirement FR-4.5
   * Logout URLs contain both localhost and CloudFront entries.
   */
  it('Logout URLs contain both localhost and CloudFront entries', () => {
    const clients = authTemplate.findResources('AWS::Cognito::UserPoolClient');
    const clientProps = Object.values(clients)[0].Properties;
    const logoutUrls = clientProps.LogoutURLs;

    expect(logoutUrls).toContain('http://localhost:5173/login');
    expect(logoutUrls.length).toBeGreaterThan(1);

    const cloudFrontEntry = logoutUrls.find(
      (url: any) => typeof url === 'object' && url['Fn::Join'] !== undefined,
    );
    expect(cloudFrontEntry).toBeDefined();
  });

  /**
   * Validates: Requirements FR-4.4, FR-4.5 (outputs preservation)
   * CloudFormation outputs UserPoolId, UserPoolClientId, CognitoDomain remain present.
   */
  describe('CloudFormation outputs', () => {
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
   * Validates: Requirement NFR-3.3
   * No Lambda functions in AuthStack (no custom auth backend).
   */
  it('no Lambda functions exist in AuthStack', () => {
    const lambdas = authTemplate.findResources('AWS::Lambda::Function');
    expect(Object.keys(lambdas)).toHaveLength(0);
  });
});
