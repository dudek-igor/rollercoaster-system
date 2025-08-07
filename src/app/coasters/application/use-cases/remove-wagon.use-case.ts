import { Injectable, NotFoundException } from '@nestjs/common';
import { CoasterSchema } from '../../core/entities';
import { CoasterEventPublisherPort, CoasterRepositoryPort } from '../../core/ports';

@Injectable()
export class RemoveWagonUseCase {
  constructor(
    private readonly coasterRepo: CoasterRepositoryPort,
    private readonly coasterEventPublisher: CoasterEventPublisherPort,
  ) {}
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
  async execute(coasterId: string, wagonId: string): Promise<Omit<CoasterSchema, 'published'>> {
    const coaster = await this.coasterRepo.findById(coasterId);
    if (!coaster) {
      throw new NotFoundException(`Kolejka ${coasterId} nie istnieje`);
    }

    const index = coaster.findWagon(wagonId);
    if (index === -1) {
      throw new NotFoundException(`Wagon ${wagonId} nie istnieje w kolejce`);
    }

    coaster.removeWagon(index);
    coaster.adjustPublished(false);
    await this.coasterRepo.save(coaster);
    await this.coasterEventPublisher.publish(coaster);
    return coaster.toResponse();
  }
}
