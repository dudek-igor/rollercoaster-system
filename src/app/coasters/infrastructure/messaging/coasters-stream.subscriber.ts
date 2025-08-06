// import {
//   Injectable,
//   OnModuleInit,
//   OnModuleDestroy,
//   Logger,
//   Inject,
// } from '@nestjs/common';
// import { REDIS_CLIENT } from '@/constants';
// import Redis from 'ioredis';

// @Injectable()
// export class CoastersStreamSubscriber implements OnModuleInit, OnModuleDestroy {
//   private readonly logger = new Logger(CoastersStreamSubscriber.name);
//   private consumerName = 'consumer-1';
//   private groupName = 'coasters_group';
//   private streamKey = 'coasters_stream';
//   private isRunning = false;

//   constructor(@Inject(REDIS_CLIENT) private readonly redis: Redis) {}

//   async onModuleInit() {
//     this.logger.log('Starting CoastersStreamSubscriber...');
//     await this.createGroupIfNotExists();
//     this.isRunning = true;
//     this.readStreamLoop().catch((err) => {
//       this.logger.error('Stream reading error', err);
//     });
//   }

//   async onModuleDestroy() {
//     this.isRunning = false;
//     this.logger.log('Stopping CoastersStreamSubscriber...');
//   }

//   private async createGroupIfNotExists() {
//     try {
//       // Próba stworzenia grupy; jeśli już istnieje, ignorujemy błąd
//       await this.redis.xgroup(
//         'CREATE',
//         this.streamKey,
//         this.groupName,
//         '$',
//         'MKSTREAM',
//       );
//       this.logger.log(
//         `Group ${this.groupName} created on stream ${this.streamKey}`,
//       );
//     } catch (err: any) {
//       if (err.message.includes('BUSYGROUP')) {
//         this.logger.log(`Group ${this.groupName} already exists`);
//       } else {
//         this.logger.error('Error creating group', err);
//         throw err;
//       }
//     }
//   }

//   private async readStreamLoop() {
//     while (this.isRunning) {
//       // XREADGROUP z blokowaniem na max 5s (5000 ms)
//       const responses = await this.redis.xreadgroup(
//         'GROUP',
//         this.groupName,
//         this.consumerName,
//         'BLOCK',
//         5000,
//         'COUNT',
//         10,
//         'STREAMS',
//         this.streamKey,
//         '>',
//       );

//       if (!responses) {
//         // brak nowych wiadomości, petla zaczyna od nowa
//         continue;
//       }

//       for (const [stream, messages] of responses) {
//         for (const [id, fields] of messages) {
//           try {
//             this.logger.log(`Processing message ${id} from stream ${stream}`);
//             // fields to tablica [key1, val1, key2, val2,...]
//             const message = this.parseFields(fields);
//             await this.handleMessage(id, message);
//           } catch (err) {
//             this.logger.error(`Error processing message ${id}`, err);
//             // tu możesz zdecydować, czy odznaczać wiadomość jako przetworzoną czy zostawić
//           }
//         }
//       }
//     }
//   }

//   private parseFields(fields: string[]): Record<string, string> {
//     const obj: Record<string, string> = {};
//     for (let i = 0; i < fields.length; i += 2) {
//       obj[fields[i]] = fields[i + 1];
//     }
//     return obj;
//   }

//   private async handleMessage(id: string, message: Record<string, string>) {
//     // TODO: tutaj logika obsługi wiadomości np. zapis do DB, wywołanie serwisu itd.
//     this.logger.log(`Received event: ${JSON.stringify(message)}`);

//     // Po przetworzeniu potwierdzamy, że wiadomość jest obsłużona
//     await this.redis.xack(this.streamKey, this.groupName, id);
//   }
// }
