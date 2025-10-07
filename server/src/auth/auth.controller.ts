import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { GoogleAuthGuard } from './guards/google';

@Controller('auth')
export class AuthController {
  @Get('google/login')
  @UseGuards(GoogleAuthGuard)
  handleLogin() {}

  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  handleCallback(@Req() req: Request) {
    if (!req.isAuthenticated()) {
      return { errorCode: 'UNAUTHENTICATED' };
    }
    console.log('req.user', req.user);
    console.log('req.session', req.session);
    return req.user;
  }

  @Get('status')
  authStatus(@Req() req: Request) {
    if (req.isAuthenticated()) {
      return req.user;
    }
    return { errorCode: 'UNAUTHENTICATED' };
  }
}
