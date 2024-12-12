import type { Prisma } from '@prisma/client';
import { prisma } from '@src/global';

export class SummarizeRepository {
  async getAllSummarizes(include?: Prisma.SummarizeInclude, where?: Prisma.SummarizeWhereInput) {
    return await prisma.summarize.findMany({
      include: { ...include },
      where: { ...where },
    });
  }

  async getSummarizeById(id: number, include?: Prisma.SummarizeInclude) {
    return await prisma.summarize.findUniqueOrThrow({
      where: { id },
      include: { ...include },
    });
  }

  async createSummarize(userId: string, data: Prisma.SummarizeCreateInput) {
    return prisma.summarize.create({
      data: {
        ...data,
        user: { connect: { id: userId } },
      },
    });
  }

  async updateSummarize(id: number, data: Prisma.SummarizeUpdateInput) {
    return await prisma.summarize.update({
      where: { id },
      data,
    });
  }

  async deleteSummarize(id: number) {
    return await prisma.summarize.delete({
      where: { id },
    });
  }

  async startSummarizeExtraction(formData: any) {
    const AI_URL = process.env.AI_URL;

    if (!AI_URL) {
      console.error('AI_URL is not defined in the environment');
      throw new Error('AI_URL is not defined in the environment');
    }

    try {
      const response = await fetch(`${AI_URL}/summarize`, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        return data;
      }
      return null;
    } catch (err) {
      console.error('Error while calling AI service', err);
      throw new Error('Error while calling AI service');
    }
  }

  async pollSummarizeExtraction(requestId: string) {
    const AI_URL = process.env.AI_URL;

    if (!AI_URL) {
      console.error('AI_URL is not defined in the environment');
      throw new Error('AI_URL is not defined in the environment');
    }

    try {
      const response = await fetch(`${AI_URL}/poll_summarize`, {
        method: 'POST',
        body: JSON.stringify({ requestId }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        return data;
      }
      return null;
    } catch (err) {
      console.error('Error while calling AI service', err);
      throw new Error('Error while calling AI service');
    }
  }
}
