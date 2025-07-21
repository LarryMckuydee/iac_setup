import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { Vpc, IpAddresses, SubnetType, SecurityGroup, InterfaceVpcEndpointAwsService } from 'aws-cdk-lib/aws-ec2'
import { NetworkStackProps } from './types';
// import * as sqs from 'aws-cdk-lib/aws-sqs';

export class NetworkStack extends cdk.Stack {
  public readonly vpc:Vpc
  constructor(scope: Construct, id: string, props?: NetworkStackProps) {
    super(scope, id, props);

    // The code that defines your stack goes here

    // example resource
    // const queue = new sqs.Queue(this, 'MbbQuestion1Queue', {
    //   visibilityTimeout: cdk.Duration.seconds(300)
    // });

    this.vpc = new Vpc(this, `${id}_VPC`, {
      ipAddresses: IpAddresses.cidr(props?.Vpc.ipAddresses!),
      //cidr: '192.168.0.0/16',
      //maxAzs: 2,
      maxAzs: props?.Vpc.maxAzs!,
      //natGateways: 1,
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

    // SSM Endpoint
    // refer: https://000058.awsstudygroup.com/3-accessibilitytoinstances/3.2-private-instance/
    // refer: https://docs.aws.amazon.com/cdk/api/v2/docs/aws-cdk-lib.aws_ec2.InterfaceVpcEndpointAwsService.html
    // refer: https://docs.aws.amazon.com/cdk/api/v2/docs/aws-cdk-lib.aws_ec2.InterfaceVpcEndpointService.html
    // refer: https://docs.aws.amazon.com/cdk/api/v2/docs/aws-cdk-lib.aws_ec2.InterfaceVpcEndpointOptions.html
    const sg = new SecurityGroup(this, `${id}_SSM_Endpoint_SG`, {
      vpc: this.vpc,
      allowAllOutbound: true
    })
    this.vpc.addInterfaceEndpoint(`${id}_SSM_Endpoint`, {
      service: InterfaceVpcEndpointAwsService.SSM,
      privateDnsEnabled: true,
      securityGroups: [sg]
    })
    this.vpc.addInterfaceEndpoint(`${id}_SSM_MESSAGES_Endpoint`, {
      service: InterfaceVpcEndpointAwsService.SSM_MESSAGES,
      privateDnsEnabled: true,
      securityGroups: [sg]
    })
    this.vpc.addInterfaceEndpoint(`${id}_EC2_MESSAGES_Endpoint`, {
      service: InterfaceVpcEndpointAwsService.EC2_MESSAGES,
      privateDnsEnabled: true,
      securityGroups: [sg]
    })

  }
}
