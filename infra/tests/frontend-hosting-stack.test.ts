import { App } from 'aws-cdk-lib';
import { Template, Match } from 'aws-cdk-lib/assertions';
import { describe, it, expect, beforeAll } from 'vitest';
import { FrontendHostingStack } from '../lib/stacks/frontend-hosting-stack';

describe('FrontendHostingStack', () => {
  let template: Template;

  beforeAll(() => {
    const app = new App();
    const stack = new FrontendHostingStack(app, 'TestStack');
    template = Template.fromStack(stack);
  });

  describe('S3 Bucket', () => {
    it('has Block Public Access fully enabled', () => {
      template.hasResourceProperties('AWS::S3::Bucket', {
        PublicAccessBlockConfiguration: {
          BlockPublicAcls: true,
          IgnorePublicAcls: true,
          BlockPublicPolicy: true,
          RestrictPublicBuckets: true,
        },
      });
    });

    it('uses BucketOwnerEnforced object ownership', () => {
      template.hasResourceProperties('AWS::S3::Bucket', {
        OwnershipControls: {
          Rules: [{ ObjectOwnership: 'BucketOwnerEnforced' }],
        },
      });
    });

    it('does not enable S3 static website hosting', () => {
      const buckets = template.findResources('AWS::S3::Bucket');
      for (const bucket of Object.values(buckets)) {
        expect(bucket.Properties).not.toHaveProperty('WebsiteConfiguration');
      }
    });
  });

  describe('CloudFront Distribution', () => {
    it('has an OAC resource', () => {
      const oacResources = template.findResources('AWS::CloudFront::OriginAccessControl');
      expect(Object.keys(oacResources).length).toBeGreaterThanOrEqual(1);
    });

    it('does not have an OAI resource', () => {
      const oaiResources = template.findResources('AWS::CloudFront::CloudFrontOriginAccessIdentity');
      expect(Object.keys(oaiResources).length).toBe(0);
    });

    it('redirects HTTP to HTTPS', () => {
      template.hasResourceProperties('AWS::CloudFront::Distribution', {
        DistributionConfig: {
          DefaultCacheBehavior: {
            ViewerProtocolPolicy: 'redirect-to-https',
          },
        },
      });
    });

    it('sets DefaultRootObject to index.html', () => {
      template.hasResourceProperties('AWS::CloudFront::Distribution', {
        DistributionConfig: {
          DefaultRootObject: 'index.html',
        },
      });
    });

    it('enables compression', () => {
      template.hasResourceProperties('AWS::CloudFront::Distribution', {
        DistributionConfig: {
          DefaultCacheBehavior: {
            Compress: true,
          },
        },
      });
    });

    it('has custom error responses for 403 and 404', () => {
      template.hasResourceProperties('AWS::CloudFront::Distribution', {
        DistributionConfig: {
          CustomErrorResponses: Match.arrayWith([
            Match.objectLike({
              ErrorCode: 403,
              ResponseCode: 200,
              ResponsePagePath: '/index.html',
              ErrorCachingMinTTL: Match.anyValue(),
            }),
            Match.objectLike({
              ErrorCode: 404,
              ResponseCode: 200,
              ResponsePagePath: '/index.html',
              ErrorCachingMinTTL: Match.anyValue(),
            }),
          ]),
        },
      });
    });

    it('has error caching TTL of 10 seconds or less for 403 and 404', () => {
      const distributions = template.findResources('AWS::CloudFront::Distribution');
      for (const dist of Object.values(distributions)) {
        const errorResponses = dist.Properties?.DistributionConfig?.CustomErrorResponses;
        expect(errorResponses).toBeDefined();

        const err403 = errorResponses.find((r: any) => r.ErrorCode === 403);
        const err404 = errorResponses.find((r: any) => r.ErrorCode === 404);

        expect(err403).toBeDefined();
        expect(err403.ErrorCachingMinTTL).toBeLessThanOrEqual(10);

        expect(err404).toBeDefined();
        expect(err404.ErrorCachingMinTTL).toBeLessThanOrEqual(10);
      }
    });
  });

  describe('CloudFormation Outputs', () => {
    it('exports FrontendBucketName', () => {
      template.hasOutput('FrontendBucketName', {});
    });

    it('exports DistributionId', () => {
      template.hasOutput('DistributionId', {});
    });

    it('exports DistributionDomainName', () => {
      template.hasOutput('DistributionDomainName', {});
    });

    it('exports FrontendBaseUrl', () => {
      template.hasOutput('FrontendBaseUrl', {});
    });
  });
});
