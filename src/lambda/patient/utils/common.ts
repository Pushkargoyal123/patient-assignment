// internal dependencies
import { ResponseModel } from "../models/reponse.model";

export function respondWithSucess(body: object): ResponseModel{
    return {
        statusCode: 200, // status code 200
        headers:  {contentType: 'application/json'}, // content type
        body: JSON.stringify({data: body}) // body of the response
    }
}

export function respondWithError(statusCode: number, message: string): ResponseModel{
    return{
        statusCode: statusCode,
        body: JSON.stringify({error: message})
    }
}