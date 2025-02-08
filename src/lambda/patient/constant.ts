export const API_GATEWAY_METHODS = {
    GET: 'GET',
    POST: 'POST',
    PUT: 'PUT',
    DELETE: 'DELETE'
}

export const API_END_POINTS = {
    GET_ALL_PATIENT: '/patient',
    GET_PATIENT: '/patient/{id}',
    POST_PATIENT: '/patient',
    UPDATE_PATIENT: '/patient/{id}',
    DELETE_PATIENT: '/patient/{id}'
}

export const AWS_DEFAULT_REGION = 'us-east-1';

export const DB_RETURN_VALUES = {
    ALL_OLD: 'ALL_OLD',
    ALL_NEW: 'ALL_NEW',
    UPDATED_OLD: 'UPDATED_OLD',
    UPDATED_NEW: 'UPDATED_NEW'
}