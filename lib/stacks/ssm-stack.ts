import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { SsmProps } from './types';
import { Instance, InstanceClass, InstanceSize, InstanceType, MachineImage, SecurityGroup, SubnetType, Vpc } from 'aws-cdk-lib/aws-ec2';
import { ManagedPolicy, Policy, Role, ServicePrincipal } from 'aws-cdk-lib/aws-iam';
// import * as sqs from 'aws-cdk-lib/aws-sqs';

export class SsmStack extends cdk.Stack {
  public readonly role:Role
  public readonly vpc:Vpc
  public readonly ssmInstance:Instance

  constructor(scope: Construct, id: string, props?: SsmProps) {
    super(scope, id, props);

    // The code that defines your stack goes here

    // example resource
    // const queue = new sqs.Queue(this, 'MbbQuestion1Queue', {
    //   visibilityTimeout: cdk.Duration.seconds(300)
    // });

    //refer: https://docs.aws.amazon.com/systems-manager/latest/userguide/manually-install-ssm-agent-linux.html

    // Create Role
    this.role = new Role(this, `${id}_SSM_Agent_Role`, {
      assumedBy: new ServicePrincipal("ec2.amazonaws.com")
    })

    // Create Policy
    this.role.addManagedPolicy(ManagedPolicy.fromAwsManagedPolicyName("AmazonSSMManagedInstanceCore"))

    // Create EC2
    const vpc = props?.vpc!
    const ec2InstaceType = InstanceType.of(InstanceClass.BURSTABLE3, InstanceSize.MICRO)
    const subnet = props?.subnet!
    this.ssmInstance = new Instance(this, `${id}_SSM_Instance`, {
      vpc,
      instanceType: ec2InstaceType,
      machineImage: MachineImage.latestAmazonLinux2023(),
      role: this.role,
      vpcSubnets: {
        subnets: [
          subnet
        ]
      }
    })
  }
}
