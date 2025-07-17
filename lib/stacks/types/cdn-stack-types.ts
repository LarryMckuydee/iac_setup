import { StackProps } from "aws-cdk-lib"
import { NetworkLoadBalancer } from "aws-cdk-lib/aws-elasticloadbalancingv2"

export interface CdnStackProps extends StackProps {
  nlb: NetworkLoadBalancer
}
