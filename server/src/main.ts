import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { getDataSourceToken } from '@nestjs/typeorm';
import { TypeormStore } from 'connect-typeorm';
import * as session from 'express-session';
import * as passport from 'passport';
import { DataSource } from 'typeorm';
import { AppModule } from './app.module';
import { startLoginProxy } from './proxy';
import { SessionEntity } from './typeorm/entities/Session';

void (async () => {
  const app = await NestFactory.create(AppModule);

  const nodeEnv = process.env.NODE_ENV || 'local';
  const isLocal = nodeEnv === 'local';

  app.setGlobalPrefix('api');

  app.enableCors({
    origin: process.env.FRONTEND_URL?.split(',').concat('http://localhost:5260') ?? 'http://localhost:4200',
    credentials: true,
  });
  app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));

  const dataSource = app.get<DataSource>(getDataSourceToken());
  const sessionRepo = dataSource.getRepository(SessionEntity);

  app.use(
    // @ts-ignore  Nest compiler thinks this is correct, but VSCode's TS compiler disagrees
    session({
      secret: process.env.SESSION_SECRET ?? '',
      saveUninitialized: false,
      resave: false,
      name: process.env.SESSION_COOKIE_NAME || 'connect.sid',
      cookie: {
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
  await app.listen(Number(process.env.PORT) || 5280, process.env.APP_HOST ?? '127.0.0.1');
  
  if (isLocal) {
    startLoginProxy(await app.getUrl());
  }

  console.log(`Server is running on: ${await app.getUrl()}`);
})();
