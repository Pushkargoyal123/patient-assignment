// external dependencies
import * as AWS from 'aws-sdk';
import { ExpressionAttributeNameMap, ExpressionAttributeValueMap, ProjectionExpression, QueryInput, ScanInput } from 'aws-sdk/clients/dynamodb';

// internal dependencies
import { AWS_DEFAULT_REGION, DB_RETURN_VALUES } from '../constant';

/**
 * Creates a new item in the specified DynamoDB table.
 *
 * @param {object} item - The item to be inserted into the table.
 * @param {string} tableName - The name of the DynamoDB table where the item will be inserted.
 * @returns {Promise<object>} - A promise that resolves to the inserted item.
 *
 * @throws {Error} - Throws an error if the DynamoDB operation fails.
 *
 * @example
 * const newItem = { id: '123', name: 'John Doe' };
 * const tableName = 'Patients';
 * const result = await create(newItem, tableName);
 * console.log(result);
 */
export const create = async (item: object, tableName: string): Promise<object> => {
    const docClient = new AWS.DynamoDB.DocumentClient({
        region: AWS_DEFAULT_REGION,
    });
    const params = {
        TableName: tableName,
        Item: item
    };
    console.log('insert record params', params);
    await docClient.put(params).promise();
    return item;
}

/**
 * Queries a DynamoDB table using the provided parameters.
 *
 * @param {string} tableName - The name of the DynamoDB table to query.
 * @param {string} KeyConditionExpression - A condition that specifies the key values for items to be retrieved by the query.
 * @param {ExpressionAttributeNameMap} ExpressionAttributeNames - One or more substitution tokens for attribute names in an expression.
 * @param {ExpressionAttributeValueMap} ExpressionAttributeValues - One or more values that can be substituted in an expression.
 * @returns {Promise<object>} - A promise that resolves to the query response from DynamoDB.
 */
export const query = async (tableName: string, KeyConditionExpression: string, filterExpression: string, ExpressionAttributeValues: ExpressionAttributeValueMap, ExpressionAttributeNames?: ExpressionAttributeNameMap, projectionExpression?: ProjectionExpression, indexName?: string): Promise<object> => {
    const docClient = new AWS.DynamoDB.DocumentClient({
        region: AWS_DEFAULT_REGION,
    });
    const params: QueryInput = {
        TableName: tableName,
        IndexName: indexName,
        KeyConditionExpression: KeyConditionExpression,
        FilterExpression: filterExpression,
        ExpressionAttributeNames: ExpressionAttributeNames,
        ExpressionAttributeValues: ExpressionAttributeValues,
    };
    if(projectionExpression) {
        params.ProjectionExpression = projectionExpression
    }
    console.log('query record params', params);
    const response = await docClient.query(params).promise();
    return response;
}

/**
 * Scans a DynamoDB table with optional filter, attribute values, attribute names, and projection expression.
 *
 * @param {string} tableName - The name of the DynamoDB table to scan.
 * @param {string} [filterExpression] - An optional filter expression to apply to the scan.
 * @param {ExpressionAttributeValueMap} [ExpressionAttributeValues] - An optional map of attribute values to use in the filter expression.
 * @param {ExpressionAttributeNameMap} [ExpressionAttributeNames] - An optional map of attribute names to use in the filter expression.
 * @param {ProjectionExpression} [projectionExpression] - An optional projection expression to specify the attributes to be returned.
 * @returns {Promise<object>} - A promise that resolves to the scan result.
 */
export const scanTable = async (tableName: string, filterExpression?: string, ExpressionAttributeValues?: ExpressionAttributeValueMap, ExpressionAttributeNames?: ExpressionAttributeNameMap, projectionExpression?: ProjectionExpression): Promise<object> => {
    const docClient = new AWS.DynamoDB.DocumentClient({
        region: AWS_DEFAULT_REGION,
    });
    const params:ScanInput = {
        TableName: tableName,
        FilterExpression: filterExpression,
        ExpressionAttributeValues: ExpressionAttributeValues,
        ExpressionAttributeNames: ExpressionAttributeNames,
    };
    if(projectionExpression) {
        params.ProjectionExpression = projectionExpression
    }
    console.log('scan record params', params);
    return await docClient.scan(params).promise();
}

/**
 * Updates an item in a DynamoDB table.
 *
 * @param {string} tableName - The name of the DynamoDB table.
 * @param {object} key - The primary key of the item to update.
 * @param {Record<string, any>} data - An object containing the attributes to update and their new values.
 * @returns {Promise<object>} - A promise that resolves to the updated item.
 *
 * @example
 * const tableName = 'Patients';
 * const key = { patientId: '12345' };
 * const data = { age: 30, address: '123 Main St' };
 * const updatedItem = await update(tableName, key, data);
 * console.log(updatedItem);
 */
export const update = async (tableName: string, key: object, data: Record<string, any>): Promise<object> => {
    const docClient = new AWS.DynamoDB.DocumentClient({
        region: AWS_DEFAULT_REGION,
    });

    let updateExpression = 'SET ';
    const expressionAttributeNames: { [key: string]: string } = {};
    const expressionAttributeValues: { [key: string]: any } = {};
    for (const key in data) {
        updateExpression +=`#${key} = :${key}, `;
        expressionAttributeNames[`#${key}`] = key;
        expressionAttributeValues[`:${key}`] = data[key];
    }
    updateExpression = updateExpression.slice(0, -2); // remove the last comma and space
    const params = {
        TableName: tableName,
        Key: key,
        UpdateExpression: updateExpression,
        ExpressionAttributeValues: expressionAttributeValues,
        ExpressionAttributeNames: expressionAttributeNames,
        ReturnValues: DB_RETURN_VALUES.ALL_NEW
    };
    console.log('update record params', params);
    return await docClient.update(params).promise();
}