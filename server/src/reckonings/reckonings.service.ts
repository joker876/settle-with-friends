import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { GetAllReckoningsResponseDto } from '@shared/contracts/reckonings/get-all';
import { In, Repository } from 'typeorm';
import { Reckoning, User } from '../typeorm/entities';

@Injectable()
export class ReckoningsService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @InjectRepository(Reckoning) private readonly reckoningRepository: Repository<Reckoning>,
  ) {}

  async getAllForUser(id: number): Promise<GetAllReckoningsResponseDto> {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: { reckoningUsers: true },
    });
    if (!user) return [];

    const reckoningIds = Array.from(new Set(user.reckoningUsers.map(v => v.reckoningId)));

    const reckonings = await this.reckoningRepository.find({
      where: { id: In(reckoningIds) },
      relations: { reckoningUsers: true },
      select: {
        id: true,
        name: true,
        isArchived: true,
        createdDate: true,
        updatedDate: true,
        reckoningUsers: { userId: true, role: true },
      },
    });

    return reckonings?.map(r => ({
      ...r,
      numberOfUsers: r.reckoningUsers.length,
      currentBalance: 0,
      numberOfTransactions: 0,
    }));
  }
}
