import { SummarizeController } from '@src/controllers/summarize-controller';
import { pollSummarizeSchema, updateSummarizeSchema } from '@src/entities/summarize';
import authMiddleware from '@src/middlewares/auth-middleware';
import requestValidator from '@src/middlewares/request-validator';
import { SummarizeRepository } from '@src/repositories/summarize-repository';
import { SummarizeService } from '@src/services/summarize-service';
import express from 'express';

const summarizeRouter = express.Router();

const summarizeRepository = new SummarizeRepository();
const summarizeService = new SummarizeService(summarizeRepository);
const summarizeController = new SummarizeController(summarizeService);

summarizeRouter.get('/', authMiddleware, summarizeController.getAllSummarizes);
summarizeRouter.get('/:id', authMiddleware, summarizeController.getSummarizeById);
summarizeRouter.post('/', authMiddleware, summarizeController.createSummarize);
summarizeRouter.post('/extraction', authMiddleware, summarizeController.startSummarizeExtraction);
summarizeRouter.post(
  '/extraction/poll',
  authMiddleware,
  requestValidator(pollSummarizeSchema),
  summarizeController.pollSummarizeExtraction,
);
summarizeRouter.put(
  '/:id',
  authMiddleware,
  requestValidator(updateSummarizeSchema),
  summarizeController.updateSummarize,
);
summarizeRouter.delete('/:id', authMiddleware, summarizeController.deleteSummarize);

export default summarizeRouter;
