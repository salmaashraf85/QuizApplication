// src/app/layout/connections/connection.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Connection {
  id: number;
  studentId: number;
  teacherId: number;
  createdAt: Date;
}

export interface StoredStudent {
  id: number;
  name: string;
  email: string;
  phone?: string;
}

export interface StoredTeacher {
  id: number;
  name: string;
  subject: string;
  phone?: string;
  email: string;
}

@Injectable({ providedIn: 'root' })
export class ConnectionService {
  private readonly baseUrl = 'http://localhost:8081';

  constructor(private http: HttpClient) {}

  // 🔗 connections
  getAllConnections(): Observable<Connection[]> {
    return this.http.get<Connection[]>(`${this.baseUrl}/connections`);
  }

  getConnectionsByStudent(studentId: number): Observable<Connection[]> {
    return this.http.get<Connection[]>(`${this.baseUrl}/connections/student/${studentId}`);
  }

  addConnection(studentId: number, teacherId: number): Observable<Connection> {
  return this.http.post<Connection>(
    `${this.baseUrl}/connections/addConnection?studentId=${studentId}&teacherId=${teacherId}`,
    {}
  );
}

  removeConnection(connectionId: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/connections/${connectionId}`);
  }

  
  getStudents(): Observable<StoredStudent[]> {
    return this.http.get<StoredStudent[]>('http://localhost:8081/admin/students');
  }

  getTeachers(): Observable<StoredTeacher[]> {
    return this.http.get<StoredTeacher[]>('http://localhost:8081/admin/teachers');
  }
}
