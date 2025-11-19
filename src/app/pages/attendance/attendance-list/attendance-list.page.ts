import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';
import { AttendanceService, Attendance } from '../../../services/attendance.service';

@Component({
  selector: 'app-attendance-list',
  templateUrl: './attendance-list.page.html',
  styleUrls: ['./attendance-list.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule]
})
export class AttendanceListPage implements OnInit {
  futureAttendances: Attendance[] = [];
  isLoading = true;

  constructor(
    private attendanceService: AttendanceService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadAttendances();
  }

  loadAttendances() {
    this.isLoading = true;
    // Garante que o serviço foi inicializado
    this.attendanceService.ensureInitialized().then(() => {
      this.attendanceService.getUpcomingAttendances().subscribe({
        next: (data) => {
          this.futureAttendances = data.sort((a, b) => {
            const dateA = new Date(a.date + 'T' + a.time);
            const dateB = new Date(b.date + 'T' + b.time);
            return dateA.getTime() - dateB.getTime();
          });
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Erro ao carregar atendimentos:', error);
          this.isLoading = false;
        }
      });
    });
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }

  formatTime(timeString: string): string {
    return timeString;
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'agendado':
        return 'primary';
      case 'atendido':
        return 'success';
      case 'cancelado':
        return 'danger';
      case 'transferido':
        return 'warning';
      default:
        return 'medium';
    }
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'agendado':
        return 'Agendado';
      case 'atendido':
        return 'Atendido';
      case 'cancelado':
        return 'Cancelado';
      case 'transferido':
        return 'Transferido';
      default:
        return status;
    }
  }

  editAttendance(attendance: Attendance) {
    this.router.navigate(['/attendance', attendance.id, 'edit']);
  }

  async markAsAttended(attendance: Attendance, event: Event) {
    event.stopPropagation();
    await this.attendanceService.updateStatus(attendance.id, 'atendido');
    this.loadAttendances();
  }

  async markAsCancelled(attendance: Attendance, event: Event) {
    event.stopPropagation();
    await this.attendanceService.updateStatus(attendance.id, 'cancelado');
    this.loadAttendances();
  }

  async markAsTransferred(attendance: Attendance, event: Event) {
    event.stopPropagation();
    await this.attendanceService.updateStatus(attendance.id, 'transferido');
    this.loadAttendances();
  }

  async deleteAttendance(attendance: Attendance, event: Event) {
    event.stopPropagation();
    if (confirm('Deseja realmente deletar este atendimento?')) {
      await this.attendanceService.deleteAttendance(attendance.id);
      this.loadAttendances();
    }
  }

  newAttendance() {
    this.router.navigate(['/attendance/new']);
  }

  goToHistory() {
    this.router.navigate(['/attendance-history']);
  }
}