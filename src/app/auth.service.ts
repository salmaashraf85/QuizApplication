// src/app/auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

// شكل الـ response اللي بيرجعه الـ backend
interface LoginResponse {
  token: string;
  role: 'ROLE_STUDENT' | 'ROLE_TEACHER' | 'ROLE_ADMIN';
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private baseUrl = 'http://localhost:8081/auth';
  private loggedIn = false;
  private role: 'ROLE_STUDENT' | 'ROLE_TEACHER' | 'ROLE_ADMIN' | null = null;

  constructor(private http: HttpClient) {
    const savedToken = localStorage.getItem('token');
    const savedRole = localStorage.getItem('role') as
      | 'ROLE_STUDENT'
      | 'ROLE_TEACHER'
      | 'ROLE_ADMIN'
      | null;

    this.loggedIn = !!savedToken;
    this.role = savedRole;
  }

  isLoggedIn(): boolean {
    return this.loggedIn;
  }

  getRole(): 'ROLE_STUDENT' | 'ROLE_TEACHER' | 'ROLE_ADMIN' | null {
    return this.role;
  }

  // 🆕 هترجع التوكن للـ interceptor أو أي service تانية
  getToken(): string | null {
    return localStorage.getItem('token');
  }

  // 🆕 login بيرجع LoginResponse بدل any
  login(username: string, password: string): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(`${this.baseUrl}/login`, { username, password })
      .pipe(
        tap((res) => {
          localStorage.setItem('token', res.token);
          localStorage.setItem('role', res.role);

          this.loggedIn = true;
          this.role = res.role;
        })
      );
  }

  logout() {
    this.loggedIn = false;
    this.role = null;
    localStorage.removeItem('token');
    localStorage.removeItem('role');
  }
}
