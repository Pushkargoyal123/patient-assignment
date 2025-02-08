// external dependencies
import { ExpressionAttributeNameMap } from "aws-sdk/clients/dynamodb";

// internal dependencies
import { ResponseModel } from "../models/reponse.model";

export function respondWithSucess(body: object): ResponseModel{
    return {
        statusCode: 200, // status code 200
        headers:  {contentType: 'application/json'}, // content type
        body: JSON.stringify({data: body}) // body of the response
    }
}

export function respondWithError(statusCode: number, message: string): ResponseModel{
    return{
        statusCode: statusCode,
        body: JSON.stringify({error: message})
    }
}

export function convertToExpressionAttributeNames(fieldsToReturn: string): { expressionAttributeNames: ExpressionAttributeNameMap, finalFieldsToReturn: string } {
    const fields = fieldsToReturn.split(',');
    const expressionAttributeNames: ExpressionAttributeNameMap = {};
    fields.forEach((field) => {
        expressionAttributeNames[`#${field.trim()}`] = field.trim();
    });
    const finalFieldsToReturn = fields.map((field) => `#${field.trim()}`).join(', ');
    return {expressionAttributeNames, finalFieldsToReturn};
}