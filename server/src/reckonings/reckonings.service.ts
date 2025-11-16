import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ICreateReckoningRequestDto } from '@shared/contracts/reckonings/create';
import { GetAllReckoningsResponseDto, IReckoningTableData } from '@shared/contracts/reckonings/get-all';
import { IReckoning } from '@shared/entities/reckoning';
import { IUserWithRole } from '@shared/entities/user';
import { UserRole } from '@shared/enums/user-role';
import { roundToPrecision } from 'more-rounding';
import { In, Repository } from 'typeorm';
import { Reckoning, ReckoningUser, User } from '../typeorm/entities';

@Injectable()
export class ReckoningsService {
  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    @InjectRepository(Reckoning) private readonly reckoningRepo: Repository<Reckoning>,
    @InjectRepository(ReckoningUser) private readonly reckoningUserRepo: Repository<ReckoningUser>,
  ) {}

  async getAllForUser(id: number): Promise<GetAllReckoningsResponseDto> {
    const user = await this.userRepo.findOne({
      where: { id },
      relations: { reckoningUsers: true },
    });
    if (!user) return [];

    const reckoningIds = Array.from(new Set(user.reckoningUsers.map(v => v.reckoningId)));

    const reckonings = await this.reckoningRepo.find({
      where: { id: In(reckoningIds) },
      relations: { reckoningUsers: true },
      select: {
        id: true,
        name: true,
        isArchived: true,
        createdDate: true,
        updatedDate: true,
        mainCurrency: true,
        helperCurrency: true,
        reckoningUsers: { userId: true, role: true },
      },
    });

    const transactionData: Pick<GetAllReckoningsResponseDto[number], 'currentBalance' | 'numberOfTransactions'>[] =
      await Promise.all(
        reckonings.map(async r => {
          const transactionData = await this.reckoningRepo
            .createQueryBuilder('reckoning')
            .leftJoin('reckoning.transactions', 'transaction')
            .where('reckoning.id = :id', { id: r.id })
            .select('COUNT(transaction.id)', 'count')
            .addSelect(
              // multiply every amount by rate; if rate is null -> 1; if sum is null -> 0
              'COALESCE(SUM(transaction.amount * COALESCE(transaction.currencyRate, 1)), 0)',
              'sum',
            )
            .getRawOne<{ count: string; sum: string }>();

          const numberOfTransactions = parseInt(transactionData!.count, 10) || 0;
          const currentBalance = roundToPrecision(parseFloat(transactionData!.sum) || 0, 2);
          return { numberOfTransactions, currentBalance };
        }),
      );

    return reckonings?.map((r, i) => ({
      ...r,
      numberOfUsers: r.reckoningUsers.length,
      ...transactionData[i],
    }));
  }

  async getById(id: number): Promise<IReckoning | null> {
    return this.reckoningRepo.findOne({
      where: { id },
      relations: { reckoningUsers: true },
      select: {
        id: true,
        name: true,
        isArchived: true,
        createdDate: true,
        updatedDate: true,
        mainCurrency: true,
        helperCurrency: true,
        reckoningUsers: { userId: true, role: true },
      },
    });
  }

  async create(data: ICreateReckoningRequestDto, userId: number): Promise<IReckoningTableData> {
    const reckoning = this.reckoningRepo.create(data);
    await this.reckoningRepo.save(reckoning);

    await this.addUser(reckoning.id, userId, UserRole.Owner);
    return {
      ...reckoning,
      numberOfUsers: 1,
      currentBalance: 0,
      numberOfTransactions: 0,
    };
  }

  async addUser(reckoningId: number, userId: number, role: UserRole) {
    const reckoning = await this.reckoningRepo.findOneBy({ id: reckoningId });
    if (!reckoning) {
      throw new Error('Reckoning not found');
    }

    const user = await this.userRepo.findOneBy({ id: userId });
    if (!user) {
      throw new Error('User not found');
    }

    const reckoningUser = this.reckoningUserRepo.create({
      reckoning,
      user,
      role,
    });

    return this.reckoningUserRepo.save(reckoningUser);
  }

  async getAllUsersInReckoning(reckoningId: number): Promise<IUserWithRole[]> {
    const reckoningUsers = await this.reckoningUserRepo.find({
      where: { reckoningId },
      relations: { user: true },
      select: {
        role: true,
        user: {
          id: true,
          email: true,
          displayName: true,
          photo: true,
        },
      },
    });
    return reckoningUsers.map(ru => ({ ...ru.user, role: ru.role }));
  }
}
