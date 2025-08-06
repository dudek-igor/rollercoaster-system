import { Injectable, NotFoundException } from '@nestjs/common';
import { Coaster } from '../../core/entities';
import { CoasterRepositoryPort } from '../../core/ports';

@Injectable()
export class RemoveWagonUseCase {
  constructor(private readonly coasterRepo: CoasterRepositoryPort) {}
  /**
   * Removes a wagon from a roller coaster by its coaster ID and wagon ID.
   *
   * @param coasterId - The unique identifier of the roller coaster.
   * @param wagonId - The unique identifier of the wagon to be removed.
   * @returns The updated coaster object after removing the wagon.
   *
   * @throws {NotFoundException} If the coaster with the given `coasterId` does not exist.
   * @throws {NotFoundException} If the wagon with the given `wagonId` is not found in the coaster.
   */
  async execute(coasterId: string, wagonId: string): Promise<Coaster> {
    const coaster = await this.coasterRepo.findById(coasterId);
    if (!coaster) {
      throw new NotFoundException(`Kolejka ${coasterId} nie istnieje`);
    }

    const index = coaster.findWagon(wagonId);
    if (index === -1) {
      throw new NotFoundException(`Wagon ${wagonId} nie istnieje w kolejce`);
    }

    coaster.removeWagon(index);

    return await this.coasterRepo.save(coaster);
  }
}
