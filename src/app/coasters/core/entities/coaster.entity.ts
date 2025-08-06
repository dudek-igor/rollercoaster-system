import * as crypto from 'crypto';
import { Wagon, type WagonSchema } from './wagon.entity';

type CoasterStatus = 'active' | 'inactive' | 'maintenance';

export interface CoasterSchema {
  liczba_personelu: number;
  liczba_klientow: number;
  dl_trasy: number;
  godziny_od: string;
  godziny_do: string;
  wagony: WagonSchema[];
  status: CoasterStatus;
  id: string;
}
export class Coaster {
  constructor(
    private liczba_personelu: number,
    private liczba_klientow: number,
    private dl_trasy: number,
    private godziny_od: string,
    private godziny_do: string,
    private wagony: Wagon[],
    private status: 'active' | 'inactive' | 'maintenance' = 'active',
    private readonly id: string,
  ) {}

  get identifier(): string {
    return this.id;
  }

  get statusInformation(): string {
    return this.status;
  }

  get staffCount(): number {
    return this.liczba_personelu;
  }

  get clientCount(): number {
    return this.liczba_klientow;
  }

  get trackLength(): number {
    return this.dl_trasy;
  }

  get openingTime(): string {
    return this.godziny_od;
  }

  get closingTime(): string {
    return this.godziny_do;
  }

  get wagons(): Wagon[] {
    return this.wagony;
  }

  addWagon(wagon: Wagon) {
    this.wagony.push(wagon);
  }

  findWagon(wagonId: string) {
    return this.wagony.findIndex((w) => w.identifier === wagonId);
  }

  removeWagon(index: number) {
    if (index < 0 || index >= this.wagony.length) {
      throw new Error('Invalid wagon index');
    }
    this.wagony.splice(index, 1);
  }

  update(data: {
    liczba_personelu: number;
    liczba_klientow: number;
    godziny_od: string;
    godziny_do: string;
  }) {
    this.liczba_personelu = data.liczba_personelu;
    this.liczba_klientow = data.liczba_klientow;
    this.godziny_od = data.godziny_od;
    this.godziny_do = data.godziny_do;
  }
  /**
   * Serialization
   */
  toJSON(): CoasterSchema {
    return {
      liczba_personelu: this.liczba_personelu,
      liczba_klientow: this.liczba_klientow,
      dl_trasy: this.dl_trasy,
      godziny_od: this.godziny_od,
      godziny_do: this.godziny_do,
      wagony: this.wagony.map((wagon) => wagon.toJSON()),
      status: this.status,
      id: this.id,
    };
  }
  /**
   * Deserialization
   */
  static fromJSON(json: CoasterSchema): Coaster {
    const wagonInstances = json.wagony.map((wagonJson) => {
      try {
        return Wagon.fromJSON(wagonJson);
      } catch (error) {
        throw new Error(`Invalid wagon data: ${error.message}`);
      }
    });
    return new Coaster(
      json.liczba_personelu,
      json.liczba_klientow,
      json.dl_trasy,
      json.godziny_od,
      json.godziny_do,
      wagonInstances,
      json.status,
      json.id,
    );
  }

  static create(data: {
    liczba_personelu: number;
    liczba_klientow: number;
    dl_trasy: number;
    godziny_od: string;
    godziny_do: string;
    wagony?: Wagon[];
    status?: 'active' | 'inactive' | 'maintenance';
    id?: string;
  }): Coaster {
    return new Coaster(
      data.liczba_personelu,
      data.liczba_klientow,
      data.dl_trasy,
      data.godziny_od,
      data.godziny_do,
      data.wagony || [],
      data.status || 'active',
      data.id || crypto.randomUUID(),
    );
  }
}
