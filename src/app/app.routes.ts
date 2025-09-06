import { Routes } from '@angular/router';
import { LayoutComponent } from './layout/layout.component';
import { OverviewComponent } from './layout/overview/overview.component';
import { StudentComponent } from './layout/student/student.component';
import { TeacherComponent } from './layout/teacher/teacher.component';
import { ConnectionsComponent } from './layout/connections/connections.component';
import { RelashionMapComponent } from './layout/relashion-map/relashion-map.component';
import { ErrorpageComponent } from './errorpage/errorpage.component';
import { IndexComponent } from './index/index.component';
import { SignInComponent } from './sign-in/sign-in.component';
import { LayoutStudentComponent } from './main-app/student/layout-student/layout-student.component';
import { StudentDashboardComponent } from './main-app/student/student-dashboard/student-dashboard.component';

import { authGuard } from './auth.guard';
import { QuizFormComponent } from './main-app/teacher/quiz-form/quiz-form.component';

import { AttemptQuizComponent } from './main-app/student/attempt-quiz/attempt-quiz.component';
import { TeacherDashboardComponent } from './main-app/teacher/teacher-dashboard/teacher-dashboard.component';
import { LayoutTeacherComponent } from './main-app/teacher/layout-teacher/layout-teacher.component';
import { StudentToTeacherComponent } from './main-app/teacher/student-to-teacher/student-to-teacher.component';
import { ConnectStudentsComponent } from './main-app/student/connect-students/connect-students.component';
import { ViewDetailesComponent } from './main-app/teacher/view-detailes/view-detailes.component';
import { GradingQuizComponent } from './main-app/teacher/grading-quiz/grading-quiz.component';
import { ReviewQuizComponent } from './main-app/student/review-quiz/review-quiz.component';

export const routes: Routes = [
  { path: '', redirectTo: 'index', pathMatch: 'full' },
  { path: 'index', component: IndexComponent },
  { path: 'sign-in', component: SignInComponent },

  {
    path: '',
    component: LayoutComponent,
    canActivate: [authGuard],
    data: { role: 'ROLE_ADMIN' },
    children: [
      { path: 'home', component: OverviewComponent },
      { path: 'student', component: StudentComponent },
      { path: 'teacher', component: TeacherComponent },
      { path: 'connections', component: ConnectionsComponent },
      { path: 'relashion-map', component: RelashionMapComponent },
    ],
  },
  {
    path: '',
    component: LayoutTeacherComponent,
    canActivate: [authGuard],
    data: { role: 'ROLE_TEACHER' },
    children: [
      { path: 'create-quiz', component: QuizFormComponent },
      { path: 'teacher-dashboard', component: TeacherDashboardComponent },
      { path: 'student-to-teacher', component: StudentToTeacherComponent },
      { path: 'view-detailes/:id', component: ViewDetailesComponent },
      { path: 'grading-quiz/:id', component: GradingQuizComponent },
    ],
  },
  {
    path: '',
    component: LayoutStudentComponent,
    canActivate: [authGuard],
    data: { role: 'ROLE_STUDENT' },
    children: [
      { path: 'student-dashboard', component: StudentDashboardComponent },
      { path: 'teacher-to-student', component: StudentToTeacherComponent },
      { path: 'connect-student', component: ConnectStudentsComponent },
      { path: 'attempt-quiz/:id', component: AttemptQuizComponent },
      { path: 'review-quiz/:id', component: ReviewQuizComponent },
    ],
  },

  { path: '**', component: ErrorpageComponent },
];
