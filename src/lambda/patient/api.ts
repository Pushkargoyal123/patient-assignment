// external dependencies
import { APIGatewayEvent, DynamoDBStreamEvent } from "aws-lambda";
import { v4 as uuidv4 } from 'uuid';
import { Client } from '@opensearch-project/opensearch';
import { AwsSigv4Signer } from "@opensearch-project/opensearch/aws";
import { defaultProvider } from "@aws-sdk/credential-provider-node";
import { ExpressionAttributeValueMap, QueryOutput, ScanOutput, UpdateItemOutput } from "aws-sdk/clients/dynamodb";

// internal dependencies
import { CreatePatient, UpdatePatient } from "./validateModels/patient";
import { validatePayload } from "./utils/validator";
import { PatientData } from "./models/patient.model";
import { create, query, scanTable, update } from "./utils/databaseOperation";
import { convertToExpressionAttributeNames, getDate } from "./utils/common";

// open search client
const openSearchClient = new Client({
    ...AwsSigv4Signer({
        region: process.env.AWS_REGION || "us-east-1",
        service: "es",
        getCredentials: () => defaultProvider()(),
    }),
    node: process.env.OPENSEARCH_ENDPOINT || "https://dummy-opensearch-url.com"
});

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

export const getAllPatients = async (event: APIGatewayEvent) => {
    const queryParams = event.queryStringParameters;
    // condition to search the patients based on conditions or allergies in queryParameters
    if (queryParams && (queryParams.condition || queryParams.allergy)) {
        const shouldQuery = [];
        if (queryParams.allergy) {
            shouldQuery.push({ match: { allergies: queryParams.allergy } });
        }
        if (queryParams.condition) {
            shouldQuery.push({ match: { conditions: queryParams.condition } });
        }

        const searchQuery = {
            index: "patients",
            body: {
                query: {
                    bool: {
                        should: shouldQuery,
                        minimum_should_match: 1, // At least one condition must match
                    },
                },
            },
        };
        console.log('search query', searchQuery);
        const result = await openSearchClient.search(searchQuery);
        return result.body.hits.hits.map((hit: any) => hit._source);
    }
    const fieldsToReturn = 'id, name, address, conditions, allergies, createdAt, updatedAt';
    const { expressionAttributeNames, finalFieldsToReturn } = convertToExpressionAttributeNames(fieldsToReturn);
    const response: ScanOutput = await scanTable(process.env.PATIENT_TABLE as string, 'isDeleted = :isDeleted', { ':isDeleted': false } as unknown as ExpressionAttributeValueMap, expressionAttributeNames, finalFieldsToReturn);
    return response.Items;
}

/**
 * Retrieves a patient by their ID from the database.
 *
 * @param {APIGatewayEvent} event - The API Gateway event containing the path parameters.
 * @returns {Promise<any>} - A promise that resolves to the patient data if found.
 * @throws {Error} - Throws an error if the patient is not found.
 *
 * @example
 * // Example usage:
 * const event = {
 *   pathParameters: {
 *     id: '123'
 *   }
 * };
 * const patient = await getPatientById(event);
 */
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
    const response: UpdateItemOutput = await update(process.env.PATIENT_TABLE as string, { id: patientId }, payload);
    return response.Attributes;
}

/**
 * Deletes a patient record by marking it as deleted in the database.
 *
 * @param {APIGatewayEvent} event - The API Gateway event containing the request data.
 * @returns {Promise<{message: string}>} - A promise that resolves to an object containing a success message.
 *
 * @throws {Error} - Throws an error if the patient ID is not found or if there is an issue with the database operation.
 */
export const deletePatient = async (event: APIGatewayEvent) => {
    const patientId = event.pathParameters?.id;
    // fetching the existing project details
    await getPatientById(event) as unknown as PatientData;

    // updating the project updated date
    const updatedData = {
        isDeleted: true,
        updatedAt: getDate()
    }
    await update(process.env.PATIENT_TABLE as string, { id: patientId }, updatedData);
    return { message: 'Patient deleted successfully' };
}

export const syncDynamoDataWithOpenSearch = async (event: DynamoDBStreamEvent) => {
    for (const record of (event).Records) {
        if (record.eventName === 'INSERT' || record.eventName === 'MODIFY') {
            const newItem = record.dynamodb?.NewImage;
            console.log('new item', newItem);
            const patient = {
                id: newItem?.id?.S,
                allergies: newItem?.allergies?.L?.map((item) => item.S) || [],
                conditions: newItem?.conditions?.L?.map((item) => item.S) || [],
            };

            await openSearchClient.index({
                index: 'patients',
                id: patient.id,
                body: patient,
            });
        }
    }
    return { message: 'Data synced successfully' };
}