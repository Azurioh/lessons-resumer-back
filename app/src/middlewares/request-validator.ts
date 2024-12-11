import { AjvService } from '@services/ajv-service';
import type { Request, Response, NextFunction } from 'express';

const requestValidator = (schema: any) => {
  const ajvService = new AjvService();

  return (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.body) {
        res.status(400).json({ err: 'No body provided.' });
        return;
      }

      ajvService.validate(req.body, schema);

      next();
    } catch (err) {
      console.error(err);
      res.status(400).json({ err: 'Invalid request body.' });
      return;
    }
  };
};

export default requestValidator;
