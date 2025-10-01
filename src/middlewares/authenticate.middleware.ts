import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../prisma';
import { ENVConfig } from '../config/env.config';

type DecodedToken = {
	userId?: string;
	sub?: string;
	iat?: number;
	exp?: number;
	[key: string]: unknown;
};

export async function authenticate(
	req: Request,
	res: Response,
	next: NextFunction,
): Promise<void> {
	const authHeader = req.headers.authorization;

	if (!authHeader) {
		res.status(401).json({ error: 'Unauthorized' });
		return;
	}

	const parts = authHeader.split(' ');
	const token = parts.length === 2 ? parts[1] : undefined;

	if (!token) {
		res.status(401).json({ error: 'Unauthorized' });
		return;
	}

	try {
		const decoded = jwt.verify(
			token,
			ENVConfig.JWT_SECRET_KEY as string,
		) as DecodedToken;
		const userId = (decoded.userId as string) || (decoded.sub as string);

		if (!userId) {
			res.status(401).json({ error: 'Invalid token payload' });
			return;
		}

		(req as Request & { userId?: string }).userId = userId;

		const user = await (
			prisma as unknown as {
				users: {
					update: (args: {
						where: { id: string };
						data: { lastActiveAt: Date };
					}) => Promise<{ email: string | null; username: string | null }>;
				};
			}
		).users.update({
			where: { id: userId },
			data: { lastActiveAt: new Date() },
		});

		next();
	} catch (error) {
		res.status(401).json({ error: (error as Error).message });
	}
}
