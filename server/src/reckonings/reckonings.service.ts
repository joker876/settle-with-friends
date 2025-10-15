import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ICreateReckoningRequestDto } from '@shared/contracts/reckonings/create';
import { GetAllReckoningsResponseDto, IReckoningTableData } from '@shared/contracts/reckonings/get-all';
import { UserRole } from '@shared/enums/user-role';
import { In, Repository } from 'typeorm';
import { Reckoning, ReckoningUser, User } from '../typeorm/entities';

@Injectable()
export class ReckoningsService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @InjectRepository(Reckoning) private readonly reckoningRepository: Repository<Reckoning>,
    @InjectRepository(ReckoningUser) private readonly reckoningUserRepository: Repository<ReckoningUser>,
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

  async create(data: ICreateReckoningRequestDto, userId: number): Promise<IReckoningTableData> {
    const reckoning = this.reckoningRepository.create(data);
    await this.reckoningRepository.save(reckoning);

    await this.addUser(reckoning.id, userId, UserRole.Owner);
    return { ...reckoning, numberOfUsers: 1, currentBalance: 0, numberOfTransactions: 0 };
  }

  async addUser(reckoningId: number, userId: number, role: UserRole) {
    const reckoning = await this.reckoningRepository.findOneBy({ id: reckoningId });
    if (!reckoning) {
      throw new Error('Reckoning not found');
    }

    const user = await this.userRepository.findOneBy({ id: userId });
    if (!user) {
      throw new Error('User not found');
    }

    const reckoningUser = this.reckoningUserRepository.create({
      reckoning,
      user,
      role,
    });

    return this.reckoningUserRepository.save(reckoningUser);
  }
}
