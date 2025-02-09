// external dependencies
import { expect } from 'chai';
import * as sinon from 'sinon';

// internal dependencies
import {handler} from '../../lambda/patient/index';
import * as api from '../../lambda/patient/api';
import { event } from '../mock-data/mockevent';
import { respondWithSucess, respondWithError } from '../../lambda/patient/utils/common';

describe('getAllPatients API', () => { 

    it('should return success response when getAllPatients is called', async () => {
        const mockResponse = { patients: [] };
        const getAllPatientsStub = sinon.stub(api, 'getAllPatients').resolves([mockResponse]);
        const respondWithSucessStub = sinon.stub().returns(respondWithSucess);

        const result = await handler(event);

        expect(getAllPatientsStub.calledOnce).to.be.true;
        expect(respondWithSucessStub.calledOnce).to.be.true;
        expect(result).to.deep.equal(respondWithSucess(mockResponse));

        getAllPatientsStub.restore();
        respondWithSucessStub.restore();
    });

    it('should return error response when getAllPatients throws an error', async () => {
        const mockError = new Error('Something went wrong');
        const getAllPatientsStub = sinon.stub(api, 'getAllPatients').rejects(mockError);
        const respondWithErrorStub = sinon.stub().returns(respondWithError);

        const result = await handler(event);

        expect(getAllPatientsStub.calledOnce).to.be.true;
        expect(respondWithErrorStub.calledOnce).to.be.true;
        expect(result).to.deep.equal(respondWithError(500, JSON.stringify(mockError)));

        getAllPatientsStub.restore();
        sinon.restore();
    });

    it('should return 404 error for invalid API endpoint', async () => {
        event.resource = '/invalid-endpoint';
        const respondWithErrorStub = sinon.stub().returns(respondWithError);

        const result = await handler(event);

        expect(respondWithErrorStub.calledOnce).to.be.true;
        expect(result).to.deep.equal(respondWithError(404, 'Invalid API endpoint -> /invalid-endpoint'));

        respondWithErrorStub.restore();
    });
});