import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { BlockPublicAccess, Bucket } from 'aws-cdk-lib/aws-s3';
import { Distribution, CfnOriginAccessControl, CfnDistribution } from 'aws-cdk-lib/aws-cloudfront';
import { S3Origin } from 'aws-cdk-lib/aws-cloudfront-origins';
// import * as sqs from 'aws-cdk-lib/aws-sqs';

export class CdnStack extends cdk.Stack {
  public readonly s3: Bucket
  public readonly cloudfront: Distribution | CfnDistribution

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
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
          viewerProtocolPolicy: 'allow-all'
        },
        origins: [
          {
            id: this.s3.bucketArn,
            domainName: this.s3.bucketDomainName,
            s3OriginConfig: {},
            originAccessControlId: oac.attrId
          }
        ]
      }
    })
  }
}
