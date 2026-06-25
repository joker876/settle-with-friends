import { Body, Controller, Delete, Get, Inject, Param, ParseIntPipe, Post, Put, Req } from '@nestjs/common';
import { Request } from 'express';
import { ReckoningAccess } from '../reckonings/reckoning-access.guard';
import { Payment } from '../typeorm/entities';
import { CreatePaymentRequestDto } from './dtos/create';
import { UpdatePaymentRequestDto } from './dtos/update';
import { PaymentsService } from './payments.service';

@Controller('reckonings/:reckoningId/payments')
@ReckoningAccess()
export class PaymentsController {
  constructor(@Inject() private readonly paymentsService: PaymentsService) {}

  @Get()
  async getAll(@Param('reckoningId', ParseIntPipe) reckoningId: number): Promise<Payment[]> {
    return this.paymentsService.getAllForReckoning(reckoningId);
  }

  @Get('recent')
  async getRecent(@Param('reckoningId', ParseIntPipe) reckoningId: number): Promise<Payment[]> {
    return this.paymentsService.getRecentForReckoning(reckoningId);
  }

  @Get(':paymentId')
  async getById(
    @Param('reckoningId', ParseIntPipe) reckoningId: number,
    @Param('paymentId', ParseIntPipe) paymentId: number,
  ): Promise<Payment> {
    return this.paymentsService.getById(reckoningId, paymentId);
  }

  @Post()
  async createPayment(
    @Req() req: Request,
    @Param('reckoningId', ParseIntPipe) reckoningId: number,
    @Body() paymentData: CreatePaymentRequestDto,
  ): Promise<Payment> {
    const userId = req.user!.id;

    return this.paymentsService.createPayment(reckoningId, userId, paymentData);
  }

  @Put(':paymentId')
  async updatePayment(
    @Req() req: Request,
    @Param('reckoningId', ParseIntPipe) reckoningId: number,
    @Param('paymentId', ParseIntPipe) paymentId: number,
    @Body() paymentData: UpdatePaymentRequestDto,
  ): Promise<Payment> {
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
