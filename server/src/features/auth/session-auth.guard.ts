// src/auth/session-auth.guard.ts
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from './public.decorator';

@Injectable()
export class SessionAuthGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const req = context
      .switchToHttp()
      .getRequest<
        Request & { user?: unknown; isAuthenticated?: () => boolean }
      >();

    const loggedIn =
      (typeof req.isAuthenticated === 'function'
        ? req.isAuthenticated()
        : false) || !!req.user;
    if (!loggedIn) throw new UnauthorizedException();
    return true;
  }
}
