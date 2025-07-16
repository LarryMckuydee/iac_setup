import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { DatabaseInstance, DatabaseInstanceEngine, MariaDbEngineVersion, DatabaseInstanceReadReplica } from 'aws-cdk-lib/aws-rds';
import { InstanceClass, InstanceSize, InstanceType, SubnetType, Vpc } from 'aws-cdk-lib/aws-ec2';
import { DatabaseStackProps } from './types';
// import * as sqs from 'aws-cdk-lib/aws-sqs';

export class DatabaseStack extends cdk.Stack {
  public readonly vpc: Vpc
  public readonly master: DatabaseInstance
  public readonly replica: DatabaseInstanceReadReplica
  constructor(scope: Construct, id: string, props?: DatabaseStackProps) {
    super(scope, id, props);

    // The code that defines your stack goes here

    // example resource
    // const queue = new sqs.Queue(this, 'MbbQuestion1Queue', {
    //   visibilityTimeout: cdk.Duration.seconds(300)
    // });
    
    this.vpc = props?.vpc!
    const subnets = this.vpc.selectSubnets({
      subnetType: SubnetType.PRIVATE_WITH_EGRESS
    }).subnets

    const instanceType = InstanceType.of(InstanceClass.BURSTABLE3, InstanceSize.LARGE)

    this.master = new DatabaseInstance(this, `${id}_Master_Database`, {
      engine: DatabaseInstanceEngine.mariaDb({
        version: MariaDbEngineVersion.VER_10_11
      }),
      instanceType,
      vpc: this.vpc,
      vpcSubnets: {
        subnets: []
      }
    })

    this.replica = new DatabaseInstanceReadReplica(this, `${id}_Replica_Database`, {
      sourceDatabaseInstance: this.master,
      vpc: this.vpc,
      instanceType,
      vpcSubnets: {
        subnets: []
      }
    })
  }
}
