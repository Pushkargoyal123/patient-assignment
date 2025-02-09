// external dependencies
import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as opensearch from "aws-cdk-lib/aws-opensearchservice";
import * as iam from "aws-cdk-lib/aws-iam";
import * as eventSources from "aws-cdk-lib/aws-lambda-event-sources";
import { Code, LayerVersion, Runtime, StartingPosition } from "aws-cdk-lib/aws-lambda";

// local dependencies
import { createTable } from "../util/database.util";
import { addMethodToApiGateway, createLambda } from "../util/lambda.util";
import { createCognitoPool } from "../util/cognito.util";
import { API_GATEWAY_METHODS } from "../constant";

export class CdkAssignmentStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // OpenSearch Domain
    const domain = new opensearch.CfnDomain(this, "MyOpenSearchDomain", {
      domainName: "patient-search", // Change if needed
      engineVersion: "OpenSearch_2.11", // Latest version

      clusterConfig: {
        instanceType: "t3.small.search", // Free Tier eligible
        instanceCount: 1, // Keep it to 1 node (Free Tier)
      },

      ebsOptions: {
        ebsEnabled: true,
        volumeSize: 10, // Free Tier allows up to 10GB
        volumeType: "gp2",
      },

      nodeToNodeEncryptionOptions: { enabled: true },
      encryptionAtRestOptions: { enabled: true },

      accessPolicies: {
        Version: "2012-10-17",
        Statement: [
          {
            Effect: "Allow",
            Principal: { AWS: `arn:aws:iam::${cdk.Stack.of(this).account}:root` }, // Allow only your AWS account
            Action: "es:*",
            Resource: `arn:aws:es:${cdk.Stack.of(this).region}:${cdk.Stack.of(this).account}:domain/patient-search/*`,
          },
        ],
      },
    });

    // Output the OpenSearch Domain Endpoint
    new cdk.CfnOutput(this, "OpenSearchDomainEndpoint", {
      value: domain.attrDomainEndpoint,
      description: "OpenSearch Domain Endpoint",
    });

    const lambdaRole = new iam.Role(this, "LambdaExecutionRole", {
      assumedBy: new iam.ServicePrincipal("lambda.amazonaws.com"),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName("service-role/AWSLambdaBasicExecutionRole"),
        iam.ManagedPolicy.fromAwsManagedPolicyName("AmazonDynamoDBFullAccess"),
        iam.ManagedPolicy.fromAwsManagedPolicyName("AmazonOpenSearchServiceFullAccess"),
      ],
    });

    // Create DynamoDB table
    const patientTable = createTable(this, "PatientTable", "id");

    const layer = new LayerVersion(this, "packageLayer", {
      code: Code.fromAsset("src/layers"),
      compatibleRuntimes: [Runtime.NODEJS_LATEST],
    });

    // create cognito user pool
    const authorizer = createCognitoPool(this);

    // Create a pateint Lambda function and its API Gateway end point
    const patientLambda = createLambda(
      this,
      "PatientLambda",
      "patient",
      {
        PATIENT_TABLE: patientTable.tableName,
        OPENSEARCH_ENDPOINT: `https://${domain.attrDomainEndpoint}`,
      },
      [layer],
      lambdaRole,
      authorizer,
    );

    // Attach DynamoDB Stream to Lambda
    patientLambda.lambdaFunction.addEventSource(
      new eventSources.DynamoEventSource(patientTable, {
        startingPosition: StartingPosition.LATEST, // Only sync new changes
      }),
    );

    patientLambda.lambdaFunction.addToRolePolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: ["es:ESHttpPost", "es:ESHttpPut", "es:ESHttpGet"],
        resources: [`arn:aws:es:${this.region}:${this.account}:domain/patient-search/*`],
      }),
    );

    // granting permission to the lambda function to access the table
    patientTable.grantReadWriteData(patientLambda.lambdaFunction);
    patientTable.grantStreamRead(patientLambda.lambdaFunction);

    // add method to the api gateway
    addMethodToApiGateway(
      patientLambda.apiRoute,
      [
        API_GATEWAY_METHODS.GET,
        API_GATEWAY_METHODS.POST,
        API_GATEWAY_METHODS.PUT,
        API_GATEWAY_METHODS.DELETE,
      ],
      patientLambda.lambdaFunction,
      authorizer,
    );
  }
}
