import type { THttpError } from '../../types/HttpResponse';
import type { NextFunction, Request, Response } from 'express';
import logger from '../../utils/logger';

process.on('uncaughtException', (error: Error) => {
	console.log('uncaught Exception Occurred', JSON.stringify(error));
});

process.on('unhandledRejection', (reason: string, p: Promise<unknown>) => {
	logger.error(`Unhandled rejection at: ${p.toString()} reason: ${reason} `);
});

process.on('uncaughtException', (error: Error) => {
	logger.error(`Error occurred: ${JSON.stringify(error)}`);
});

export const defaultErrorHandler = (
	err: THttpError,
	_: Request,
	res: Response,
	__: NextFunction,
): void => {
	const errStatus = err?.statusCode || 500;
	console.error(`Error occurred: ${JSON.stringify(err)}`);
	res.status(errStatus).json(err);
};

class ErrorHandler {
	public async handleError(
		error: Error,
		responseStream: Response,
		next: NextFunction,
	): Promise<void> {
		//will add implementation if needed
		// await logger.logError(error);
		// await fireMonitoringMetric(error);
		// await crashIfUntrustedErrorOrSendResponse(error, responseStream);
		//  await sendMailToAdminIfCritical();
		// await saveInOpsQueueIfCritical();
		// await determineIfOperationalError();
		//We can do the error handling logic here
		responseStream.status(500).json({ error: 'An unexpected error occurred.' });
	}
}

export const handler = new ErrorHandler();
