// external dependencies
import { expect } from "chai";
import * as sinon from "sinon";

// internal dependencies
import { handler } from "../../lambda/patient/index";
import * as api from "../../lambda/patient/api";
import { event } from "../mock-data/mockevent";
import * as responseMethods from "../../lambda/patient/utils/common";
import { PatientData } from "../../lambda/patient/models/patient.model";
import { patientResponse } from "../mock-data/mock-response";

describe("getAllPatients API", () => {
  it("should return success response when getAllPatients is called", async () => {
    const mockResponse: PatientData[] = [patientResponse];

    const getAllPatientsStub = sinon
      .stub(api, "getAllPatients")
      .resolves(mockResponse as unknown as any[]);
    const respondWithSucessStub = sinon
      .stub(responseMethods, "respondWithSucess")
      .callsFake((data: any) => {
        return { statusCode: 200, body: JSON.stringify(data) };
      });

    const result = await handler(event);
    console.log("result of handler", result);

    expect(getAllPatientsStub.calledOnce).to.be.true;
    expect(respondWithSucessStub.calledOnce).to.be.true;
    expect(result.statusCode).to.equal(200);
    expect(result).to.deep.equal(responseMethods.respondWithSucess(mockResponse));

    getAllPatientsStub.restore();
    respondWithSucessStub.restore();
  });

  // test case for invalid end point (negative scanario)
  it("should return 404 error for invalid API endpoint", async () => {
    event.resource = "/invalid-endpoint";
    const respondWithErrorStub = sinon
      .stub(responseMethods, "respondWithError")
      .callsFake((statusCode: number, message: string) => {
        return { statusCode, body: message };
      });

    const result = await handler(event);
    console.log("result of handler", result);

    expect(respondWithErrorStub.calledOnce).to.be.true;
    expect(result.statusCode).to.equal(404);
    expect(result).to.deep.equal(
      responseMethods.respondWithError(404, "Invalid API endpoint -> /invalid-endpoint"),
    );

    respondWithErrorStub.restore();
  });

  // test case for invalid method (negative scanario)
  it("should return 404 error for Method like GOST", async () => {
    event.httpMethod = "GOST";
    const respondWithErrorStub = sinon
      .stub(responseMethods, "respondWithError")
      .callsFake((statusCode: number, message: string) => {
        return { statusCode, body: message };
      });

    const result = await handler(event);
    console.log("result of handler", result);

    expect(respondWithErrorStub.calledOnce).to.be.true;
    expect(result.statusCode).to.equal(404);
    expect(result).to.deep.equal(responseMethods.respondWithError(404, "Invalid request method"));

    respondWithErrorStub.restore();
  });
});
