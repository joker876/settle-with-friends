import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment } from '../typeorm/entities';
import { CreatePaymentRequestDto } from './dtos/create';
import { UpdatePaymentRequestDto } from './dtos/update';

@Injectable()
export class PaymentsService {
  constructor(@InjectRepository(Payment) private readonly paymentRepo: Repository<Payment>) {}

  async getAllForReckoning(id: number): Promise<Payment[]> {
    return this.paymentRepo.find({
      where: {
        reckoning: { id },
      },
      order: {
        paymentDate: 'ASC',
        createdDate: 'ASC',
      },
    });
  }

  async getRecentForReckoning(id: number): Promise<Payment[]> {
    return this.paymentRepo.find({
      where: {
        reckoning: { id },
      },
      order: {
        updatedDate: 'DESC',
      },
      take: 5,
    });
  }

  async getById(reckoningId: number, paymentId: number): Promise<Payment> {
    const pmnt = await this.paymentRepo.findOne({
      where: {
        id: paymentId,
        reckoning: { id: reckoningId },
      },
    });
    if (!pmnt) {
      throw new NotFoundException('Payment not found');
    }
    return pmnt;
  }

  async createPayment(reckoningId: number, userId: number, paymentData: CreatePaymentRequestDto): Promise<Payment> {
    const pmnt = this.paymentRepo.create({
      ...paymentData,
      createdByUserId: userId,
      updatedByUserId: userId,
      reckoning: { id: reckoningId } as any,
    });

    const savedPmnt = await this.paymentRepo.save(pmnt);

    return (await this.paymentRepo.findOne({
      where: { id: savedPmnt.id },
    }))!;
  }

  async updatePayment(
    reckoningId: number,
    paymentId: number,
    userId: number,
    paymentData: UpdatePaymentRequestDto,
  ): Promise<Payment> {
    const pmnt = await this.paymentRepo.findOne({
      where: { id: paymentId, reckoning: { id: reckoningId } },
    });
    if (!pmnt) {
      throw new NotFoundException('Payment not found');
    }

    Object.assign(pmnt, paymentData);
    pmnt.updatedByUserId = userId;
    const savedPmnt = await this.paymentRepo.save(pmnt);

    return (await this.paymentRepo.findOne({
      where: { id: savedPmnt.id },
    }))!;
  }

  async deletePayment(reckoningId: number, paymentId: number): Promise<void> {
    const pmnt = await this.paymentRepo.findOne({
      where: { id: paymentId, reckoning: { id: reckoningId } },
    });
    if (!pmnt) {
      throw new NotFoundException('Payment not found');
    }
    if (pmnt.createdByUserId )

    await this.paymentRepo.remove(pmnt);
  }
}
