import {
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { Public } from './public.decorator';
import { GoogleAuthGuard } from './utils/google-auth.guard';

@Controller('auth')
export class AuthController {
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
      throw new HttpException(
        'CLIENT_URL is not set',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    return res.redirect(new URL(appUrl).toString());
  }

  @Get('status')
  @Public()
  user(@Req() request: Request) {
    if (request.user) {
      return { loggedIn: true, user: request.user };
    } else {
      return { loggedIn: false, user: null };
    }
  }
}
