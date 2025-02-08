// external dependencies
import { APIGatewayEvent } from 'aws-lambda';

// internal dependencies
import { respondWithError, respondWithSucess } from './utils/common';
import { ErrorResponse, ResponseModel } from './models/reponse.model';
import { API_END_POINTS, API_GATEWAY_METHODS } from './constant';
import { getAllPatients, getPatientById, insertPatient } from './api';

exports.handler = async (event: APIGatewayEvent): Promise<ResponseModel> => {
    try {
        console.log('Api gateway event', event);
        console.log('table name', process.env.PATIENT_TABLE);
        let response;
        switch (event.httpMethod) {
            case API_GATEWAY_METHODS.GET: // GET API call
                if (event.resource === API_END_POINTS.GET_ALL_PATIENT) {
                    response = await getAllPatients();
                } else if (event.resource === API_END_POINTS.GET_PATIENT) {
                    response = await getPatientById(event);
                } else {
                    return respondWithError(404, 'Invalid API endpoint -> '+ event.resource);
                }
                return respondWithSucess(response as object);
            case API_GATEWAY_METHODS.POST: // post API call
                if (event.resource === API_END_POINTS.POST_PATIENT) {
                    response = await insertPatient(event);
                } else {
                    return respondWithError(404, 'Invalid API endpoint');
                }
                return respondWithSucess(response);
            case API_GATEWAY_METHODS.PUT: // put api call
                return respondWithSucess({ message: 'Hello from patient lambda' });
            case API_GATEWAY_METHODS.DELETE: //delete api call
                return respondWithSucess({ message: 'Hello from patient lambda' });
        }
        return respondWithError(404, 'Invalid request method');
    }
    catch (err: unknown) {
        console.log('error message', err);
        let errorMessage: ErrorResponse = {};
        if (typeof (err as Error).message === 'string') {
            errorMessage = JSON.parse((err as Error).message);
            return respondWithError(errorMessage['statusCode'] as number, JSON.stringify(errorMessage) || 'Unknown error');
        }
        return respondWithError(500, JSON.stringify(err));
    }
}