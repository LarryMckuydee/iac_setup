import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { BlockPublicAccess, Bucket } from 'aws-cdk-lib/aws-s3';
import { Distribution, CfnOriginAccessControl, CfnDistribution, CachePolicy, OriginRequestPolicy } from 'aws-cdk-lib/aws-cloudfront';
import { S3Origin } from 'aws-cdk-lib/aws-cloudfront-origins';
import { CdnStackProps } from './types';
import { Effect, PolicyStatement, ServicePrincipal } from 'aws-cdk-lib/aws-iam';
// import * as sqs from 'aws-cdk-lib/aws-sqs';

export class CdnStack extends cdk.Stack {
  public readonly s3: Bucket
  public readonly cloudfront: Distribution | CfnDistribution

  constructor(scope: Construct, id: string, props?: CdnStackProps) {
    super(scope, id, props);

    // The code that defines your stack goes here

    // example resource
    // const queue = new sqs.Queue(this, 'MbbQuestion1Queue', {
    //   visibilityTimeout: cdk.Duration.seconds(300)
    // });

    // Create S3 Bucket or OAC
    this.s3 = new Bucket(this, `${id}_S3_Bucket`, {
      blockPublicAccess: BlockPublicAccess.BLOCK_ALL
    })

    // Create OAC
    // refer: https://docs.aws.amazon.com/AWSCloudFormation/latest/TemplateReference/aws-properties-cloudfront-originaccesscontrol-originaccesscontrolconfig.html#cfn-cloudfront-originaccesscontrol-originaccesscontrolconfig-originaccesscontrolorigintype
    const oacConfig: CfnOriginAccessControl.OriginAccessControlConfigProperty = {
      name: `${id}_OAC_Config_Props`,
      originAccessControlOriginType: "s3",
      signingBehavior: "always",
      signingProtocol: "sigv4"
    }
    const oac = new CfnOriginAccessControl(this, `${id}_OAC`, {
      originAccessControlConfig: oacConfig
    })

    // Create Cloudfront
    //this.cloudfront = new Distribution(this, `${id}_Cloudfront_Distribution`, {
    //  defaultBehavior: {
    //    origin: new S3Origin(this.s3),

    //  }
    //})
    
    this.cloudfront = new CfnDistribution(this, `${id}_Cloudfront_Distribution`, {
      distributionConfig: {
        enabled: true,
        defaultCacheBehavior: {
          targetOriginId: this.s3.bucketArn,
          viewerProtocolPolicy: 'allow-all',
          allowedMethods: ['GET', 'HEAD'],
          cachePolicyId: CachePolicy.CACHING_OPTIMIZED.cachePolicyId
        },
        cacheBehaviors: [
          {
            pathPattern: "/api/*",
            targetOriginId: "nlborigin",
            viewerProtocolPolicy: "allow-all",
            allowedMethods: ["GET", "HEAD", "OPTIONS", "PUT", "POST", "PATCH", "DELETE"],
            cachePolicyId: CachePolicy.CACHING_DISABLED.cachePolicyId,
            originRequestPolicyId: OriginRequestPolicy.ALL_VIEWER.originRequestPolicyId
          }
        ],
        origins: [
          {
            id: this.s3.bucketArn,
            domainName: this.s3.bucketDomainName,
            s3OriginConfig: {},
            originAccessControlId: oac.attrId
          },
          {
            id: "nlborigin",
            domainName: props?.nlb.loadBalancerDnsName!,
            customOriginConfig: {
              originProtocolPolicy: 'http-only',
              httpPort: 80
            }
          }
        ]
      }
    })

    this.s3.addToResourcePolicy(new PolicyStatement({
      effect: Effect.ALLOW,
      principals: [
        new ServicePrincipal('cloudfront.amazonaws.com')
      ],
      actions: ['s3:GetObject'],
      resources: [
        `${this.s3.bucketArn}/*`
      ],
      conditions: {
        StringEquals: {
          'AWS:SourceArn': `arn:aws:cloudfront::${cdk.Stack.of(this).account}:distribution/${this.cloudfront.ref}`
        }
      }
    }))
  }
}
