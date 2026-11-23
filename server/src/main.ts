import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { getDataSourceToken } from '@nestjs/typeorm';
import { TypeormStore } from 'connect-typeorm';
import * as session from 'express-session';
import * as passport from 'passport';
import { DataSource } from 'typeorm';
import { addTransactionalDataSource, initializeTransactionalContext } from 'typeorm-transactional';
import { AppModule } from './app.module';
import { startLoginProxy } from './proxy';
import { SessionEntity } from './typeorm/entities/Session';

void (async () => {
  initializeTransactionalContext();

  checkEnvVar('SESSION_SECRET');

  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  const nodeEnv = process.env.NODE_ENV || 'local';
  const isLocal = nodeEnv === 'local';

  app.setGlobalPrefix('api');

  app.enableCors({
    origin: process.env.FRONTEND_URL?.split(',') ?? 'http://localhost:4200',
    credentials: true,
  });
  app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));

  const dataSource = app.get<DataSource>(getDataSourceToken());
  addTransactionalDataSource(dataSource);

  const sessionRepo = dataSource.getRepository(SessionEntity);

  app.set('trust proxy', 1);
  app.use(
    // @ts-ignore  Nest compiler thinks this is correct, but VSCode's TS compiler disagrees
    session({
      secret: process.env.SESSION_SECRET ?? '',
      saveUninitialized: false,
      resave: false,
      name: process.env.SESSION_COOKIE_NAME || 'connect.sid',
      cookie: {
        ...(isLocal
          ? { secure: false, sameSite: 'lax' }
          : {
              httpOnly: true,
              secure: true,
              sameSite: 'none',
              path: '/',
            }),
        maxAge: parseInt(process.env.SESSION_MAX_AGE ?? '86400000'),
      },
      store: new TypeormStore({
        cleanupLimit: 2,
        ttl: parseInt(process.env.SESSION_COOKIE_DURATION ?? '86400000') / 1000,
        limitSubquery: false,
      }).connect(sessionRepo),
    }),
  );
  app.use(passport.initialize());
  app.use(passport.session());
  await app.listen(Number(process.env.PORT) || 8080, process.env.APP_HOST ?? '127.0.0.1');

  if (isLocal) {
    startLoginProxy(await app.getUrl());
  }

  console.log(
    `Server is running on: ${await app.getUrl()}, frontend: ${process.env.FRONTEND_URL ?? 'http://localhost:4200'}`,
  );
})();

function checkEnvVar(name: string): void {
  if (!process.env[name]) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
}
