// external dependencies
import { APIGatewayEvent } from 'aws-lambda';

// internal dependencies
import { respondWithError, respondWithSucess } from './utils/common';
import { ResponseModel } from './models/reponse.model';
import { API_END_POINTS, API_GATEWAY_METHODS } from './constant';
import { insertPatient } from './api';

exports.handler = async(event: APIGatewayEvent): Promise<ResponseModel> => {
    try {
        console.log('Api gateway event', event);
        console.log('table name', process.env.PATIENT_TABLE);
        let response;
        switch (event.httpMethod) {
            case API_GATEWAY_METHODS.GET:
                return respondWithSucess({ message: 'Hello from patient lambda' });
            case API_GATEWAY_METHODS.POST:
                if(event.path === API_END_POINTS.POST_PATIENT){
                    response = await insertPatient(event);
                }else{
                    return respondWithError(404, 'Invalid API endpoint');
                }
                return respondWithSucess({ message: 'Hello from patient lambda' });
            case API_GATEWAY_METHODS.PUT:
                return respondWithSucess({ message: 'Hello from patient lambda' });
            case API_GATEWAY_METHODS.DELETE:
                return respondWithSucess({ message: 'Hello from patient lambda' });
        }
        return respondWithError(404, 'Invalid request method');
    }
    catch (err) {
        console.log('error message', err);
        return respondWithError(500, JSON.stringify(err));
    }
}