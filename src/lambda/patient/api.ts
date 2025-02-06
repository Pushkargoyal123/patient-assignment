// external dependencies
import { APIGatewayEvent } from "aws-lambda";
import { v4 as uuidv4 } from 'uuid';

// internal dependencies
import { PatientRecord } from "./validateModels/patient";
import { validatePayload } from "./utils/validator";
import { PatientData } from "./models/patient.model";
import { create } from "./utils/databaseOperation";

export const insertPatient = async (event: APIGatewayEvent) => {
    const payload = event.body; // payload of the API
    await validatePayload(JSON.parse(payload as string), PatientRecord); // validating the payload
    const id = uuidv4();
    const item: PatientData = {
        id: uuidv4(),
        ...JSON.parse(payload as string),
        createdAt: new Date().toLocaleDateString('en-GB'),
        updatedAt: new Date().toLocaleDateString('en-GB')
    }
    // inserting the patient record in the database
    const response = await create(item, process.env.PATIENT_TABLE as string);
    return response;
}