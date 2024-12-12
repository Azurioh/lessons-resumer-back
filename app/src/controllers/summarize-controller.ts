import type { CreateSummarizeData, PollSummarizeData, UpdateSummarizeData } from '@src/entities/summarize';
import type { GetUserByIdQueryType } from '@src/entities/users';
import type { SummarizeService } from '@src/services/summarize-service';
import type { Request, Response } from 'express';
import fs from 'node:fs';

export class SummarizeController {
  public summarizeService: SummarizeService;

  constructor(summarizeService: SummarizeService) {
    this.summarizeService = summarizeService;
  }

  getAllSummarizes = async (req: Request & { user: GetUserByIdQueryType }, res: Response): Promise<void> => {
    const user = req.user;

    try {
      const summarizes = await this.summarizeService.getAllSummarizes(undefined, { userId: user.id });

      res.status(200).json({ data: summarizes });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal server error' });
    }
  };

  getSummarizeById = async (req: Request & { user: GetUserByIdQueryType }, res: Response): Promise<void> => {
    let id: number;
    try {
      id = Number(req.params.id);
    } catch (err) {
      console.error(err);
      res.status(400).json({ error: 'Invalid path parameter: id' });
      return;
    }

    try {
      const summarize = await this.summarizeService.getSummarizeById(id);

      if (summarize.userId !== req.user.id) {
        res.status(403).json({ error: 'Unauthorized' });
        return;
      }

      res.status(200).json({ data: summarize });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal server error' });
    }
  };

  createSummarize = async (req: Request & { user: GetUserByIdQueryType }, res: Response) => {
    const data: CreateSummarizeData = req.body;
    const user = req.user;

    try {
      if (!fs.existsSync(data.pdf_file)) {
        res.status(400).json({ error: 'Invalid body: pdf_file' });
      }

      const summarize = await this.summarizeService.createSummarize(user.id, data);

      res.status(201).json({ data: summarize });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal server error' });
    }
  };

  startSummarizeExtraction = async (req: Request, res: Response): Promise<void> => {
    let pdfPath: string | undefined;

    try {
      if (!req.file) {
        res.status(400).json({ error: 'No file uploaded' });
        return;
      }
      const formData = new FormData();

      const pdfPath = req.file.path;
      const fileContent = fs.readFileSync(pdfPath);

      const fileContentBlob = new Blob([fileContent], { type: 'application/pdf' });

      formData.append('file', fileContentBlob, 'file.pdf');

      const response: any = await this.summarizeService.startSummarizeExtraction(formData);

      if (!response?.data?.requestId) {
        res.status(500).json({ error: 'Failed to start extraction' });
        fs.unlinkSync(pdfPath);
        return;
      }

      res.status(201).json(response);
    } catch (err) {
      console.error(err);
      if (pdfPath) {
        fs.unlinkSync(pdfPath);
      }
      res.status(500).json({ error: 'Internal server error' });
    }
  };

  pollSummarizeExtraction = async (req: Request, res: Response): Promise<void> => {
    const data: PollSummarizeData = req.body;

    try {
      const response = await this.summarizeService.pollSummarizeExtraction(data.requestId);

      res.status(200).json(response);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal server error' });
    }
  };

  updateSummarize = async (req: Request & { user: GetUserByIdQueryType }, res: Response): Promise<void> => {
    let id: number | undefined;

    try {
      id = Number(req.params.id);
    } catch (err) {
      console.error(err);
      res.status(400).json({ error: 'Invalid path parameter: id' });
      return;
    }

    const data: UpdateSummarizeData = req.body;

    try {
      const summarize = await this.summarizeService.getSummarizeById(id);

      if (summarize.userId !== req.user.id) {
        res.status(403).json({ error: 'Unauthorized' });
        return;
      }
    } catch (err) {
      console.error(err);
      res.status(404).json({ error: 'Summarize not found' });
    }

    try {
      const updatedSummarize = await this.summarizeService.updateSummarize(id, data);

      res.status(200).json({ data: updatedSummarize });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal server error' });
    }
  };

  deleteSummarize = async (req: Request & { user: GetUserByIdQueryType }, res: Response): Promise<void> => {
    let id: number | undefined;

    try {
      id = Number(req.params.id);
    } catch (err) {
      console.error(err);
      res.status(400).json({ error: 'Invalid path parameter: id' });
      return;
    }

    try {
      const summarize = await this.summarizeService.getSummarizeById(id);

      if (summarize.userId !== req.user.id) {
        res.status(403).json({ error: 'Unauthorized' });
        return;
      }
    } catch (err) {
      console.error(err);
      res.status(404).json({ error: 'Summarize not found' });
    }

    try {
      await this.summarizeService.deleteSummarize(id);

      res.status(204).send();
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal server error' });
    }
  };
}
