export default class Wagon {
  private _id: string;
  private _seatsCount: number;
  private _speed: number;

  constructor(seatsCount: number, speed: number, id?: string) {
    if (seatsCount <= 0 || speed <= 0) {
      throw new Error('Invalid wagon data');
    }
    this._id = id ?? this.generateUUID();
    this._seatsCount = seatsCount;
    this._speed = speed;
  }

  get id() {
    return this._id;
  }

  get seatsCount() {
    return this._seatsCount;
  }

  get speed() {
    return this._speed;
  }

  updateSeatsCount(newCount: number) {
    if (newCount <= 0) {
      throw new Error('Seats count must be positive');
    }
    this._seatsCount = newCount;
  }

  updateSpeed(newSpeed: number) {
    if (newSpeed <= 0) {
      throw new Error('Speed must be positive');
    }
    this._speed = newSpeed;
  }

  private generateUUID(): string {
    return crypto.randomUUID();
  }
}
