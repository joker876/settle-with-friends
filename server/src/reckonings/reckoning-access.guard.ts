import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Request } from 'express';
import { ReckoningAccessService } from './reckoning-access.service';

@Injectable()
export class ReckoningAccessGuard implements CanActivate {
  constructor(private readonly reckoningAccessService: ReckoningAccessService) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const req = ctx.switchToHttp().getRequest<Request>();
    const userId = req.user?.id;
    const reckoningId = parseInt(req.params?.reckoningId, 10);

    if (!userId || Number.isNaN(reckoningId)) {
      throw new ForbiddenException('Access denied');
    }

    const ok = await this.reckoningAccessService.verifyUserAccess(userId, reckoningId);
    if (!ok) {
      throw new ForbiddenException('Access denied');
    }
    return true;
  }
}

import { applyDecorators, UseGuards } from '@nestjs/common';

export const ReckoningAccess = () => applyDecorators(UseGuards(ReckoningAccessGuard));
