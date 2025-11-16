import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../typeorm/entities/User';
import { fileUrlToFileBase64 } from '../utils/file-url-to-file-base64';
import { UserDetails } from '../utils/types';
import { AuthRegisterRequestDto } from './dtos/register';

@Injectable()
export class AuthService {
  constructor(@InjectRepository(User) private readonly userRepository: Repository<User>) {}

  async validateUser(details: UserDetails) {
    const user = await this.userRepository.findOneBy({ email: details.email });
    if (user) return user;

    if (process.env.CAN_CREATE_NEW_ACCOUNTS !== '1') {
      return { id: -1 };
    }
    details.photo &&= await fileUrlToFileBase64(details.photo);
    const newUser = this.userRepository.create(details);
    return this.userRepository.save(newUser);
  }

  async findUser(id: number) {
    const user = await this.userRepository.findOneBy({ id });
    return user;
  }

  async isUserRegistered(id: number): Promise<boolean> {
    return this.userRepository.existsBy({ id, registered: true });
  }

  async existsUser(id: number, otherData?: Partial<Omit<User, 'id'>>): Promise<boolean> {
    return await this.userRepository.existsBy({ id, ...(otherData ?? {}) });
  }

  async registerUserData(id: number, userData: AuthRegisterRequestDto): Promise<void> {
    if (!userData.displayName) {
      userData.displayName = (await this.findUser(id))!.displayName;
    }
    if (userData.acceptsPhoto) {
      await this.userRepository.update({ id }, { registered: true, displayName: userData.displayName });
    }
    await this.userRepository.update({ id }, { registered: true, displayName: userData.displayName, photo: undefined });
  }
}
