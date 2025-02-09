import { APIGatewayEvent } from "aws-lambda";
import { API_END_POINTS, API_GATEWAY_METHODS } from "../../lambda/patient/constant";

export const event: APIGatewayEvent = {
    httpMethod: API_GATEWAY_METHODS.GET,
    resource: API_END_POINTS.GET_ALL_PATIENT,
    body: null,
    headers: {},
    multiValueHeaders: {},
    queryStringParameters: null,
    multiValueQueryStringParameters: null,
    pathParameters: null,
    stageVariables: null,
    path: '',
    isBase64Encoded: false,
    requestContext: {
        accountId: '',
        apiId: '',
        authorizer: null,
        protocol: '',
        httpMethod: '',
        identity: {
            accessKey: null,
            accountId: null,
            apiKey: null,
            apiKeyId: null,
            caller: null,
            clientCert: null,
            cognitoAuthenticationProvider: null,
            cognitoAuthenticationType: null,
            cognitoIdentityId: null,
            cognitoIdentityPoolId: null,
            principalOrgId: null,
            sourceIp: '',
            user: null,
            userAgent: null,
            userArn: null
        },
        path: '',
        stage: '',
        requestId: '',
        requestTimeEpoch: 0,
        resourceId: '',
        resourcePath: ''
    }
};