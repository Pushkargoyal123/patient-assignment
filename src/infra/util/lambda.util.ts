import { Function, Runtime, Code, FunctionProps, LayerVersion } from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import { Construct } from 'constructs';

export function createLambda(scope: Construct, name: string, folderName: string, environment: { [key: string]: string }, layerArray: LayerVersion[]): { lambdaFunction: Function, apiRoute: apigateway.IResource } {
    const params: FunctionProps = {
        functionName: `${name}Function`,
        runtime: Runtime.NODEJS_LATEST,
        handler: 'index.handler',
        environment: environment,
        memorySize: 256,
        code: Code.fromAsset(`dist/${folderName}`),
        layers: layerArray
    }
    const lambdaFunction = new Function(scope, name, params);

    // Create an API Gateway instance
    const api = new apigateway.RestApi(scope, `${folderName}Api`)
    
    // adding main route
    const mainPath = api.root.addResource(folderName);
    // adding id path
    const idResource = mainPath.addResource('{id}');

    idResource.addMethod('GET', new apigateway.LambdaIntegration(lambdaFunction));

    return { lambdaFunction, apiRoute: mainPath };
}