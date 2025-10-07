import { Controller, Get, HttpException, HttpStatus, Req, UseGuards } from '@nestjs/common';
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
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    }
    console.log('req.user', req.user);
    console.log('req.session', req.session);
    // Ensure session is saved before redirecting so the Set-Cookie header is sent
    // Express's session middleware exposes req.session.save
    try {
      // If save exists, use it and redirect inside the callback
      const sess: any = req.session;
      if (sess && typeof sess.save === 'function') {
        sess.save(err => {
          if (err) {
            // Log and still attempt redirect — client may retry status check
            console.error('Error saving session before redirect', err);
          }
          const res = req.res;
          if (res && !res.headersSent && !(res as any).writableEnded) {
            res.redirect('http://localhost:4200/login');
          } else {
            console.warn('Response already sent; skipping redirect to frontend');
          }
        });
      } else {
        const res = req.res;
        if (res && !res.headersSent && !(res as any).writableEnded) {
          res.redirect('http://localhost:4200/login');
        } else {
          console.warn('Response already sent; skipping redirect to frontend');
        }
      }
    } catch (e) {
      console.error('Error ensuring session save before redirect', e);
      req.res?.redirect('http://localhost:4200/login');
    }
  }

  @Get('status')
  authStatus(@Req() req: Request) {
    if (!req.isAuthenticated()) {
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    }
    return req.user;
  }
}
