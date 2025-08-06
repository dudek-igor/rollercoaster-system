import * as crypto from 'crypto';
export interface WagonSchema {
  id: string;
  ilosc_miejsc: number;
  predkosc_wagonu: number;
}
export class Wagon {
  constructor(
    private readonly id: string,
    private ilosc_miejsc: number,
    private predkosc_wagonu: number,
  ) {
    if (ilosc_miejsc <= 0) {
      throw new Error('Ilość miejsc musi być większa niż 0');
    }
    if (predkosc_wagonu <= 0) {
      throw new Error('Prędkość wagonu musi być większa niż 0');
    }
  }

  get seatsQuantity(): number {
    return this.ilosc_miejsc;
  }

  get speed(): number {
    return this.predkosc_wagonu;
  }

  get identifier(): string {
    return this.id;
  }

  update(ilosc_miejsc: number, predkosc_wagonu: number): void {
    if (ilosc_miejsc <= 0) {
      throw new Error('Ilość miejsc musi być większa niż 0');
    }
    if (predkosc_wagonu <= 0) {
      throw new Error('Prędkość wagonu musi być większa niż 0');
    }

    this.ilosc_miejsc = ilosc_miejsc;
    this.predkosc_wagonu = predkosc_wagonu;
  }
  /**
   * Serialization
   */
  toJSON(): WagonSchema {
    return {
      ilosc_miejsc: this.ilosc_miejsc,
      predkosc_wagonu: this.predkosc_wagonu,
      id: this.id,
    };
  }
  /**
   * Deserialization
   */
  static fromJSON(json: WagonSchema): Wagon {
    return new Wagon(json.id, json.ilosc_miejsc, json.predkosc_wagonu);
  }

  static create(data: { ilosc_miejsc: number; predkosc_wagonu: number; id?: string }): Wagon {
    const id = data.id || crypto.randomUUID();
    return new Wagon(id, data.ilosc_miejsc, data.predkosc_wagonu);
  }
}
