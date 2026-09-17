import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../typeorm/entities';
import { GetAccountSettingsResponse } from './dtos/get';
import { UpdateAccountSettingsRequest } from './dtos/patch';

@Injectable()
export class AccountSettingsService {
  constructor(@InjectRepository(User) private readonly userRepo: Repository<User>) {}

  async get(userId: number): Promise<GetAccountSettingsResponse> {
    const user = await this.userRepo.findOne({
      where: {
        id: userId,
      },
      select: ['displayName', 'email', 'photo', 'registeredAt'],
    });
    if (!user) {
      throw new NotFoundException('Cannot find user');
    }
    return {
      photo: user.photo,
      displayName: user.displayName,
      email: user.email,
      registeredAt: user.registeredAt!, // at this point the user is definitely registered
    };
  }

  async patch(userId: number, dto: UpdateAccountSettingsRequest): Promise<void> {
    const userExists = await this.userRepo.existsBy({ id: userId });

    if (!userExists) {
      throw new NotFoundException('Cannot find user');
    }

    await this.userRepo.update({ id: userId }, dto);
  }

  async deleteAccount(userId: number): Promise<void> {
    const user = await this.userRepo.findOneBy({ id: userId });

    if (!user) {
      throw new NotFoundException('Cannot find user');
    }

    const emailParts = user.email.split('@');
    const firstPart = emailParts[0].split('+');
    if (firstPart.length === 1) firstPart.push('');

    await this.userRepo.update(
      { id: userId },
      { email: `${firstPart[0]}+${firstPart[1]}-del${Date.now()}@${emailParts[1]}` },
    );

    await this.userRepo.softDelete({ id: userId });
  }
}
