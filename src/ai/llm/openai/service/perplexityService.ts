// PerplexityService: A service class similar to OpenAIService, but for Perplexity's chat completion API.

import Perplexity from '@perplexity-ai/perplexity_ai';
import { perplexityClient as perplexityClientInstance } from '../../openai/config/perplexityClient';

class PerplexityService {
	static getCompletion(arg0: { primaryKeyword: string }) {
		throw new Error('Method not implemented.');
	}
	private perplexityClient: Perplexity;

	constructor(perplexityClient: Perplexity = perplexityClientInstance) {
		this.perplexityClient = perplexityClient;
	}

	/**
	 * Get a chat completion from Perplexity's API.
	 * @param {string} prompt - The prompt to send.
	 * @param {object} [options] - Optional parameters (e.g., model, system message, etc.)
	 * @returns {Promise<any>} - The completion result or null on error.
	 */
	public async getCompletion(prompt: string, options: any = {}) {
		try {
			const {
				model = 'sonar-pro', // default model, change as needed
				system = 'You are a helpful assistant.',
			} = options;

			const messages = [
				{ role: 'system', content: system },
				{ role: 'user', content: prompt },
			];

			const completion =
				await this.perplexityClient.chat.completions.create({
					messages: messages.map((message) => ({
						role: message.role,
						content: message.content,
					})) as {
						role:
							| 'system'
							| 'user'
							| 'assistant'
							| 'tool';
						content: any;
					}[],
					model,
					search_domain_filter: [
						'-wikipedia.org',
						'-youtube.com',
						'-instagram.com',
						'-tiktok.com',
						'-twitter.com',
						'-facebook.com',
						'-reddit.com',
					],
				});

			// Perplexity's API is similar to OpenAI's, so we expect choices[0]
			return completion.citations || null;
		} catch (error) {
			console.error('Error fetching Perplexity completion:', error);
			return null;
		}
	}
}

export default PerplexityService;
