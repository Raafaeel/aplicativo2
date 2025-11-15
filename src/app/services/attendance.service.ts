import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

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
  patientId: number;
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

  constructor() {
    this.loadAttendances();
  }

  private loadAttendances(): void {
    const stored = localStorage.getItem('attendances');
    if (stored) {
      const data = JSON.parse(stored);
      this.attendances$.next(data);
      this.nextId = Math.max(...data.map((a: Attendance) => a.id), 0) + 1;
    }
  }

  private saveAttendances(): void {
    localStorage.setItem('attendances', JSON.stringify(this.attendances$.value));
  }

  getAttendances(): Observable<Attendance[]> {
    return this.attendances$.asObservable();
  }

  getAttendanceById(id: number): Attendance | undefined {
    return this.attendances$.value.find(a => a.id === id);
  }

  createAttendance(request: CreateAttendanceRequest): Attendance {
    const attendance: Attendance = {
      id: this.nextId++,
      ...request,
      status: 'agendado',
      createdAt: new Date().toISOString()
    };
    this.attendances$.next([...this.attendances$.value, attendance]);
    this.saveAttendances();
    return attendance;
  }

  updateAttendance(id: number, updates: Partial<Attendance>): void {
    const index = this.attendances$.value.findIndex(a => a.id === id);
    if (index > -1) {
      const updated = { ...this.attendances$.value[index], ...updates };
      const newAttendances = [...this.attendances$.value];
      newAttendances[index] = updated;
      this.attendances$.next(newAttendances);
      this.saveAttendances();
    }
  }

  deleteAttendance(id: number): void {
    this.attendances$.next(this.attendances$.value.filter(a => a.id !== id));
    this.saveAttendances();
  }

  getUpcomingAttendances(): Observable<Attendance[]> {
    return new BehaviorSubject(
      this.attendances$.value.filter(a => a.status === 'agendado' && new Date(a.date + 'T' + a.time) > new Date())
    ).asObservable();
  }

  getCompletedAttendances(): Observable<Attendance[]> {
    return new BehaviorSubject(
      this.attendances$.value.filter(a => ['atendido', 'cancelado', 'transferido'].includes(a.status))
    ).asObservable();
  }

  updateStatus(id: number, status: 'atendido' | 'cancelado' | 'transferido'): void {
    this.updateAttendance(id, {
      status,
      completedAt: status === 'atendido' ? new Date().toISOString() : undefined
    });
  }
}