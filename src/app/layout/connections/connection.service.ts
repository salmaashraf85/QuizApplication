// src/app/connections/connection.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Connection {
  id: number;
  studentId: number;
  teacherId: number;
  createdAt: Date;
}
@Injectable({ providedIn: 'root' })
export class ConnectionService {
  private readonly baseUrl = 'http://localhost:8080/connections';

  constructor(private http: HttpClient) {}

  getAllConnections(): Observable<Connection[]> {
    return this.http.get<Connection[]>(this.baseUrl);
  }

  getConnectionsByStudent(studentId: number): Observable<Connection[]> {
    return this.http.get<Connection[]>(`${this.baseUrl}/student/${studentId}`);
  }

  addConnection(studentId: number, teacherId: number): Observable<Connection> {
    return this.http.post<Connection>(this.baseUrl, { studentId, teacherId });
  }

  removeConnection(connectionId: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${connectionId}`);
  }
}
