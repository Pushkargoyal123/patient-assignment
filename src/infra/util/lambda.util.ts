// external dependencies
import { Function, Runtime, Code, FunctionProps, LayerVersion } from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import { Construct } from 'constructs';

// internal dependencies
import { API_GATEWAY_METHODS } from '../constant';

/**
 * Creates an AWS Lambda function and an associated API Gateway route.
 *
 * @param {Construct} scope - The scope in which to define this construct.
 * @param {string} name - The name of the Lambda function.
 * @param {string} folderName - The name of the folder containing the Lambda function code.
 * @param {{ [key: string]: string }} environment - The environment variables for the Lambda function.
 * @param {LayerVersion[]} layerArray - An array of Lambda Layer versions to include in the function.
 * @returns {{ lambdaFunction: Function, apiRoute: apigateway.IResource }} An object containing the created Lambda function and the main API Gateway route.
 */
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

    idResource.addMethod(API_GATEWAY_METHODS.GET, new apigateway.LambdaIntegration(lambdaFunction));
    idResource.addMethod(API_GATEWAY_METHODS.PUT, new apigateway.LambdaIntegration(lambdaFunction));
    idResource.addMethod(API_GATEWAY_METHODS.DELETE, new apigateway.LambdaIntegration(lambdaFunction));

    return { lambdaFunction, apiRoute: mainPath };
}

/**
 * Adds specified HTTP methods to an API Gateway resource with a Lambda integration and Cognito authorizer.
 *
 * @param apiRoute - The API Gateway resource to which the methods will be added.
 * @param methodNames - An array of HTTP method names (e.g., 'GET', 'POST') to be added to the API Gateway resource.
 * @param lambdaFunction - The Lambda function to be integrated with the API Gateway methods.
 * @param authorizer - The Cognito authorizer to be used for the API Gateway methods.
 */
export function addMethodToApiGateway(apiRoute: apigateway.IResource, methodNames: string[], lambdaFunction: Function, authorizer: apigateway.IAuthorizer) {
    methodNames.forEach(method => {
        apiRoute.addMethod(method, new apigateway.LambdaIntegration(lambdaFunction), {
            authorizationType: apigateway.AuthorizationType.COGNITO,
            authorizer,
        });
    });
}