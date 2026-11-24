import { Component, inject, signal } from '@angular/core';
import { AuthService } from '../../core/auth.service';
import { Router } from '@angular/router';
import { TaskService } from '../../core/task.service';
import { Task, TaskStatus } from '../../model/task.model';
import { NotifyService } from '../../core/notify.service';
import { RouterLink } from '@angular/router';  

@Component({
  selector: 'app-tasks',
  imports: [RouterLink],
  templateUrl: './tasks.component.html',
  styleUrl: './tasks.component.css'
})
export class TasksComponent {
  private readonly taskApi = inject(TaskService);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly tasks = signal<Task[]>([]);
  readonly page = signal(1);
  readonly lastPage = signal(1);
  readonly status = signal<TaskStatus | ''>('');
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  private readonly notify = inject(NotifyService);


  load(): void {
    this.loading.set(true);
    this.error.set(null);

    this.taskApi.list(this.page(), this.status() || undefined).subscribe({
      next: (res) => {
        this.tasks.set(res.data);
        this.lastPage.set(res.meta.last_page);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Could not load tasks. Please try again.');
        this.loading.set(false);
      },
    });
  }

  onStatusChange(value: string): void {
    this.status.set(value as TaskStatus | '');
    this.page.set(1);
    this.load();
  }

  goTo(page: number): void {
    if (page < 1 || page > this.lastPage()) return;
    this.page.set(page);
    this.load();
  }

  logout(): void {
    this.auth.logout().subscribe(() => this.router.navigate(['/login']));
  }


  async remove(task: Task): Promise<void> {
    const confirmed = await this.notify.confirmDelete(task.title);
    if (!confirmed) return;

    this.taskApi.remove(task.id).subscribe(() => {
      this.notify.success('Task deleted');
      // if we deleted the only item on the last page, step back one page
      if (this.tasks().length === 1 && this.page() > 1) {
        this.page.update((p) => p - 1);
      }
      this.load();
    });
  }
}
