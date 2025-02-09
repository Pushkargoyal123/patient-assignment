import { AttributeType, StreamViewType, Table } from "aws-cdk-lib/aws-dynamodb";
import { Construct } from "constructs";
import * as cdk from "aws-cdk-lib";

export function createTable(
  scope: Construct,
  tableName: string,
  partitionKey: string,
  sortKey?: string,
): Table {
  return new Table(scope, tableName, {
    partitionKey: { name: partitionKey, type: AttributeType.STRING },
    sortKey: sortKey ? { name: sortKey, type: AttributeType.STRING } : undefined,
    tableName: tableName,
    stream: StreamViewType.NEW_IMAGE, // Enable DynamoDB Streams
    removalPolicy: cdk.RemovalPolicy.RETAIN,
  });
}
