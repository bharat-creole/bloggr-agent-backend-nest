import type { Request, Response } from 'express';
import { EApplicationEnvironment } from '../constants/application';
import { ENVConfig } from '../config/env.config';
import Logger from './logger';
import type { THttpResponse } from 'types';

export const httpResponse = (
	req: Request,
	res: Response,
	responseStatusCode: number,
	responseMessage: string,
	data: unknown = null,
): void => {
	try {
		const response: THttpResponse = {
			success: responseStatusCode >= 200 && responseStatusCode < 300,
			statusCode: responseStatusCode,
			request: {
				ip:
					ENVConfig.NODE_ENV === EApplicationEnvironment.PRODUCTION
						? undefined
						: req.ip || undefined,
				method: req.method,
				url: req.originalUrl,
			},
			message: responseMessage,
			data: data,
		};

		// Log
		Logger.info('CONTROLLER_RESPONSE', {
			meta: response,
		});

		res.status(responseStatusCode).json(response);
	} catch (error) {
		Logger.error('Error in httpResponse', { error });
		res.status(500).json({
			success: false,
			statusCode: 500,
			message: 'Internal Server Error',
		});
	}
};
