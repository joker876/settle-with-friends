import { NestFactory } from '@nestjs/core';
import session from 'express-session';
import passport from 'passport';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');

  app.use(
    session({
      secret:
        process.env.SESSION_SECRET ??
        (() => {
          throw new Error('SESSION_SECRET env variable is missing');
        })(),
      saveUninitialized: false,
      resave: false,
      cookie: { maxAge: parseInt(process.env.SESSION_COOKIE_DURATION ?? '86400000') }, // 1 hour
    })
  );
  app.use(passport.initialize());
  app.use(passport.session());

  await app.listen(process.env.PORT ?? 8080);
}
// eslint-disable-next-line @typescript-eslint/no-floating-promises
bootstrap();
