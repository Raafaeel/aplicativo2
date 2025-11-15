import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService, User } from '../../../services/users.service';

@Component({
  selector: 'app-user-edit',
  templateUrl: './user-edit.page.html',
  styleUrls: ['./user-edit.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule]
})
export class UserEditPage implements OnInit {
  user: User | null = null;
  isLoading = true;
  errorMessage = '';
  userId: number = 0;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private userService: UserService
  ) { }

  ngOnInit() {
    this.userId = Number(this.route.snapshot.paramMap.get('id'));
    this.loadUser();
  }

  loadUser() {
    const user = this.userService.getUserById(this.userId);
    if (user) {
      this.user = { ...user };
      this.isLoading = false;
    } else {
      this.errorMessage = 'Usuário não encontrado';
      this.isLoading = false;
    }
  }

  saveUser() {
    if (this.user) {
      this.userService.updateUser(this.user);
      this.router.navigate(['/users']);
    }
  }

  cancel() {
    this.router.navigate(['/users']);
  }

  formatDateForInput(dateString: string): string {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  onDateChange(event: any) {
    if (this.user && event.detail.value) {
      this.user.birthDate = event.detail.value;
    }
  }
}