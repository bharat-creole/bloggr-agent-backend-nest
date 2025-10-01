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
  getAllThreads,
  getThreadHistory
} from '../../controllers/chatbot/ai-chabot.controller';

import express from 'express';
import { authenticate } from '../../middlewares/authenticate.middleware';

const staticChatbotRouter = express.Router();

// get all threads
staticChatbotRouter.get('/assistants/threads', authenticate, getAllThreads);

staticChatbotRouter.post('/chat', authenticate, chatAIChatbot);

// create assistants
staticChatbotRouter.post('/assistants', authenticate, createAssistants);

// create threads
staticChatbotRouter.post('/assistants/threads', authenticate, createAssistantThread);

// get thread history
staticChatbotRouter.get('/assistants/threads/:threadId/history', authenticate, getThreadHistory);

// messages
staticChatbotRouter.post('/assistants/threads/:threadId/messages', authenticate, getAssistantMessages);

// actions
staticChatbotRouter.post('/assistants/threads/:threadId/actions', authenticate, getAssistantActions);

// *********** function Calling Api ***********

// static function call
staticChatbotRouter.post('/assistants/actions/callstatic', authenticate, () => {});

// dynamic function call
staticChatbotRouter.post('/assistants/actions/calldynamic', authenticate, () => {});

// usage function call
staticChatbotRouter.post('/assistants/actions/callusage', authenticate, () => {});

// get primary keyword
staticChatbotRouter.post('/assistants/actions/get_primary_keyword', authenticate, getPrimaryKeyword);

// set primary secondary keyword
staticChatbotRouter.post('/assistants/actions/set_primary_secondary_keyword', authenticate, setPrimarySecondaryKeyword);

// find keyword info
staticChatbotRouter.post('/assistants/actions/find_keyword_info', authenticate, findKeywordInfo);

// get title
staticChatbotRouter.post('/assistants/actions/get_title', authenticate, getTitle);

// get reference outline
staticChatbotRouter.post('/assistants/actions/get_reference_outline', authenticate, getReferenceOutline);

// get regenerated outline
staticChatbotRouter.post('/assistants/actions/get_regenerated_outline', authenticate, getRegeneratedOutline);

// add interlinking
staticChatbotRouter.post('/assistants/actions/add_interlinking', authenticate, addInterlinking);

// create blog
staticChatbotRouter.post('/assistants/actions/create_blog', authenticate, createBlog);

// get blog
staticChatbotRouter.post('/assistants/actions/get_blog', authenticate, getBlog);

export default staticChatbotRouter;
