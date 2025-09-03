import type { Request, Response } from 'express';
import OpenAIService from '../llm/openai/service/openaiService';
const openaiService = new OpenAIService();
const https = require('https');
import axios from 'axios';
const fs = require('fs');
const path = require('path');

const FormData = require('form-data');
// ----------------------------------------------------------------------------------------
const token =
	'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI0YjE2ZGVmMC04NzMzLTQyMmQtOTYzNS1jZmEwYTVmZjBmYWUiLCJlbWFpbCI6Imp1emFyLmFudHJpQGNyZW9sZXN0dWRpb3MuY29tIiwiaWF0IjoxNzUzNDMyNzU2fQ.B61S53ZTmTuo3qcx56XSh2EVdyxP91LFZHAjPzFt-sk';

const filePath = path.join(__dirname, '../../blog-draft.json');

// ----------------------------------------------------------------------------------------

const loadFileData = (): any[] => {
	if (!fs.existsSync(filePath)) return [];
	const rawData = fs.readFileSync(filePath, 'utf-8');
	if (!rawData.trim()) return [];
	try {
		const parsed = JSON.parse(rawData);
		return Array.isArray(parsed) ? parsed : [];
	} catch {
		return [];
	}
};

const ensureThreadObject = (threadId: string): any => {
	const fileData = loadFileData();
	let obj = fileData.find((item: any) => item.thread_id === threadId);
	if (!obj) {
		obj = { thread_id: threadId };
		fileData.push(obj);
		fs.writeFileSync(
			filePath,
			JSON.stringify(fileData, null, 2),
			'utf-8'
		);
	}
	return obj;
};

const updateThreadObject = (
	threadId: string,
	data: Record<string, any>
): any => {
	const fileData = loadFileData();
	let obj = fileData.find((item: any) => item.thread_id === threadId);
	if (!obj) {
		obj = { thread_id: threadId };
		fileData.push(obj);
	}
	for (const [key, value] of Object.entries(data)) {
		obj[key] = value;
	}
	fs.writeFileSync(filePath, JSON.stringify(fileData, null, 2), 'utf-8');
	return obj;
};

export const extractJsonArray = (input: string) => {
	try {
		const match = input.match(
			/\[\s*(?:{[^}]*}|\s*"[^"]*"\s*)(?:\s*,\s*(?:{[^}]*}|\s*"[^"]*"\s*))*\s*\]/
		);

		if (!match) {
			throw new Error('No valid JSON array found in input.');
		}

		const jsonArrayStr = match[0];
		const parsed = JSON.parse(jsonArrayStr);

		if (!Array.isArray(parsed)) {
			throw new Error('Parsed content is not an array.');
		}

		return parsed;
	} catch (err: any) {
		console.error('Error parsing array:', err.message);
		return null;
	}
};

export const chatbotService = (
	req: Request,
	res: Response
	// next: NextFunction
): any => {
	console.log('Chatbot service called');
	console.log(req.body);

	return 'Hello! How can I help you today???';
};

export const getPrimaryKeywordData = async (
	keyword: string,
	country: string,
	reference_meaning: string
): Promise<any> => {
	console.log(
		keyword,
		country,
		reference_meaning,
		'keyword, country, reference_meaning'
	);

	try {
		// Get the Rank data from Google Search
		const API_KEY =
			'b673f651123b57de00c25a4e0ba6bb242acccfd0419bbde14ea0e61e5b1e1294';
		const query = keyword;

		const getSerpApiUrl = `https://serpapi.com/search.json?q=${encodeURIComponent(
			query
		)}&hl=en&gl=us&api_key=${API_KEY}`;

		const googleSearchResponse = await axios.get(getSerpApiUrl);

		// console.log(googleSearchResponse.data, 'googleSearchResponse');
		const googleSearchData = [keyword];

		googleSearchResponse.data.organic_results.map((item: any) => {
			if (item.title) {
				googleSearchData.push(item.title);
			}
		});

		console.log(
			googleSearchData.length,
			googleSearchData,
			'googleSearchData'
		);
		// return googleSearchData;

		// Get Keywords from titles from LLms

		const keywordsFromTitles =
			await openaiService.getKeywordsFromTitles(
				googleSearchData,
				reference_meaning
			);

		const keywordsFromTitlesArray = extractJsonArray(
			keywordsFromTitles || ''
		);

		console.log(
			keywordsFromTitlesArray?.length,
			keywordsFromTitlesArray,
			'keywordsFromTitlesArray'
		);

		// return keywordsFromTitlesArray;

		const finalKeywordsArray: any[] = [];

		for (const userKeyword of keywordsFromTitlesArray || []) {
			const apiUrl = 'https://bloggr.ai:3011/getKeywords';

			const httpsAgent = new https.Agent({
				rejectUnauthorized: false,
			});

			try {
				const response = await axios.post(
					apiUrl,
					{
						keyword: userKeyword,
						country,
					},
					{
						headers: {
							'Content-Type': 'application/json',
							Authorization: `Bearer ${token}`,
						},
						httpsAgent,
					}
				);
				console.log(response.data, 'response.data>>>>>>>>>>>>');

				console.log(response.data.text.length, 'response.data');

				// const keywordTexts = response.data.text
				// 	.slice(0, 3)
				// 	.map((item: any) => {
				// 		// console.log(item, 'item');
				// 		return {
				// 			keyword: item.text,
				// 			volume: item.keywordIdeaMetrics
				// 				.avgMonthlySearches,
				// 			competition:
				// 				item.keywordIdeaMetrics
				// 					.competitionIndex,
				// 		};
				// 	});

				// finalKeywordsArray.push(...keywordTexts);

				const keywordTexts = response.data.text
					.filter(
						(item: any) =>
							item.keywordIdeaMetrics
								.competitionIndex < 50 &&
							item.keywordIdeaMetrics
								.avgMonthlySearches >= 100
					)
					.sort(
						(a: any, b: any) =>
							b.keywordIdeaMetrics
								.avgMonthlySearches -
							a.keywordIdeaMetrics
								.avgMonthlySearches
					)
					.slice(0, 3)
					.map((item: any) => {
						return {
							keyword: item.text,
							volume: item.keywordIdeaMetrics
								.avgMonthlySearches,
							competition:
								item.keywordIdeaMetrics
									.competitionIndex,
						};
					});

				finalKeywordsArray.push(...keywordTexts);

				finalKeywordsArray.sort(
					(a: any, b: any) => b.volume - a.volume
				);
			} catch (error) {
				console.error(
					`Error fetching for keyword "${userKeyword}":`,
					error
				);
			}
		}

		const filterKeywordsWithReferenceMeaning =
			await openaiService.filterKeywordsWithReferenceMeaning(
				finalKeywordsArray,
				reference_meaning
			);

		const filterKeywordsWithReferenceMeaningArray = extractJsonArray(
			filterKeywordsWithReferenceMeaning || ''
		);

		console.log(
			filterKeywordsWithReferenceMeaningArray,
			'filterKeywordsWithReferenceMeaningArray'
		);

		console.log(finalKeywordsArray.length, 'finalKeywordsArray');
		return finalKeywordsArray;

		// __________________________________________________________
		// const apiUrl = 'https://bloggr.ai:3011/getKeywords';

		// const httpsAgent = new https.Agent({
		// 	rejectUnauthorized: false,
		// });

		// const response = await axios.post(
		// 	apiUrl,
		// 	{
		// 		keyword,
		// 		country,
		// 	},
		// 	{
		// 		headers: {
		// 			'Content-Type': 'application/json',
		// 			Authorization: `Bearer ${token}`,
		// 		},
		// 		httpsAgent,
		// 	}
		// );

		// if (response.status !== 200) {
		// 	throw new Error(
		// 		`Failed to fetch primary keyword: ${response.statusText}`
		// 	);
		// }
		// const keywordTexts = response.data.text.map(
		// 	(item: any) => item.text
		// );

		// console.log(keywordTexts, 'keywordTexts');
		// return keywordTexts.slice(0, 5);
	} catch (error: any) {
		console.error('ERROR:', error);
	}
};

export const setPrimarySecondaryKeywordData = async (
	primaryKeyword: string,
	secondaryKeyword: string
): Promise<any> => {
	console.log(
		primaryKeyword,
		secondaryKeyword,
		'primaryKeyword>>>>>>>>>>>>>>>>>>, secondaryKeyword>>>>>>>>>>>>>>>>>>>>>>>>>>>'
	);
};

export const findKeywordInfoData = async (keywords: string[]): Promise<any> => {
	console.log(keywords, 'keywords');

	const apiUrl = 'https://bloggr.ai:3011/getKeywords';

	const httpsAgent = new https.Agent({
		rejectUnauthorized: false,
	});
	const keywordDataArray: any[] = [];
	await Promise.all(
		keywords.map(async (keyword: string) => {
			const response = await axios.post(
				apiUrl,
				{
					keyword: keyword,
					country: 'United States',
				},
				{
					headers: {
						'Content-Type': 'application/json',
						Authorization: `Bearer ${token}`,
					},
					httpsAgent,
				}
			);
			keywordDataArray.push(...response.data.text);
			console.log(response.data, 'response');
		})
	);
	console.log(keywordDataArray, 'keywordDataArray');
	let keywordTexts: any[] = [];
	keywordTexts = keywordDataArray
		.filter(
			(item: any) =>
				item.keywordIdeaMetrics.competitionIndex < 50 &&
				item.keywordIdeaMetrics.avgMonthlySearches >= 100
		)
		.sort(
			(a: any, b: any) =>
				b.keywordIdeaMetrics.avgMonthlySearches -
				a.keywordIdeaMetrics.avgMonthlySearches
		)
		.map((item: any) => {
			return {
				keyword: item.text,
				volume: item.keywordIdeaMetrics.avgMonthlySearches,
				competition: item.keywordIdeaMetrics.competitionIndex,
			};
		});

	console.log(keywordTexts, 'keywordTexts');
	return keywordTexts;
	// await Promise.all(keywordData);
};

export const getTitleData = async (
	topic: string,
	primaryKeyword: string
): Promise<any> => {
	console.log(topic, primaryKeyword, 'topic, primaryKeyword');

	const apiUrl = 'https://bloggr.ai:3011/generatetitle';

	const httpsAgent = new https.Agent({
		rejectUnauthorized: false,
	});

	const response = await axios.post(
		apiUrl,
		{
			topic,
			primaryKeyword,
		},
		{
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${token}`,
			},
			httpsAgent,
		}
	);

	if (response.status !== 200) {
		throw new Error(`Failed to fetch title: ${response.statusText}`);
	}

	const title = response.data.title;
	console.log(title, 'title');
	return title;
};

export const getReferenceOutlineData = async (
	title: string,
	primaryKeyword: string,
	threadId: string
): Promise<any> => {
	console.log(
		title,
		primaryKeyword,
		threadId,
		'topic, primaryKeyword, threadId'
	);

	const API_KEY =
		'b673f651123b57de00c25a4e0ba6bb242acccfd0419bbde14ea0e61e5b1e1294';
	const query = title;

	const url = `https://serpapi.com/search.json?q=${encodeURIComponent(
		query
	)}&hl=en&gl=us&api_key=${API_KEY}`;

	try {
		const response = await axios.get(url);

		const links = response.data.organic_results.map(
			(item: any) => item.link
		);
		// return links.slice(0, 5);
		// const httpsAgentData = new https.Agent({
		// 	rejectUnauthorized: false,
		// });
		const crawlResults = Promise.all(
			links.slice(0, 5).map(async (link: string) => {
				console.log(link, 'link');
				const crawlApiUrl = 'https://bloggr.ai:3013/crawl';

				const httpsAgentData = new https.Agent({
					rejectUnauthorized: false,
				});

				const form = new FormData();
				form.append('user_id', threadId);
				form.append('urls', link);

				const crawlResponse = await axios.post(
					crawlApiUrl,
					form,
					{
						headers: {
							'Content-Type': 'multipart/form-data',
							Authorization: `Bearer ${token}`,
						},
						httpsAgent: httpsAgentData,
					}
				);

				if (crawlResponse.status !== 200) {
					throw new Error(
						`Failed to fetch title: ${crawlResponse.statusText}`
					);
				}

				return crawlResponse.data;
			})
		);

		const generateOutlineApiUrl = 'https://bloggr.ai:3013/process';
		const httpsAgentData = new https.Agent({
			rejectUnauthorized: false,
		});

		// Wait for all crawlResults to complete before hitting the generate outline API
		await crawlResults;

		const formProcess = new FormData();
		formProcess.append('user_id', threadId);
		formProcess.append('language', 'English');
		formProcess.append('primary_keyword', primaryKeyword);
		formProcess.append('title', title);
		formProcess.append('include_crawled', 'true');
		formProcess.append('secondary_keywords', '');

		const generateOutlineResponse = await axios.post(
			generateOutlineApiUrl,
			formProcess,
			{
				headers: {
					...formProcess.getHeaders(),
					Authorization: `Bearer ${token}`,
				},
				httpsAgent: httpsAgentData,
			}
		);

		updateThreadObject(threadId, {
			outline: generateOutlineResponse.data.outline_generation
				.outline_data.parsed_outline,
			title: title,
			primary_keywords: primaryKeyword,
		});
		return generateOutlineResponse.data;
	} catch (error: any) {
		console.error('ERROR:', error);
	}
};

export const getRegeneratedOutlineData = async (
	threadId: string,
	feedback: string
): Promise<any> => {
	console.log(threadId, feedback, 'threadId, feedback');

	const fileData = loadFileData();
	const blogDraftObj = fileData.find(
		(item: any) => item.thread_id === threadId
	);

	if (!blogDraftObj) {
		console.error(`No blog draft found for thread_id: ${threadId}`);
		return { error: 'No blog draft found for the provided threadId.' };
	}

	// console.log(blogDraftObj, 'blogDraftObj');

	const regenerateOutlineApiUrl =
		'https://bloggr.ai:3013/regenerate-outline';
	const httpsAgentData = new https.Agent({
		rejectUnauthorized: false,
	});

	const form = new FormData();
	form.append('user_id', threadId);
	form.append('language', 'English');
	form.append('primary_keyword', blogDraftObj.primary_keywords);
	form.append('title', blogDraftObj.title);
	form.append('include_crawled', 'false');
	form.append('secondary_keywords', blogDraftObj.secondary_keywords);
	form.append('feedback', feedback);
	form.append('outline', blogDraftObj.outline.toString());

	const regenerateOutlineResponse = await axios.post(
		regenerateOutlineApiUrl,
		form,
		{
			httpsAgent: httpsAgentData,
			headers: {
				'Content-Type': 'multipart/form-data',
				Authorization: `Bearer ${token}`,
			},
		}
	);

	console.log(regenerateOutlineResponse.data, 'regenerateOutlineResponse');
	updateThreadObject(threadId, {
		outline: regenerateOutlineResponse.data.outline_generation
			.outline_data.parsed_outline,
	});
	return regenerateOutlineResponse.data;
};

export const addInterlinkingData = async (
	links: string[],
	threadId: string
): Promise<any> => {
	try {
		console.log(links, threadId, 'links, threadId');
		const dummyLink =
			'https://www.drupal.org/project/dummy_link/git-instructions';

		updateThreadObject(threadId, {
			links: links,
			secondary_keywords: '',
			brandVoice:
				'- To proceed with the analysis in the requested format, please provide key details or a summary about the brand. This may include:\r\n- Mission and vision of the brand\r\n- Description of products or services\r\n- Target market or audience\r\n- Tone and style of communication\r\n- Distinguishing features or traits\r\n- With this information, I can then craft a comprehensive brand voice description for you.',
			aiPersona:
				'H1: Best AI Tools for Writing SEO-Rich Blog Content\n\nH2: TL;DR\n\nH2: Introduction\n\nH2: Why Use AI Tools for SEO Blog Writing?\n\nH2: Key Features to Look for in AI SEO Blog Tools\n(Add 5-6 Key Features)\n\nH2: 5 Best AI Tools for Writing SEO-Rich Blog Content in 2025\nH3s:\nBloggr.AI\nJasper AI\nWritesonic\nCopy.ai\nNeuralText\n\nH3: Conclusion',
			model: 'GPT-o1-mini',
			language: 'English',
			user_id: threadId,
		});
		return 'success';
	} catch (error: any) {
		console.error('ERROR:', error);
	}
};

export const createBlogData = async (threadId: string): Promise<any> => {
	console.log(threadId, 'threadId');
	const generateBlogApiUrl = 'https://bloggr.ai:3013/generate_blog';
	const httpsAgentData = new https.Agent({
		rejectUnauthorized: false,
	});

	const fileData = loadFileData();
	const blogDraftObj = fileData.find(
		(item: any) => item.thread_id === threadId
	);

	if (!blogDraftObj) {
		console.error(`No blog draft found for thread_id: ${threadId}`);
		return { error: 'No blog draft found for the provided threadId.' };
	}
	// console.log(blogDraftObj, 'blogDraftObj');

	try {
		const response = await axios.post(
			generateBlogApiUrl,
			blogDraftObj,
			{
				httpsAgent: httpsAgentData,
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${token}`,
				},
			}
		);

		updateThreadObject(threadId, { blog: response.data });

		return response.data.blog_content;
	} catch (error: any) {
		console.error('Error generating blog:', error.message);
		return { message: 'failed' };
	}
};

export const getBlogData = async (threadId: string): Promise<any> => {
	console.log(threadId, 'threadId');
	const fileData = loadFileData();
	const blogDraftObj = fileData.find(
		(item: any) => item.thread_id === threadId
	);
	return blogDraftObj.blog.blog_content;
};
