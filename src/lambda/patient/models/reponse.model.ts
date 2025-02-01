export interface ResponseModel {
    statusCode: number;
    body: string;
    headers?: {
        contentType: string;
    };
}