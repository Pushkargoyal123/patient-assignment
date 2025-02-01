import { ResponseModel } from "../models/reponse.model";

export function respondWithSucess(body: object): ResponseModel{
    return {
        statusCode: 200, // status code 200
        headers:  {contentType: 'application/json'}, // content type
        body: JSON.stringify(body) // body of the response
    }
}