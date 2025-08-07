import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { DateTime } from 'luxon';
import { CoasterRepositoryPort } from '../../core/ports';

@Injectable()
export class CoastersMonitoring implements OnModuleInit, OnModuleDestroy {
  private intervalId: NodeJS.Timeout | null = null;
  private readonly logger = new Logger(CoastersMonitoring.name);

  constructor(private readonly coasterRepo: CoasterRepositoryPort) {}

  async onModuleInit() {
    await this.startMonitoringLoop();
  }

  onModuleDestroy() {
    this.stop;
  }

  private async startMonitoringLoop() {
    await this.logStats();
    this.intervalId = setInterval(async () => await this.logStats(), 1000); // 1s
  }

  private async logStats() {
    try {
      const coasters = await this.coasterRepo.findAll();
      if (coasters.length) {
        console.clear();
        console.log(`[Godzina: ${DateTime.now().toFormat('HH:mm')}]`);
        coasters.forEach((coaster) => {
          const stats = coaster.statistics;
          console.log(` `);
          console.log(`[${stats.name}]`);
          console.log(`1. Godziny działania: ${stats.operatingHours}`);
          console.log(`2. Liczba wagonów: ${stats.wagons}`);
          console.log(`3. Dostępny personel:: ${stats.staff}`);
          console.log(`4. Klienci dziennie: ${stats.availableClientCapacity}`);
          console.log(`5. Status: ${stats.status}`);
          console.log(` `);
        });
      }
    } catch (err) {
      this.logger.error(`[MONITORING] Failed to refresh stats: ${err.message}`);
    }
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }
}
