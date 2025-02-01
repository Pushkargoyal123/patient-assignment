import { Function, Runtime, Code } from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import { Construct } from 'constructs';

export function createLambda(scope: Construct, name: string, folderName: string, environment: { [key: string]: string }): { lambdaFunction: Function, apiRoute: apigateway.IResource } {
    const lambdaFunction = new Function(scope, name, {
        functionName: `${name}Function`,
        runtime: Runtime.NODEJS_LATEST,
        handler: 'index.handler',
        environment: environment,
        memorySize: 256,
        code: Code.fromAsset(`dist/${folderName}`),
    });

    // Create an API Gateway instance
    const api = new apigateway.RestApi(scope, `${folderName}Api`)
    
    // adding main route
    const mainPath = api.root.addResource(folderName);

    return { lambdaFunction, apiRoute: mainPath };
}