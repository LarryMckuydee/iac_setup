# Welcome to your CDK TypeScript project

This is a blank project for CDK development with TypeScript.

The `cdk.json` file tells the CDK Toolkit how to execute your app.

## Useful commands

* `npm run build`   compile typescript to js
* `npm run watch`   watch for changes and compile
* `npm run test`    perform the jest unit tests
* `npx cdk deploy`  deploy this stack to your default AWS account/region
* `npx cdk diff`    compare deployed stack with current state
* `npx cdk synth`   emits the synthesized CloudFormation template

## Sample SSM Port Forward Command
```
aws ssm start-session --target <instance-id> --document-name AWS-StartPortForwardingSessionToRemoteHost --parameters '{"host": ["databasestack-databasestackmasterdatabase5d3-4tyoxdfx71jc.cneow02o6yyx.ap-southeast-1.rds.amazonaws.com"], "portNumber":["3306"],"localPortNumber":["3306"]}'
```
MariaDB: 3306
localPortNumber: 3306


## CDK Command
```
cdk diff -c config=dev
cdk deploy -c config=dev
```

To deploy
```
cdk bootstrap -c config=dev
cdk deploy -c config=dev --all
```
