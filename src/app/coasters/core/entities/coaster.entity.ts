import * as crypto from 'crypto';
import { DateTime } from 'luxon';
import { Wagon, type WagonSchema } from './wagon.entity';

export type CoasterStatus =
  | 'OK'
  | 'BRAK_WAGONÓW'
  | 'ZA_MAŁO_WAGONÓW'
  | 'ZA_MAŁO_PERSONELU'
  | 'NADMIAR_PERSONELU'
  | 'NADMIAR_WAGONÓW'
  | 'POZA_GODZINAMI_OPERACYJNYMI';

export interface CoasterSchema {
  liczba_personelu: number;
  liczba_klientow: number;
  dl_trasy: number;
  godziny_od: string;
  godziny_do: string;
  wagony: WagonSchema[];
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
    private readonly id: string,
  ) {}

  get identifier(): string {
    return this.id;
  }

  get name(): string {
    return `Coaster ${this.id.slice(0, 4).toUpperCase()}`;
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

  get operatingHours(): string {
    return `${this.godziny_od} - ${this.godziny_do}`;
  }

  get wagons(): Wagon[] {
    return this.wagony;
  }

  get numberOfWagons(): number {
    return this.wagony.length;
  }

  get totalSeatsQuantity(): number {
    return this.wagony.reduce((sum, w) => sum + w.seatsQuantity, 0);
  }

  get requiredStaff(): number {
    return 1 + this.numberOfWagons * 2;
  }

  get slowestWagonSpeed(): number {
    if (this.wagons.length === 0) return 0;
    return Math.min(...this.wagons.map((w) => w.speed)); // in m/s
  }

  get rideTime(): number {
    return this.slowestWagonSpeed > 0 ? this.trackLength / this.slowestWagonSpeed : 0; // in seconds
  }

  get breakTime(): number {
    return 5 * 60; // 5m equal 300 seconds
  }

  get cycleTime(): number {
    return this.rideTime + this.breakTime; // in seconds
  }

  get operatingStart(): DateTime {
    return DateTime.fromFormat(this.godziny_od, 'HH:mm');
  }

  get operatingEnd(): DateTime {
    return DateTime.fromFormat(this.godziny_do, 'HH:mm');
  }

  get operatingTimeInSeconds(): number {
    return this.operatingEnd.diff(this.operatingStart, 'seconds').seconds;
  }

  get isOperatingNow(): boolean {
    const now = DateTime.now();
    const start = this.operatingStart;
    const end = this.operatingEnd;
    return now >= start && now <= end;
  }

  get numberOfCycles(): number {
    if (this.cycleTime <= 0 || this.numberOfWagons === 0) return 0;
    return Math.floor(this.operatingTimeInSeconds / this.cycleTime);
  }

  get availableClientCapacity(): number {
    return this.numberOfCycles * this.totalSeatsQuantity;
  }

  get status(): CoasterStatus[] {
    const records: CoasterStatus[] = [];

    if (this.numberOfWagons === 0) {
      records.push('BRAK_WAGONÓW');
      return records;
    }

    if (!this.isOperatingNow) {
      records.push('POZA_GODZINAMI_OPERACYJNYMI');
    }

    if (this.staffCount < this.requiredStaff) {
      records.push('ZA_MAŁO_PERSONELU');
    } else if (this.staffCount > this.requiredStaff) {
      records.push('NADMIAR_PERSONELU');
    }

    if (this.availableClientCapacity < this.clientCount) {
      records.push('ZA_MAŁO_WAGONÓW');
    } else if (this.availableClientCapacity > this.clientCount * 2) {
      records.push('NADMIAR_WAGONÓW');
    }

    if (records.length === 0) {
      records.push('OK');
    }

    return records;
  }

  get statistics() {
    const availableStaff = this.staffCount;
    const requiredStaff = this.requiredStaff;

    let requiredWagons = 0;
    if (this.cycleTime > 0 && this.operatingTimeInSeconds > 0 && this.numberOfCycles > 0) {
      const seatsNeededPerCycle = Math.ceil(this.clientCount / this.numberOfCycles);
      const avgSeatsPerWagon =
        this.numberOfWagons > 0 ? this.totalSeatsQuantity / this.numberOfWagons : 0;
      requiredWagons = avgSeatsPerWagon > 0 ? Math.ceil(seatsNeededPerCycle / avgSeatsPerWagon) : 0;
    }

    // const missingStaff = Math.max(0, requiredStaff - availableStaff);
    // const excessStaff = Math.max(0, availableStaff - requiredStaff);

    // const missingWagons =
    //   this.numberOfWagons === 0 ? 0 : Math.max(0, requiredWagons - this.numberOfWagons);
    // const excessWagons =
    //   this.numberOfWagons === 0 ? 0 : Math.max(0, this.numberOfWagons - requiredWagons);

    return {
      id: this.id,
      name: this.name,
      status: this.status.join(', '),
      operatingHours: this.operatingHours,
      wagons: `${this.numberOfWagons}/${requiredWagons}`,
      staff: `${availableStaff}/${requiredStaff}`,
      availableClientCapacity: this.availableClientCapacity,
    };
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
    id?: string;
  }): Coaster {
    return new Coaster(
      data.liczba_personelu,
      data.liczba_klientow,
      data.dl_trasy,
      data.godziny_od,
      data.godziny_do,
      data.wagony || [],
      data.id || crypto.randomUUID(),
    );
  }
}
