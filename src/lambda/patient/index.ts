// external dependencies
import { APIGatewayEvent, DynamoDBStreamEvent } from "aws-lambda";

// internal dependencies
import { respondWithError, respondWithSucess } from "./utils/common";
import { ErrorResponse, ResponseModel } from "./models/reponse.model";
import { API_END_POINTS, API_GATEWAY_METHODS } from "./constant";
import {
  deletePatient,
  getAllPatients,
  getPatientById,
  insertPatient,
  syncDynamoDataWithOpenSearch,
  updatePatient,
} from "./api";

const handler = async (event: APIGatewayEvent): Promise<ResponseModel> => {
  try {
    console.log("Api gateway event", event);
    console.log("table name", process.env.PATIENT_TABLE);

    // condition to sync data from dynamoDB to open search
    if ((event as unknown as DynamoDBStreamEvent).Records) {
      const response: object = await syncDynamoDataWithOpenSearch(
        event as unknown as DynamoDBStreamEvent,
      );
      return respondWithSucess(response);
    }

    let response;
    switch (event.httpMethod) {
      case API_GATEWAY_METHODS.GET: // GET API call
        if (event.resource === API_END_POINTS.GET_ALL_PATIENT) {
          response = await getAllPatients(event);
        } else if (event.resource === API_END_POINTS.GET_PATIENT) {
          response = await getPatientById(event);
        } else {
          return respondWithError(404, "Invalid API endpoint -> " + event.resource);
        }
        return respondWithSucess(response as object);

      case API_GATEWAY_METHODS.POST: // post API call
        if (event.resource === API_END_POINTS.POST_PATIENT) {
          response = await insertPatient(event);
        } else {
          return respondWithError(404, "Invalid API endpoint");
        }
        return respondWithSucess(response);

      case API_GATEWAY_METHODS.PUT: // put api call
        if (event.resource === API_END_POINTS.UPDATE_PATIENT) {
          response = (await updatePatient(event)) as object;
        } else {
          return respondWithError(404, "Invalid API endpoint");
        }
        return respondWithSucess(response);

      case API_GATEWAY_METHODS.DELETE: //delete api call
        if (event.resource === API_END_POINTS.DELETE_PATIENT) {
          response = await deletePatient(event);
        } else {
          return respondWithError(404, "Invalid API endpoint");
        }
        return respondWithSucess(response);
    }
    return respondWithError(404, "Invalid request method");
  } catch (err: unknown) {
    console.log("error message", err);
    let errorMessage: ErrorResponse = {};
    if (typeof (err as Error).message === "string") {
      errorMessage = JSON.parse((err as Error).message);
      return respondWithError(
        errorMessage["statusCode"] as number,
        JSON.stringify(errorMessage.error) || "Unknown error",
      );
    }
    return respondWithError(500, JSON.stringify(err));
  }
};

export { handler };
