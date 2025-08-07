import { Coaster } from '../../entities';

export default abstract class CoasterRepositoryPort {
  abstract save(order: Coaster): Promise<Coaster>;
  abstract findById(id: string): Promise<Coaster | null>;
  abstract findAll(): Promise<Coaster[]>;
}
