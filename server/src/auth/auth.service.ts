import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserDetails } from '../shared/UserDetails';
import { User } from '../typeorm/entities/User';

@Injectable()
export class AuthService {
  constructor(@InjectRepository(User) private readonly userRepository: Repository<User>) {}

  async validateUser(userData: UserDetails): Promise<User> {
    const user = await this.userRepository.findOneBy({ email: userData.email });
    if (user) {
      return user;
    }

    const newUser = this.userRepository.create(userData);
    return this.userRepository.save(newUser);
  }

  async findUserById(id: number): Promise<User | null> {
    return this.userRepository.findOneBy({ id });
  }
}
