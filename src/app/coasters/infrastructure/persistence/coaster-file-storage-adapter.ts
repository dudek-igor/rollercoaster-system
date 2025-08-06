import { Injectable } from '@nestjs/common';
import { CoasterRepositoryPort } from '../../core/ports';
import { Coaster, type CoasterSchema } from '../../core/entities';
import { FileStorageService } from '@/databases/file-storage/file-storage.service';

@Injectable()
export default class CoasterFileStorageRepositoryAdapter implements CoasterRepositoryPort {
  constructor(private readonly fileStorage: FileStorageService) {}

  /**
   * Saves a roller coaster to the file storage as JSON.
   * @param coaster - The coaster instance to save.
   * @returns The saved coaster.
   */
  async save(coaster: Coaster): Promise<Coaster> {
    await this.fileStorage.saveJson(`coaster-${coaster.identifier}.json`, coaster.toJSON());
    return coaster;
  }

  /**
   * Loads a coaster by its ID from file storage.
   * @param id - The unique coaster ID.
   * @returns The loaded coaster, or null if not found.
   */
  async findById(id: string): Promise<Coaster | null> {
    const coasterSchema = await this.fileStorage.readJson<CoasterSchema>(`coaster-${id}.json`);
    return coasterSchema ? Coaster.fromJSON(coasterSchema) : null;
  }

  /**
   * Loads all coasters from file storage.
   * @returns The loaded coasters, or null if not found.
   */
  async findAll(): Promise<Coaster[]> {
    const coasterSchemas = await this.fileStorage.readAllJsonFiles<CoasterSchema>(`coaster`);
    return coasterSchemas.map((coasterSchema) => Coaster.fromJSON(coasterSchema));
  }
}
