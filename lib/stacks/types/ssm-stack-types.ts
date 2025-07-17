import { StackProps } from "aws-cdk-lib";
import { ISubnet, Vpc } from "aws-cdk-lib/aws-ec2";

export interface SsmProps extends StackProps {
  vpc: Vpc
  subnet: ISubnet
}
