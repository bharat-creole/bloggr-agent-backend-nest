import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();
class OpenAIClient {
	private static instance: OpenAI;

	private constructor() {} // Prevent direct instantiation

	public static getInstance(): OpenAI {
		if (!OpenAIClient.instance) {
			OpenAIClient.instance = new OpenAI({
				apiKey: process.env.OPENAI_API_KEY || '',
			});
		}
		return OpenAIClient.instance;
	}
}

export const openaiClient = OpenAIClient.getInstance();
