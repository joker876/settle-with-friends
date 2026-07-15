import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Reckoning } from '../../typeorm/entities';

@Injectable()
export class NoArchivedService {
  constructor(@InjectRepository(Reckoning) private readonly reckoningRepo: Repository<Reckoning>) {}

  async isReckoningArchived(reckoningId: number): Promise<boolean | null> {
    const reckoning = await this.reckoningRepo.findOne({
      where: { id: reckoningId },
      select: ['archivedAt'],
    });
    return reckoning ? reckoning.archivedAt != null : null;
  }
}
