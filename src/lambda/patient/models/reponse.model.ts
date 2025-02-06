export interface ResponseModel {
    statusCode: number;
    body: string;
    headers?: {
        contentType: string;
    };
}

export interface ErrorResponse { statusCode?: number; errors?: string }