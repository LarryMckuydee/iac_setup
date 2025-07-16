import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { NetworkLoadBalancer, BaseLoadBalancer, Protocol } from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import { ComputeStackProps } from './types';
import { AutoScalingGroup } from 'aws-cdk-lib/aws-autoscaling';
import { InstanceClass, InstanceSize, InstanceType, MachineImage, Peer, Port, SecurityGroup } from 'aws-cdk-lib/aws-ec2';
import { listeners } from 'process';
// import * as sqs from 'aws-cdk-lib/aws-sqs';

export class ComputeStack extends cdk.Stack {
  public readonly lb: NetworkLoadBalancer
  public readonly asg: AutoScalingGroup

  constructor(scope: Construct, id: string, props?: ComputeStackProps) {
    super(scope, id, props);

    // The code that defines your stack goes here

    // example resource
    // const queue = new sqs.Queue(this, 'MbbQuestion1Queue', {
    //   visibilityTimeout: cdk.Duration.seconds(300)
    // });

    const vpc = props?.vpc!
    // Create NLB
    this.lb = new NetworkLoadBalancer(this, `${id}_NLB`, {
      vpc,
    })

    const ec2InstaceType = InstanceType.of(InstanceClass.BURSTABLE3, InstanceSize.MICRO)

    // Create Security Group
    // only VPC cidr
    const sg = new SecurityGroup(this, `${id}_SG`, {
      vpc
    })
    sg.addIngressRule(Peer.ipv4(vpc.vpcCidrBlock), Port.tcp(433))

    // Create ASG
    this.asg = new AutoScalingGroup(this, `${id}_ASG`, {
      vpc,
      instanceType: ec2InstaceType,
      machineImage: MachineImage.latestAmazonLinux2(),
      securityGroup: sg
    })

    // Configure LoadBalancer to listen to Target group
    const listener = this.lb.addListener(`${id}_NLB_Listener`, {
      port: 443,
      protocol: Protocol.TLS
    })

    listener.addTargets(`${id}_ASG_Target`, {
      port: 443,
      targets: [this.asg]
    })
  }
}
