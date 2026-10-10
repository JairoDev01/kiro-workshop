import * as cdk from 'aws-cdk-lib';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import { Construct } from 'constructs';

export interface AuthStackProps extends cdk.StackProps {
  readonly callbackUrls: string[];
  readonly logoutUrls: string[];
  readonly allowedOrigins: string[];
  readonly domainPrefix: string;
  readonly frontendDomain?: string;
}

export class AuthStack extends cdk.Stack {
  public readonly userPool: cognito.UserPool;
  public readonly userPoolClient: cognito.UserPoolClient;
  public readonly userPoolDomain: cognito.UserPoolDomain;
  public readonly allowedOrigins: string[];

  constructor(scope: Construct, id: string, props: AuthStackProps) {
    super(scope, id, props);

    this.allowedOrigins = props.frontendDomain
      ? [...props.allowedOrigins, `https://${props.frontendDomain}`]
      : props.allowedOrigins;

    const effectiveCallbackUrls = props.frontendDomain
      ? [...props.callbackUrls, `https://${props.frontendDomain}/callback`]
      : props.callbackUrls;

    const effectiveLogoutUrls = props.frontendDomain
      ? [...props.logoutUrls, `https://${props.frontendDomain}/login`]
      : props.logoutUrls;

    // User Pool with Managed Login (Hosted UI), email as sign-in attribute, self sign-up enabled
    this.userPool = new cognito.UserPool(this, 'UserPool', {
      userPoolName: 'kiro-essentials-pool',
      featurePlan: cognito.FeaturePlan.ESSENTIALS,
      selfSignUpEnabled: true,
      signInAliases: {
        email: true,
      },
      autoVerify: {
        email: true,
      },
      standardAttributes: {
        email: {
          required: true,
          mutable: true,
        },
      },
      passwordPolicy: {
        minLength: 8,
        requireLowercase: true,
        requireUppercase: true,
        requireDigits: true,
        requireSymbols: false,
      },
      accountRecovery: cognito.AccountRecovery.EMAIL_ONLY,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    // User Pool Domain (prefix-based) with Managed Login v2
    this.userPoolDomain = this.userPool.addDomain('UserPoolDomain', {
      cognitoDomain: {
        domainPrefix: props.domainPrefix,
      },
      managedLoginVersion: cognito.ManagedLoginVersion.NEWER_MANAGED_LOGIN,
    });

    // App Client: no client secret, Authorization Code Grant only, PKCE support
    this.userPoolClient = this.userPool.addClient('UserPoolClient', {
      userPoolClientName: 'kiro-essentials-client',
      generateSecret: false,
      authFlows: {
        custom: false,
        userPassword: false,
        userSrp: false,
      },
      oAuth: {
        flows: {
          authorizationCodeGrant: true,
          implicitCodeGrant: false,
        },
        scopes: [
          cognito.OAuthScope.OPENID,
          cognito.OAuthScope.EMAIL,
          cognito.OAuthScope.PROFILE,
        ],
        callbackUrls: effectiveCallbackUrls,
        logoutUrls: effectiveLogoutUrls,
      },
      preventUserExistenceErrors: true,
      supportedIdentityProviders: [
        cognito.UserPoolClientIdentityProvider.COGNITO,
      ],
    });

    // Managed Login Branding (Cognito defaults)
    new cognito.CfnManagedLoginBranding(this, 'ManagedLoginBranding', {
      userPoolId: this.userPool.userPoolId,
      clientId: this.userPoolClient.userPoolClientId,
      useCognitoProvidedValues: true,
    });

    // CloudFormation Outputs
    new cdk.CfnOutput(this, 'UserPoolId', {
      value: this.userPool.userPoolId,
      description: 'Cognito User Pool ID',
    });

    new cdk.CfnOutput(this, 'UserPoolClientId', {
      value: this.userPoolClient.userPoolClientId,
      description: 'Cognito User Pool Client ID',
    });

    new cdk.CfnOutput(this, 'CognitoDomain', {
      value: cdk.Fn.join('', [
        props.domainPrefix,
        '.auth.',
        cdk.Aws.REGION,
        '.amazoncognito.com',
      ]),
      description: 'Cognito Hosted UI Domain',
    });

    // Tags on all resources
    cdk.Tags.of(this).add('Project', 'kiro-essentials');
    cdk.Tags.of(this).add('ManagedBy', 'cdk');
  }
}
