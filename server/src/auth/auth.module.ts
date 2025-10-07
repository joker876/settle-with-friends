import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../typeorm/entities/User';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { GoogleStrategy } from './strategies/google';
import { SessionSerializer } from './utils/serializer';

@Module({
  imports: [PassportModule.register({ session: true }), TypeOrmModule.forFeature([User])],
  controllers: [AuthController],
  // Provide strategies, service and the session serializer for passport
  providers: [GoogleStrategy, AuthService, SessionSerializer],
})
export class AuthModule {}
