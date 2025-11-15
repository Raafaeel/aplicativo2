import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';
import { UserService, User } from '../../services/users.service';

@Component({
  selector: 'app-users',
  templateUrl: './users.page.html',
  styleUrls: ['./users.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule]
})
export class UsersPage implements OnInit {
  users: User[] = [];
  isLoading = true;
  errorMessage = '';

  constructor(
    private userService: UserService,
    private router: Router
  ) { }

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    this.userService.getUsers().subscribe({
      next: (response) => {
        this.users = response.users;
        this.userService.setUsers(response.users);
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = 'Erro ao carregar usuários';
        this.isLoading = false;
        console.error(error);
      }
    });
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }

  getFullAddress(user: User): string {
    const addr = user.address;
    return `${addr.address}, ${addr.city}, ${addr.state}, ${addr.postalCode}, ${addr.country}`;
  }

  editUser(user: User) {
    this.router.navigate(['/users', user.id, 'edit']);
  }

  goBack() {
    this.router.navigate(['/home']);
  }
}