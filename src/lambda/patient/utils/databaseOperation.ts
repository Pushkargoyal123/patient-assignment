// external dependencies
import * as AWS from 'aws-sdk';

// internal dependencies
import { AWS_DEFAULT_REGION } from '../constant';

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