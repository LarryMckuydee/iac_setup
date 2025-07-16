import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { Vpc, IpAddresses, SubnetType } from 'aws-cdk-lib/aws-ec2'
import { NetworkStackProps } from './types';
// import * as sqs from 'aws-cdk-lib/aws-sqs';

export class NetworkStack extends cdk.Stack {
  public readonly vpc:Vpc
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // The code that defines your stack goes here

    // example resource
    // const queue = new sqs.Queue(this, 'MbbQuestion1Queue', {
    //   visibilityTimeout: cdk.Duration.seconds(300)
    // });

    this.vpc = new Vpc(this, `${id}_VPC`, {
      //ipAddresses: IpAddresses.cidr('10.0.0.0/16'),
      cidr: '192.168.0.0/16',
      maxAzs: 2,
      natGateways: 1,
      subnetConfiguration: [
        {
          name: "PublicSubnet",
          subnetType: SubnetType.PUBLIC
        },
        {
          name: "PrivateSubnetWithNAT",
          subnetType: SubnetType.PRIVATE_WITH_EGRESS
        },
      ]
    })

  }
}
