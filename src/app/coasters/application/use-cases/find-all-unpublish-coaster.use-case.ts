import { Injectable } from '@nestjs/common';
import { Coaster } from '../../core/entities/coaster.entity';
import { CoasterRepositoryPort } from '../../core/ports';

@Injectable()
export class FindAllUnpublishCoaster {
  constructor(private readonly coasterRepo: CoasterRepositoryPort) {}

  async execute(): Promise<Coaster[]> {
    const coasters = await this.coasterRepo.findAll();
    return coasters.filter((c) => !c.isPublished);
  }
}
