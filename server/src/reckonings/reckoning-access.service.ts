import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../typeorm/entities';

@Injectable()
export class ReckoningAccessService {
  constructor(@InjectRepository(User) private readonly userRepo: Repository<User>) {}

  async verifyUserAccess(userId: number, reckoningId: number): Promise<boolean> {
    return this.userRepo.exists({
      where: {
        id: userId,
        reckoningUsers: { reckoningId },
      },
    });
  }
}
