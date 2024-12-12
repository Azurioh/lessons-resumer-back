import express, { type Request, type Response } from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import authRouter from './routers/auth-router';
import userRouter from './routers/user-router';
import authMiddleware from './middlewares/auth-middleware';
import summarizeRouter from './routers/summarize-router';
import multer from 'multer';
import { v4 } from 'uuid';

dotenv.config();

const storage = multer.diskStorage({
  destination: (_, __, cb) => {
    cb(null, 'app/data/pdfs');
  },
  filename: (_, __, cb) => {
    cb(null, `${v4()}.pdf`);
  },
});

const upload = multer({ storage });

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
app.use('/users', authMiddleware, userRouter);
app.use('/summarizes', authMiddleware, upload.single('file'), summarizeRouter);

app.get('*', (_: Request, res: Response) => {
  res.status(404).send('Not Found');
});
