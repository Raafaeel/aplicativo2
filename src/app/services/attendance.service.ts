import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { FileStorageService } from './file-storage.service';

export interface Attendance {
  id: number;
  patientId: number;
  patientName: string;
  patientPhone: string;
  date: string;
  time: string;
  serviceType: string;
  observations: string;
  status: 'agendado' | 'atendido' | 'cancelado' | 'transferido';
  createdAt: string;
  completedAt?: string;
}

export interface CreateAttendanceRequest {
  patientName: string;
  patientPhone: string;
  date: string;
  time: string;
  serviceType: string;
  observations: string;
}

@Injectable({
  providedIn: 'root'
})
export class AttendanceService {
  private attendances$ = new BehaviorSubject<Attendance[]>([]);
  private nextId = 1;
  private initialized = false;
  private initPromise: Promise<void> | null = null;

  constructor(private fileStorage: FileStorageService) {
    this.initPromise = this.initialize();
  }

  private async initialize(): Promise<void> {
    if (!this.initialized) {
      await this.loadAttendances();
      this.initialized = true;
    }
  }

  private async loadAttendances(): Promise<void> {
    try {
      const data = await this.fileStorage.loadAttendancesFromFile();
      if (data && data.length > 0) {
        this.attendances$.next(data);
        this.nextId = Math.max(...data.map((a: Attendance) => a.id), 0) + 1;
      } else {
        // Fallback para localStorage
        const stored = localStorage.getItem('attendances');
        if (stored) {
          const parsedData = JSON.parse(stored);
          this.attendances$.next(parsedData);
          this.nextId = Math.max(...parsedData.map((a: Attendance) => a.id), 0) + 1;
        }
      }
    } catch (error) {
      console.warn('Erro ao carregar atendimentos do arquivo:', error);
      // Fallback para localStorage
      const stored = localStorage.getItem('attendances');
      if (stored) {
        try {
          const data = JSON.parse(stored);
          this.attendances$.next(data);
          this.nextId = Math.max(...data.map((a: Attendance) => a.id), 0) + 1;
        } catch (parseError) {
          console.error('Erro ao fazer parse do localStorage:', parseError);
        }
      }
    }
  }

  private async saveAttendances(): Promise<void> {
    try {
      await this.fileStorage.saveAttendancesToFile(this.attendances$.value);
      localStorage.setItem('attendances', JSON.stringify(this.attendances$.value));
    } catch (error) {
      console.error('Erro ao salvar atendimentos:', error);
      // Tenta salvar apenas no localStorage como fallback
      localStorage.setItem('attendances', JSON.stringify(this.attendances$.value));
    }
  }

  // Aguardar inicialização antes de qualquer operação
  async ensureInitialized(): Promise<void> {
    if (this.initPromise) {
      await this.initPromise;
    }
  }

  getAttendances(): Observable<Attendance[]> {
    return this.attendances$.asObservable();
  }

  getAttendanceById(id: number): Attendance | undefined {
    return this.attendances$.value.find(a => a.id === id);
  }

  async createAttendance(request: CreateAttendanceRequest): Promise<Attendance> {
    await this.ensureInitialized();
    
    const attendance: Attendance = {
      id: this.nextId++,
      patientId: 0,
      ...request,
      status: 'agendado',
      createdAt: new Date().toISOString()
    };
    const updatedAttendances = [...this.attendances$.value, attendance];
    this.attendances$.next(updatedAttendances);
    await this.saveAttendances();
    return attendance;
  }

  async updateAttendance(id: number, updates: Partial<Attendance>): Promise<void> {
    await this.ensureInitialized();
    
    const index = this.attendances$.value.findIndex(a => a.id === id);
    if (index > -1) {
      const updated = { ...this.attendances$.value[index], ...updates };
      const newAttendances = [...this.attendances$.value];
      newAttendances[index] = updated;
      this.attendances$.next(newAttendances);
      await this.saveAttendances();
    }
  }

  async deleteAttendance(id: number): Promise<void> {
    await this.ensureInitialized();
    
    const filtered = this.attendances$.value.filter(a => a.id !== id);
    this.attendances$.next(filtered);
    await this.saveAttendances();
  }

  getUpcomingAttendances(): Observable<Attendance[]> {
    const upcoming = this.attendances$.value.filter(a => {
      if (a.status !== 'agendado') return false;
      const attendanceDateTime = new Date(a.date + 'T' + a.time);
      return attendanceDateTime > new Date();
    });
    return new BehaviorSubject(upcoming).asObservable();
  }

  getCompletedAttendances(): Observable<Attendance[]> {
    const completed = this.attendances$.value.filter(a => 
      ['atendido', 'cancelado', 'transferido'].includes(a.status)
    );
    return new BehaviorSubject(completed).asObservable();
  }

  async updateStatus(id: number, status: 'atendido' | 'cancelado' | 'transferido'): Promise<void> {
    await this.updateAttendance(id, {
      status,
      completedAt: status === 'atendido' ? new Date().toISOString() : undefined
    });
  }
}