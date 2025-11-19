import { Injectable } from '@angular/core';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FileStorageService {
  private dataDir = Directory.Documents;
  private attendanceFile = 'attendances.json';
  private usersFile = 'users.json';

  constructor() { }

  /**
   * Salvar dados de atendimentos em arquivo JSON
   */
  async saveAttendancesToFile(attendances: any[]): Promise<void> {
    try {
      await Filesystem.writeFile({
        path: this.attendanceFile,
        data: JSON.stringify(attendances, null, 2),
        directory: this.dataDir,
        encoding: Encoding.UTF8
      });
      console.log('Atendimentos salvos com sucesso');
    } catch (error) {
      console.error('Erro ao salvar atendimentos:', error);
      throw error;
    }
  }

  /**
   * Ler dados de atendimentos do arquivo JSON
   */
  async loadAttendancesFromFile(): Promise<any[]> {
    try {
      const file = await Filesystem.readFile({
        path: this.attendanceFile,
        directory: this.dataDir,
        encoding: Encoding.UTF8
      });
      return JSON.parse(file.data as string);
    } catch (error) {
      console.warn('Arquivo de atendimentos não encontrado:', error);
      return [];
    }
  }

  /**
   * Salvar dados de usuários em arquivo JSON
   */
  async saveUsersToFile(users: any[]): Promise<void> {
    try {
      await Filesystem.writeFile({
        path: this.usersFile,
        data: JSON.stringify(users, null, 2),
        directory: this.dataDir,
        encoding: Encoding.UTF8
      });
      console.log('Usuários salvos com sucesso');
    } catch (error) {
      console.error('Erro ao salvar usuários:', error);
      throw error;
    }
  }

  /**
   * Ler dados de usuários do arquivo JSON
   */
  async loadUsersFromFile(): Promise<any[]> {
    try {
      const file = await Filesystem.readFile({
        path: this.usersFile,
        directory: this.dataDir,
        encoding: Encoding.UTF8
      });
      return JSON.parse(file.data as string);
    } catch (error) {
      console.warn('Arquivo de usuários não encontrado:', error);
      return [];
    }
  }

  /**
   * Exportar todos os dados (backup)
   */
  async exportAllData(): Promise<string> {
    try {
      const attendances = await this.loadAttendancesFromFile();
      const users = await this.loadUsersFromFile();
      
      const backup = {
        timestamp: new Date().toISOString(),
        attendances,
        users
      };
      
      const fileName = `backup_${new Date().getTime()}.json`;
      await Filesystem.writeFile({
        path: fileName,
        data: JSON.stringify(backup, null, 2),
        directory: this.dataDir,
        encoding: Encoding.UTF8
      });
      
      console.log('Backup criado:', fileName);
      return fileName;
    } catch (error) {
      console.error('Erro ao criar backup:', error);
      throw error;
    }
  }

  /**
   * Importar dados de um arquivo de backup
   */
  async importFromBackup(fileName: string): Promise<any> {
    try {
      const file = await Filesystem.readFile({
        path: fileName,
        directory: this.dataDir,
        encoding: Encoding.UTF8
      });
      
      const backup = JSON.parse(file.data as string);
      
      if (backup.attendances) {
        await this.saveAttendancesToFile(backup.attendances);
      }
      if (backup.users) {
        await this.saveUsersToFile(backup.users);
      }
      
      console.log('Backup restaurado com sucesso');
      return backup;
    } catch (error) {
      console.error('Erro ao importar backup:', error);
      throw error;
    }
  }

  /**
   * Listar todos os arquivos na pasta Documents
   */
  async listFiles(): Promise<string[]> {
    try {
      const result = await Filesystem.readdir({
        path: '',
        directory: this.dataDir
      });
      return result.files.map(f => f.name);
    } catch (error) {
      console.error('Erro ao listar arquivos:', error);
      return [];
    }
  }

  /**
   * Deletar um arquivo
   */
  async deleteFile(fileName: string): Promise<void> {
    try {
      await Filesystem.deleteFile({
        path: fileName,
        directory: this.dataDir
      });
      console.log('Arquivo deletado:', fileName);
    } catch (error) {
      console.error('Erro ao deletar arquivo:', error);
      throw error;
    }
  }
}