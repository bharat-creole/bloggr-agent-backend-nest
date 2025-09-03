import { openaiClient } from './../config/openaiClient';

class OpenAIService {
	private openai;

	constructor() {
		this.openai = openaiClient;
	}

	public async getCompletion(prompt: string) {
		try {
			const completion = await this.openai.chat.completions.create({
				messages: [{ role: 'system', content: prompt }],
				model: 'gpt-4o',
				store: true,
			});

			return completion.choices[0];
		} catch (error) {
			console.error('Error fetching completion:', error);
			return null;
		}
	}

	public async createBatchEmbeddings(data: any) {
		const batchSize = 500;
		try {
			const embeddingsArray = [];
			for (let i = 0; i < data.length; i += batchSize) {
				const batch = data.slice(i, i + batchSize);
				// console.log('batch:', batch);
				const stringifiedArray = batch.map((item: any) =>
					JSON.stringify(item)
				);
				// console.log('stringifiedArray:', stringifiedArray);

				const embeddingRes =
					await this.openai.embeddings.create({
						model: 'text-embedding-3-large',
						input: stringifiedArray,
					});

				// console.log('embeddingRes:', embeddingRes);

				const embedding = embeddingRes.data.map(
					(item: any) => item.embedding
				);
				for (const arr of embedding) {
					if (Array.isArray(arr) && arr.length > 0) {
						embeddingsArray.push([...arr]);
					}
				}
			}
			return embeddingsArray;
		} catch (error) {
			console.log('err:', error);
			return error;
		}
	}

	public async createEmbedding(data: any) {
		try {
			const embeddingRes = await this.openai.embeddings.create({
				model: 'text-embedding-3-large',
				input: data,
			});

			const embedding = embeddingRes.data.map(
				(item: any) => item.embedding
			);

			// console.log("embedding:", embedding);

			return embedding;
		} catch (error) {
			console.log('err:');
			return error;
		}
	}

	public async getKeywordsFromTitles(
		titles: any,
		reference_meaning: string
	) {
		const prompt = `
		You are a helpful assistant that extracts keywords from titles. From the titles, extract the keywords that are most relevant to the title from seo perspective. From given titles only analyze and list the keywords that are most relevant to the title. Analyze and list those are highly meaningful and relevant to the title.

		Give strict output in json format as given in example and do not include any other text in your response. Just array elements of keywords. 

		consider this reference_meaning: ${reference_meaning} while extracting the keywords if it is given.
		
		example :- 
		Title:-
		[
				'ASI and its future impacts on day to day tasks',
				'Beyond AI: Preparing For Artificial Superintelligence',
				'The Event Horizon of Thought: Exploring ...',
				'What Is Artificial Superintelligence?',
				'Artificial Super Intelligence (ASI) Explained - Checkify',
				'Thriving in the Age of Superintelligence',
				'AGI vs ASI: Key Differences & Future Implications',
				'20 Pros & Cons of ASI (Artificial Super Intelligence) [2025]',
				'Preparing for the Future of Human-Technology Collaboration',
				'The Impact of AGI/ASI: Shaping the Future of Life and ...'
]

		Keywords:-
		[
			'ASI',
			'Artificial Super Intelligence',
			'future impacts',
			'day to day tasks',
			'Beyond AI',
			'Event Horizon of Thought',
			'Thriving in the Age of Superintelligence',
			'AGI vs ASI',
			'Pros & Cons of ASI',
			'Future of Human-Technology Collaboration',
			'Impact of AGI/ASI'
		]
	
		`;

		const completion = await this.openai.chat.completions.create({
			messages: [
				{ role: 'system', content: prompt },
				{ role: 'user', content: titles.join('\n') },
			],
			model: 'gpt-4o',
		});

		console.log(completion.choices[0].message.content, 'completion');

		return completion.choices[0].message.content;
	}

	public async filterKeywordsWithReferenceMeaning(
		keywords: any,
		reference_meaning: string
	) {
		console.log(keywords, 'keywords');
		console.log(reference_meaning, 'reference_meaning');

		const prompt = `
		You are a helpful assistant that filters keywords with reference meaning.

		consider this reference_meaning: ${reference_meaning} while filtering the keywords and give output based on context.

		
		Give strict output in json format (array of objects) as given in example and do not include any other text in your response. Just array elements of keywords. 

		Output should be in json format as given in example.
		example :-
		
		[
        {
            "keyword": "asi",
            "volume": "60500",
            "competition": "1"
        },
        {
            "keyword": "hybrid workplace",
            "volume": "6600",
            "competition": "7"
        },
        {
            "keyword": "asi insurance company",
            "volume": "4400",
            "competition": "23"
        },
        {
            "keyword": "american strategic insurance company",
            "volume": "4400",
            "competition": "23"
        },
				]

		`;

		const completion = await this.openai.chat.completions.create({
			messages: [
				{ role: 'system', content: prompt },
				{ role: 'user', content: keywords.join('\n') },
			],
			model: 'gpt-4o',
		});

		console.log(completion.choices[0].message.content, 'completion');

		return completion.choices[0].message.content;
	}
}
export default OpenAIService;
