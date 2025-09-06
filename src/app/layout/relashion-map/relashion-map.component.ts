// relashion-map.component.ts
import { Component, OnInit, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  DataStoreService,
  StoredStudent,
  StoredTeacher,
} from '../connections/data-store.service';
import { ConnectionService, Connection } from '../connections/connection.service';

@Component({
  selector: 'app-relashion-map',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './relashion-map.component.html',
  styleUrls: ['./relashion-map.component.css'],
})
export class RelashionMapComponent implements OnInit {
  students: StoredStudent[] = [];
  teachers: StoredTeacher[] = [];
  connections: Connection[] = [];   // هنا نخزن نسخة من الـ connections

  viewMode = signal<'all' | 'by-student' | 'by-teacher'>('all');
  search = signal<string>('');

  constructor(
    private store: DataStoreService,
    private connectionService: ConnectionService
  ) {}

  ngOnInit(): void {
    this.students = this.store.getStudents();
    this.teachers = this.store.getTeachers();

    // تحميل كل الـ connections من السيرفر مرّة واحدة
    this.connectionService.getAllConnections().subscribe((conns) => {
      this.connections = conns;
    });
  }

  // Derived data
  readonly studentWithAssignments = computed(() => {
    const term = this.search().toLowerCase().trim();
    return this.students
      .filter((s) => !term || s.name.toLowerCase().includes(term))
      .map((s) => {
        const links = this.connections.filter((c) => c.studentId === s.id);
        const teacherInfos = links
          .map((l) => this.teachers.find((t) => t.id === l.teacherId))
          .filter(Boolean) as StoredTeacher[];
        return {
          student: s,
          teachers: teacherInfos,
          count: teacherInfos.length,
          createdAtList: links.map((l) => l.createdAt),
        };
      });
  });

  readonly teacherWithAssignments = computed(() => {
    const term = this.search().toLowerCase().trim();
    return this.teachers
      .filter(
        (t) =>
          !term ||
          t.name.toLowerCase().includes(term) ||
          t.subject.toLowerCase().includes(term)
      )
      .map((t) => {
        const links = this.connections.filter((c) => c.teacherId === t.id);
        const studentInfos = links
          .map((l) => this.students.find((s) => s.id === l.studentId))
          .filter(Boolean) as StoredStudent[];
        return {
          teacher: t,
          students: studentInfos,
          count: studentInfos.length,
          createdAtList: links.map((l) => l.createdAt),
        };
      });
  });
}
