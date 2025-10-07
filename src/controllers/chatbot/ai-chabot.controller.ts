import assistantService from '../../ai/llm/openai/assistants/assistantService';
const https = require('https');
const FormData = require('form-data');
import axios from 'axios';

import {
	addInterlinkingData,
	chatbotService,
	createBlogData,
	findKeywordInfoData,
	getQuickModeOutline,
	getBlogData,
	getPrimaryKeywordData,
	getReferenceOutlineData,
	getRegeneratedOutlineData,
	getTitleData,
	setPrimarySecondaryKeywordData,
	generateAutoKeywordsData,
	generateAutoTitleData,
	show_interlinking_ui as show_interlinking_uiService,
} from '../../ai/chatbot/chatbotService';
import type { NextFunction, Request, Response } from 'express';
import PerplexityService from '../../ai/llm/openai/service/perplexityService';
const assistantservice = new assistantService();
const perplexityService = new PerplexityService();

export const chatAIChatbot = async (
	req: Request,
	res: Response,
	next: NextFunction
): Promise<any> => {
	try {
		const chatbotResponse = chatbotService(req, res);

		return res.status(200).json({
			message: 'Chatbot response received',
			gptresponse: chatbotResponse,
		});
	} catch (err) {
		console.error('Error while creating chatbot:', err);
		next(err);
	}
};

export const createAssistants = async (
	req: Request,
	res: Response,
	next: NextFunction
): Promise<any> => {
	try {
		const createAssistant = assistantservice.createAssistants();
		return res.status(200).json({
			message: 'success',
			data: createAssistant,
		});
	} catch (err) {
		console.error('Error while saving static server metrics:', err);
		next(err);
	}
};

export const createAssistantThread = async (
	req: Request,
	res: Response,
	next: NextFunction
): Promise<any> => {
	try {
		const createThread = await assistantservice.createAssistantThread();
		return res.status(200).json({
			message: 'success',
			data: createThread,
		});
	} catch (err) {
		console.error('Error', err);
		next(err);
	}
};

export const getAssistantMessages = async (
	req: Request,
	res: Response,
	next: NextFunction
): Promise<any> => {
	try {
		await assistantservice.getAssistantMessages(req, res);
	} catch (err) {
		console.error('Error :', err);
		next(err);
	}
};

export const getAssistantActions = async (
	req: Request,
	res: Response,
	next: NextFunction
): Promise<any> => {
	try {
		await assistantservice.getAssistantActions(req, res);
	} catch (err) {
		console.error('Error ', err);
		next(err);
	}
};

export const getPrimaryKeyword = async (
	req: Request,
	res: Response,
	next: NextFunction
): Promise<any> => {
	try {
		const { keyword, country, reference_meaning } = req.body;
		const primaryKeyword = await getPrimaryKeywordData(
			keyword,
			'United States',
			reference_meaning
		);
		return res.status(200).json({
			message: 'success',
			data: primaryKeyword,
		});
	} catch (err: any) {
		console.error('Error ', err.message);
		next(err);
	}
};

export const setPrimarySecondaryKeyword = async (
	req: Request,
	res: Response,
	next: NextFunction
): Promise<any> => {
	try {
		const { primaryKeyword, secondaryKeyword } = req.body;
		const setPrimarySecondaryKeyword =
			await setPrimarySecondaryKeywordData(
				primaryKeyword,
				secondaryKeyword
			);
		return res.status(200).json({
			message: 'success',
			data: setPrimarySecondaryKeyword,
		});
	} catch (err) {
		console.error('Error ', err);
		next(err);
	}
};

export const findKeywordInfo = async (
	req: Request,
	res: Response,
	next: NextFunction
): Promise<any> => {
	try {
		const { keywords } = req.body;
		const findKeywordInfo = await findKeywordInfoData(keywords);
		return res.status(200).json({
			message: 'success',
			data: findKeywordInfo,
		});
	} catch (err) {
		console.error('Error ', err);
		next(err);
	}
};

export const getTitle = async (
	req: Request,
	res: Response,
	next: NextFunction
): Promise<any> => {
	try {
		const { topic, primaryKeyword } = req.body;
		const title = await getTitleData(topic, primaryKeyword);
		return res.status(200).json({
			message: 'success',
			data: title,
		});
	} catch (err) {
		console.error('Error ', err);
		next(err);
	}
};

export const getReferenceOutline = async (
	req: Request,
	res: Response,
	next: NextFunction
): Promise<any> => {
	try {
		const { title, primaryKeyword, threadId } = req.body;
		const referenceOutline = await getReferenceOutlineData(
			title,
			primaryKeyword,
			threadId
		);
		return res.status(200).json({
			message: 'success',
			data: referenceOutline,
		});
	} catch (err) {
		console.error('Error ', err);
		next(err);
	}
};
export const getQuickModeOutlineHandler = async (
	req: Request,
	res: Response
): Promise<any> => {
	try {
		const { topic, thread_id } = req.body;

		if (!topic || !thread_id) {
			return res.status(400).json({
				error: 'topic and thread_id are required',
			});
		}

		const result = await getQuickModeOutline(topic, thread_id);
		return res.status(200).json(result);
	} catch (error: any) {
		console.error('Error in quick mode outline:', error);
		return res.status(500).json({
			error: 'Failed to generate quick mode outline',
		});
	}
};
export const generateAutoKeywords = async (
	req: Request,
	res: Response,
	next: NextFunction
): Promise<any> => {
	try {
		const { topic, country } = req.body;
		if (!topic) {
			return res.status(400).json({ error: 'topic is required' });
		}

		const targetCountry = country || 'United States';

		console.log(
			`Starting generateAutoKeywords for topic: ${topic}, country: ${targetCountry}`
		);

		const result = await generateAutoKeywordsData(topic, targetCountry);

		return res.status(200).json({
			message: 'success',
			data: result,
		});
	} catch (err: any) {
		console.error('Error in generateAutoKeywords:', err);
		return res.status(500).json({
			error: 'Failed to generate keywords automatically',
			details: err.message,
		});
	}
};

export const generateAutoTitle = async (
	req: Request,
	res: Response,
	next: NextFunction
): Promise<any> => {
	try {
		const { topic, primaryKeyword } = req.body;
		if (!topic) {
			return res.status(400).json({ error: 'topic is required' });
		}

		const keywordToUse = primaryKeyword || topic;

		console.log(
			`Starting generateAutoTitle for topic: ${topic}, primaryKeyword: ${keywordToUse}`
		);
		const result = await generateAutoTitleData(topic, keywordToUse);

		return res.status(200).json({
			message: 'success',
			data: result,
		});
	} catch (err: any) {
		console.error('Error in generateAutoTitle:', err);
		return res.status(200).json({
			message: 'partial_success',
			data: {
				title: `The Complete Guide to ${
					req.body.topic || 'This Topic'
				}`,
			},
			error: err.message,
		});
	}
};

export const getRegeneratedOutline = async (
	req: Request,
	res: Response,
	next: NextFunction
): Promise<any> => {
	try {
		const { threadId, feedback } = req.body;
		const regeneratedOutline = await getRegeneratedOutlineData(
			threadId,
			feedback
		);
		return res.status(200).json({
			message: 'success',
			data: regeneratedOutline,
		});
	} catch (err) {
		console.error('Error ', err);
		next(err);
	}
};
export const addInterlinking = async (
	req: Request,
	res: Response,
	next: NextFunction
): Promise<any> => {
	try {
		const { links, threadId } = req.body;
		const interlinking = await addInterlinkingData(links, threadId);
		return res.status(200).json({
			message: 'success',
			data: interlinking,
		});
	} catch (err) {
		console.error('Error ', err);
		next(err);
	}
};

export const createBlog = async (
	req: Request,
	res: Response,
	next: NextFunction
): Promise<any> => {
	try {
		const { threadId } = req.body;
		const blog = await createBlogData(threadId);
		if (blog.message === 'failed') {
			return res.status(400).json({
				message: 'failed',
				data: blog,
			});
		}
		return res.status(200).json({
			message: 'success',
			data: blog,
			isBlog: true,
			type: 'blog',
		});
	} catch (err) {
		console.error('Error ', err);
		next(err);
	}
};

export const getBlog = async (
	req: Request,
	res: Response,
	next: NextFunction
): Promise<any> => {
	try {
		const { threadId } = req.body;
		const blog = await getBlogData(threadId);

		return res.status(200).json({
			message: 'success',
			data: blog,
		});
	} catch (err) {
		console.error('Error ', err);
		next(err);
	}
};

export const getPerplexityCompletion = async (
	req: Request,
	res: Response,
	next: NextFunction
): Promise<any> => {
	try {
		const { prompt, options } = req.body || {};
		if (!prompt) {
			return res.status(400).json({ error: 'prompt is required' });
		}

		const result = await perplexityService.getCompletion(
			prompt,
			options || {}
		);
		return res.status(200).json({ message: 'success', data: result });
	} catch (err: any) {
		console.error('Error in getPerplexityCompletion:', err);
		return res.status(500).json({
			error: 'Failed to get Perplexity completion',
			details: err.message,
		});
	}
};
