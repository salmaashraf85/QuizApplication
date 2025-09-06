import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClientModule } from '@angular/common/http'; // ✅ مهم Standalone
import { z } from 'zod';
import { HlmInput } from '@spartan-ng/helm/input';
import { HlmButton } from '@spartan-ng/helm/button';
import { toast } from 'ngx-sonner';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-sign-in',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, HlmInput, HlmButton, HttpClientModule], // ✅ HttpClientModule
  templateUrl: './sign-in.component.html',
  styleUrls: ['./sign-in.component.css'],
})
export class SignInComponent {
  form: FormGroup;
  errors: { username?: string; password?: string } = {};
  submitted = false;
  showPassword = false;
  passwordHasValue = false;

  constructor(
  private fb: FormBuilder,
  private router: Router,
  private authService: AuthService
  ) {
    this.form = this.fb.group({
      username: [''],
      password: [''],
    });

    this.form.valueChanges.subscribe((value) => {
      const trimmedValue = {
        username: value.username?.trim(),
        password: value.password?.trim(),
      };
      this.form.patchValue(trimmedValue, { emitEvent: false });

      if (this.submitted) {
        this.validateForm(trimmedValue);
      }
    });
  }

  // ✅ أبسط schema بدون أي prefixes
  schema = z.object({
    username: z.string().min(3, 'Username must be at least 3 characters'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
  });

  validateForm(value: any) {
    this.errors = {};
    const result = this.schema.safeParse(value);
    if (!result.success) {
      result.error.issues.forEach((issue) => {
        const field = issue.path[0] as 'username' | 'password';
        this.errors[field] = issue.message;
      });
    }
  }

  onPasswordInput() {
    const value = this.form.get('password')?.value;
    this.passwordHasValue = !!value;
    if (!value) this.showPassword = false;
  }

  focusNext(nextInput: HTMLInputElement) {
    if (nextInput) {
      nextInput.focus();
    }
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  onSubmit() {
    this.submitted = true;

    const trimmedValue = {
      username: this.form.value.username?.trim(),
      password: this.form.value.password?.trim(),
    };

    this.validateForm(trimmedValue);

    if (Object.keys(this.errors).length) {
      Object.values(this.errors).forEach((message) => toast.error(message));
      return;
    }

    // ✅ Use AuthService.login() with Observable
    this.authService.login(trimmedValue.username, trimmedValue.password)
      .subscribe({
        next: (res: { token: string; role: string }) => {
          // Save token
          localStorage.setItem('token', res.token);

          toast.success('✅ Login successful!', { duration: 2000 });

          // Redirect by role
         if (res.role === 'ROLE_STUDENT') {
      this.router.navigate(['/student-dashboard']);
     } else if (res.role === 'ROLE_TEACHER') {
     this.router.navigate(['/teacher-dashboard']);
     } else if (res.role === 'ROLE_ADMIN') {
      this.router.navigate(['/home']);
}
        },
        error: () => {
          toast.error('❌ Invalid username or password');
        }
      });
  }
}
