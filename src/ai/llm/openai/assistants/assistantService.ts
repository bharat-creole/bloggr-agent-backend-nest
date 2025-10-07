import { response, type Request, type Response } from 'express';
import { Readable } from 'stream';
import { openaiClient } from './../config/openaiClient';
import { add } from 'winston';

const tools: any = [
	{
		name: 'getStaticServerMetrics',
		description:
			'Get the static server metrics from database for given serverId and userId',
		strict: false,
		parameters: {
			type: 'object',
			properties: {},
			additionalProperties: false,
			required: [],
		},
	},
	{
		name: 'getDynamicServerMetrics',
		description:
			'This function will get user`s dynamic server metrics and will help you get the context of from which you can answer to user`s query.',
		strict: false,
		parameters: {
			type: 'object',
			properties: {
				contentType: {
					type: 'array',
					description:
						'This will give content type of the server metrics based on user query',
					items: {
						type: 'string',
					},
				},
				userQuery: {
					type: 'string',
					description: 'the original latest user query',
				},
				timeAskInQuery: {
					type: 'string',
					description:
						'If user had mentioned time in query then do this operation :- (Current IST time) - (user time). If user time is not mentioned just give the given IST time data. strictly give in IST only',
				},
				currentTime: {
					type: 'string',
					description:
						'give the current time given with query',
				},
			},
			required: [
				'contentType',
				'userQuery',
				'timeAskInQuery',
				'currentTime',
			],
		},
	},
	{
		name: 'getUsageFromDB',
		description: 'This function will get the usage from the database',
		strict: false,
		parameters: {
			type: 'object',
			properties: {
				contentType: {
					type: 'array',
					description:
						'This will give content type of the server metrics based on user query',
					items: {
						type: 'string',
					},
				},
			},
			required: ['contentType'],
		},
	},
];
class assistantService {
	private openai;

	constructor() {
		this.openai = openaiClient;
	}

	public async createAssistants() {
		const assistant = await this.openai.beta.assistants.create({
			instructions: 'You are a helpful assistant.',
			name: 'ai-server-chatbot-2',
			model: 'gpt-4o',
			tools: tools,
		});
		console.log('assistant:', assistant);
		return { assistantId: assistant.id };
	}

	public async createAssistantThread() {
		const thread = await this.openai.beta.threads.create();
		console.log('assistantThread:', thread);
		return { threadId: thread.id };
	}

	public async getAssistantMessages(req: Request, res: Response) {
		res.setHeader('Content-Type', 'text/event-stream');
		res.setHeader('Cache-Control', 'no-cache');
		res.setHeader('Connection', 'keep-alive');

		const threadId = req.params.threadId;
		const content = req.body.content;
		console.log('content:', req.body, 'threadId:', threadId);
		const currentTimeIST = new Date()
			.toLocaleString('en-US', {
				timeZone: 'Asia/Kolkata',
				year: 'numeric',
				month: '2-digit',
				day: '2-digit',
				hour: '2-digit',
				minute: '2-digit',
				second: '2-digit',
				hour12: false,
			})
			.replace(',', '');
		console.log('Current Time IST:', currentTimeIST);
		await this.openai.beta.threads.messages.create(threadId, {
			role: 'user',
			content: `${content}Current·time·is·:${currentTimeIST}`,
		});

		const stream = this.openai.beta.threads.runs.stream(threadId, {
			// assistant_id: 'asst_kZeG0dLUN88S3JX26gSduAEH',
			assistant_id: 'asst_60wAlmqMuI0GcI5sgCYoTx7v',
		});

		for await (const chunk of stream) {
			res.write(`${JSON.stringify(chunk)}\n\n`);
		}
		res.end();
	}

	public async getAssistantActions(req: Request, res: Response) {
		res.setHeader('Content-Type', 'text/event-stream');
		res.setHeader('Cache-Control', 'no-cache');
		res.setHeader('Connection', 'keep-alive');

		const { toolCallOutputs, runId } = req.body;
		const threadId = req.params.threadId;

		const stream =
			this.openai.beta.threads.runs.submitToolOutputsStream(
				threadId,
				runId,
				{ tool_outputs: toolCallOutputs }
			);

		for await (const chunk of stream) {
			res.write(`${JSON.stringify(chunk)}\n\n`);
		}
		res.end();
	}
}

export default assistantService;
