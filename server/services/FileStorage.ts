import fs from 'fs/promises';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');

/**
 * FileStorageService: Reads and writes domain entities to local JSON files.
 * Provides File I/O persistence for Rooms, Reservations, Payments, and Hotel configuration.
 */
export class FileStorageService {
  private static async ensureDataDir() {
    try {
      await fs.mkdir(DATA_DIR, { recursive: true });
    } catch (err) {
      // directory exists
    }
  }

  public static async readData<T>(fileName: string, fallback: T): Promise<T> {
    await this.ensureDataDir();
    const filePath = path.join(DATA_DIR, fileName);
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      return JSON.parse(content) as T;
    } catch (error) {
      // If file missing or invalid, write initial fallback
      await this.writeData(fileName, fallback);
      return fallback;
    }
  }

  public static async writeData<T>(fileName: string, data: T): Promise<void> {
    await this.ensureDataDir();
    const filePath = path.join(DATA_DIR, fileName);
    const tempPath = `${filePath}.tmp`;
    const jsonStr = JSON.stringify(data, null, 2);

    // Atomic write via temp file rename
    await fs.writeFile(tempPath, jsonStr, 'utf-8');
    await fs.rename(tempPath, filePath);
  }
}
