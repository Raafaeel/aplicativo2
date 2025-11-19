import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';
import { AttendanceService, Attendance } from '../../../services/attendance.service';

@Component({
  selector: 'app-attendance-history',
  templateUrl: './attendance-history.page.html',
  styleUrls: ['./attendance-history.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule]
})
export class AttendanceHistoryPage implements OnInit {
  completedAttendances: Attendance[] = [];
  filteredAttendances: Attendance[] = [];
  selectedStatus: string = 'todos';
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
      this.attendanceService.getCompletedAttendances().subscribe(data => {
        this.completedAttendances = data.sort((a, b) => {
          const dateA = new Date(b.date);
          const dateB = new Date(a.date);
          return dateB.getTime() - dateA.getTime();
        });
        this.filterByStatus();
        this.isLoading = false;
      });
    });
  }

  filterByStatus() {
    if (this.selectedStatus === 'todos') {
      this.filteredAttendances = this.completedAttendances;
    } else {
      this.filteredAttendances = this.completedAttendances.filter(
        a => a.status === this.selectedStatus
      );
    }
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }

  getStatusColor(status: string): string {
    switch (status) {
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

  onStatusChange() {
    this.filterByStatus();
  }
}