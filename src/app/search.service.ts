// src/app/search.service.ts
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import {
  ConnectionService,
  StoredStudent,
  StoredTeacher,
  Connection,
} from './layout/connections/connection.service';
import { Observable, of, forkJoin, map } from 'rxjs';

export interface SearchResult {
  type: 'student' | 'teacher' | 'connection' | 'page';
  id?: number;
  title: string;
  description: string;
  route: string;
  icon: string;
  highlightedTitle?: string;
  highlightedDescription?: string;
}

@Injectable({ providedIn: 'root' })
export class SearchService {
  private allPages: SearchResult[] = [
    { type: 'page', title: 'Overview', description: 'Dashboard overview page', route: '/home', icon: '<svg ...></svg>' },
    { type: 'page', title: 'Students', description: 'Manage students', route: '/student', icon: '<svg ...></svg>' },
    { type: 'page', title: 'Teachers', description: 'Manage teachers', route: '/teacher', icon: '<svg ...></svg>' },
    { type: 'page', title: 'Connections', description: 'Manage student-teacher connections', route: '/connections', icon: '<span class="material-symbols-outlined">link</span>' },
    { type: 'page', title: 'Relationship Map', description: 'View relationship map', route: '/relashion-map', icon: '<svg ...></svg>' }
  ];

  constructor(
    private connectionService: ConnectionService,
    private router: Router
  ) {}

  getAllPages(): SearchResult[] {
    return this.allPages;
  }

  search(query: string): Observable<SearchResult[]> {
    if (!query) {
      return of(this.getAllPages());
    }

    const term = query.toLowerCase().trim();
    let results: SearchResult[] = [];

    // 🟢 صفحات
    this.allPages.forEach(page => {
      if (
        page.title.toLowerCase().includes(term) ||
        page.description.toLowerCase().includes(term)
      ) {
        const highlightedPage = { ...page };
        highlightedPage.highlightedTitle = this.highlightText(page.title, term);
        highlightedPage.highlightedDescription = this.highlightText(page.description, term);
        results.push(highlightedPage);
      }
    });

    // 🟢 حملنا الطلاب + المدرسين + الـ connections من الـ service
    return forkJoin({
      students: this.connectionService.getStudents(),
      teachers: this.connectionService.getTeachers(),
      connections: this.connectionService.getAllConnections(),
    }).pipe(
      map(({ students, teachers, connections }) => {
        // 🔹 الطلبة
        students.forEach((student: StoredStudent) => {
          if (
            student.name.toLowerCase().includes(term) ||
            student.email.toLowerCase().includes(term) ||
            (student.phone && student.phone.toLowerCase().includes(term))
          ) {
            const result: SearchResult = {
              type: 'student',
              id: student.id,
              title: student.name,
              description: `Student - Grade`,
              route: '/student',
              icon: '<svg ...></svg>',
            };
            result.highlightedTitle = this.highlightText(student.name, term);
            result.highlightedDescription = this.highlightText(`Student - Grade `, term);
            results.push(result);
          }
        });

        // 🔹 المدرسين
        teachers.forEach((teacher: StoredTeacher) => {
          if (
            teacher.name.toLowerCase().includes(term) ||
            teacher.email.toLowerCase().includes(term) ||
            teacher.subject.toLowerCase().includes(term) ||
            teacher.phone?.toLowerCase().includes(term)
          ) {
            const result: SearchResult = {
              type: 'teacher',
              id: teacher.id,
              title: teacher.name,
              description: `Teacher - ${teacher.subject}`,
              route: '/teacher',
              icon: '<svg ...></svg>',
            };
            result.highlightedTitle = this.highlightText(teacher.name, term);
            result.highlightedDescription = this.highlightText(`Teacher - ${teacher.subject}`, term);
            results.push(result);
          }
        });

        // 🔹 العلاقات (Connections)
        connections.forEach((connection: Connection) => {
          const student = students.find(s => s.id === connection.studentId);
          const teacher = teachers.find(t => t.id === connection.teacherId);

          if (student && teacher) {
            const studentMatch = student.name.toLowerCase().includes(term);
            const teacherMatch =
              teacher.name.toLowerCase().includes(term) ||
              teacher.subject.toLowerCase().includes(term);

            if (studentMatch || teacherMatch) {
              const title = `${student.name} ↔ ${teacher.name}`;
              const description = `Connection - ${teacher.subject}`;

              const result: SearchResult = {
                type: 'connection',
                id: connection.id,
                title,
                description,
                route: '/connections',
                icon: '<span class="material-symbols-outlined">link</span>',
              };
              result.highlightedTitle = this.highlightText(title, term);
              result.highlightedDescription = this.highlightText(description, term);
              results.push(result);
            }
          }
        });

        return results;
      })
    );
  }

  private highlightText(text: string, term: string): string {
    if (!term) return text;
    const regex = new RegExp(`(${term})`, 'gi');
    return text.replace(regex, '<mark class="bg-yellow-200">$1</mark>');
  }

  navigateToResult(result: SearchResult): void {
    this.router.navigate([result.route]);
  }
}
