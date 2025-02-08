// external dependencies
import { APIGatewayEvent } from "aws-lambda";
import { v4 as uuidv4 } from 'uuid';
import { ExpressionAttributeValueMap, QueryOutput, ScanOutput } from "aws-sdk/clients/dynamodb";

// internal dependencies
import { PatientRecord } from "./validateModels/patient";
import { validatePayload } from "./utils/validator";
import { PatientData } from "./models/patient.model";
import { create, query, scanTable } from "./utils/databaseOperation";

/**
 * Inserts a new patient record into the database.
 *
 * @param {APIGatewayEvent} event - The API Gateway event containing the request data.
 * @returns {Promise<any>} - The response from the database insertion operation.
 *
 * @throws {Error} - Throws an error if payload validation fails or database insertion fails.
 *
 * @example
 * // Example usage:
 * const event = {
 *   body: JSON.stringify({
 *     name: "John Doe",
 *     age: 30,
 *     address: "123 Main St"
 *   })
 * };
 * const response = await insertPatient(event);
 * console.log(response);
 */
export const insertPatient = async (event: APIGatewayEvent) => {
    const payload = event.body; // payload of the API
    await validatePayload(JSON.parse(payload as string), PatientRecord); // validating the payload
    const id = uuidv4();
    const item: PatientData = {
        id: uuidv4(),
        ...JSON.parse(payload as string),
        isDeleted: false,
        createdAt: new Date().toLocaleDateString('en-GB'),
        updatedAt: new Date().toLocaleDateString('en-GB')
    }
    // inserting the patient record in the database
    const response = await create(item, process.env.PATIENT_TABLE as string);
    return response;
}

export const getAllPatients = async () => {
    const fieldsToReturn = 'id, name, address, conditions, allergies, createdAt, updatedAt';
    const response: ScanOutput = await scanTable(process.env.PATIENT_TABLE as string, 'isDeleted = :isDeleted', { ':isDeleted': false } as unknown as ExpressionAttributeValueMap, undefined, fieldsToReturn);
    return response.Items;
}

export const getPatientById = async (event: APIGatewayEvent) => {
    const patientId = event.pathParameters?.id;
    const keyConditionExpression = 'id = :id';
    const filterExpression = 'isDeleted = :isDeleted';
    const expressionAttributeValues = {
        ':id': patientId,
        ':isDeleted': false
    }
    const response: QueryOutput = await query(process.env.PATIENT_TABLE as string, keyConditionExpression, filterExpression, expressionAttributeValues as unknown as ExpressionAttributeValueMap);
    if (!response.Items?.length) {
        throw new Error(JSON.stringify({ statusCode: 404, errors: 'Patient not found with id' + patientId }));
    }
    return response.Items[0];
}