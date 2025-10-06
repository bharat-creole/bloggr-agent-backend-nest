import { get } from 'http';
import {
	chatAIChatbot,
	createAssistants,
	createAssistantThread,
	getAssistantActions,
	getAssistantMessages,
	getPrimaryKeyword,
	getTitle,
	getReferenceOutline,
	addInterlinking,
	createBlog,
	getBlog,
	setPrimarySecondaryKeyword,
	findKeywordInfo,
	getRegeneratedOutline,
	getQuickModeOutlineHandler,
	generateAutoKeywords,
	generateAutoTitle,

} from '../../controllers/chatbot/ai-chabot.controller';

import express from 'express';

const staticChatbotRouter = express.Router();

staticChatbotRouter.post('/chat', chatAIChatbot);

// create assistants
staticChatbotRouter.post('/assistants', createAssistants);

// create threads
staticChatbotRouter.post('/assistants/threads', createAssistantThread);

// messages
staticChatbotRouter.post(
	'/assistants/threads/:threadId/messages',
	getAssistantMessages
);

// actions
staticChatbotRouter.post(
	'/assistants/threads/:threadId/actions',
	getAssistantActions
);

// *********** function Calling Api ***********

// static function call
staticChatbotRouter.post('/assistants/actions/callstatic', () => {});

// dynamic function call
staticChatbotRouter.post('/assistants/actions/calldynamic', () => {});

// usage function call
staticChatbotRouter.post('/assistants/actions/callusage', () => {});

// get primary keyword
staticChatbotRouter.post(
	'/assistants/actions/get_primary_keyword',
	getPrimaryKeyword
);

// set primary secondary keyword
staticChatbotRouter.post(
	'/assistants/actions/set_primary_secondary_keyword',
	setPrimarySecondaryKeyword
);

// find keyword info
staticChatbotRouter.post(
	'/assistants/actions/find_keyword_info',
	findKeywordInfo
);

// get title
staticChatbotRouter.post('/assistants/actions/get_title', getTitle);

// get reference outline
staticChatbotRouter.post(
	'/assistants/actions/get_reference_outline',
	getReferenceOutline
);
// ADD THIS NEW ROUTE (add it after get_reference_outline)
staticChatbotRouter.post(
	'/assistants/actions/get_quick_mode_outline',
	getQuickModeOutlineHandler
);
// get regenerated outline
staticChatbotRouter.post(
	'/assistants/actions/get_regenerated_outline',
	getRegeneratedOutline
);

// add interlinking
staticChatbotRouter.post(
	'/assistants/actions/add_interlinking',
	addInterlinking
);
staticChatbotRouter.post(
  '/assistants/actions/generate_auto_keywords',
  generateAutoKeywords
);

// Auto title selection (for mid-conversation auto-handling)
staticChatbotRouter.post(
  '/assistants/actions/generate_auto_title',
  generateAutoTitle
);
// create blog
staticChatbotRouter.post('/assistants/actions/create_blog', createBlog);

// get blog
staticChatbotRouter.post('/assistants/actions/get_blog', getBlog);

export default staticChatbotRouter;
