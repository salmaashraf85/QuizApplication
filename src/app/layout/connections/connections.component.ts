// src/app/layout/connections/connections.component.ts
import { Component, OnInit, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ConnectionService, Connection, StoredStudent, StoredTeacher } from './connection.service';
import { Observable, of } from 'rxjs';

@Component({
  selector: 'app-connections',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './connections.component.html',
  styleUrl: './connections.component.css',
})
export class ConnectionsComponent implements OnInit {
  students: StoredStudent[] = [];
  teachers: StoredTeacher[] = [];

  selectedStudentId = signal<number | null>(null);
  teacherSearch = signal<string>('');
  mode = signal<'assign' | 'manage'>('assign');

  connectionsByStudent$!: Observable<Connection[]>;

  filteredTeachers = computed(() => {
    const term = this.teacherSearch().toLowerCase().trim();
    if (!term) return this.teachers;
    return this.teachers.filter(
      (t) =>
        t.name.toLowerCase().includes(term) ||
        t.subject.toLowerCase().includes(term)
    );
  });

  get filteredTeachersList(): StoredTeacher[] {
    return this.filteredTeachers();
  }

  constructor(public connections: ConnectionService) {}

  ngOnInit(): void {
    // نجيب الطلاب
    this.connections.getStudents().subscribe((students) => {
      this.students = students;
    });

    // نجيب المدرسين
    this.connections.getTeachers().subscribe((teachers) => {
      this.teachers = teachers;
    });
  }

  onStudentChange(studentId: number | null) {
    this.selectedStudentId.set(studentId);
    if (studentId !== null) {
      this.connectionsByStudent$ = this.connections.getConnectionsByStudent(studentId);
    } else {
      this.connectionsByStudent$ = of([]);
    }
  }

  isTeacherAssigned(teacherId: number, connections: Connection[]): boolean {
    return connections.some((c) => c.teacherId === teacherId);
  }

  toggleAssignment(teacherId: number, checked: boolean, connections: Connection[]) {
    const studentId = this.selectedStudentId();
    if (studentId === null) return;

    if (checked) {
      if (!this.isTeacherAssigned(teacherId, connections)) {
        this.connections.addConnection(studentId, teacherId).subscribe(() => {
          this.onStudentChange(studentId); // refresh
        });
      }
    } else {
      const existing = connections.find((c) => c.teacherId === teacherId);
      if (existing) {
        this.connections.removeConnection(existing.id).subscribe(() => {
          this.onStudentChange(studentId); // refresh
        });
      }
    }
  }

  getSelectedStudentName(): string {
    const id = this.selectedStudentId();
    if (id === null) return '';
    return this.getStudentNameById(id);
  }

  getStudentNameById(id: number): string {
    return this.students.find((s) => s.id === id)?.name ?? '';
  }

  getTeacherNameById(id: number): string {
    return this.teachers.find((t) => t.id === id)?.name ?? '';
  }

  getTeacherSubjectById(id: number): string {
    return this.teachers.find((t) => t.id === id)?.subject ?? '';
  }
}
