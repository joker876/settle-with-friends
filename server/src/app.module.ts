import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AuthModule } from './features/auth/auth.module';
import { SessionAuthGuard } from './features/auth/session-auth.guard';
import { ParticipantsModule } from './features/participants/participants.module';
import { ReckoningsModule } from './features/reckonings/reckonings.module';
import { ReturnsModule } from './features/returns/returns.module';
import { SummaryModule } from './features/summary/summary.module';
import { TransactionsModule } from './features/transactions/transactions.module';
import { SessionEntity } from './typeorm/entities/Session';
import { entities } from './typeorm/entities/index';
import { DateMappingInterceptor } from './utils/date-mapping.interceptor';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST,
      port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 3306,
      username: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      entities,
      synchronize: true,
      extra: {
        decimalNumbers: true,
      },
    }),
    TypeOrmModule.forFeature([SessionEntity]),
    PassportModule.register({ session: true }),
    AuthModule,
    ReckoningsModule,
    TransactionsModule,
    ReturnsModule,
    SummaryModule,
    ParticipantsModule,
  ],
  controllers: [AppController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: SessionAuthGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: DateMappingInterceptor,
    },
  ],
})
export class AppModule {}
