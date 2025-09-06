import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Teacher } from './teacher.component';
import { AuthService } from '../../../app/auth.service';

@Injectable({ providedIn: 'root' })
export class TeacherService {
  private apiUrl = 'http://localhost:8081/admin/teachers';

  constructor(private http: HttpClient, private auth: AuthService) {}

  private getHeaders(): HttpHeaders {
    const token = this.auth.getToken();
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }

  getTeachers(): Observable<Teacher[]> {
    return this.http.get<Teacher[]>(this.apiUrl, { headers: this.getHeaders() });
  }

  addTeacher(teacher: Omit<Teacher, 'id'>): Observable<Teacher> {
    return this.http.post<Teacher>(
      'http://localhost:8081/admin/add',
      { ...teacher, roleId: 2 },
      { headers: this.getHeaders() }
    );
  }

  updateTeacher(id: number, teacher: Teacher): Observable<Teacher> {
    return this.http.put<Teacher>( `http://localhost:8081/admin/update/${id}`, teacher, { headers: this.getHeaders() });
  }

  deleteTeacher(id: number): Observable<void> {
    return this.http.delete<void>(`http://localhost:8081/admin/delete/${id}`, { headers: this.getHeaders() });
  }
}
