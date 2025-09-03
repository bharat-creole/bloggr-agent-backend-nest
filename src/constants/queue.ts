import { type ConnectionOptions, Queue } from 'bullmq';
import { ENVConfig } from '../config/env.config';

export const redisConfigForQueue: ConnectionOptions = {
	host: ENVConfig.REDIS_HOST,
	port: Number(ENVConfig.REDIS_PORT),
	password: ENVConfig.REDIS_PASSWORD,
	username: ENVConfig.REDIS_USERNAME,
	maxRetriesPerRequest: null,
};
