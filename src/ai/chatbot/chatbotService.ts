import type { Request, Response } from 'express';
import OpenAIService from '../llm/openai/service/openaiService';
const openaiService = new OpenAIService();
const PerplexityService =
	require('../llm/openai/service/perplexityService').default;
const perplexityService = new PerplexityService();
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
			'666e2c786d1bddf1a7808b32f2efe6de893c72b3abb74d035984c925a7aedba5';
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
					`Error fetching for keyword "${userKeyword}":`
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
		// ✅ FIX: Actually return this data!
		// if (
		// 	filterKeywordsWithReferenceMeaningArray &&
		// 	filterKeywordsWithReferenceMeaningArray.length > 0
		// ) {
		// 	console.log(
		// 		`✅ Returning ${filterKeywordsWithReferenceMeaningArray.length} keywords from filter`
		// 	);
		// 	return filterKeywordsWithReferenceMeaningArray; // ← ADD THIS LINE
		// }

		// If filter returned nothing, return whatever we have in finalKeywordsArray
		console.log(finalKeywordsArray.length, 'finalKeywordsArray');

		if (finalKeywordsArray.length > 0) {
			return finalKeywordsArray;
		}

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
	let links: any[] = [];
	links = await perplexityService.getCompletion(
		`Given the blog title "${title}" and the primary keyword "${primaryKeyword}", provice sourced links for the blog post. Only provide the links, no other text. top 5 only`
	);
	console.log(links, 'links');

	try {
		// Crawl with Promise.allSettled to handle individual failures
		console.log('Starting to crawl URLs...');
		const crawlStartTime = Date.now();

		const crawlResults = await Promise.allSettled(
			links.slice(0, 3).map(async (link: string, index: number) => {
				try {
					console.log(
						`[${index + 1}/${links.length}] Crawling:`,
						link
					);
					const crawlApiUrl =
						'https://bloggr.ai:3013/crawl';

					const httpsAgentData = new https.Agent({
						rejectUnauthorized: false,
					});

					const form = new FormData();
					form.append('user_id', threadId);
					form.append('urls', link);

					const linkStartTime = Date.now();
					const crawlResponse = await axios.post(
						crawlApiUrl,
						form,
						{
							headers: {
								'Content-Type':
									'multipart/form-data',
								Authorization: `Bearer ${token}`,
							},
							httpsAgent: httpsAgentData,
							timeout: 60000, // 60 seconds per URL
						}
					);

					const linkDuration = Date.now() - linkStartTime;

					if (crawlResponse.status !== 200) {
						console.error(
							`[${index + 1}] Failed with status ${
								crawlResponse.status
							}:`,
							link
						);
						return null;
					}

					console.log(
						`[${
							index + 1
						}] Successfully crawled in ${linkDuration}ms:`,
						link
					);
					return crawlResponse.data;
				} catch (error: any) {
					const errorMsg =
						error.code === 'ECONNABORTED'
							? 'timeout'
							: error.message;
					console.error(
						`[${index + 1}] Error crawling ${link}:`,
						errorMsg
					);
					return null;
				}
			})
		);

		const crawlTotalTime = Date.now() - crawlStartTime;
		console.log(`Total crawling time: ${crawlTotalTime}ms`);

		// Count successful crawls
		const successfulCrawls = crawlResults.filter(
			(result) =>
				result.status === 'fulfilled' && result.value !== null
		).length;

		console.log(
			`Successfully crawled ${successfulCrawls} out of ${links.length} URLs`
		);

		// If less than 2 successful crawls, fall back to quick mode
		if (successfulCrawls < 2) {
			console.log(
				'Not enough successful crawls, falling back to quick mode'
			);
			return await getQuickModeOutline(title, threadId);
		}

		console.log(
			'Crawling complete, generating outline with crawled data...'
		);

		const generateOutlineApiUrl = 'https://bloggr.ai:3013/process';
		const httpsAgentData = new https.Agent({
			rejectUnauthorized: false,
		});

		const formProcess = new FormData();
		formProcess.append('user_id', threadId);
		formProcess.append('language', 'English');
		formProcess.append('primary_keyword', primaryKeyword);
		formProcess.append('title', title);
		formProcess.append('include_crawled', 'true');
		formProcess.append('secondary_keywords', '');

		const outlineStartTime = Date.now();
		const generateOutlineResponse = await axios.post(
			generateOutlineApiUrl,
			formProcess,
			{
				headers: {
					...formProcess.getHeaders(),
					Authorization: `Bearer ${token}`,
				},
				httpsAgent: httpsAgentData,
				timeout: 120000, // 2 minutes for outline generation
			}
		);
		console.log('outline:', generateOutlineApiUrl);

		const outlineDuration = Date.now() - outlineStartTime;
		console.log(`Outline generation completed in ${outlineDuration}ms`);

		// Check if the outline generation was successful
		const outlineData =
			generateOutlineResponse.data?.outline_generation
				?.outline_data;
		console.log(outlineData, 'jhdysgfjkhg');

		if (
			!outlineData ||
			outlineData.error ||
			outlineData.message ===
				'Insufficient or irrelevant context' ||
			!outlineData.parsed_outline
		) {
			console.log(
				'Outline generation failed with crawled data, falling back to quick mode'
			);
			console.log(
				'Error details:',
				outlineData?.error || outlineData?.message
			);
			return await getQuickModeOutline(title, threadId);
		}

		// Success - store and return
		updateThreadObject(threadId, {
			outline: outlineData.parsed_outline,
			title: title,
			primary_keywords: primaryKeyword,
		});

		console.log(
			'Outline generated and stored successfully with web research'
		);
		return generateOutlineResponse.data;
	} catch (error: any) {
		console.error('ERROR in getReferenceOutlineData:', error.message);
		console.error('Stack trace:', error.stack);

		// Fall back to quick mode on any error
		console.log('Falling back to quick mode due to error');
		try {
			return await getQuickModeOutline(title, threadId);
		} catch (fallbackError: any) {
			console.error(
				'Fallback to quick mode also failed:',
				fallbackError.message
			);
			throw new Error(
				'Unable to generate outline with web research or AI knowledge'
			);
		}
	}
};
function safeJSONParse(str: string, fallback: any = null) {
	try {
		// Remove leading/trailing whitespace and code block markers
		let cleaned = str.trim();
		// Remove ```json and ```
		cleaned = cleaned.replace(/```json\s*/g, '').replace(/```\s*/g, '');
		return JSON.parse(cleaned);
	} catch (error) {
		console.error('safeJSONParse error:', error, '\nRaw input:', str);
		return fallback;
	}
}

// Add these two functions to your chatbotService.ts

// Replace existing generateAutoKeywordsData function
export const generateAutoKeywordsData = async (
	topic: string,
	country: string
) => {
	try {
		console.log(
			`Auto-generating keywords using same research process for: ${topic}, ${country}`
		);

		const allKeywords = await getPrimaryKeywordData(
			topic,
			country,
			`Keywords related to: ${topic}`
		);

		if (!allKeywords || allKeywords.length === 0) {
			console.warn(
				'⚠️ No keywords from research, falling back to OpenAI'
			);
			throw new Error('No keywords found from research');
		}

		console.log(`Found ${allKeywords.length} keywords from research`);

		// ✅ CONVERT TO NUMBERS FOR FILTERING
		const validKeywords = allKeywords.filter((k: any) => {
			const competition = Number(k.competition || 999);
			const volume = Number(k.volume || 0);
			return competition < 50 && volume >= 100;
		});

		if (validKeywords.length === 0) {
			console.warn(
				'⚠️ No valid keywords after filtering, falling back to OpenAI'
			);
			throw new Error(
				'No valid keywords with acceptable competition found'
			);
		}

		// ✅ CONVERT TO NUMBERS FOR SORTING
		const sortedByVolume = validKeywords.sort((a: any, b: any) => {
			const aVolume = Number(a.volume || 0);
			const bVolume = Number(b.volume || 0);
			return bVolume - aVolume;
		});

		const primary = sortedByVolume[0];

		const secondary = sortedByVolume
			.filter((k: any) => k.keyword !== primary.keyword)
			.slice(0, 10)
			.map((k: any) => k.keyword);

		console.log('✅ Auto-selected primary:', primary.keyword);
		console.log('✅ Auto-selected secondary:', secondary);

		return {
			primary: primary.keyword,
			secondary: secondary,
			primaryVolume: Number(primary.volume),
			primaryCompetition: Number(primary.competition),
			totalOptionsFound: allKeywords.length,
		};
	} catch (error: any) {
		console.error(
			'❌ Error in generateAutoKeywordsData:',
			error.message
		);
		console.log('🔄 Falling back to OpenAI-only keyword generation');

		const result = await openaiService.generateAutoKeywords(
			topic,
			country
		);

		if (!result) {
			console.warn(
				'⚠️ OpenAI generateAutoKeywords returned null, using default fallback'
			);
			return {
				primary: topic.toLowerCase(),
				secondary: [
					`${topic} guide`,
					`${topic} tips`,
					`${topic} best practices`,
				],
				fallback: true,
			};
		}

		const parsed = safeJSONParse(result, {
			primary: topic.toLowerCase(),
			secondary: [
				`${topic} guide`,
				`${topic} tips`,
				`${topic} best practices`,
			],
		});

		return {
			primary: parsed.primary,
			secondary: parsed.secondary,
			fallback: true,
		};
	}
};

// Replace existing generateAutoTitleData function
export const generateAutoTitleData = async (
	topic: string,
	primaryKeyword: string
) => {
	try {
		console.log(
			`Auto-generating title using same process for: ${topic}, ${primaryKeyword}`
		);

		// USE THE SAME FUNCTION AS GUIDED MODE - this calls external API
		const allTitles = await getTitleData(topic, primaryKeyword);

		if (!allTitles || allTitles.length === 0) {
			throw new Error('No titles generated');
		}
		if (!allTitles || allTitles.length === 0) {
			throw new Error('No titles generated');
		}

		console.log(`Generated ${allTitles.length} title options`);
		console.log(`Generated ${allTitles.length} title options`);

		// Auto-select first title (the API typically returns best one first)
		const selectedTitle = allTitles[0];
		// Auto-select first title (the API typically returns best one first)
		// const selectedTitle = allTitles[0];

		console.log('Auto-selected title:', selectedTitle);
		console.log('Auto-selected title:', selectedTitle);

		return {
			title: selectedTitle,
			totalOptionsGenerated: allTitles.length,
		};
	} catch (error: any) {
		console.error('Error in generateAutoTitleData:', error);

		// Fallback to OpenAI-only if API fails
		console.log('Falling back to OpenAI-only title generation');
		const result = await openaiService.generateAutoTitle(
			topic,
			primaryKeyword
		);

		return {
			title:
				result ||
				`The Complete Guide to ${topic}: Everything You Need to Know`,
			fallback: true,
		};
	}
};

// Make sure getQuickModeOutline exists and is exported
export const getQuickModeOutline = async (
	topic: string,
	threadId: string
): Promise<any> => {
	console.log('========================================');
	console.log('QUICK MODE WITH FULL RESEARCH: Starting outline generation');
	console.log('Topic:', topic);
	console.log('ThreadId received:', threadId);
	console.log('========================================');

	try {
		// ============================================================
		// STEP 1: KEYWORD RESEARCH (using same API as guided mode)
		// ============================================================
		console.log('🔍 Step 1: Researching keywords with full API...');
		let primaryKeyword = topic.toLowerCase(); // fallback
		let secondaryKeywords: string[] = [];

		try {
			const keywordData = await generateAutoKeywordsData(
				topic,
				'United States'
			);
			primaryKeyword = keywordData.primary;
			secondaryKeywords = keywordData.secondary;

			console.log('✅ Keyword research complete');
			console.log('   Primary:', primaryKeyword);
			console.log('   Secondary:', secondaryKeywords.join(', '));
		} catch (keywordError: any) {
			console.warn(
				'⚠️ Keyword research failed, using topic as keyword:',
				keywordError.message
			);
			primaryKeyword = topic.toLowerCase();
			secondaryKeywords = [
				`${topic} guide`,
				`${topic} tips`,
				`best ${topic}`,
			];
		}

		// ============================================================
		// STEP 2: GENERATE TITLE (using researched keyword)
		// ============================================================
		console.log(
			'📝 Step 2: Generating title with researched keyword...'
		);
		let title = `Understanding ${
			topic.charAt(0).toUpperCase() + topic.slice(1)
		}: A Complete Guide`; // fallback

		try {
			const titleData = await generateAutoTitleData(
				topic,
				primaryKeyword
			);
			title = titleData.title;
			console.log('✅ Title generated:', title);
		} catch (titleError: any) {
			console.warn(
				'⚠️ Title generation failed, using default:',
				titleError.message
			);
		}

		// ============================================================
		// STEP 3: WEB CRAWLING RESEARCH
		// ============================================================
		console.log('🌐 Step 3: Starting web crawling research...');

		// const API_KEY =
		// 	'666e2c786d1bddf1a7808b32f2efe6de893c72b3abb74d035984c925a7aedba5';
		// const query = `${primaryKeyword} article blog guide`;
		// const url = `https://serpapi.com/search.json?q=${encodeURIComponent(
		// 	query
		// )}&hl=en&gl=us&api_key=${API_KEY}`;

		let crawlSuccessful = false;

		try {
			// console.log('Searching for relevant articles...');
			// const response = await axios.get(url);

			// if (
			// 	response.data.organic_results &&
			// 	response.data.organic_results.length > 0
			// ) {
			// Filter problematic domains and homepages
			// const problematicDomains = [
			// 	'medium.com/@',
			// 	'sciencedirect.com',
			// 	'researchgate.net',
			// 	'jstor.org',
			// 	'academia.edu',
			// 	'springer.com',
			// 	'ieee.org',
			// ];

			// const homepagePatterns = [
			// 	/^https?:\/\/[^\/]+\/?$/,
			// 	/^https?:\/\/www\.[^\/]+\/?$/,
			// 	/discord\.com\/invite/,
			// 	/finance\.yahoo\.com\/quote/,
			// 	/linkedin\.com\/company/,
			// 	/twitter\.com\/[^\/]+\/?$/,
			// 	/facebook\.com\/[^\/]+\/?$/,
			// 	/instagram\.com\/[^\/]+\/?$/,
			// 	/github\.com\/[^\/]+\/?$/,
			// 	/\/login/,
			// 	/\/signup/,
			// 	/\/register/,
			// ];

			// const links = response.data.organic_results
			// 	.filter((item: any) => {
			// 		const link = item.link.toLowerCase();

			// 		if (
			// 			problematicDomains.some((domain) =>
			// 				link.includes(domain)
			// 			)
			// 		) {
			// 			return false;
			// 		}

			// 		if (
			// 			homepagePatterns.some((pattern) =>
			// 				pattern.test(link)
			// 			)
			// 		) {
			// 			return false;
			// 		}

			// 		if (link.endsWith('.pdf')) {
			// 			return false;
			// 		}

			// 		return true;
			// 	})
			// 	.map((item: any) => item.link)
			// 	.slice(0, 6); // Crawl fewer links in quick mode for speed

			// console.log(
			// 	`Found ${links.length} URLs to crawl in quick mode`
			// );
			let links: any[] = [];
			links = await perplexityService.getCompletion(
				`Given the blog title "${title}" and the primary keyword "${primaryKeyword}", provice sourced links for the blog post. Only provide the links, no other text. top 5 only`
			);

			if (links.length >= 1) {
				// Crawl URLs
				console.log('Starting to crawl URLs...');
				const crawlStartTime = Date.now();

				const crawlResults = await Promise.allSettled(
					links
						.slice(0, 3)
						.map(
							async (
								link: string,
								index: number
							) => {
								try {
									console.log(
										`[${index + 1}/${
											links.length
										}] Crawling:`,
										link
									);
									const crawlApiUrl =
										'https://bloggr.ai:3013/crawl';

									const httpsAgentData =
										new https.Agent({
											rejectUnauthorized:
												false,
										});

									const form =
										new FormData();
									form.append(
										'user_id',
										threadId
									);
									form.append('urls', link);

									const crawlResponse =
										await axios.post(
											crawlApiUrl,
											form,
											{
												headers: {
													'Content-Type':
														'multipart/form-data',
													Authorization: `Bearer ${token}`,
												},
												httpsAgent:
													httpsAgentData,
												// timeout: 45000, // 45 seconds (faster than normal mode)
											}
										);

									if (
										crawlResponse.status !==
										200
									) {
										console.error(
											`[${
												index +
												1
											}] Failed with status ${
												crawlResponse.status
											}`
										);
										return null;
									}

									console.log(
										`[${
											index + 1
										}] Successfully crawled:`,
										link
									);
									return crawlResponse.data;
								} catch (error: any) {
									console.error(
										`[${
											index + 1
										}] Error crawling:`,
										error.message
									);
									return null;
								}
							}
						)
				);

				const crawlTotalTime = Date.now() - crawlStartTime;
				console.log(`Total crawling time: ${crawlTotalTime}ms`);

				const successfulCrawls = crawlResults.filter(
					(result) =>
						result.status === 'fulfilled' &&
						result.value !== null
				).length;

				console.log(
					`Successfully crawled ${successfulCrawls} out of ${links.length} URLs`
				);

				// If we got at least 2 successful crawls, try to generate with them
				if (successfulCrawls >= 2) {
					console.log(
						'Generating outline with crawled data...'
					);

					const generateOutlineApiUrl =
						'https://bloggr.ai:3013/process';
					const httpsAgentData = new https.Agent({
						rejectUnauthorized: false,
					});

					const formProcess = new FormData();
					formProcess.append('user_id', threadId);
					formProcess.append('language', 'English');
					formProcess.append(
						'primary_keyword',
						primaryKeyword
					); // ✅ Using researched keyword
					formProcess.append('title', title); // ✅ Using generated title
					formProcess.append('include_crawled', 'true');
					formProcess.append(
						'secondary_keywords',
						secondaryKeywords.join(', ')
					); // ✅ Using researched keywords

					const generateOutlineResponse = await axios.post(
						generateOutlineApiUrl,
						formProcess,
						{
							headers: {
								...formProcess.getHeaders(),
								Authorization: `Bearer ${token}`,
							},
							httpsAgent: httpsAgentData,
							timeout: 90000, // 90 seconds
						}
					);

					console.log(
						'Outline API response status:',
						generateOutlineResponse.status
					);

					const outlineData =
						generateOutlineResponse.data
							?.outline_generation?.outline_data;

					// Check if outline generation was successful
					if (
						outlineData &&
						!outlineData.error &&
						outlineData.message !==
							'Insufficient or irrelevant context' &&
						outlineData.parsed_outline
					) {
						console.log(
							'✅ Outline generated successfully with web research'
						);
						crawlSuccessful = true;

						// Store data with researched keywords
						const dataToSave = {
							outline: outlineData.parsed_outline,
							title: title,
							primary_keywords: primaryKeyword,
							secondary_keywords:
								secondaryKeywords.join(', '), // ✅ Store researched keywords
							links: [],
							brandVoice:
								'- To proceed with the analysis in the requested format, please provide key details or a summary about the brand. This may include:\r\n- Mission and vision of the brand\r\n- Description of products or services\r\n- Target market or audience\r\n- Tone and style of communication\r\n- Distinguishing features or traits\r\n- With this information, I can then craft a comprehensive brand voice description for you.',
							aiPersona:
								'H1: Best AI Tools for Writing SEO-Rich Blog Content\n\nH2: TL;DR\n\nH2: Introduction\n\nH2: Why Use AI Tools for SEO Blog Writing?\n\nH2: Key Features to Look for in AI SEO Blog Tools\n(Add 5-6 Key Features)\n\nH2: 5 Best AI Tools for Writing SEO-Rich Blog Content in 2025\nH3s:\nBloggr.AI\nJasper AI\nWritesonic\nCopy.ai\nNeuralText\n\nH3: Conclusion',
							model: 'Gemini-2.5 Flash',
							language: 'English',
							user_id: threadId,
						};

						updateThreadObject(threadId, dataToSave);

						console.log(
							'========================================'
						);
						console.log(
							'✅ QUICK MODE: Complete with full research'
						);
						console.log(
							'   Primary Keyword:',
							primaryKeyword
						);
						console.log(
							'   Secondary Keywords:',
							secondaryKeywords.join(', ')
						);
						console.log('   Title:', title);
						console.log(
							'========================================'
						);

						return {
							success: true,
							outline_generation: {
								outline_data: {
									parsed_outline:
										outlineData.parsed_outline,
								},
							},
							thread_id: threadId,
							research_used: true,
							primary_keyword: primaryKeyword,
							title: title,
						};
					}
				}
			}
			// }
		} catch (crawlError: any) {
			console.error('═══ CRAWL/OUTLINE ERROR DETAILS ═══');
			console.error('Error message:', crawlError.message);
			console.error('Status code:', crawlError.response?.status);
			console.error(
				'Status text:',
				crawlError.response?.statusText
			);
			console.error('Response data:', crawlError.response?.data);
			console.error('Request URL:', crawlError.config?.url);
			console.error('Request method:', crawlError.config?.method);
			console.error('═══════════════════════════════════');
		}

		// ============================================================
		// FALLBACK: If crawling fails or doesn't work, use OpenAI only
		// ============================================================

		console.log(crawlSuccessful, 'CrawlSuccessful');

		if (!crawlSuccessful) {
			console.log(
				'📋 Generating outline with OpenAI only (no web research)...'
			);
			const outlineContent =
				await openaiService.generateOutlineFromTopic(
					topic,
					title,
					primaryKeyword
				);

			console.log('Outline generated successfully (AI-only mode)');

			// Parse outline string to array
			let parsedOutline;
			try {
				parsedOutline = JSON.parse(outlineContent);
			} catch (parseError) {
				console.error(
					'Failed to parse outline JSON:',
					parseError
				);
				throw new Error('Invalid outline format from OpenAI');
			}

			// Store data with researched keywords (even in fallback)
			const dataToSave = {
				outline: parsedOutline, // ✅ Store as array, not string
				title: title,
				primary_keywords: primaryKeyword,
				secondary_keywords: secondaryKeywords.join(', '), // ✅ Store researched keywords
				links: [],
				brandVoice:
					'- To proceed with the analysis in the requested format, please provide key details or a summary about the brand. This may include:\r\n- Mission and vision of the brand\r\n- Description of products or services\r\n- Target market or audience\r\n- Tone and style of communication\r\n- Distinguishing features or traits\r\n- With this information, I can then craft a comprehensive brand voice description for you.',
				aiPersona:
					'H1: Best AI Tools for Writing SEO-Rich Blog Content\n\nH2: TL;DR\n\nH2: Introduction\n\nH2: Why Use AI Tools for SEO Blog Writing?\n\nH2: Key Features to Look for in AI SEO Blog Tools\n(Add 5-6 Key Features)\n\nH2: 5 Best AI Tools for Writing SEO-Rich Blog Content in 2025\nH3s:\nBloggr.AI\nJasper AI\nWritesonic\nCopy.ai\nNeuralText\n\nH3: Conclusion',
				model: 'Gemini-2.5 Flash',
				language: 'English',
				user_id: threadId,
			};

			updateThreadObject(threadId, dataToSave);

			console.log('========================================');
			console.log('✅ QUICK MODE: Complete with AI fallback');
			console.log('   Primary Keyword:', primaryKeyword);
			console.log(
				'   Secondary Keywords:',
				secondaryKeywords.join(', ')
			);
			console.log('   Title:', title);
			console.log('========================================');

			return {
				success: true,
				outline_generation: {
					outline_data: {
						parsed_outline: parsedOutline, // ✅ Return array, not string
					},
				},
				thread_id: threadId,
				research_used: false,
				primary_keyword: primaryKeyword,
				title: title,
			};
		}
	} catch (error: any) {
		console.error('========================================');
		console.error('ERROR in Quick Mode:', error);
		console.error('ThreadId was:', threadId);
		console.error('========================================');
		throw error;
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
	console.log('blogdrafrt obj:', blogDraftObj);

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

export const show_interlinking_ui = async (): Promise<any> => {
	console.log('Triggered show_interlinking_ui');
	return {
		success: true,
		message: 'UI component displayed for interlinking input',
	};
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
			model: 'Gemini-2.5 Flash',
			language: 'English',
			user_id: threadId,
		});
		return 'success';
	} catch (error: any) {
		console.error('ERROR:', error);
	}
};

export const createBlogData = async (threadId: string): Promise<any> => {
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
	console.log(blogDraftObj, 'blogDraftObj');

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
