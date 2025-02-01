import * as iam from 'aws-cdk-lib/aws-iam';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import { AWS_REGION } from '../constant';

export function createCognitoPool(scope: Construct): cdk.aws_apigateway.CognitoUserPoolsAuthorizer {
  // Create a Cognito User Pool
  const userPool = new cognito.UserPool(scope, 'MyUserPool', {
    userPoolName: 'my-user-pool',
    selfSignUpEnabled: true,   // Allow users to sign up
    signInAliases: {
      username: true,          // Allow sign in with username
      email: true,             // Allow sign in with email
    },
    autoVerify: {
      email: true,             // Automatically verify email addresses
    },
  });

  // Create a User Pool Client
  const userPoolClient = new cognito.UserPoolClient(scope, 'UserPoolClient', {
    userPool,
    generateSecret: true, // False if used in frontend apps
  });

  // Step 5: Create Cognito Authorizer for API Gateway
  const authorizer = new apigateway.CognitoUserPoolsAuthorizer(scope, 'CognitoAuthorizer', {
    cognitoUserPools: [userPool],
  });

  // Output the User Pool ID and Client ID
  new cdk.CfnOutput(scope, 'UserPoolId', {
    value: userPool.userPoolId,
  });

  new cdk.CfnOutput(scope, 'UserPoolClientId', {
    value: userPoolClient.userPoolClientId,
  });

  // Set up a Cognito domain
  const cognitoDomain = userPool.addDomain('MyCognitoDomain', {
    cognitoDomain: {
      domainPrefix: 'myapp-patient',
    },
  });

  new cdk.CfnOutput(scope, 'CognitoDomainURL', {
    value: `https://${cognitoDomain.domainName}.auth.${AWS_REGION}.amazoncognito.com`,
    description: 'Cognito Hosted UI Domain',
  });

  const cognitoPolicy = new iam.PolicyStatement({
    actions: ['cognito-idp:AdminInitiateAuth', 'cognito-idp:AdminRespondToAuthChallenge'],
    resources: [userPool.userPoolArn],
  });

  const lambdaRole = new iam.Role(scope, 'MyLambdaRole', {
    assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
  });

  lambdaRole.addToPolicy(cognitoPolicy);

  return authorizer;
}