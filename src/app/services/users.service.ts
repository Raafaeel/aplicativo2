import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Address {
  address: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface User {
  id: number;
  firstName: string;
  lastName: string;
  age: number;
  email: string;
  username: string;
  password: string;
  birthDate: string;
  bloodGroup: string;
  height: number;
  weight: number;
  address: Address;
}

export interface UsersResponse {
  users: User[];
  total: number;
  skip: number;
  limit: number;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = 'https://dummyjson.com/users';
  private localUsers: User[] = [];

  constructor(private http: HttpClient) { }

  getUsers(): Observable<UsersResponse> {
    return this.http.get<UsersResponse>(this.apiUrl);
  }

  getUserById(id: number): User | undefined {
    return this.localUsers.find(u => u.id === id);
  }

  setUsers(users: User[]): void {
    this.localUsers = users;
  }

  updateUser(user: User): void {
    const index = this.localUsers.findIndex(u => u.id === user.id);
    if (index > -1) {
      this.localUsers[index] = user;
    }
  }
}