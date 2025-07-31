import * as crypto from 'crypto';
import Wagon from './wagon.entity';

export default class Coaster {
  private _id: string;
  private _staffCount: number;
  private _customersCount: number;
  private _routeLength: number;
  private _openingHours: string;
  private _closingHours: string;
  private _wagons: Wagon[];
  private _status: 'active' | 'inactive' | 'maintenance';

  constructor(data: {
    staffCount: number;
    customersCount: number;
    routeLength: number;
    openingHours: string;
    closingHours: string;
    status?: 'active' | 'inactive' | 'maintenance';
    wagons?: Wagon[];
    id?: string;
  }) {
    this._id = data.id ?? this.generateUUID();
    this._wagons = data.wagons ?? [];
    this._status = data.status ?? 'active';
    this._staffCount = data.staffCount;
    this._customersCount = data.customersCount;
    this._routeLength = data.routeLength;
    this._openingHours = data.openingHours;
    this._closingHours = data.closingHours;
  }

  get id() {
    return this._id;
  }

  get staffCount() {
    return this._staffCount;
  }

  get customersCount() {
    return this._customersCount;
  }

  get routeLength() {
    return this._routeLength;
  }

  get openingHours() {
    return this._openingHours;
  }

  get closingHours() {
    return this._closingHours;
  }

  get wagons() {
    return this._wagons;
  }

  get status() {
    return this._status;
  }

  activate() {
    this._status = 'active';
  }

  deactivate() {
    this._status = 'inactive';
  }

  startMaintenance() {
    this._status = 'maintenance';
  }

  updateStaffCount(newCount: number) {
    if (newCount <= 0) {
      throw new Error('Staff count must be positive');
    }
    this._staffCount = newCount;
  }

  updateCustomersCount(newCount: number) {
    if (newCount < 0) {
      throw new Error('Customers count cannot be negative');
    }
    this._customersCount = newCount;
  }

  addWagon(wagon: Wagon) {
    this._wagons.push(wagon);
  }

  removeWagon(index: number) {
    if (index < 0 || index >= this._wagons.length) {
      throw new Error('Invalid wagon index');
    }
    this._wagons.splice(index, 1);
  }

  private generateUUID(): string {
    return crypto.randomUUID();
  }
}
