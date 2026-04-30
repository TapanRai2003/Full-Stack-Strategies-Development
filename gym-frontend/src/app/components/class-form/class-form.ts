import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ClassService } from '../../services/class';

@Component({
  selector: 'app-class-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './class-form.html',
  styleUrl: './class-form.css'
})
export class ClassForm implements OnInit {
  isEditMode = false;
  classId = '';
  message = '';

  gymClass: any = {
    title: '',
    type: '',
    instructor: '',
    capacity: '',
    location: '',
    start_time: '',
    duration_mins: ''
  };

  constructor(
    private classService: ClassService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');

    if (id) {
      this.isEditMode = true;
      this.classId = id;
      this.loadClassData();
    }
  }

  loadClassData(): void {
    this.classService.getClasses().subscribe({
      next: (res: any) => {
        const classes = Array.isArray(res) ? res : [];
        const foundClass = classes.find((c: any) => c.id === this.classId);

        if (foundClass) {
          this.gymClass = { ...foundClass };
        } else {
          this.message = 'Class not found';
        }
      },
      error: (err: any) => {
        console.log('LOAD CLASS DATA ERROR:', err);
        this.message = 'Failed to load class data';
      }
    });
  }

  submitForm(): void {
    if (this.isEditMode) {
      this.classService.updateClass(this.classId, this.gymClass).subscribe({
        next: (res: any) => {
          this.message = res.message || 'Class updated successfully';
          setTimeout(() => {
            this.router.navigate(['/admin/manage-classes']);
          }, 1000);
        },
        error: (err: any) => {
          console.log('UPDATE CLASS ERROR:', err);
          this.message = err?.error?.message || 'Failed to update class';
        }
      });
    } else {
      this.classService.createClass(this.gymClass).subscribe({
        next: (res: any) => {
          this.message = res.message || 'Class created successfully';
          this.gymClass = {
            title: '',
            type: '',
            instructor: '',
            capacity: '',
            location: '',
            start_time: '',
            duration_mins: ''
          };
        },
        error: (err: any) => {
          console.log('CREATE CLASS ERROR:', err);
          this.message = err?.error?.message || 'Failed to create class';
        }
      });
    }
  }
}