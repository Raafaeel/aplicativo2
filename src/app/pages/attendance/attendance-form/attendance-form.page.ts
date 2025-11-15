import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { ActivatedRoute, Router } from '@angular/router';
import { AttendanceService, Attendance, CreateAttendanceRequest } from '../../../services/attendance.service';

@Component({
  selector: 'app-attendance-form',
  templateUrl: './attendance-form.page.html',
  styleUrls: ['./attendance-form.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule]
})
export class AttendanceFormPage implements OnInit {
  isNewAttendance = true;
  attendance: any = {
    patientName: '',
    patientPhone: '',
    date: '',
    time: '',
    serviceType: '',
    observations: ''
  };
  serviceTypes = ['Fisioterapia Geral', 'Recuperação Pós-operatória', 'Reabilitação', 'Drenagem Linfática', 'Massagem Terapêutica', 'Outro'];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private attendanceService: AttendanceService
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id && id !== 'new') {
      this.isNewAttendance = false;
      const existing = this.attendanceService.getAttendanceById(Number(id));
      if (existing) {
        this.attendance = { ...existing };
      }
    }
  }

  saveAttendance() {
    if (!this.attendance.patientName || !this.attendance.date || !this.attendance.time || !this.attendance.serviceType) {
      alert('Preencha todos os campos obrigatórios');
      return;
    }

    if (this.isNewAttendance) {
      this.attendanceService.createAttendance(this.attendance);
    } else {
      this.attendanceService.updateAttendance(this.attendance.id, this.attendance);
    }

    this.router.navigate(['/attendance']);
  }

  cancel() {
    this.router.navigate(['/attendance']);
  }

  getTodayDate(): string {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}