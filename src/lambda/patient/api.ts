// external dependencies
import { APIGatewayEvent } from "aws-lambda";
import { v4 as uuidv4 } from 'uuid';
import { ExpressionAttributeValueMap, QueryOutput, ScanOutput, UpdateItemOutput } from "aws-sdk/clients/dynamodb";

// internal dependencies
import { CreatePatient, UpdatePatient } from "./validateModels/patient";
import { validatePayload } from "./utils/validator";
import { PatientData } from "./models/patient.model";
import { create, query, scanTable, update } from "./utils/databaseOperation";
import { convertToExpressionAttributeNames, getDate } from "./utils/common";

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
 */
export const insertPatient = async (event: APIGatewayEvent) => {
    const payload = event.body; // payload of the API
    await validatePayload(JSON.parse(payload as string), CreatePatient); // validating the payload
    const id = uuidv4();
    const item: PatientData = {
        id: uuidv4(),
        ...JSON.parse(payload as string),
        isDeleted: false,   
        createdAt: getDate(),
        updatedAt: getDate()
    }
    // inserting the patient record in the database
    const response = await create(item, process.env.PATIENT_TABLE as string);
    return response;
}

export const getAllPatients = async () => {
    const fieldsToReturn = 'id, name, address, conditions, allergies, createdAt, updatedAt';
    const { expressionAttributeNames, finalFieldsToReturn} = convertToExpressionAttributeNames(fieldsToReturn);
    const response: ScanOutput = await scanTable(process.env.PATIENT_TABLE as string, 'isDeleted = :isDeleted', { ':isDeleted': false } as unknown as ExpressionAttributeValueMap, expressionAttributeNames, finalFieldsToReturn);
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
        throw new Error(JSON.stringify({ statusCode: 404, error: 'Patient not found with id ' + patientId }));
    }
    return response.Items[0];
}

export const updatePatient = async (event: APIGatewayEvent) => {
    const patientId = event.pathParameters?.id;
    const payload = JSON.parse(event.body as string);
    // validating the payload
    await validatePayload(payload, UpdatePatient);
    // fetching the existing patient details
    await getPatientById(event) as unknown as PatientData;
    
    // updating the project updated date
    payload.updatedAt = getDate();
    const response: UpdateItemOutput = await update(process.env.PATIENT_TABLE as string, {id: patientId}, payload);
    return response.Attributes;
}

export const deletePatient = async (event: APIGatewayEvent) => {
    const patientId = event.pathParameters?.id;
    // fetching the existing project details
    await getPatientById(event) as unknown as PatientData;
    
    // updating the project updated date
    const updatedData = {
        isDeleted: true,
        updatedAt: getDate()
    }
    await update(process.env.PATIENT_TABLE as string, {id: patientId}, updatedData);
    return {message: 'Patient deleted successfully'};
}