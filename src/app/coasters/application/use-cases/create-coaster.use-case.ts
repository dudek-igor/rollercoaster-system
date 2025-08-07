import { Injectable } from '@nestjs/common';
import { Coaster, CoasterSchema } from '../../core/entities/coaster.entity';
import { CoasterEventPublisherPort, CoasterRepositoryPort } from '../../core/ports';
import { CreateCoasterDTO } from '../../infrastructure/dto';

@Injectable()
export class CreateCoasterUseCase {
  constructor(
    private readonly coasterRepo: CoasterRepositoryPort,
    private readonly coasterEventPublisher: CoasterEventPublisherPort,
  ) {}

  async execute(data: CreateCoasterDTO): Promise<Omit<CoasterSchema, 'published'>> {
    const coaster = await this.coasterRepo.save(Coaster.create(data));
    await this.coasterEventPublisher.publish(coaster);
    return coaster.toResponse();
  }

  async save(data: Coaster): Promise<Coaster> {
    return await this.coasterRepo.save(data);
  }
}
