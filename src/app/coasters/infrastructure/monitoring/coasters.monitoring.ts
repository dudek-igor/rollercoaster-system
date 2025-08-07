import { Injectable, OnModuleInit, Inject, OnModuleDestroy } from '@nestjs/common';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { DateTime } from 'luxon';
import { LoggerService } from '@nestjs/common';
import { CoasterRepositoryPort } from '../../core/ports';

@Injectable()
export class CoastersMonitoring implements OnModuleInit, OnModuleDestroy {
  private intervalId: NodeJS.Timeout | null = null;

  constructor(
    @Inject(WINSTON_MODULE_NEST_PROVIDER) private readonly logger: LoggerService,
    private readonly coasterRepo: CoasterRepositoryPort,
  ) {}

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
    console.clear();
    try {
      const coasters = await this.coasterRepo.findAll();
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
