import { Injectable } from '@nestjs/common';
import { CoasterRepositoryPort } from '../../core/ports';
import { Coaster } from '../../core/entities';
/**
 * Use Cases
 */
@Injectable()
export default class CoastersService {
  constructor(private readonly coasterRepo: CoasterRepositoryPort) {}

  async create(
    data: Pick<
      Coaster,
      | 'staffCount'
      | 'customersCount'
      | 'routeLength'
      | 'openingHours'
      | 'closingHours'
    >,
  ) {
    const order = new Coaster(data);
    await this.coasterRepo.save(order);
    return order;
  }
}
