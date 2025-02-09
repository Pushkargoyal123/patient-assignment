// external dependencies
import { ExpressionAttributeNameMap } from "aws-sdk/clients/dynamodb";

// internal dependencies
import { ResponseModel } from "../models/reponse.model";

/**
 * Responds with a success message.
 *
 * @param body - The body of the response.
 * @returns An object conforming to the ResponseModel interface, containing a status code of 200,
 *          headers with content type 'application/json', and the body serialized as a JSON string.
 */
export function respondWithSucess(body: object): ResponseModel {
  return {
    statusCode: 200, // status code 200
    headers: { contentType: "application/json" }, // content type
    body: JSON.stringify({ data: body }), // body of the response
  };
}

/**
 * Generates a response object with an error message.
 *
 * @param {number} statusCode - The HTTP status code to return.
 * @param {string} message - The error message to include in the response body.
 * @returns {ResponseModel} The response object containing the status code and error message.
 */
export function respondWithError(statusCode: number, message: string): ResponseModel {
  return {
    statusCode: statusCode,
    body: JSON.stringify({ error: message }),
  };
}

/**
 * Converts a comma-separated string of field names into an object containing
 * DynamoDB expression attribute names and a formatted string of these fields.
 *
 * @param fieldsToReturn - A comma-separated string of field names to be converted.
 * @returns An object containing:
 * - `expressionAttributeNames`: A map of DynamoDB expression attribute names.
 * - `finalFieldsToReturn`: A formatted string of the field names prefixed with `#`.
 */
export function convertToExpressionAttributeNames(fieldsToReturn: string): {
  expressionAttributeNames: ExpressionAttributeNameMap;
  finalFieldsToReturn: string;
} {
  const fields = fieldsToReturn.split(",");
  const expressionAttributeNames: ExpressionAttributeNameMap = {};
  fields.forEach((field) => {
    expressionAttributeNames[`#${field.trim()}`] = field.trim();
  });
  const finalFieldsToReturn = fields.map((field) => `#${field.trim()}`).join(", ");
  return { expressionAttributeNames, finalFieldsToReturn };
}

/**
 * Returns the current date as a string in 'en-GB' locale format.
 *
 * @returns {string} The current date in 'en-GB' locale format (dd/mm/yyyy).
 */
export const getDate = (): string => {
  return new Date().toLocaleDateString("en-GB");
};
