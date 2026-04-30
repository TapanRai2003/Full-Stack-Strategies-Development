import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ClassService } from '../../services/class';

@Component({
  selector: 'app-manage-classes',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './manage-classes.html',
  styleUrl: './manage-classes.css'
})
export class ManageClasses implements OnInit {
  classes: any[] = [];
  message = '';

  constructor(
    private classService: ClassService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadClasses();
  }

  loadClasses(): void {
    this.message = 'Loading classes...';

    this.classService.getClasses().subscribe({
      next: (res: any) => {
        console.log('MANAGE CLASSES RESPONSE:', res);

        this.classes = Array.isArray(res) ? res : [];
        this.message = this.classes.length ? '' : 'No classes found';

        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.log('LOAD CLASSES ERROR:', err);

        this.classes = [];
        this.message = 'Failed to load classes';

        this.cdr.detectChanges();
      }
    });
  }

  deleteClass(classId: string): void {
    const confirmed = window.confirm('Are you sure you want to delete this class?');

    if (!confirmed) {
      return;
    }

    this.classService.deleteClass(classId).subscribe({
      next: (res: any) => {
        this.message = res.message || 'Class deleted successfully';
        alert(this.message);
        this.loadClasses();
      },
      error: (err: any) => {
        console.log('DELETE CLASS ERROR:', err);
        this.message = err?.error?.message || 'Failed to delete class';
        alert(this.message);
        this.cdr.detectChanges();
      }
    });
  }
}