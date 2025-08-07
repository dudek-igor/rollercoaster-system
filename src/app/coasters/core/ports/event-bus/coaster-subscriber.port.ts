export default abstract class CoasterEventSubscriberPort {
  abstract synchronize(): Promise<void>;
  abstract subscribe(): Promise<void>;
  abstract fallback(): Promise<void>;
}
