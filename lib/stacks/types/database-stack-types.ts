import { StackProps } from "aws-cdk-lib";
import { ISubnet, SecurityGroup, Vpc } from "aws-cdk-lib/aws-ec2";
import { DatabaseInstanceEngine } from "aws-cdk-lib/aws-rds";
import { SubnetSelection } from "aws-cdk-lib/aws-ec2";

export interface DatabaseStackProps extends StackProps {
  vpc: Vpc,
  masterSubnet: ISubnet,
  replicaSubnet: ISubnet,
  ec2Sg: SecurityGroup
}

export type DatabaseConfig = {
  engine: DatabaseInstanceEngine
  subnets: SubnetSelection
}
