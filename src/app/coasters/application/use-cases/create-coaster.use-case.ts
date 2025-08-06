import { Injectable } from '@nestjs/common';
import { Coaster } from '../../core/entities/coaster.entity';
import { CoasterRepositoryPort } from '../../core/ports';
import { CreateCoasterDTO } from '../../infrastructure/dto';

@Injectable()
export class CreateCoasterUseCase {
  constructor(private readonly coasterRepo: CoasterRepositoryPort) {}

  async execute(data: CreateCoasterDTO): Promise<Coaster> {
    return await this.coasterRepo.save(Coaster.create(data));
  }
}
