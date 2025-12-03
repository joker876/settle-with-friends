import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { getDataSourceToken } from '@nestjs/typeorm';
import { TypeormStore } from 'connect-typeorm';
import * as session from 'express-session';
import * as passport from 'passport';
import { DataSource } from 'typeorm';
import { AppModule } from './app.module';
import { SessionEntity } from './typeorm/entities/Session';

void (async () => {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');

  app.enableCors({
    origin: process.env.CORS_ORIGIN?.split(',') ?? 'http://localhost:4200',
    credentials: true,
  });
  app.useGlobalPipes(new ValidationPipe());

  const dataSource = app.get<DataSource>(getDataSourceToken());
  const sessionRepo = dataSource.getRepository(SessionEntity);

  app.use(
    // @ts-ignore  Nest compiler thinks this is correct, but TS compiler disagrees
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
  await app.listen(Number(process.env.PORT) || 5280, process.env.IPV4 ?? '127.0.0.1');

  console.log(`Server is running on: ${await app.getUrl()}`);
})();
