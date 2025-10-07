import { NestFactory } from '@nestjs/core';
import session from 'express-session';
import passport from 'passport';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');

  // If behind a proxy (ngrok, cloud provider), enable trust proxy so secure cookies work
  // Access underlying Express instance via the HTTP adapter to set proxy trust.
  try {
    const instance = app.getHttpAdapter().getInstance() as unknown;
    // Only call set if the underlying instance exposes it (Express apps do)
    if (instance && typeof (instance as any).set === 'function') {
      (instance as any).set('trust proxy', 1);
    }
  } catch (e) {
    // If this fails, continue without crash. This only affects environments behind proxies.
    console.warn('Could not set trust proxy on underlying HTTP server', e);
  }

  app.enableCors({
    origin: process.env.CORS_ORIGIN?.split(',') ?? 'http://localhost:4200',
    credentials: true,
  });

  // const dataSource = app.get<DataSource>(getDataSourceToken());

  app.use(
    session({
      secret:
        process.env.SESSION_SECRET ??
        (() => {
          throw new Error('SESSION_SECRET env variable is missing');
        })(),
      saveUninitialized: false,
      resave: false,
      // Configure cookie for cross-site OAuth flows. In production we require secure + SameSite=None.
      cookie: {
        maxAge: parseInt(process.env.SESSION_COOKIE_DURATION ?? '86400000'), // 24 hours
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      },
      // store: new TypeormStore({
      //   cleanupLimit: 2,
      //   ttl: parseInt(process.env.SESSION_COOKIE_DURATION ?? '86400000') / 1000,
      // }).connect(sessionRepository),
    })
  );
  app.use(passport.initialize());
  app.use(passport.session());

  await app.listen(process.env.PORT ?? 8080);
}
// eslint-disable-next-line @typescript-eslint/no-floating-promises
bootstrap();
