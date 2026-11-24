import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NotifyService } from '../../core/notify.service';
import { TaskService } from '../../core/task.service';
import { TaskStatus } from '../../model/task.model';

@Component({
  selector: 'app-task-form',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './task-form.component.html',
  styleUrl: './task-form.component.css',
})
export class TaskFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly api = inject(TaskService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly notify = inject(NotifyService);

  readonly taskId = this.route.snapshot.paramMap.get('id');   // null means create mode
  readonly saving = signal(false);

  readonly form = this.fb.nonNullable.group({
    title: ['', [Validators.required, Validators.maxLength(150)]],
    description: ['', [Validators.maxLength(1000)]],
    status: ['todo' as TaskStatus],
  });

  ngOnInit(): void {
    if (!this.taskId) return;

    this.api.get(Number(this.taskId)).subscribe({
      next: (task) =>
        this.form.patchValue({
          title: task.title,
          description: task.description ?? '',
          status: task.status,
        }),
      error: () => this.router.navigate(['/tasks']),   // the interceptor already showed the reason
    });
  }

  submit(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;

    const payload = this.form.getRawValue();
    const request$ = this.taskId
      ? this.api.update(Number(this.taskId), payload)
      : this.api.create(payload);

    this.saving.set(true);
    request$.subscribe({
      next: () => {
        this.notify.success(this.taskId ? 'Task updated' : 'Task created');
        this.router.navigate(['/tasks']);
      },
      error: (err: HttpErrorResponse) => {
        this.saving.set(false);
        if (err.status === 422) {
          this.showServerErrors(err.error?.errors ?? {});
        }
      },
    });
  }

  // Laravel's { errors: { title: ["..."] } } is attached to the matching form fields
  private showServerErrors(errors: Record<string, string[]>): void {
    Object.entries(errors).forEach(([field, messages]) => {
      this.form.get(field)?.setErrors({ server: messages[0] });
    });
  }
}