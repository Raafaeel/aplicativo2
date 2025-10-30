import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: false,
})
export class LoginPage  {
  username = '';
  password = '';
  errorMessage = '';
  constructor(private auth: AuthService, private router: Router) {}
  onLogin() {
    this.auth.login(this.username, this.password).subscribe({
      next: () => {
        this.router.navigateByUrl('/home', { replaceUrl: true });
      },
      error: () => {
        this.errorMessage = 'Login inválido';
      },
    });
  }
}
