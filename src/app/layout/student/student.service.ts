import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Student } from './student.component';
import { AuthService } from '../../../app/auth.service';

@Injectable({ providedIn: 'root' })
export class StudentService {
  private apiUrl = 'http://localhost:8081/admin/students';

  constructor(private http: HttpClient, private auth: AuthService) {}

  private getHeaders(): HttpHeaders {
    const token = this.auth.getToken();
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }

  getStudents(): Observable<Student[]> {
    return this.http.get<Student[]>(this.apiUrl, { headers: this.getHeaders() });
  }

  addStudent(student: Omit<Student, 'id'>): Observable<Student> {
    return this.http.post<Student>(
      'http://localhost:8081/admin/add',
      { ...student, roleId: 3 },
      { headers: this.getHeaders() }
    );
  }

  updateStudent(id: number, student: Student): Observable<Student> {
    return this.http.put<Student>( `http://localhost:8081/admin/update/${id}`, student, { headers: this.getHeaders() });
  }

  deleteStudent(id: number): Observable<void> {
    return this.http.delete<void>(`http://localhost:8081/admin/delete/${id}`, { headers: this.getHeaders() });
  }
}
