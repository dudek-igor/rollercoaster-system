import { Coaster } from '../entities';

export default abstract class CoasterRepositoryPort {
  abstract save(order: Coaster): Promise<Coaster>;
}
