import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Reckoning, User } from '../typeorm/entities';

@Injectable()
export class ReckoningsService {
  constructor(
    @InjectRepository(Reckoning) private readonly reckoningRepository: Repository<Reckoning>,
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) {}

  async getAllForUser(id: number): Promise<Reckoning[]> {
    return (await this.userRepository.findOneBy({ id }).then(v => v?.reckoningUsers.map(v => v.reckoning))) ?? [];
  }
}
