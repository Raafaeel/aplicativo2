import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})

export class AuthService {
  private apiUrl = 'https://dummyjson.com/users';
  private userSubject = new BehaviorSubject<any>(null);
  user$ = this.userSubject.asObservable();

  constructor(private http: HttpClient) {}
  login(username: string, password: string) {
    return this.http.get<any>(this.apiUrl, { username, password }).pipe(
      tap(response => {
        if (response && response.token) {
          localStorage.setItem('user', JSON.stringify(response));
          this.userSubject.next(response);
        }
      })
    );
  }

  logout() {
    localStorage.removeItem('user');
    this.userSubject.next(null);
  }

  getUser() {
    return JSON.parse(localStorage.getItem('user') || 'null');
  }

  isLoggedIn() {
    return !!this.getUser();
  }
}
