// external dependencies
import { ClassConstructor, plainToInstance } from "class-transformer";
import { validate } from "class-validator";

export const validatePayload = async (payload: Record<string, unknown>, schema: ClassConstructor<object>): Promise<object> => {
    // Convert JSON to UserDto instance and validate
    const userDto: object = plainToInstance(schema, payload);
    const errors = await validate(userDto);

    if (errors.length > 0) {
        throw new Error(JSON.stringify({
            statusCode: 400,
            error: errors.map((error) => error.constraints)
        }))
    } else {
        return userDto;
    }
}