import { Injectable, NotFoundException } from '@nestjs/common';
import { CoasterSchema } from '../../core/entities';
import { CoasterEventPublisherPort, CoasterRepositoryPort } from '../../core/ports';
import { UpdateCoasterDTO } from '../../infrastructure/dto';

@Injectable()
export class UpdateCoasterUseCase {
  constructor(
    private readonly coasterRepo: CoasterRepositoryPort,
    private readonly coasterEventPublisher: CoasterEventPublisherPort,
  ) {}

  async execute(
    coasterId: string,
    data: UpdateCoasterDTO,
  ): Promise<Omit<CoasterSchema, 'published'>> {
    const coaster = await this.coasterRepo.findById(coasterId);
    if (!coaster) {
      throw new NotFoundException(`Kolejka ${coasterId} nie istnieje`);
    }

    coaster.update(data);
    coaster.adjustPublished(false);

    await this.coasterRepo.save(coaster);

    await this.coasterEventPublisher.publish(coaster);

    return coaster.toResponse();
  }
}
