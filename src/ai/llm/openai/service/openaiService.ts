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


public async generateOutlineFromTopic(
  topic: string,
  title: string,
  primaryKeyword: string
): Promise<string> {
  const prompt = `
Create a comprehensive, SEO-optimized blog outline in the following JSON format:

[
  {
    "id": "1",
    "name": "Section name",
    "items": [
      {
        "id": "11",
        "name": "Subsection name"
      }
    ]
  }
]

Title: ${title}
Primary Keyword: ${primaryKeyword}
Topic: ${topic}

Requirements:
- Use the provided title exactly as the main topic
- Each main section should be an object with "id", "name", and "items" (array of subsections)
- 5-7 main sections covering key aspects of the topic
- Each main section should have 2-4 subsections as "items"
- Use unique, sequential IDs for each section and subsection (e.g., 1, 11, 12, 2, 21, etc.)
- The first section should be an Introduction, the last section should be a Conclusion
- Do NOT include any commentary or explanations, ONLY return the required JSON structure

Format your response as valid, minified JSON.
`;

  try {
    const completion = await this.openai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are an expert content strategist and SEO specialist who creates detailed, well-structured blog outlines in JSON that rank well in search engines.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      model: 'gpt-4o',
      temperature: 0.7,
      max_tokens: 1500
    });

    // The response should be valid JSON string
    return completion.choices[0].message.content || '';
  } catch (error) {
    console.error('Error generating outline from topic:', error);
    throw error;
  }
}
	public async createBatchEmbeddings(data: any) {
		const batchSize = 500;
		try {
			const embeddingsArray = [];
			for (let i = 0; i < data.length; i += batchSize) {
				const batch = data.slice(i, i + batchSize);
				const stringifiedArray = batch.map((item: any) =>
					JSON.stringify(item)
				);

				const embeddingRes =
					await this.openai.embeddings.create({
						model: 'text-embedding-3-large',
						input: stringifiedArray,
					});

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
	 // NEW: Auto keyword generation
    public async generateAutoKeywords(topic: string, country: string) {
        const prompt = `
Generate the best SEO keywords for the topic: "${topic}" targeting country: "${country}".

Select 1 primary keyword (highest volume, lowest competition) and 5-10 secondary keywords (good volume, manageable competition).

Respond with ONLY valid JSON in this exact format:
{
    "primary": "primary keyword text",
    "secondary": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5"]
}

No explanations, no additional text, just the JSON.
        `;

        try {
            const completion = await this.openai.chat.completions.create({
                messages: [
                    { 
                        role: 'system', 
                        content: 'You are an SEO keyword expert. Respond with ONLY valid JSON. No explanations.' 
                    },
                    { role: 'user', content: prompt },
                ],
                model: 'gpt-4o',
                temperature: 0.3,
            });

            return completion.choices[0].message.content;
        } catch (error) {
            console.error('Error in generateAutoKeywords:', error);
            throw error;
        }
    }

    // NEW: Auto title generation
    public async generateAutoTitle(topic: string, primaryKeyword: string) {
        const prompt = `
Create the best SEO-optimized blog title for:
Topic: "${topic}"
Primary Keyword: "${primaryKeyword}"

The title should:
- Include the primary keyword naturally
- Be engaging and clickable
- Be 50-60 characters for SEO
- Appeal to the target audience

Respond with ONLY the title text. No quotes, no explanations, just the title.
        `;

        try {
            const completion = await this.openai.chat.completions.create({
                messages: [
                    { 
                        role: 'system', 
                        content: 'You are a title optimization expert. Respond with ONLY the optimized title text.' 
                    },
                    { role: 'user', content: prompt },
                ],
                model: 'gpt-4o',
                temperature: 0.7,
            });

            return completion.choices[0].message.content?.trim();
        } catch (error) {
            console.error('Error in generateAutoTitle:', error);
            throw error;
        }
    }
}
export default OpenAIService;