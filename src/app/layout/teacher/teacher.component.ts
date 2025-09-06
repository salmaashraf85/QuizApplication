import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { z } from 'zod';
import { toast } from 'ngx-sonner';
import { ActivityService } from '../../activity.service';
import { TeacherService } from './teacher.serviec'; 

export interface Teacher {
  id: number;
  name: string;
  email: string;
  gender: string;
  userName: string;
  password: string;
  phone?: string;
}

@Component({
  selector: 'app-teacher',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './teacher.component.html',
  styleUrls: ['./teacher.component.css'],
})
export class TeacherComponent implements OnInit {
  teachers: Teacher[] = [];
  filteredTeachers: Teacher[] = [];
  currentTeacher: Omit<Teacher, 'id'> & { id: number | null } = {
    id: null,
    name: '',
    email: '',
    gender: '',
    userName: '',
    password: '',
    phone: '',
  };

  showPassword = false;
  showModal = false;
  isEditMode = false;
  searchTerm = '';
  errors: Partial<Record<keyof Teacher, string>> = {};
  formValid = false;
  genderOptions = ['Male', 'Female'];

  constructor(
    private activityService: ActivityService,
    private teacherService: TeacherService // ✅ حقن السيرفز
  ) {}

  ngOnInit() {
    this.loadTeachers(); // ✅ أول ما الكومبوننت يفتح
  }

  loadTeachers() {
    this.teacherService.getTeachers().subscribe({
      next: (data) => {
        this.teachers = data;
        this.filteredTeachers = [...this.teachers];
      },
      error: () => toast.error('Failed to load teachers'),
    });
  }

  filterTeachers() {
    if (!this.searchTerm) {
      this.filteredTeachers = [...this.teachers];
      return;
    }
    const term = this.searchTerm.toLowerCase();
    this.filteredTeachers = this.teachers.filter(
      (t) =>
        t.name.toLowerCase().includes(term) ||
        t.email.toLowerCase().includes(term) ||
        t.gender.toLowerCase().includes(term) ||
        (t.phone && t.phone.includes(term))
    );
  }

  openAddModal() {
    this.isEditMode = false;
    this.currentTeacher = {
      id: null,
      name: '',
      email: '',
      gender: '',
      userName: '',
      password: '',
      phone: '',
    };
    this.errors = {};
    this.formValid = false;
    this.showModal = true;
  }

  editTeacher(teacher: Teacher) {
    this.isEditMode = true;
    this.currentTeacher = { ...teacher };
    this.errors = {};
    this.showPassword = false;
    this.formValid = true;
    this.showModal = true;
  }

  deleteTeacher(id: number) {
    const teacher = this.teachers.find((t) => t.id === id);
    if (!teacher) return;

    if (!confirm('Are you sure you want to delete this teacher?')) return;

    this.teacherService.deleteTeacher(id).subscribe({
      next: () => {
        this.teachers = this.teachers.filter((t) => t.id !== id);
        this.filterTeachers();

        toast.success('Teacher deleted successfully!');
        this.activityService.addActivity(
          'teacher',
          'Deleted Teacher',
          `Teacher ${teacher.name} was deleted`
        );
      },
      error: () => toast.error('Failed to delete teacher'),
    });
  }

  onInputChange() {
    const result = this.teacherSchema.safeParse(this.currentTeacher);
    if (!result.success) {
      this.errors = {};
      result.error.issues.forEach((issue) => {
        const key = issue.path[0] as keyof Teacher;
        this.errors[key] = issue.message;
      });
      this.formValid = false;
    } else {
      this.errors = {};
      this.formValid = true;
    }
  }

  addTeacher() {
    if (!this.formValid) return;

    const teacherWithoutId = { ...this.currentTeacher } as Omit<Teacher, 'id'>;

    this.teacherService.addTeacher(teacherWithoutId).subscribe({
      next: (newTeacher) => {
        this.teachers.push(newTeacher);
        this.filterTeachers();

        toast.success('Teacher added successfully!');
        this.activityService.addActivity(
          'teacher',
          'Added Teacher',
          `Teacher ${newTeacher.name} was added`
        );

        this.closeModal();
      },
      error: () => toast.error('Failed to add teacher'),
    });
  }

  updateTeacher() {
    if (!this.formValid || this.currentTeacher.id === null) return;

    this.teacherService
      .updateTeacher(this.currentTeacher.id, this.currentTeacher as Teacher)
      .subscribe({
        next: (updated) => {
          const index = this.teachers.findIndex((t) => t.id === updated.id);
          if (index !== -1) {
            this.teachers[index] = updated;
            this.filterTeachers();
          }

          toast.success('Teacher updated successfully!');
          this.activityService.addActivity(
            'teacher',
            'Updated Teacher',
            `Teacher ${updated.name} was updated`
          );

          this.closeModal();
        },
        error: () => toast.error('Failed to update teacher'),
      });
  }

  closeModal() {
    this.showModal = false;
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  teacherSchema = z.object({
    name: z.string().min(2, 'Name is required'),
    email: z
      .string()
      .email('Invalid email')
      .endsWith('@gmail.com', 'Email must end with @gmail.com'),
    gender: z.string().min(1, 'Gender is required'),
    phone: z.string().regex(/^\d*$/, 'Phone must be numbers only').optional(),
    userName: z.string().min(4, 'Username must be at least 4 characters'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[\W_]/, 'Password must contain at least one special character')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number'),
  });
}
