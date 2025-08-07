import { Coaster } from '../../entities';

export default abstract class CoasterEventPublisherPort {
  abstract publish(coaster: Coaster): Promise<boolean>;
  abstract fallback(): Promise<void>;
}
