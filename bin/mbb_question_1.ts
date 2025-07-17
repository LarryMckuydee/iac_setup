#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { MbbQuestion1Stack } from '../lib/mbb_question_1-stack';
import { NetworkStack } from '../lib/stacks/network-stack';
import { DatabaseStack } from '../lib/stacks/database-stack';
import { ComputeStack } from '../lib/stacks/compute-stack';
import { CdnStack } from '../lib/stacks/cdn-stack';
import { ConfigProps } from '../lib/types'
import * as yaml from 'yaml'
import * as fs from 'fs'
import { SubnetType } from 'aws-cdk-lib/aws-ec2';
import { SsmStack } from '../lib/stacks/ssm-stack';



const app = new cdk.App();

function getConfig() {
  let env = app.node.tryGetContext('config')
  
  if (!env)
    throw new Error("Context variable missing on CDK command. Pass in as '-c config=XXX'")

  const configFile = fs.readFileSync(`./config/${env}.yaml`, "utf8")
  
  const readConfig = yaml.parse(configFile)

  return readConfig
}

const config = getConfig()

const networkStack = new NetworkStack(app, "MbbNetworkStack", {
  env: config.env,
  description: config.description,
  Vpc: config.Vpc
})

const subnets = networkStack.vpc.selectSubnets({
  subnetType: SubnetType.PRIVATE_WITH_EGRESS
}).subnets

const masterPrivateSubnet = subnets[0]
const replicaPrivateSubnet = subnets[1] 

const computeStack = new ComputeStack(app, "MbbComputeStack", {
  env: config.env,
  description: config.description,
  vpc: networkStack.vpc,
  subnet: masterPrivateSubnet
})

const dbStack = new DatabaseStack(app, "MbbDatabaseStack", {
  env: config.env,
  description: config.description,
  vpc: networkStack.vpc,
  masterSubnet: masterPrivateSubnet,
  replicaSubnet: replicaPrivateSubnet,
  ec2Sg: computeStack.sg
})

const cdnStack = new CdnStack(app, "MbbCdnStack", {
  env: config.env,
  description: config.description,
  nlb: computeStack.lb
})

const publicSubnets = networkStack.vpc.selectSubnets({
  subnetType: SubnetType.PUBLIC
}).subnets

const replicaAzPublicSubnet = publicSubnets.find( s => s.availabilityZone == replicaPrivateSubnet.availabilityZone)

const ssmStack = new SsmStack(app, "MbbSsmStack", {
  env: config.env,
  description: config.description,
  vpc: networkStack.vpc,
  subnet: replicaAzPublicSubnet!
})

//new MbbQuestion1Stack(app, 'MbbQuestion1Stack', {
//  /* If you don't specify 'env', this stack will be environment-agnostic.
//   * Account/Region-dependent features and context lookups will not work,
//   * but a single synthesized template can be deployed anywhere. */
//
//  /* Uncomment the next line to specialize this stack for the AWS Account
//   * and Region that are implied by the current CLI configuration. */
//  // env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: process.env.CDK_DEFAULT_REGION },
//
//  /* Uncomment the next line if you know exactly what Account and Region you
//   * want to deploy the stack to. */
//  // env: { account: '123456789012', region: 'us-east-1' },
//
//  /* For more information, see https://docs.aws.amazon.com/cdk/latest/guide/environments.html */
//
//});
