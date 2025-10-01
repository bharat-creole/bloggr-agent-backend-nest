import assistantService from '../../ai/llm/openai/assistants/assistantService';
import {
  addInterlinkingData,
  chatbotService,
  createBlogData,
  findKeywordInfoData,
  getBlogData,
  getPrimaryKeywordData,
  getReferenceOutlineData,
  getRegeneratedOutlineData,
  getTitleData,
  setPrimarySecondaryKeywordData
} from '../../ai/chatbot/chatbotService';
import type { NextFunction, Request, Response } from 'express';
const assistantservice = new assistantService();

export const getAllThreads = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  try {
    const userId = req.query.userId;

    if (!userId) {
      return res.status(400).json({ message: 'userId is required' });
    }

    const threads = await assistantservice.getAllThreadById(userId as string);
    return res.status(200).json({
      message: 'success',
      data: threads
    });
  } catch (err) {
    console.error('Error while fetching threads:', err);
    next(err);
  }
};

export const chatAIChatbot = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  try {
    const chatbotResponse = chatbotService(req, res);

    return res.status(200).json({
      message: 'Chatbot response received',
      gptresponse: chatbotResponse
    });
  } catch (err) {
    console.error('Error while creating chatbot:', err);
    next(err);
  }
};

export const createAssistants = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  try {
    const createAssistant = assistantservice.createAssistants();
    return res.status(200).json({
      message: 'success',
      data: createAssistant
    });
  } catch (err) {
    console.error('Error while saving static server metrics:', err);
    next(err);
  }
};

export const createAssistantThread = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  try {
    const { userId, messageName } = req.body;
    const createThread = await assistantservice.createAssistantThread(userId, messageName);
    return res.status(200).json({
      message: 'success',
      data: createThread
    });
  } catch (err) {
    console.error('Error', err);
    next(err);
  }
};

export const getAssistantMessages = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  try {
    await assistantservice.getAssistantMessages(req, res);
  } catch (err) {
    console.error('Error :', err);
    next(err);
  }
};

export const getAssistantActions = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  try {
    await assistantservice.getAssistantActions(req, res);
  } catch (err) {
    console.error('Error ', err);
    next(err);
  }
};

export const getThreadHistory = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  try {
    const { threadId } = req.params as { threadId: string };
    if (!threadId) {
      return res.status(400).json({ message: 'threadId is required' });
    }
    const history = await assistantservice.getThreadHistory(threadId);
    return res.status(200).json({ message: 'success', data: history });
  } catch (err) {
    console.error('Error while fetching thread history:', err);
    next(err);
  }
};

export const getPrimaryKeyword = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  try {
    const { keyword, country, reference_meaning } = req.body;
    const primaryKeyword = await getPrimaryKeywordData(keyword, 'United States', reference_meaning);
    return res.status(200).json({
      message: 'success',
      data: primaryKeyword
    });
  } catch (err: any) {
    console.error('Error ', err.message);
    next(err);
  }
};

export const setPrimarySecondaryKeyword = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  try {
    const { primaryKeyword, secondaryKeyword } = req.body;
    const setPrimarySecondaryKeyword = await setPrimarySecondaryKeywordData(primaryKeyword, secondaryKeyword);
    return res.status(200).json({
      message: 'success',
      data: setPrimarySecondaryKeyword
    });
  } catch (err) {
    console.error('Error ', err);
    next(err);
  }
};

export const findKeywordInfo = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  try {
    const { keywords } = req.body;
    const findKeywordInfo = await findKeywordInfoData(keywords);
    return res.status(200).json({
      message: 'success',
      data: findKeywordInfo
    });
  } catch (err) {
    console.error('Error ', err);
    next(err);
  }
};

export const getTitle = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  try {
    const { topic, primaryKeyword } = req.body;
    const title = await getTitleData(topic, primaryKeyword);
    return res.status(200).json({
      message: 'success',
      data: title
    });
  } catch (err) {
    console.error('Error ', err);
    next(err);
  }
};

export const getReferenceOutline = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  try {
    const { title, primaryKeyword, threadId } = req.body;
    const referenceOutline = await getReferenceOutlineData(title, primaryKeyword, threadId);
    return res.status(200).json({
      message: 'success',
      data: referenceOutline
    });
  } catch (err) {
    console.error('Error ', err);
    next(err);
  }
};

export const getRegeneratedOutline = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  try {
    const { threadId, feedback } = req.body;
    const regeneratedOutline = await getRegeneratedOutlineData(threadId, feedback);
    return res.status(200).json({
      message: 'success',
      data: regeneratedOutline
    });
  } catch (err) {
    console.error('Error ', err);
    next(err);
  }
};

export const addInterlinking = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  try {
    const { links, threadId } = req.body;
    const interlinking = await addInterlinkingData(links, threadId);
    return res.status(200).json({
      message: 'success',
      data: interlinking
    });
  } catch (err) {
    console.error('Error ', err);
    next(err);
  }
};

export const createBlog = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  try {
    const { threadId } = req.body;
    const blog = await createBlogData(threadId);
    if (blog.message === 'failed') {
      return res.status(400).json({
        message: 'failed',
        data: blog
      });
    }
    return res.status(200).json({
      message: 'success',
      data: blog
    });
  } catch (err) {
    console.error('Error ', err);
    next(err);
  }
};

export const getBlog = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  try {
    const { threadId } = req.body;
    const blog = await getBlogData(threadId);

    return res.status(200).json({
      message: 'success',
      data: blog
    });
  } catch (err) {
    console.error('Error ', err);
    next(err);
  }
};
