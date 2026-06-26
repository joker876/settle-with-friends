import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ReckoningUser } from '../../typeorm/entities';
import { UserWithRoleDto } from './dtos/get-users';

@Injectable()
export class ParticipantsService {
  constructor(@InjectRepository(ReckoningUser) private readonly reckoningUserRepo: Repository<ReckoningUser>) {}

  async getAllForReckoning(reckoningId: number): Promise<UserWithRoleDto[]> {
    return await this.reckoningUserRepo
      .find({
        where: { reckoningId },
        relations: ['user'],
      })
      .then(users =>
        users.map(user => ({
          id: user.id,
          displayName: user.user.displayName,
          email: user.user.email,
          photo: user.user.photo,
          role: user.role,
        })),
      );
  }
}
