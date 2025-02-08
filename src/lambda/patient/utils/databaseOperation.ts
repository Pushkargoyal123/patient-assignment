// external dependencies
import * as AWS from 'aws-sdk';
import { ExpressionAttributeNameMap, ExpressionAttributeValueMap, ProjectionExpression, QueryInput, ScanInput } from 'aws-sdk/clients/dynamodb';

// internal dependencies
import { AWS_DEFAULT_REGION } from '../constant';

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
    console.log('insert record params', params);
    const response = await docClient.query(params).promise();
    return response;
}

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
    return await docClient.scan(params).promise();
}