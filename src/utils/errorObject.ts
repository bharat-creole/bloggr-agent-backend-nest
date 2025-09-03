import type { Request } from 'express';
import type { THttpError } from '../types/HttpResponse';
import { EApplicationEnvironment } from '../constants/application';
import { ENVConfig } from '../config/env.config';
import responseMessage from '../constants/responseMessage';
import { Prisma } from '@prisma/client';

export default (
	err: Error | unknown,
	req: Request,
	errorStatusCode = 500,
): THttpError => {
	const errorObj: THttpError = {
		success: false,
		statusCode: errorStatusCode,
		request: {
			ip: req.ip ?? null,
			method: req.method,
			url: req.originalUrl,
		},
		message: responseMessage.SOMETHING_WENT_WRONG,
		data: null,
		trace: null,
	};
	if (err instanceof Prisma.PrismaClientKnownRequestError) {
		if (err.code === 'P2002' || err.code === '23505') {
			errorObj.message = 'User already exists';
		}
		errorObj.statusCode = err.code === 'P2002' ? 400 : 500;
	}
	// if error is an instance of Error object
	else if (err instanceof Error) {
		errorObj.message = err.message || responseMessage.SOMETHING_WENT_WRONG;
		errorObj.trace = { error: err.stack ?? 'No stack trace available' };
	}

	if (ENVConfig.NODE_ENV === EApplicationEnvironment.PRODUCTION) {
		errorObj.request.ip = undefined;
		errorObj.trace = undefined;
	}
	return errorObj;
};
