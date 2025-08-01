import { Injectable } from '@nestjs/common';
import { writeFile, readFile, access, mkdir } from 'fs/promises';
import { join } from 'path';
import { ConfigService } from '@nestjs/config';
import { EnvironmentVariables } from '@/config';
import { NODE_ENV } from '@/constants';

@Injectable()
export class FileStorageService {
  private environment: string;
  private dataDir: string;

  constructor(
    private configService: ConfigService<EnvironmentVariables, true>,
  ) {
    this.environment = this.configService.get(NODE_ENV, { infer: true });
    this.dataDir = join(process.cwd(), 'data', this.environment);
  }

  private async ensureDir() {
    try {
      await access(this.dataDir);
    } catch (error) {
      if (error.code === 'ENOENT') {
        await mkdir(this.dataDir, { recursive: true });
      } else {
        throw error;
      }
    }
  }

  async saveJson(name: string, data: any) {
    await this.ensureDir();
    const filePath = join(this.dataDir, name);
    await writeFile(filePath, JSON.stringify(data, null, 2), 'utf8');
    return filePath;
  }

  async readJson<T = any>(name: string): Promise<T | null> {
    const filePath = join(this.dataDir, name);
    try {
      const content = await readFile(filePath, 'utf8');
      return JSON.parse(content) as T;
    } catch (e) {
      return null;
    }
  }
}
