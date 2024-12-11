import express, { type Request, type Response } from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import authRouter from './routers/auth-router';

dotenv.config();

export const app = express();
export const prisma = new PrismaClient();

app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

app.get('/', (_: Request, res: Response) => {
  res.status(200).send('Hello World');
});

app.use('/auth', authRouter);

app.get('*', (_: Request, res: Response) => {
  res.status(404).send('Not Found');
});
