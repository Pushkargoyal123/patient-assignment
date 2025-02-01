import { respondWithSucess } from './utils/common';

exports.handler = async (event: any) => {
    try {
        console.log('Api gateway event', event);
        console.log('table name', process.env.PATIENT_TABLE);
        return respondWithSucess({ message: 'Hello from patient lambda' });
    }
    catch (err) {
        console.log('error message', err);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: err })
        }
    }
}