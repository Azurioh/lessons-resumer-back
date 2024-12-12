import type { Prisma } from '@prisma/client';
import type { SummarizeRepository } from '@src/repositories/summarize-repository';

export class SummarizeService {
  public summarizeRepository: SummarizeRepository;

  constructor(summarizeRepository: SummarizeRepository) {
    this.summarizeRepository = summarizeRepository;
  }

  async getAllSummarizes(include?: Prisma.SummarizeInclude, where?: Prisma.SummarizeWhereInput) {
    return await this.summarizeRepository.getAllSummarizes(include, where);
  }

  async getSummarizeById(id: number, include?: Prisma.SummarizeInclude) {
    return await this.summarizeRepository.getSummarizeById(id, include);
  }

  async createSummarize(userId: string, data: Prisma.SummarizeCreateInput) {
    return await this.summarizeRepository.createSummarize(userId, data);
  }

  async updateSummarize(id: number, data: Prisma.SummarizeUpdateInput) {
    return await this.summarizeRepository.updateSummarize(id, data);
  }

  async deleteSummarize(id: number) {
    return await this.summarizeRepository.deleteSummarize(id);
  }

  async startSummarizeExtraction(formData: any) {
    return await this.summarizeRepository.startSummarizeExtraction(formData);
  }

  async pollSummarizeExtraction(requestId: string) {
    return await this.summarizeRepository.pollSummarizeExtraction(requestId);
  }
}
