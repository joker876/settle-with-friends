import { applyDecorators, CanActivate, ExecutionContext, ForbiddenException, Injectable, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { NoArchivedService } from './no-archived.service';

@Injectable()
export class NoArchivedGuard implements CanActivate {
  constructor(private readonly noArchivedService: NoArchivedService) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const req = ctx.switchToHttp().getRequest<Request>();
    const reckoningId = parseInt(req.params?.reckoningId, 10);

    if (Number.isNaN(reckoningId)) {
      throw new ForbiddenException('Access denied');
    }

    const isArchived = await this.noArchivedService.isReckoningArchived(reckoningId);
    if (isArchived) {
      throw new ForbiddenException('Reckoning is archived');
    }
    return true;
  }
}

export const NoArchived = () => applyDecorators(UseGuards(NoArchivedGuard));
