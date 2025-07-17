import { StackProps } from "aws-cdk-lib"
import { Vpc, ISubnet } from "aws-cdk-lib/aws-ec2"

export interface ComputeStackProps extends StackProps {
  vpc: Vpc,
  subnet: ISubnet
}
