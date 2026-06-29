import { Inject, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserRole } from '@shared/enums/user-role';
import { Repository } from 'typeorm';
import { Return } from '../../typeorm/entities';
import { ReckoningAccessService } from '../reckonings/reckoning-access.service';
import { CreateReturnRequestDto } from './dtos/create';
import { UpdateReturnRequestDto } from './dtos/update';

@Injectable()
export class ReturnsService {
  constructor(
    @InjectRepository(Return) private readonly returnRepo: Repository<Return>,
    @Inject(ReckoningAccessService) private readonly accessService: ReckoningAccessService,
  ) {}

  async getAllForReckoning(id: number): Promise<Return[]> {
    return this.returnRepo.find({
      where: {
        reckoning: { id },
      },
      order: {
        returnDate: 'ASC',
        createdDate: 'ASC',
      },
    });
  }

  async getRecentForReckoning(id: number): Promise<Return[]> {
    return this.returnRepo.find({
      where: {
        reckoning: { id },
      },
      order: {
        updatedDate: 'DESC',
      },
      take: 5,
    });
  }

  async getById(reckoningId: number, returnId: number): Promise<Return> {
    const rtn = await this.returnRepo.findOne({
      where: {
        id: returnId,
        reckoning: { id: reckoningId },
      },
    });
    if (!rtn) {
      throw new NotFoundException('Return not found');
    }
    return rtn;
  }

  async createReturn(reckoningId: number, userId: number, returnData: CreateReturnRequestDto): Promise<Return> {
    const rtn = this.returnRepo.create({
      ...returnData,
      createdByUserId: userId,
      updatedByUserId: userId,
      reckoning: { id: reckoningId } as any,
    });

    const savedRtn = await this.returnRepo.save(rtn);

    return (await this.returnRepo.findOne({
      where: { id: savedRtn.id },
    }))!;
  }

  async updateReturn(
    reckoningId: number,
    returnId: number,
    userId: number,
    returnData: UpdateReturnRequestDto,
  ): Promise<Return> {
    const rtn = await this.returnRepo.findOne({
      where: { id: returnId, reckoning: { id: reckoningId } },
    });
    if (!rtn) {
      throw new NotFoundException('Return not found');
    }
    if (
      rtn.createdByUserId !== userId &&
      rtn.returnedByUserId !== userId &&
      rtn.returnedToUserId !== userId &&
      !(await this.accessService.isUserAuthorized(reckoningId, userId, UserRole.Admin))
    ) {
      throw new UnauthorizedException('Unauthorized');
    }

    Object.assign(rtn, returnData);
    rtn.updatedByUserId = userId;
    const savedRtn = await this.returnRepo.save(rtn);

    return (await this.returnRepo.findOne({
      where: { id: savedRtn.id },
    }))!;
  }

  async deleteReturn(reckoningId: number, returnId: number, userId: number): Promise<void> {
    const rtn = await this.returnRepo.findOne({
      where: { id: returnId, reckoning: { id: reckoningId } },
    });
    if (!rtn) {
      throw new NotFoundException('Return not found');
    }
    if (
      rtn.createdByUserId !== userId &&
      rtn.returnedByUserId !== userId &&
      rtn.returnedToUserId !== userId &&
      !(await this.accessService.isUserAuthorized(reckoningId, userId, UserRole.Admin))
    ) {
      throw new UnauthorizedException('Unauthorized');
    }
    await this.returnRepo.remove(rtn);
  }
}
