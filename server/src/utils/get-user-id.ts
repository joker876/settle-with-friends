import { HttpException, HttpStatus } from '@nestjs/common';
import { Request } from 'express';

export function getUserIdFromRequest(req: Request): number {
  const userId = req.user?.id;
  if (!userId) {
    throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
  }
  return userId;
}
