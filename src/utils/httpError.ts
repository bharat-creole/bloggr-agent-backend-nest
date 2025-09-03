import type { NextFunction, Request } from 'express';
import errorObject from './errorObject';

export const httpError = (
	nextFunc: NextFunction,
	err: Error | unknown,
	req: Request,
	errorStatusCode = 500,
) => {
	const errorObj = errorObject(err, req, errorStatusCode);
	return nextFunc(errorObj);
};
