import { Component, ElementRef, QueryList, ViewChildren } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  FormArray,
  Validators,
  FormControl,
} from '@angular/forms';
import {
  HlmDialog,
  HlmDialogContent,
  HlmDialogFooter,
  HlmDialogHeader,
} from '@spartan-ng/helm/dialog';
import { BrnDialogContent, BrnDialogTrigger } from '@spartan-ng/brain/dialog';

import { HlmInput } from '@spartan-ng/helm/input';
import { BrnSelectImports } from '@spartan-ng/brain/select';
import { HlmSelectImports } from '@spartan-ng/helm/select';
import { HlmButton } from '@spartan-ng/helm/button';
import { QuizDataService } from '../../quiz.service';
import { Quiz } from '../../quiz.model';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
@Component({
  selector: 'app-quiz-form',
  standalone: true,
  imports: [
    HlmButton,
    CommonModule,
    ReactiveFormsModule,
    BrnSelectImports,
    HlmSelectImports,
    HlmInput,
    BrnDialogTrigger,
    BrnDialogContent,
    HlmDialog,
    HlmDialogContent,
    HlmDialogFooter,
    HlmDialogHeader,
  ],
  templateUrl: './quiz-form.component.html',
})
export class QuizFormComponent {
  quizForm: FormGroup;
  minDateTime!: string;
  /** Temporary controls for the "Add Question" form */
  newQuestionType = new FormControl<'mcq' | 'written'>('mcq', {
    nonNullable: true,
  });
  newQuestionPoints = new FormControl<number>(1, { nonNullable: true });
  newQuestionText = new FormControl<string>('', {
    validators: Validators.required,
    nonNullable: true,
  });
  private minDateTimeValidator(control: FormControl) {
    if (!control.value) return null;
    const selected = new Date(control.value);
    const now = new Date();
    now.setMinutes(now.getMinutes() + 1);
    return selected < now ? { minDateTime: true } : null;
  }

  /** ✅ Temporary MCQ state (always 4 options) */
  tempOptionControls: FormArray<FormControl<string>>;
  tempCorrectIndex: number | null = null;

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private quizDataService: QuizDataService,
    private location: Location
  ) {
    this.quizForm = this.fb.nonNullable.group({
      title: ['', Validators.required],
      description: [''],
      duration: [30, [Validators.required, Validators.min(1)]],
      startTime: ['', [Validators.required, this.minDateTimeValidator]],
      questions: this.fb.array<FormGroup>([]),
    });

    // ✅ Initialize 4 empty option controls
    this.tempOptionControls = this.fb.array<FormControl<string>>([
      this.fb.control('', Validators.required) as FormControl<string>,
      this.fb.control('', Validators.required) as FormControl<string>,
      this.fb.control('', Validators.required) as FormControl<string>,
      this.fb.control('', Validators.required) as FormControl<string>,
    ]);
  }

  /** Getter for questions FormArray re*/
  get questions(): FormArray<FormGroup> {
    return this.quizForm.get('questions') as FormArray<FormGroup>;
  }

  /** Get options FormArray for a question */
  getOptions(questionIndex: number): FormArray<FormGroup> {
    return this.questions
      .at(questionIndex)
      .get('options') as FormArray<FormGroup>;
  }

  getOptionControl(questionIndex: number, optionIndex: number): FormControl {
    return this.getOptions(questionIndex)
      .at(optionIndex)
      ?.get('text') as FormControl;
  }

  /** Set a temporary correct option for MCQ creation */
  setTempCorrect(index: number) {
    this.tempCorrectIndex = index;
  }

  /** Add new question from "Add Question" form */
  addNewQuestion() {
    if (!this.newQuestionText.value) return;

    const questionGroup = this.fb.nonNullable.group({
      text: [this.newQuestionText.value, Validators.required],
      type: [this.newQuestionType.value, Validators.required],
      points: [
        this.newQuestionPoints.value,
        [Validators.required, Validators.min(1)],
      ],
      options: this.fb.array<FormGroup>([]),
      correctAnswer: [''],
    });

    if (this.newQuestionType.value === 'mcq') {
      const optsArray = questionGroup.get('options') as FormArray;

      this.tempOptionControls.controls.forEach((ctrl, i) => {
        optsArray.push(
          this.fb.group({
            text: [ctrl.value, Validators.required],
            isCorrect: [i === this.tempCorrectIndex],
          })
        );
      });

      if (this.tempCorrectIndex !== null) {
        questionGroup.patchValue({
          correctAnswer: this.tempOptionControls.at(this.tempCorrectIndex)
            .value,
        });
      }
    }

    this.questions.push(questionGroup);

    // Reset fields
    this.newQuestionText.reset('');
    this.newQuestionType.setValue('mcq');
    this.newQuestionPoints.setValue(1);

    this.tempOptionControls.controls.forEach((ctrl) => ctrl.reset(''));
    this.tempCorrectIndex = null;
  }

  /** Remove a question */
  removeQuestion(index: number) {
    this.questions.removeAt(index);
  }

  /** Mark an option as correct (for saved questions) */
  setCorrectOption(questionIndex: number, optionIndex: number) {
    const options = this.getOptions(questionIndex);

    options.controls.forEach((opt, i) =>
      opt.patchValue({ isCorrect: i === optionIndex })
    );

    const correctAnswer = options.at(optionIndex).get('text')?.value;
    this.questions.at(questionIndex).patchValue({ correctAnswer });
  }
  @ViewChildren('optionInput') optionInputs!: QueryList<
    ElementRef<HTMLInputElement>
  >;

  /** Focus next input */
  focusNext(nextInput?: HTMLTextAreaElement | HTMLInputElement) {
    nextInput?.focus();
  }
  /** Submit handler */
  submit(ctx?: { close: () => void }) {
    if (!this.quizForm.valid) return;

    const rawValue = this.quizForm.getRawValue();
    const quiz: Quiz = {
      ...rawValue,
      id: crypto.randomUUID(),
      startTime: new Date(rawValue.startTime),
    };

    this.quizDataService.addQuiz(quiz);
    console.log(quiz);
    ctx?.close();

    this.router.navigate(['/teacher-dashboard'], {
      replaceUrl: true,
    });
  }
  goBack() {
    this.location.back();
  }
}
