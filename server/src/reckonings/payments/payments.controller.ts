import { Body, Controller, Delete, Get, Inject, Param, ParseIntPipe, Post, Put, Req } from '@nestjs/common';
import { IPayment } from '@shared/entities/payment';
import { Request } from 'express';
import { ReckoningAccess } from '../reckoning-access.guard';
import { CreatePaymentRequestDto } from './dtos/create';
import { UpdatePaymentRequestDto } from './dtos/update';
import { PaymentsService } from './payments.service';

@Controller('reckonings/:reckoningId/payments')
@ReckoningAccess()
export class PaymentsController {
  constructor(@Inject() private readonly paymentsService: PaymentsService) {}

  @Get()
  async getAll(@Param('reckoningId', ParseIntPipe) reckoningId: number): Promise<IPayment[]> {
    return this.paymentsService.getAllForReckoning(reckoningId);
  }

  @Post()
  async createPayment(
    @Req() req: Request,
    @Param('reckoningId', ParseIntPipe) reckoningId: number,
    @Body() paymentData: CreatePaymentRequestDto,
  ): Promise<IPayment> {
    const userId = req.user!.id;

    return this.paymentsService.createPayment(reckoningId, userId, paymentData);
  }

  @Put(':paymentId')
  async updatePayment(
    @Req() req: Request,
    @Param('reckoningId', ParseIntPipe) reckoningId: number,
    @Param('paymentId', ParseIntPipe) paymentId: number,
    @Body() paymentData: UpdatePaymentRequestDto,
  ): Promise<IPayment> {
    const userId = req.user!.id;

    return this.paymentsService.updatePayment(reckoningId, paymentId, userId, paymentData);
  }

  @Delete(':paymentId')
  async deletePayment(
    @Param('reckoningId', ParseIntPipe) reckoningId: number,
    @Param('paymentId', ParseIntPipe) paymentId: number,
  ): Promise<void> {
    await this.paymentsService.deletePayment(reckoningId, paymentId);
  }
}
