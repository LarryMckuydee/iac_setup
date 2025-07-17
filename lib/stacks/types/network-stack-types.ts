import { StackProps } from 'aws-cdk-lib'

export interface NetworkStackProps extends StackProps {
  Vpc: VPC

}

export type VPC = {
  ipAddresses: string,
  maxAzs: number
}

export type RouteTable = {
}


