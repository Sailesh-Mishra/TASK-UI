import { Injectable } from '@angular/core';
import Swal from 'sweetalert2';

@Injectable({ providedIn: 'root' })
export class NotifyService {
  private readonly toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
  });

  success(message: string): void {
    this.toast.fire({ icon: 'success', title: message });
  }

  error(message: string): void {
    this.toast.fire({ icon: 'error', title: message });
  }

  async confirmDelete(name: string): Promise<boolean> {
    const result = await Swal.fire({
      title: 'Delete this task?',
      text: name,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete',
      cancelButtonText: 'Cancel',
    });
    return result.isConfirmed;
  }
}