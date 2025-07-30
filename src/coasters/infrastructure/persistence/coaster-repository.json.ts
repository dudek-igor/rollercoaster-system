import { Injectable } from '@nestjs/common';
import { CoasterRepositoryPort } from '../../core/ports';
import { Coaster } from '../../core/entities';

@Injectable()
export default class JsonOrderRepository implements CoasterRepositoryPort {
  async save(coaster: Coaster): Promise<Coaster> {
    console.log('Saving coaster in File', coaster);
    return coaster;
  }
}
