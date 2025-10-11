import { Body, Controller, Get, HttpException, HttpStatus, Inject, Post, Req, Res, UseGuards } from '@nestjs/common';
import { IAuthStatusResponseDto } from '@shared/contracts/auth/status';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { AuthRegisterRequestDto } from './dtos/register';
import { Public } from './public.decorator';
import { GoogleAuthGuard } from './utils/google-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(@Inject(AuthService) private readonly _authService: AuthService) {}

  @Get('google/login')
  @Public()
  @UseGuards(GoogleAuthGuard)
  handleLogin() {
    return { success: true };
  }

  // api/auth/google/redirect
  @Get('google/callback')
  @Public()
  @UseGuards(GoogleAuthGuard)
  handleRedirect(@Res() res: Response) {
    const appUrl = process.env.CLIENT_URL;
    if (!appUrl) {
      throw new HttpException('CLIENT_URL is not set', HttpStatus.INTERNAL_SERVER_ERROR);
    }

    return res.redirect(new URL(appUrl).toString());
  }

  @Get('status')
  @Public()
  user(@Req() req: Request): IAuthStatusResponseDto {
    return { loggedIn: !!req.user, user: req.user ?? null, expiresAt: req.session.cookie.expires };
  }

  @Post('logout')
  async logout(@Req() req: Request, @Res() res: Response) {
    await new Promise<void>((resolve, reject) => req.logout((err?: any) => (err ? reject(err) : resolve())));

    await new Promise<void>((resolve, reject) => req.session.destroy(err => (err ? reject(err) : resolve())));

    res.clearCookie(process.env.SESSION_COOKIE_NAME || 'connect.sid');

    return res.status(200).json({ success: true });
  }

  @Post('register')
  async register(@Body() registerData: AuthRegisterRequestDto, @Req() req: Request) {
    const userId = req.user?.id;
    if (!userId) {
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    }

    const userIsRegistered = await this._authService.existsUser(userId, { registered: true });
    if (userIsRegistered) {
      throw new HttpException('User is already registered', HttpStatus.CONFLICT);
    }

    await this._authService.registerUserData(userId, registerData);
  }
}
