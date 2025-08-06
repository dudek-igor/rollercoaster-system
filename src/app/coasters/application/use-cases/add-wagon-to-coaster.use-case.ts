import { Injectable, NotFoundException } from '@nestjs/common';
import { Wagon } from '../../core/entities';
import { CoasterRepositoryPort } from '../../core/ports';
import { AddWagonDTO } from '../../infrastructure/dto';

@Injectable()
export class AddWagonToCoasterUseCase {
  constructor(private readonly coasterRepo: CoasterRepositoryPort) {}

  /**
   * Adds a new wagon to a roller coaster by its coaster ID.
   *
   * @param coasterId - The unique identifier of the roller coaster.
   * @param data - The data transfer object containing wagon information to be added.
   * @returns The updated coaster object with the new wagon added.
   *
   * @throws {NotFoundException} If the coaster with the given `coasterId` does not exist.
   */
  async execute(coasterId: string, data: AddWagonDTO) {
    const coaster = await this.coasterRepo.findById(coasterId);
    if (!coaster) {
      throw new NotFoundException(`Coaster ${coasterId} does not exist`);
    }
    const wagon = Wagon.create(data);
    coaster.addWagon(wagon);
    const statistics = coaster.statistics;
    console.log({ statistics });

    await this.coasterRepo.save(coaster);
    return coaster;
  }
}
