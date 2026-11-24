import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment.development';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Paginated, Task, TaskPayload, TaskStatus } from '../model/task.model';
import { map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TaskService {

  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/tasks`;

  list(page = 1, status?: TaskStatus) {
    let params = new HttpParams().set('page', page);
    if (status) {
      params = params.set('status', status);
    }
    return this.http.get<Paginated<Task>>(this.url, { params });
  }

  get(id: number) {
    return this.http.get<{ data: Task }>(`${this.url}/${id}`).pipe(map((r) => r.data));
  }

  create(body: TaskPayload) {
    return this.http.post<{ data: Task }>(this.url, body).pipe(map((r) => r.data));
  }

  update(id: number, body: TaskPayload) {
    return this.http.put<{ data: Task }>(`${this.url}/${id}`, body).pipe(map((r) => r.data));
  }

  remove(id: number) {
    return this.http.delete<void>(`${this.url}/${id}`);
  }

}
