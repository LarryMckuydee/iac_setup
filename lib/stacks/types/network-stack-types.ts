import { StackProps } from 'aws-cdk-lib'

export interface NetworkStackProps extends StackProps {

}

export type VPC = {
  ipAddresses: string
}

export type RouteTable = {
}


