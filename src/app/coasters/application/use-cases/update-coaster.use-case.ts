import { Injectable, NotFoundException } from '@nestjs/common';
import { Coaster } from '../../core/entities';
import { CoasterRepositoryPort } from '../../core/ports';
import { UpdateCoasterDTO } from '../../infrastructure/dto';

@Injectable()
export class UpdateCoasterUseCase {
  constructor(private readonly coasterRepo: CoasterRepositoryPort) {}

  async execute(coasterId: string, data: UpdateCoasterDTO): Promise<Coaster> {
    const coaster = await this.coasterRepo.findById(coasterId);
    if (!coaster) {
      throw new NotFoundException(`Kolejka ${coasterId} nie istnieje`);
    }

    coaster.update(data);

    return this.coasterRepo.save(coaster);
  }
}
