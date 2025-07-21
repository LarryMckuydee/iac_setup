import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { DatabaseInstance, DatabaseInstanceEngine, MariaDbEngineVersion, DatabaseInstanceReadReplica } from 'aws-cdk-lib/aws-rds';
import { InstanceClass, InstanceSize, InstanceType, ISubnet, Port, SecurityGroup, SubnetType, Vpc } from 'aws-cdk-lib/aws-ec2';
import { DatabaseStackProps } from './types';
// import * as sqs from 'aws-cdk-lib/aws-sqs';

export class DatabaseStack extends cdk.Stack {
  public readonly vpc: Vpc
  public readonly master: DatabaseInstance
  public readonly replica: DatabaseInstanceReadReplica
  public readonly sg: SecurityGroup
  constructor(scope: Construct, id: string, props?: DatabaseStackProps) {
    super(scope, id, props);

    // The code that defines your stack goes here

    // example resource
    // const queue = new sqs.Queue(this, 'MbbQuestion1Queue', {
    //   visibilityTimeout: cdk.Duration.seconds(300)
    // });
    
    this.vpc = props?.vpc!

    this.sg = new SecurityGroup(this, `${id}_DB_SG`, {
      vpc: this.vpc
    })
    this.sg.addIngressRule(props?.ec2Sg!, Port.tcp(3306))

    const instanceType = InstanceType.of(InstanceClass.BURSTABLE3, InstanceSize.MEDIUM)

    this.master = new DatabaseInstance(this, `${id}_Master_Database`, {
      engine: DatabaseInstanceEngine.mariaDb({
        version: MariaDbEngineVersion.VER_10_11
      }),
      instanceType,
      vpc: this.vpc,
      vpcSubnets: {
        subnets: [props?.masterSubnet!, props?.replicaSubnet!]
      },
      securityGroups: [
        this.sg
      ]
    })

    this.replica = new DatabaseInstanceReadReplica(this, `${id}_Replica_Database`, {
      sourceDatabaseInstance: this.master,
      vpc: this.vpc,
      instanceType,
      vpcSubnets: {
        subnets: [props?.replicaSubnet!, props?.masterSubnet!]
      }
    })
  }
}
