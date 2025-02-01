import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { Function, Runtime, Code } from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';

export class CdkAssignmentStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Create a pateint Lambda function
    const patientLambda = new Function(this, 'PatientLambda', {
      functionName: 'PatientLambdaFunction',
      runtime: Runtime.NODEJS_LATEST,
      memorySize: 256,
      handler: 'index.handler',
      code: Code.fromAsset('dist/patient'),
    });

    // Create an API Gateway instance
    const api = new apigateway.RestApi(this, 'PatientApi', {
      description: 'This route is for managing the API for the patient',
    })

    // adding main route
    const mainPath = api.root.addResource('patient');
    mainPath.addMethod('GET', new apigateway.LambdaIntegration(patientLambda));
  }
}
