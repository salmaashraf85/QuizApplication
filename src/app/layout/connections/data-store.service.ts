import { Injectable } from '@angular/core';

export interface StoredStudent {
  id: number;
  name: string;
  email: string;
  grade: string;
  phone?: string;
}

export interface StoredTeacher {
  id: number;
  name: string;
  email: string;
  subject: string;
  phone: string;
}

@Injectable({ providedIn: 'root' })
export class DataStoreService {
  private readonly studentsKey = 'students';
  private readonly teachersKey = 'teachers';

  getStudents(): StoredStudent[] {
    try {
      const raw = localStorage.getItem(this.studentsKey);
      return raw ? JSON.parse(raw) as StoredStudent[] : [];
    } catch {
      return [];
    }
  }

  saveStudents(students: StoredStudent[]): void {
    localStorage.setItem(this.studentsKey, JSON.stringify(students));
  }

  getTeachers(): StoredTeacher[] {
    try {
      const raw = localStorage.getItem(this.teachersKey);
      return raw ? JSON.parse(raw) as StoredTeacher[] : [];
    } catch {
      return [];
    }
  }

  saveTeachers(teachers: StoredTeacher[]): void {
    localStorage.setItem(this.teachersKey, JSON.stringify(teachers));
  }
}

