import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { z } from 'zod';
import { toast } from 'ngx-sonner';
import { ActivityService } from '../../activity.service';
import { StudentService} from './student.service';


export interface Student {
  id: number;
  name: string;
  email: string;
  gender: string;
  userName: string;
  password: string;
  phone?: string;
}

@Component({
  selector: 'app-student',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './student.component.html',
  styleUrls: ['./student.component.css'],
})
export class StudentComponent implements OnInit {
  students: Student[] = [];
  filteredStudents: Student[] = [];
  currentStudent: Omit<Student, 'id'> & { id: number | null } = {
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
  errors: Partial<Record<keyof Student, string>> = {};
  formValid = false;
  genderOptions = ['Male', 'Female'];

  constructor(
    private activityService: ActivityService,
    private studentService: StudentService
  ) {}

  ngOnInit() {
    this.loadStudents();
  }

  loadStudents() {
    this.studentService.getStudents().subscribe({
      next: (data) => {
        this.students = data;
        this.filteredStudents = [...this.students];
      },
      error: () => toast.error('Failed to load students'),
    });
  }

  filterStudents() {
    if (!this.searchTerm) {
      this.filteredStudents = [...this.students];
      return;
    }
    const term = this.searchTerm.toLowerCase();
    this.filteredStudents = this.students.filter(
      (s) =>
        s.name.toLowerCase().includes(term) ||
        s.email.toLowerCase().includes(term) ||
        s.gender.toLowerCase().includes(term) ||
        (s.phone && s.phone.includes(term))
    );
  }

  openAddModal() {
    this.isEditMode = false;
    this.currentStudent = {
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

  editStudent(student: Student) {
    this.isEditMode = true;
    this.currentStudent = { ...student };
    this.errors = {};
    this.showPassword = false;
    this.formValid = true;
    this.showModal = true;
  }

  deleteStudent(id: number) {
    const student = this.students.find((s) => s.id === id);
    if (!student) return;

    if (!confirm('Are you sure you want to delete this student?')) return;

    this.studentService.deleteStudent(id).subscribe({
      next: () => {
        this.students = this.students.filter((s) => s.id !== id);
        this.filterStudents();

        toast.success('Student deleted successfully!');
        this.activityService.addActivity(
          'student',
          'Deleted Student',
          `Student ${student.name} was deleted`
        );
      },
      error: () => toast.error('Failed to delete student'),
    });
  }

  onInputChange() {
    const result = this.studentSchema.safeParse(this.currentStudent);
    if (!result.success) {
      this.errors = {};
      result.error.issues.forEach((issue) => {
        const key = issue.path[0] as keyof Student;
        this.errors[key] = issue.message;
      });
      this.formValid = false;
    } else {
      this.errors = {};
      this.formValid = true;
    }
  }

  addStudent() {
    if (!this.formValid) return;

    const studentWithoutId = { ...this.currentStudent } as Omit<Student, 'id'>;

    this.studentService.addStudent(studentWithoutId).subscribe({
      next: (newStudent) => {
        this.students.push(newStudent);
        this.filterStudents();

        toast.success('Student added successfully!');
        this.activityService.addActivity(
          'student',
          'Added Student',
          `Student ${newStudent.name} was added`
        );

        this.closeModal();
      },
      error: () => toast.error('Failed to add student'),
    });
  }

  updateStudent() {
    if (!this.formValid || this.currentStudent.id === null) return;

    this.studentService
      .updateStudent(this.currentStudent.id, this.currentStudent as Student)
      .subscribe({
        next: (updated) => {
          const index = this.students.findIndex((s) => s.id === updated.id);
          if (index !== -1) {
            this.students[index] = updated;
            this.filterStudents();
          }

          toast.success('Student updated successfully!');
          this.activityService.addActivity(
            'student',
            'Updated Student',
            `Student ${updated.name} was updated`
          );

          this.closeModal();
        },
        error: () => toast.error('Failed to update student'),
      });
  }

  closeModal() {
    this.showModal = false;
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  studentSchema = z.object({
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
