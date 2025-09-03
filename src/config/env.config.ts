import dotenv from 'dotenv';

dotenv.config();

class Config {
	public NODE_ENV: string | undefined;
	public PORT: number | undefined;
	public REDIS_HOST: string | undefined;
	public REDIS_PASSWORD: string | undefined;
	public REDIS_USERNAME: string | undefined;
	public REDIS_PORT: string | undefined;

	constructor() {
		this.NODE_ENV = process.env.NODE_ENV;
		this.PORT = Number(process.env.PORT || '3000');
		this.REDIS_HOST = process.env.REDIS_HOST;
		this.REDIS_PASSWORD = process.env.REDIS_PASSWORD;
		this.REDIS_USERNAME = process.env.REDIS_USERNAME;
		this.REDIS_PORT = process.env.REDIS_PORT;
	}

	public validateConfig(): void {
		for (const [key, value] of Object.entries(this)) {
			if (value === undefined) {
				throw new Error(`Configuration ${key} is undefined.`);
			}
		}
	}
}

export const ENVConfig: Config = new Config();
