// external dependencies
import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';

// local dependencies
import { createTable } from '../util/database.util';
import { createLambda } from '../util/lambda.util';
import { createCognitoPool } from '../util/cognito.util';
import { API_GATEWAY_METHODS } from '../constant';
import { Code, LayerVersion, Runtime } from 'aws-cdk-lib/aws-lambda';

export class CdkAssignmentStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Create DynamoDB table
    const patientTable = createTable(this, 'PatientTable', 'id');

    const layer = new LayerVersion(this, 'packageLayer', {
      code: Code.fromAsset('src/layers'),
      compatibleRuntimes: [Runtime.NODEJS_LATEST],
    });

    // Create a pateint Lambda function and its API Gateway end point
    const patientLambda = createLambda(this, 'PatientLambda', 'patient', {
      PATIENT_TABLE: patientTable.tableName
    }, [layer]);

    // granting permission to the lambda function to access the table
    patientTable.grantReadWriteData(patientLambda.lambdaFunction);

    // create cognito user pool
    const authorizer = createCognitoPool(this);

    // add method to the api gateway
    patientLambda.apiRoute.addMethod(API_GATEWAY_METHODS.GET, new apigateway.LambdaIntegration(patientLambda.lambdaFunction), {
      authorizationType: apigateway.AuthorizationType.COGNITO,
      authorizer,
    });
  }
}
