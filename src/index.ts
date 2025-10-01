import { ENVConfig } from './config/env.config';
ENVConfig.validateConfig();
import { httpResponse } from './utils/httpResponse';
import bodyParser from 'body-parser';
import express, {
	type NextFunction,
	type Request,
	type Response,
} from 'express';
import { httpError } from './utils/httpError';
import { defaultErrorHandler } from './middlewares';

import { createServer } from 'http';
import aiChatbotRouter from './routes/v1/ai-chatbot.route';

import cors from 'cors';

const app = express();
const PORT = ENVConfig.PORT;
app.disable('x-powered-by');
app.use(cors());

app.use(bodyParser.json());
app.use(
	bodyParser.urlencoded({
		extended: true,
	}),
);

app.get(
	'/server-status',
	async (req: Request, res: Response, next: NextFunction) => {
		try {
			httpResponse(req, res, 200, 'Server is up running!', {
				status: 'running',
			});
		} catch (err) {
			console.error(
				`error while getting server status: ${JSON.stringify(err)}`,
			);
			httpError(next, err, req, 500);
		}
	},
);

app.use('/api/v1/chatbot', aiChatbotRouter);
app.use(defaultErrorHandler);

const httpServer = createServer(app);

httpServer.listen(PORT, () => {
	console.log(`express server is running on port ${PORT}`);
	console.log(`http://localhost:${PORT}`);
	console.log(`http://localhost:${PORT}/server-status`);
});
