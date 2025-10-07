import Perplexity from '@perplexity-ai/perplexity_ai';
import dotenv from 'dotenv';

dotenv.config();

class PerplexityClient {
	private static instance: Perplexity;

	private constructor() {}

	public static getInstance(): Perplexity {
		if (!PerplexityClient.instance) {
			PerplexityClient.instance = new Perplexity({
				apiKey: process.env.PERPLEXITY_API_KEY || '',
			});
		}
		return PerplexityClient.instance;
	}
}

export const perplexityClient = PerplexityClient.getInstance();
